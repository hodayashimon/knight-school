/*!
 * ai.js - the computer opponent.
 *
 * Negamax with alpha-beta pruning, iterative deepening under a time budget,
 * MVV-LVA capture ordering, killer moves, and a quiescence search so the
 * engine does not stop counting in the middle of a trade.
 *
 * It reaches into the engine's internal make/unmake rather than the public
 * move() API: the public path builds SAN strings and tracks repetition, which
 * costs far more than the search itself.
 */
(function (global) {
  'use strict';

  var Chess = global.Chess;

  var VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  var MATE = 100000;
  var INFINITY = 1000000;

  /* Square tables are written from white's point of view with a8 first, which
     is exactly the order the 0x88 board walks in. */
  var PST = {
    p: [
        0,  0,  0,  0,  0,  0,  0,  0,
       50, 50, 50, 50, 50, 50, 50, 50,
       10, 10, 20, 30, 30, 20, 10, 10,
        5,  5, 10, 25, 25, 10,  5,  5,
        0,  0,  0, 20, 20,  0,  0,  0,
        5, -5,-10,  0,  0,-10, -5,  5,
        5, 10, 10,-20,-20, 10, 10,  5,
        0,  0,  0,  0,  0,  0,  0,  0
    ],
    n: [
      -50,-40,-30,-30,-30,-30,-40,-50,
      -40,-20,  0,  0,  0,  0,-20,-40,
      -30,  0, 10, 15, 15, 10,  0,-30,
      -30,  5, 15, 20, 20, 15,  5,-30,
      -30,  0, 15, 20, 20, 15,  0,-30,
      -30,  5, 10, 15, 15, 10,  5,-30,
      -40,-20,  0,  5,  5,  0,-20,-40,
      -50,-40,-30,-30,-30,-30,-40,-50
    ],
    b: [
      -20,-10,-10,-10,-10,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5, 10, 10,  5,  0,-10,
      -10,  5,  5, 10, 10,  5,  5,-10,
      -10,  0, 10, 10, 10, 10,  0,-10,
      -10, 10, 10, 10, 10, 10, 10,-10,
      -10,  5,  0,  0,  0,  0,  5,-10,
      -20,-10,-10,-10,-10,-10,-10,-20
    ],
    r: [
        0,  0,  0,  0,  0,  0,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
        0,  0,  0,  5,  5,  0,  0,  0
    ],
    q: [
      -20,-10,-10, -5, -5,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5,  5,  5,  5,  0,-10,
       -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,
      -10,  5,  5,  5,  5,  5,  0,-10,
      -10,  0,  5,  0,  0,  0,  0,-10,
      -20,-10,-10, -5, -5,-10,-10,-20
    ],
    k: [
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20,
      -10,-20,-20,-20,-20,-20,-20,-10,
       20, 20,  0,  0,  0,  0, 20, 20,
       20, 30, 10,  0,  0, 10, 30, 20
    ],
    kEnd: [
      -50,-40,-30,-20,-20,-30,-40,-50,
      -30,-20,-10,  0,  0,-10,-20,-30,
      -30,-10, 20, 30, 30, 20,-10,-30,
      -30,-10, 30, 40, 40, 30,-10,-30,
      -30,-10, 30, 40, 40, 30,-10,-30,
      -30,-10, 20, 30, 30, 20,-10,-30,
      -30,-30,  0,  0,  0,  0,-30,-30,
      -50,-30,-30,-30,-30,-30,-30,-50
    ]
  };

  var LEVELS = {
    1: { name: 'Beginner',  depth: 1, noise: 130, blunderChance: 0.25, quiescence: false, timeMs: 200 },
    2: { name: 'Casual',    depth: 2, noise: 60,  blunderChance: 0.08, quiescence: false, timeMs: 500 },
    3: { name: 'Club',      depth: 3, noise: 20,  blunderChance: 0.0,  quiescence: true,  timeMs: 1200 },
    4: { name: 'Strong',    depth: 5, noise: 0,   blunderChance: 0.0,  quiescence: true,  timeMs: 2500 }
  };

  function ChessAI(level) {
    this.setLevel(level || 2);
    this.nodes = 0;
  }

  ChessAI.prototype.setLevel = function (level) {
    this.level = LEVELS[level] ? level : 2;
    this.config = LEVELS[this.level];
  };

  ChessAI.levels = LEVELS;

  /* --- evaluation --------------------------------------------------- */

  /* Positive numbers favour white, always - the negamax wrapper flips it. */
  function evaluate(game) {
    var board = game._board;
    var score = 0;
    var i, piece;

    var bishops = { w: 0, b: 0 };
    var pawnFiles = { w: [0,0,0,0,0,0,0,0], b: [0,0,0,0,0,0,0,0] };
    var nonPawnMaterial = 0;

    /* One scan of the board, remembering where the pieces were so the second
       pass walks 32 entries instead of 128 squares. */
    var occupied = [];
    for (i = 0; i < 128; i++) {
      if (i & 0x88) { i += 7; continue; }
      piece = board[i];
      if (!piece) continue;
      occupied.push(i);
      if (piece.type === 'b') bishops[piece.color]++;
      else if (piece.type === 'p') pawnFiles[piece.color][i & 15]++;
      if (piece.type !== 'p' && piece.type !== 'k') nonPawnMaterial += VALUES[piece.type];
    }

    /* Endgame weight: 1 when only kings and pawns remain, 0 in the opening.
       It slides the king between "hide behind pawns" and "march to the centre". */
    var endgame = Math.max(0, Math.min(1, 1 - nonPawnMaterial / 6800));

    for (var n = 0; n < occupied.length; n++) {
      i = occupied[n];
      piece = board[i];

      var rank = i >> 4;
      var file = i & 15;
      var pstIndex = piece.color === 'w' ? rank * 8 + file : (7 - rank) * 8 + file;

      var value = VALUES[piece.type];
      if (piece.type === 'k') {
        value += PST.k[pstIndex] * (1 - endgame) + PST.kEnd[pstIndex] * endgame;
      } else {
        value += PST[piece.type][pstIndex];
      }

      score += piece.color === 'w' ? value : -value;
    }

    /* The bishop pair is worth roughly half a pawn. */
    if (bishops.w >= 2) score += 30;
    if (bishops.b >= 2) score -= 30;

    /* Doubled and isolated pawns */
    for (var f = 0; f < 8; f++) {
      var wp = pawnFiles.w[f], bp = pawnFiles.b[f];
      if (wp > 1) score -= (wp - 1) * 18;
      if (bp > 1) score += (bp - 1) * 18;
      if (wp > 0 && !(f > 0 && pawnFiles.w[f - 1]) && !(f < 7 && pawnFiles.w[f + 1])) score -= 15;
      if (bp > 0 && !(f > 0 && pawnFiles.b[f - 1]) && !(f < 7 && pawnFiles.b[f + 1])) score += 15;
    }

    return score;
  }

  ChessAI.evaluate = evaluate;

  /* --- move ordering ------------------------------------------------ */

  /* Most Valuable Victim / Least Valuable Attacker: try QxP-style blunders
     last and PxQ-style wins first, which makes alpha-beta cut much earlier. */
  function scoreMove(move, killers, ply) {
    if (move.captured) {
      return 10000 + VALUES[move.captured] * 10 - VALUES[move.piece];
    }
    if (move.promotion) return 9000 + VALUES[move.promotion];
    var killer = killers[ply];
    if (killer && killer.from === move.from && killer.to === move.to) return 8000;
    return 0;
  }

  function orderMoves(moves, killers, ply) {
    var scored = [];
    for (var i = 0; i < moves.length; i++) {
      scored.push({ move: moves[i], score: scoreMove(moves[i], killers, ply) });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    var out = [];
    for (i = 0; i < scored.length; i++) out.push(scored[i].move);
    return out;
  }

  /* --- search ------------------------------------------------------- */

  function Search(game, config) {
    this.game = game;
    this.config = config;
    this.nodes = 0;
    this.killers = [];
    this.deadline = Date.now() + config.timeMs;
    this.abort = false;
  }

  Search.prototype.outOfTime = function () {
    /* Checking the clock is not free, so only look every so often. */
    if ((this.nodes & 1023) === 0 && Date.now() > this.deadline) this.abort = true;
    return this.abort;
  };

  /*
   * Search on past the nominal depth until the position is quiet, so the
   * engine never evaluates a half-finished trade as if it were the final word.
   * Returns the score from the perspective of the side to move.
   */
  Search.prototype.quiesce = function (alpha, beta, sign, ply) {
    this.nodes++;

    var game = this.game;
    var us = game._turn;
    var inCheck = game._kingAttacked(us);
    var best;

    /* Standing pat means "I could just stop here" - which is not an option
       while in check, so those nodes search every evasion instead. */
    if (inCheck) {
      best = -INFINITY;
    } else {
      best = sign * evaluate(game);
      if (best >= beta) return best;
      if (best > alpha) alpha = best;
    }

    if (ply > 8 || this.outOfTime()) return inCheck ? sign * evaluate(game) : best;

    var ordered = orderMoves(game._generateMoves({ legal: false }), this.killers, ply);
    var legalCount = 0;

    for (var i = 0; i < ordered.length; i++) {
      var move = ordered[i];
      if (!inCheck && !move.captured && !move.promotion) continue;

      game._makeMove(move);
      if (game._kingAttacked(us)) { game._undoMove(); continue; }
      legalCount++;

      var score = -this.quiesce(-beta, -alpha, -sign, ply + 1);
      game._undoMove();

      if (this.abort) return best === -INFINITY ? sign * evaluate(game) : best;

      if (score > best) best = score;
      if (score > alpha) alpha = score;
      if (alpha >= beta) break;
    }

    /* No way out of check is mate, however deep we happen to be. */
    if (inCheck && legalCount === 0) return -MATE + ply;

    /*
     * Returning `best` rather than the alpha/beta bound matters: a bound is
     * only meaningful inside the window it came from, and handing one back to
     * a caller searching a different window reports fictional scores - a
     * mate-magnitude alpha would come straight back out as a mate score.
     */
    return best;
  };

  Search.prototype.negamax = function (depth, alpha, beta, sign, ply) {
    this.nodes++;

    if (this.outOfTime()) return sign * evaluate(this.game);

    var game = this.game;
    var us = game._turn;
    var pseudo = game._generateMoves({ legal: false });
    var ordered = orderMoves(pseudo, this.killers, ply);

    var legalCount = 0;
    var best = -INFINITY;

    for (var i = 0; i < ordered.length; i++) {
      var move = ordered[i];

      game._makeMove(move);
      if (game._kingAttacked(us)) { game._undoMove(); continue; }
      legalCount++;

      /* Every score below is expressed from the perspective of the side that
         was to move at this node, which is why the child result is negated. */
      var score;
      if (depth - 1 <= 0) {
        score = this.config.quiescence
          ? -this.quiesce(-beta, -alpha, -sign, ply + 1)
          : sign * evaluate(game);
      } else {
        score = -this.negamax(depth - 1, -beta, -alpha, -sign, ply + 1);
      }

      game._undoMove();

      if (this.abort) return best === -INFINITY ? sign * evaluate(game) : best;

      if (score > best) best = score;
      if (score > alpha) alpha = score;

      if (alpha >= beta) {
        /* A quiet move that causes a cutoff is worth trying first next time. */
        if (!move.captured) this.killers[ply] = { from: move.from, to: move.to };
        break;
      }
    }

    if (legalCount === 0) {
      /* Mate scores shrink with distance so the engine prefers a faster mate. */
      return game._kingAttacked(us) ? -MATE + ply : 0;
    }

    return best;
  };

  /* Root search: returns every legal move with its score, best first. */
  Search.prototype.root = function (depth, sign) {
    var game = this.game;
    var ordered = orderMoves(game._generateMoves(), this.killers, 0);
    var results = [];
    var alpha = -INFINITY;

    /*
     * Every root move gets a full window, so every score is an exact value
     * rather than a bound. The weaker levels pick among these scores instead
     * of just taking the maximum, and a bound would make that choice
     * meaningless. Pruning still happens everywhere below the root, where
     * nearly all of the nodes are.
     */
    for (var i = 0; i < ordered.length; i++) {
      var move = ordered[i];
      game._makeMove(move);

      var score = depth - 1 <= 0
        ? (this.config.quiescence ? -this.quiesce(-INFINITY, INFINITY, -sign, 1) : sign * evaluate(game))
        : -this.negamax(depth - 1, -INFINITY, INFINITY, -sign, 1);

      game._undoMove();

      results.push({ move: move, score: score });
      if (score > alpha) alpha = score;

      if (this.abort) break;
    }

    results.sort(function (a, b) { return b.score - a.score; });
    return results;
  };

  /* --- public entry point ------------------------------------------- */

  /*
   * Returns { from, to, promotion, score, depth, nodes, timeMs } ready to hand
   * straight to game.move(), or null when there is nothing legal to play.
   */
  ChessAI.prototype.findMove = function (game) {
    var config = this.config;
    var sign = game.turn() === 'w' ? 1 : -1;
    var started = Date.now();

    var legal = game.moves({ verbose: true });
    if (legal.length === 0) return null;

    var search = new Search(game, config);
    var results = null;

    /* Iterative deepening: each pass is cheap relative to the next, and it
       leaves us with a usable answer if the clock runs out mid-search. */
    for (var depth = 1; depth <= config.depth; depth++) {
      var pass = search.root(depth, sign);
      /* An aborted pass only scored part of the move list, so keep the last
         complete one - unless it is all we have. */
      if (pass.length && (!search.abort || !results)) results = pass;
      if (search.abort || Date.now() > search.deadline) break;
    }

    if (!results || !results.length) return null;

    var chosen = this._pick(results, config);

    return {
      from: squareName(chosen.move.from),
      to: squareName(chosen.move.to),
      promotion: chosen.move.promotion || undefined,
      score: chosen.score,
      depth: config.depth,
      nodes: search.nodes,
      timeMs: Date.now() - started
    };
  };

  /*
   * Weaker levels do not simply play worse moves - they play plausible ones.
   * Adding noise to each score and occasionally picking from the whole legal
   * list produces mistakes that look human instead of random.
   */
  ChessAI.prototype._pick = function (results, config) {
    if (config.blunderChance > 0 && Math.random() < config.blunderChance) {
      /* Never throw away a forced mate, and never hang the game on purpose
         when a capture is clearly winning - just pick from the middle. */
      var pool = results.slice(0, Math.max(2, Math.ceil(results.length / 2)));
      return pool[Math.floor(Math.random() * pool.length)];
    }

    if (config.noise > 0) {
      var jittered = results.map(function (r) {
        return { move: r.move, score: r.score + (Math.random() - 0.5) * 2 * config.noise };
      });
      jittered.sort(function (a, b) { return b.score - a.score; });
      return jittered[0];
    }

    /* Choose randomly among moves that are genuinely tied, so repeated games
       against the top level do not follow identical scripts. */
    var best = results[0].score;
    var tied = results.filter(function (r) { return r.score === best; });
    return tied[Math.floor(Math.random() * tied.length)];
  };

  function squareName(sq) { return 'abcdefgh'[sq & 15] + (8 - (sq >> 4)); }

  /*
   * Runs the search off the main tick so the caller can paint a "thinking"
   * state first. The search itself is synchronous; this only defers its start.
   */
  ChessAI.prototype.findMoveAsync = function (game, callback) {
    var self = this;
    setTimeout(function () {
      var result = null;
      try {
        result = self.findMove(game);
      } catch (err) {
        if (global.console) console.error('AI search failed', err);
      }
      callback(result);
    }, 30);
  };

  global.ChessAI = ChessAI;
  if (typeof module !== 'undefined' && module.exports) module.exports = ChessAI;

})(typeof globalThis !== 'undefined' ? globalThis : this);
