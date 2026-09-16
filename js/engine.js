/*!
 * engine.js - a complete chess rules engine with no dependencies.
 *
 * Board representation is 0x88: a 128-entry array where the low nibble of an
 * index is the file and the high nibble is the rank. A square is off-board
 * exactly when (index & 0x88) !== 0, which makes boundary checks a single AND.
 *
 * Index 0 is a8 and index 119 is h1, so smaller indices are higher ranks.
 */
(function (global) {
  'use strict';

  var WHITE = 'w';
  var BLACK = 'b';

  var PAWN = 'p', KNIGHT = 'n', BISHOP = 'b', ROOK = 'r', QUEEN = 'q', KING = 'k';

  var DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  var BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64
  };

  var SQUARES = {};
  (function () {
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        SQUARES['abcdefgh'[f] + (8 - r)] = r * 16 + f;
      }
    }
  })();

  var PAWN_OFFSETS = {
    w: [-16, -32, -17, -15],
    b: [16, 32, 17, 15]
  };

  var PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1]
  };

  var PIECE_MASKS = { p: 1, n: 2, b: 4, r: 8, q: 16, k: 32 };

  var SECOND_RANK = { w: 6, b: 1 };

  var ROOKS = {
    w: [
      { square: SQUARES.a1, flag: BITS.QSIDE_CASTLE },
      { square: SQUARES.h1, flag: BITS.KSIDE_CASTLE }
    ],
    b: [
      { square: SQUARES.a8, flag: BITS.QSIDE_CASTLE },
      { square: SQUARES.h8, flag: BITS.KSIDE_CASTLE }
    ]
  };

  /*
   * ATTACKS[from - to + 119] is a bitmask of the piece types that could reach
   * `to` from `from` on an empty board; RAYS holds the step to walk between the
   * two so sliding pieces can be blocker-checked. Both are derived here rather
   * than hardcoded, so the geometry is verifiable by reading it.
   */
  var ATTACKS = new Uint8Array(239);
  var RAYS = new Int8Array(239);
  (function buildTables() {
    for (var from = 0; from < 128; from++) {
      if (from & 0x88) { from += 7; continue; }
      for (var to = 0; to < 128; to++) {
        if (to & 0x88) { to += 7; continue; }
        var df = (to & 15) - (from & 15);
        var dr = (to >> 4) - (from >> 4);
        if (df === 0 && dr === 0) continue;

        var adf = Math.abs(df), adr = Math.abs(dr);
        var index = from - to + 119;
        var mask = 0;

        if ((adf === 1 && adr === 2) || (adf === 2 && adr === 1)) mask |= PIECE_MASKS.n;
        if (adf <= 1 && adr <= 1) mask |= PIECE_MASKS.k;
        if (adf === 1 && adr === 1) mask |= PIECE_MASKS.p;
        if (adf === adr) mask |= PIECE_MASKS.b | PIECE_MASKS.q;
        if (df === 0 || dr === 0) mask |= PIECE_MASKS.r | PIECE_MASKS.q;

        if (adf === adr || df === 0 || dr === 0) {
          RAYS[index] = Math.sign(dr) * 16 + Math.sign(df);
        }
        ATTACKS[index] = mask;
      }
    }
  })();

  function algebraic(sq) { return 'abcdefgh'[sq & 15] + (8 - (sq >> 4)); }
  function rank(sq) { return sq >> 4; }
  function file(sq) { return sq & 15; }
  function swapColor(c) { return c === WHITE ? BLACK : WHITE; }
  function isDigit(c) { return '0123456789'.indexOf(c) !== -1; }

  function Chess(fen) {
    this.load(fen || DEFAULT_FEN);
  }

  Chess.prototype.clear = function () {
    this._board = new Array(128);
    for (var i = 0; i < 128; i++) this._board[i] = null;
    this._kings = { w: -1, b: -1 };
    this._turn = WHITE;
    this._castling = { w: 0, b: 0 };
    this._epSquare = -1;
    this._halfMoves = 0;
    this._moveNumber = 1;
    this._history = [];
    this._positionCount = {};
  };

  Chess.prototype.load = function (fen) {
    var tokens = String(fen).trim().split(/\s+/);
    if (tokens.length < 4) throw new Error('Invalid FEN: expected at least 4 fields');

    this.clear();

    var position = tokens[0];
    var square = 0;
    for (var i = 0; i < position.length; i++) {
      var ch = position.charAt(i);
      if (ch === '/') {
        square += 8;
      } else if (isDigit(ch)) {
        square += parseInt(ch, 10);
      } else {
        var color = ch < 'a' ? WHITE : BLACK;
        this._put({ type: ch.toLowerCase(), color: color }, algebraic(square));
        square++;
      }
    }

    this._turn = tokens[1] === BLACK ? BLACK : WHITE;

    if (tokens[2].indexOf('K') > -1) this._castling.w |= BITS.KSIDE_CASTLE;
    if (tokens[2].indexOf('Q') > -1) this._castling.w |= BITS.QSIDE_CASTLE;
    if (tokens[2].indexOf('k') > -1) this._castling.b |= BITS.KSIDE_CASTLE;
    if (tokens[2].indexOf('q') > -1) this._castling.b |= BITS.QSIDE_CASTLE;

    this._epSquare = tokens[3] === '-' ? -1 : SQUARES[tokens[3]];
    if (this._epSquare === undefined) this._epSquare = -1;
    this._halfMoves = parseInt(tokens[4], 10) || 0;
    this._moveNumber = parseInt(tokens[5], 10) || 1;

    this._countPosition(1);
    return true;
  };

  Chess.prototype._put = function (piece, square) {
    var sq = SQUARES[square];
    if (sq === undefined) return false;
    if (piece.type === KING) this._kings[piece.color] = sq;
    this._board[sq] = { type: piece.type, color: piece.color };
    return true;
  };

  Chess.prototype.put = function (piece, square) { return this._put(piece, square); };

  Chess.prototype.get = function (square) {
    var sq = SQUARES[square];
    if (sq === undefined) return null;
    var p = this._board[sq];
    return p ? { type: p.type, color: p.color } : null;
  };

  Chess.prototype.remove = function (square) {
    var p = this.get(square);
    if (p) this._board[SQUARES[square]] = null;
    return p;
  };

  Chess.prototype.turn = function () { return this._turn; };
  Chess.prototype.moveNumber = function () { return this._moveNumber; };
  Chess.prototype.halfMoves = function () { return this._halfMoves; };
  Chess.prototype.historyLength = function () { return this._history.length; };

  Chess.prototype.fen = function () {
    var empty = 0;
    var fen = '';

    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (this._board[i]) {
        if (empty > 0) { fen += empty; empty = 0; }
        var p = this._board[i];
        fen += p.color === WHITE ? p.type.toUpperCase() : p.type.toLowerCase();
      } else {
        empty++;
      }

      if ((i + 1) & 0x88) {
        if (empty > 0) fen += empty;
        if (i !== SQUARES.h1) fen += '/';
        empty = 0;
        i += 8;
      }
    }

    var castling = '';
    if (this._castling.w & BITS.KSIDE_CASTLE) castling += 'K';
    if (this._castling.w & BITS.QSIDE_CASTLE) castling += 'Q';
    if (this._castling.b & BITS.KSIDE_CASTLE) castling += 'k';
    if (this._castling.b & BITS.QSIDE_CASTLE) castling += 'q';
    if (castling === '') castling = '-';

    var ep = this._epSquare === -1 ? '-' : algebraic(this._epSquare);

    return [fen, this._turn, castling, ep, this._halfMoves, this._moveNumber].join(' ');
  };

  /* The first four FEN fields identify a position for repetition purposes. */
  Chess.prototype._positionKey = function () {
    return this.fen().split(' ').slice(0, 4).join(' ');
  };

  Chess.prototype._countPosition = function (delta) {
    var key = this._positionKey();
    var next = (this._positionCount[key] || 0) + delta;
    if (next <= 0) delete this._positionCount[key];
    else this._positionCount[key] = next;
  };

  Chess.prototype.board = function () {
    var out = [];
    var row = [];
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      var p = this._board[i];
      row.push(p ? { square: algebraic(i), type: p.type, color: p.color } : null);
      if ((i + 1) & 0x88) { out.push(row); row = []; i += 8; }
    }
    return out;
  };

  function buildMove(board, from, to, flags, promotion) {
    var move = {
      color: board[from].color,
      from: from,
      to: to,
      piece: board[from].type,
      flags: flags
    };
    if (promotion) {
      move.flags |= BITS.PROMOTION;
      move.promotion = promotion;
    }
    if (board[to]) move.captured = board[to].type;
    else if (flags & BITS.EP_CAPTURE) move.captured = PAWN;
    return move;
  }

  function addMove(board, moves, from, to, flags) {
    var piece = board[from];
    var targetRank = rank(to);

    if (piece.type === PAWN && (targetRank === 0 || targetRank === 7)) {
      var promos = [QUEEN, ROOK, BISHOP, KNIGHT];
      for (var i = 0; i < promos.length; i++) {
        moves.push(buildMove(board, from, to, flags, promos[i]));
      }
    } else {
      moves.push(buildMove(board, from, to, flags));
    }
  }

  Chess.prototype._generateMoves = function (options) {
    options = options || {};
    var legal = options.legal !== false;
    var forSquare = options.square ? SQUARES[String(options.square).toLowerCase()] : null;
    var forPiece = options.piece ? String(options.piece).toLowerCase() : null;

    var moves = [];
    var us = this._turn;
    var them = swapColor(us);
    var board = this._board;

    var firstSquare = SQUARES.a8;
    var lastSquare = SQUARES.h1;
    if (forSquare !== null) {
      if (forSquare === undefined) return [];
      firstSquare = lastSquare = forSquare;
    }

    for (var from = firstSquare; from <= lastSquare; from++) {
      if (from & 0x88) { from += 7; continue; }

      var piece = board[from];
      if (!piece || piece.color !== us) continue;
      if (forPiece && piece.type !== forPiece) continue;

      var to, j, offset;

      if (piece.type === PAWN) {
        var offsets = PAWN_OFFSETS[us];

        to = from + offsets[0];
        if (!(to & 0x88) && !board[to]) {
          addMove(board, moves, from, to, BITS.NORMAL);

          to = from + offsets[1];
          if (SECOND_RANK[us] === rank(from) && !(to & 0x88) && !board[to]) {
            addMove(board, moves, from, to, BITS.BIG_PAWN);
          }
        }

        for (j = 2; j < 4; j++) {
          to = from + offsets[j];
          if (to & 0x88) continue;

          if (board[to] && board[to].color === them) {
            addMove(board, moves, from, to, BITS.CAPTURE);
          } else if (to === this._epSquare) {
            addMove(board, moves, from, to, BITS.EP_CAPTURE);
          }
        }
      } else {
        var pieceOffsets = PIECE_OFFSETS[piece.type];
        for (j = 0; j < pieceOffsets.length; j++) {
          offset = pieceOffsets[j];
          to = from;

          for (;;) {
            to += offset;
            if (to & 0x88) break;

            if (!board[to]) {
              addMove(board, moves, from, to, BITS.NORMAL);
            } else {
              if (board[to].color === us) break;
              addMove(board, moves, from, to, BITS.CAPTURE);
              break;
            }

            if (piece.type === KNIGHT || piece.type === KING) break;
          }
        }
      }
    }

    /* Castling is generated from the king's square, so only consider it when
       the caller has not narrowed the search to some other piece or square. */
    var kingSquare = this._kings[us];
    var wantsKing = (!forPiece || forPiece === KING) &&
                    (forSquare === null || forSquare === kingSquare);

    if (wantsKing && kingSquare !== -1) {
      if (this._castling[us] & BITS.KSIDE_CASTLE) {
        var ksTo = kingSquare + 2;
        if (!board[kingSquare + 1] && !board[ksTo] &&
            !this._attacked(them, kingSquare) &&
            !this._attacked(them, kingSquare + 1) &&
            !this._attacked(them, ksTo)) {
          addMove(board, moves, kingSquare, ksTo, BITS.KSIDE_CASTLE);
        }
      }

      if (this._castling[us] & BITS.QSIDE_CASTLE) {
        var qsTo = kingSquare - 2;
        if (!board[kingSquare - 1] && !board[kingSquare - 2] && !board[kingSquare - 3] &&
            !this._attacked(them, kingSquare) &&
            !this._attacked(them, kingSquare - 1) &&
            !this._attacked(them, qsTo)) {
          addMove(board, moves, kingSquare, qsTo, BITS.QSIDE_CASTLE);
        }
      }
    }

    if (!legal) return moves;

    var legalMoves = [];
    for (var i = 0; i < moves.length; i++) {
      this._makeMove(moves[i]);
      if (!this._kingAttacked(us)) legalMoves.push(moves[i]);
      this._undoMove();
    }
    return legalMoves;
  };

  Chess.prototype._attacked = function (color, square) {
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (i & 0x88) { i += 7; continue; }

      var piece = this._board[i];
      if (!piece || piece.color !== color) continue;

      var difference = i - square;
      if (difference === 0) continue;

      var index = difference + 119;
      if (!(ATTACKS[index] & PIECE_MASKS[piece.type])) continue;

      if (piece.type === PAWN) {
        /* A positive difference means the target sits at a lower index, i.e.
           further up the board - the direction white pawns capture in. */
        if (difference > 0 ? color === WHITE : color === BLACK) return true;
        continue;
      }

      if (piece.type === KNIGHT || piece.type === KING) return true;

      var offset = RAYS[index];
      var j = i + offset;
      var blocked = false;
      while (j !== square) {
        if (this._board[j]) { blocked = true; break; }
        j += offset;
      }
      if (!blocked) return true;
    }
    return false;
  };

  Chess.prototype._kingAttacked = function (color) {
    var sq = this._kings[color];
    return sq === -1 ? false : this._attacked(swapColor(color), sq);
  };

  Chess.prototype.isAttacked = function (square, byColor) {
    var sq = SQUARES[square];
    if (sq === undefined) return false;
    return this._attacked(byColor, sq);
  };

  Chess.prototype.kingSquare = function (color) {
    var sq = this._kings[color];
    return sq === -1 ? null : algebraic(sq);
  };

  Chess.prototype.inCheck = function () { return this._kingAttacked(this._turn); };
  Chess.prototype.isCheckmate = function () { return this.inCheck() && this._generateMoves().length === 0; };
  Chess.prototype.isStalemate = function () { return !this.inCheck() && this._generateMoves().length === 0; };

  Chess.prototype.isInsufficientMaterial = function () {
    var pieces = {};
    var bishops = [];
    var numPieces = 0;

    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (i & 0x88) { i += 7; continue; }
      var piece = this._board[i];
      if (!piece) continue;
      pieces[piece.type] = (pieces[piece.type] || 0) + 1;
      if (piece.type === BISHOP) bishops.push((rank(i) + file(i)) % 2);
      numPieces++;
    }

    if (numPieces === 2) return true;                                    /* K vs K */
    if (numPieces === 3 && (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)) return true;

    if (numPieces === (pieces[BISHOP] || 0) + 2) {
      /* Only kings and bishops: drawn when every bishop shares a square colour. */
      var sum = 0;
      for (var b = 0; b < bishops.length; b++) sum += bishops[b];
      return sum === 0 || sum === bishops.length;
    }

    return false;
  };

  Chess.prototype.isThreefoldRepetition = function () {
    return (this._positionCount[this._positionKey()] || 0) >= 3;
  };

  Chess.prototype.isFiftyMoveDraw = function () { return this._halfMoves >= 100; };

  Chess.prototype.isDraw = function () {
    return this.isStalemate() ||
      this.isInsufficientMaterial() ||
      this.isThreefoldRepetition() ||
      this.isFiftyMoveDraw();
  };

  Chess.prototype.isGameOver = function () { return this.isCheckmate() || this.isDraw(); };

  /* Why the game ended, or over:false when it has not. */
  Chess.prototype.gameResult = function () {
    if (this.isCheckmate()) return { over: true, winner: swapColor(this._turn), reason: 'checkmate' };
    if (this.isStalemate()) return { over: true, winner: null, reason: 'stalemate' };
    if (this.isInsufficientMaterial()) return { over: true, winner: null, reason: 'insufficient material' };
    if (this.isThreefoldRepetition()) return { over: true, winner: null, reason: 'threefold repetition' };
    if (this.isFiftyMoveDraw()) return { over: true, winner: null, reason: 'the fifty-move rule' };
    return { over: false, winner: null, reason: null };
  };

  Chess.prototype._makeMove = function (move) {
    var us = this._turn;
    var them = swapColor(us);
    var board = this._board;
    var i;

    this._history.push({
      move: move,
      kings: { w: this._kings.w, b: this._kings.b },
      turn: us,
      castling: { w: this._castling.w, b: this._castling.b },
      epSquare: this._epSquare,
      halfMoves: this._halfMoves,
      moveNumber: this._moveNumber
    });

    board[move.to] = board[move.from];
    board[move.from] = null;

    if (move.flags & BITS.EP_CAPTURE) {
      board[us === BLACK ? move.to - 16 : move.to + 16] = null;
    }

    if (move.promotion) {
      board[move.to] = { type: move.promotion, color: us };
    }

    if (board[move.to].type === KING) {
      this._kings[us] = move.to;

      if (move.flags & BITS.KSIDE_CASTLE) {
        board[move.to - 1] = board[move.to + 1];
        board[move.to + 1] = null;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        board[move.to + 1] = board[move.to - 2];
        board[move.to - 2] = null;
      }

      this._castling[us] = 0;
    }

    if (this._castling[us]) {
      for (i = 0; i < ROOKS[us].length; i++) {
        if (move.from === ROOKS[us][i].square && (this._castling[us] & ROOKS[us][i].flag)) {
          this._castling[us] ^= ROOKS[us][i].flag;
          break;
        }
      }
    }

    if (this._castling[them]) {
      for (i = 0; i < ROOKS[them].length; i++) {
        if (move.to === ROOKS[them][i].square && (this._castling[them] & ROOKS[them][i].flag)) {
          this._castling[them] ^= ROOKS[them][i].flag;
          break;
        }
      }
    }

    this._epSquare = (move.flags & BITS.BIG_PAWN)
      ? (us === WHITE ? move.to + 16 : move.to - 16)
      : -1;

    if (move.piece === PAWN || (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE))) {
      this._halfMoves = 0;
    } else {
      this._halfMoves++;
    }

    if (us === BLACK) this._moveNumber++;
    this._turn = them;
  };

  Chess.prototype._undoMove = function () {
    var old = this._history.pop();
    if (!old) return null;

    var move = old.move;
    this._kings = old.kings;
    this._turn = old.turn;
    this._castling = old.castling;
    this._epSquare = old.epSquare;
    this._halfMoves = old.halfMoves;
    this._moveNumber = old.moveNumber;

    var us = this._turn;
    var them = swapColor(us);
    var board = this._board;

    board[move.from] = board[move.to];
    board[move.from].type = move.piece;   /* undo any promotion */
    board[move.to] = null;

    if (move.flags & BITS.CAPTURE) {
      board[move.to] = { type: move.captured, color: them };
    } else if (move.flags & BITS.EP_CAPTURE) {
      board[us === BLACK ? move.to - 16 : move.to + 16] = { type: PAWN, color: them };
    }

    if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
      var castlingTo, castlingFrom;
      if (move.flags & BITS.KSIDE_CASTLE) {
        castlingTo = move.to + 1;
        castlingFrom = move.to - 1;
      } else {
        castlingTo = move.to - 2;
        castlingFrom = move.to + 1;
      }
      board[castlingTo] = board[castlingFrom];
      board[castlingFrom] = null;
    }

    return move;
  };

  Chess.prototype._moveToSan = function (move, moves) {
    if (move.flags & BITS.KSIDE_CASTLE) return this._decorate('O-O', move);
    if (move.flags & BITS.QSIDE_CASTLE) return this._decorate('O-O-O', move);

    var output = '';

    if (move.piece !== PAWN) {
      output += move.piece.toUpperCase() + disambiguator(move, moves);
    }

    if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      if (move.piece === PAWN) output += 'abcdefgh'[file(move.from)];
      output += 'x';
    }

    output += algebraic(move.to);

    if (move.flags & BITS.PROMOTION) {
      output += '=' + move.promotion.toUpperCase();
    }

    return this._decorate(output, move);
  };

  /* Append the check or checkmate marker by actually playing the move. */
  Chess.prototype._decorate = function (san, move) {
    this._makeMove(move);
    if (this.inCheck()) {
      san += this._generateMoves().length === 0 ? '#' : '+';
    }
    this._undoMove();
    return san;
  };

  function disambiguator(move, moves) {
    var ambiguities = 0, sameRank = 0, sameFile = 0;

    for (var i = 0; i < moves.length; i++) {
      var other = moves[i];
      if (other.piece === move.piece && other.to === move.to && other.from !== move.from) {
        ambiguities++;
        if (rank(move.from) === rank(other.from)) sameRank++;
        if (file(move.from) === file(other.from)) sameFile++;
      }
    }

    if (ambiguities === 0) return '';
    if (sameRank > 0 && sameFile > 0) return algebraic(move.from);
    if (sameFile > 0) return algebraic(move.from).charAt(1);
    return algebraic(move.from).charAt(0);
  }

  function strippedSan(san) {
    return String(san).replace(/=/, '').replace(/[+#]?[?!]*$/, '');
  }

  Chess.prototype._moveFromSan = function (san) {
    var cleaned = strippedSan(san).replace(/0/g, 'O');
    var moves = this._generateMoves();
    var i;

    for (i = 0; i < moves.length; i++) {
      if (strippedSan(this._moveToSan(moves[i], moves)) === cleaned) return moves[i];
    }

    /* Fall back to coordinate notation such as "e2e4" or "e7e8q". */
    var coords = /^([a-h][1-8])[-x]?([a-h][1-8])([qrbnQRBN])?$/.exec(String(san).trim());
    if (coords) {
      for (i = 0; i < moves.length; i++) {
        if (algebraic(moves[i].from) !== coords[1] || algebraic(moves[i].to) !== coords[2]) continue;
        if (moves[i].promotion) {
          var wanted = coords[3] ? coords[3].toLowerCase() : QUEEN;
          if (moves[i].promotion !== wanted) continue;
        }
        return moves[i];
      }
    }

    return null;
  };

  function publicMove(internal, san) {
    var out = {
      color: internal.color,
      from: algebraic(internal.from),
      to: algebraic(internal.to),
      piece: internal.piece,
      san: san,
      flags: internal.flags
    };
    if (internal.captured) out.captured = internal.captured;
    if (internal.promotion) out.promotion = internal.promotion;
    out.isCapture = !!(internal.flags & (BITS.CAPTURE | BITS.EP_CAPTURE));
    out.isCastle = !!(internal.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE));
    out.isPromotion = !!(internal.flags & BITS.PROMOTION);
    out.isEnPassant = !!(internal.flags & BITS.EP_CAPTURE);
    return out;
  }

  /*
   * Accepts SAN ("Nf3"), coordinate notation ("g1f3"), or an object
   * { from, to, promotion }. Returns a descriptive move object, or null when
   * the move is not legal in the current position.
   */
  Chess.prototype.move = function (input) {
    var internal = null;
    var moves = this._generateMoves();
    var i;

    if (typeof input === 'string') {
      internal = this._moveFromSan(input);
    } else if (input && typeof input === 'object') {
      for (i = 0; i < moves.length; i++) {
        var m = moves[i];
        if (algebraic(m.from) !== input.from || algebraic(m.to) !== input.to) continue;
        if (m.promotion && m.promotion !== String(input.promotion || QUEEN).toLowerCase()) continue;
        internal = m;
        break;
      }
    }

    if (!internal) return null;

    var san = this._moveToSan(internal, moves);
    this._makeMove(internal);
    this._history[this._history.length - 1].san = san;
    this._countPosition(1);
    return publicMove(internal, san);
  };

  Chess.prototype.undo = function () {
    if (this._history.length === 0) return null;
    this._countPosition(-1);
    var san = this._history[this._history.length - 1].san;
    var move = this._undoMove();
    return move ? publicMove(move, san) : null;
  };

  Chess.prototype.moves = function (options) {
    options = options || {};
    var moves = this._generateMoves(options);

    /* Disambiguation has to be judged against every legal move, not just the
       filtered subset - otherwise a lone rook reports "Rb1" when its twin can
       also reach b1 and the move is really "Rab1". */
    var candidates = (options.square || options.piece) ? this._generateMoves() : moves;

    var out = [];
    for (var i = 0; i < moves.length; i++) {
      var san = this._moveToSan(moves[i], candidates);
      out.push(options.verbose ? publicMove(moves[i], san) : san);
    }
    return out;
  };

  /* Legal destinations for one piece - what the UI highlights on pick-up. */
  Chess.prototype.movesFrom = function (square) {
    var moves = this._generateMoves({ square: square });
    var out = [];
    for (var i = 0; i < moves.length; i++) out.push(publicMove(moves[i], ''));
    return out;
  };

  Chess.prototype.history = function (options) {
    options = options || {};
    var reversed = [];
    var sans = [];
    var out = [];

    while (this._history.length > 0) {
      sans.push(this._history[this._history.length - 1].san);
      reversed.push(this._undoMove());
    }

    while (reversed.length > 0) {
      var move = reversed.pop();
      var san = sans.pop() || this._moveToSan(move, this._generateMoves());
      out.push(options.verbose ? publicMove(move, san) : san);
      this._makeMove(move);
      this._history[this._history.length - 1].san = san;
    }

    return out;
  };

  /* Movetext only - enough to paste into any viewer alongside the start FEN. */
  Chess.prototype.pgn = function (options) {
    options = options || {};
    var history = this.history();
    var moveNumber = options.startMoveNumber || 1;
    var out = [];
    var index = 0;

    if (options.startColor === BLACK && history.length > 0) {
      out.push(moveNumber + '...', history[0]);
      index = 1;
      moveNumber++;
    }

    for (; index < history.length; index += 2) {
      out.push(moveNumber + '.', history[index]);
      if (history[index + 1]) out.push(history[index + 1]);
      moveNumber++;
    }

    return out.join(' ');
  };

  Chess.prototype.ascii = function () {
    var s = '  +------------------------+\n';
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (file(i) === 0) s += ' ' + (8 - rank(i)) + ' |';
      var piece = this._board[i];
      s += piece ? ' ' + (piece.color === WHITE ? piece.type.toUpperCase() : piece.type) + ' ' : ' . ';
      if ((i + 1) & 0x88) { s += '|\n'; i += 8; }
    }
    s += '  +------------------------+\n    a  b  c  d  e  f  g  h';
    return s;
  };

  /* Counts leaf nodes at `depth`. The test suite compares these against the
     published perft values, which is what proves move generation correct. */
  Chess.prototype.perft = function (depth) {
    var moves = this._generateMoves({ legal: false });
    var nodes = 0;
    var us = this._turn;

    for (var i = 0; i < moves.length; i++) {
      this._makeMove(moves[i]);
      if (!this._kingAttacked(us)) {
        nodes += depth - 1 > 0 ? this.perft(depth - 1) : 1;
      }
      this._undoMove();
    }
    return nodes;
  };

  Chess.WHITE = WHITE;
  Chess.BLACK = BLACK;
  Chess.PAWN = PAWN;
  Chess.KNIGHT = KNIGHT;
  Chess.BISHOP = BISHOP;
  Chess.ROOK = ROOK;
  Chess.QUEEN = QUEEN;
  Chess.KING = KING;
  Chess.DEFAULT_FEN = DEFAULT_FEN;
  Chess.SQUARES = SQUARES;
  Chess.BITS = BITS;

  global.Chess = Chess;
  if (typeof module !== 'undefined' && module.exports) module.exports = Chess;

})(typeof globalThis !== 'undefined' ? globalThis : this);
