/*!
 * board.js - the interactive board component.
 *
 * Knows nothing about whose turn it is or which mode the app is in: it draws a
 * position, reports attempted moves, and lets the owner decide what is legal
 * through the `legalMoves` callback.
 */
(function (global) {
  'use strict';

  var FILES = 'abcdefgh';

  var GLYPHS = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };

  function squareName(file, rank) { return FILES[file] + (8 - rank); }

  /* The board works without i18n loaded, so translation is optional here. */
  function translate(key, fallback) {
    if (global.I18n && typeof global.I18n.t === 'function') {
      var text = global.I18n.t(key);
      if (text && text !== key) return text;
    }
    return fallback;
  }

  /* Pointer capture throws if the id is not an active pointer, which happens
     with synthetic events and with pointers the browser has already released. */
  function capturePointer(element, pointerId) {
    try { element.setPointerCapture(pointerId); } catch (err) { /* not capturable */ }
  }

  function releasePointer(element, pointerId) {
    try {
      if (element.hasPointerCapture && element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
    } catch (err) { /* already released */ }
  }

  function ChessBoard(element, options) {
    options = options || {};

    this.el = element;
    this.orientation = options.orientation || 'w';
    this.showCoordinates = options.showCoordinates !== false;

    /* Supplied by the owner: given a square, return the legal moves from it
       as [{ to, isCapture, isPromotion }]. Returning [] disables the piece. */
    this.legalMoves = options.legalMoves || function () { return []; };
    this.onMove = options.onMove || function () {};
    this.onIllegal = options.onIllegal || function () {};

    this.movableColor = options.movableColor || 'both';
    this.interactive = options.interactive !== false;

    this.position = [];          /* 8x8 of { type, color } or null, rank 8 first */
    this.pieceNodes = {};        /* square -> element */
    this.selected = null;
    this.legalForSelected = [];
    this.lastMove = null;
    this.checkSquare = null;
    this.highlighted = [];
    this.drag = null;

    this._build();
    this._bindEvents();
  }

  /* ---------- construction ---------- */

  ChessBoard.prototype._build = function () {
    this.el.classList.add('board');
    this.el.innerHTML = '';

    this.squaresLayer = document.createElement('div');
    this.squaresLayer.className = 'squares';

    this.markersLayer = document.createElement('div');
    this.markersLayer.className = 'markers';

    this.piecesLayer = document.createElement('div');
    this.piecesLayer.className = 'pieces';

    this.el.appendChild(this.squaresLayer);
    this.el.appendChild(this.markersLayer);
    this.el.appendChild(this.piecesLayer);

    this._drawSquares();
    this._sizeGlyphs();

    var self = this;
    if (global.ResizeObserver) {
      this._resizeObserver = new ResizeObserver(function () { self._sizeGlyphs(); });
      this._resizeObserver.observe(this.el);
    } else {
      global.addEventListener('resize', function () { self._sizeGlyphs(); });
    }
  };

  ChessBoard.prototype._drawSquares = function () {
    this.squaresLayer.innerHTML = '';

    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        var coords = this._rowColToSquare(row, col);
        var sq = document.createElement('div');
        sq.className = 'sq ' + ((coords.file + coords.rank) % 2 === 0 ? 'light' : 'dark');
        sq.dataset.square = coords.name;

        if (this.showCoordinates) {
          if (row === 7) {
            var f = document.createElement('span');
            f.className = 'coord file';
            f.textContent = FILES[coords.file];
            sq.appendChild(f);
          }
          if (col === 0) {
            var r = document.createElement('span');
            r.className = 'coord rank';
            r.textContent = String(8 - coords.rank);
            sq.appendChild(r);
          }
        }

        this.squaresLayer.appendChild(sq);
      }
    }
  };

  /* Board rows run top to bottom on screen; flipping swaps both axes. */
  ChessBoard.prototype._rowColToSquare = function (row, col) {
    var rank = this.orientation === 'w' ? row : 7 - row;
    var file = this.orientation === 'w' ? col : 7 - col;
    return { rank: rank, file: file, name: squareName(file, rank) };
  };

  ChessBoard.prototype._squareToRowCol = function (name) {
    var file = FILES.indexOf(name.charAt(0));
    var rank = 8 - parseInt(name.charAt(1), 10);
    return {
      row: this.orientation === 'w' ? rank : 7 - rank,
      col: this.orientation === 'w' ? file : 7 - file
    };
  };

  /* Glyph size has to follow the board's rendered width, since the font is
     drawn in px and the squares are sized in percentages. */
  ChessBoard.prototype._sizeGlyphs = function () {
    var width = this.el.clientWidth;
    if (!width) return;
    this.piecesLayer.style.fontSize = Math.round(width / 8 * 0.78) + 'px';
    var nodes = this.piecesLayer.children;
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.fontSize = 'inherit';
    }
  };

  /* ---------- drawing ---------- */

  ChessBoard.prototype.setOrientation = function (color) {
    if (color !== 'w' && color !== 'b') return;
    if (color === this.orientation) return;
    this.orientation = color;
    this._drawSquares();
    this.render({ animate: false });
  };

  ChessBoard.prototype.flip = function () {
    this.setOrientation(this.orientation === 'w' ? 'b' : 'w');
  };

  /*
   * `board` is the 8x8 array the engine produces. Pieces are matched to their
   * existing DOM node by square so that a move animates instead of flickering.
   */
  ChessBoard.prototype.setPosition = function (board, options) {
    this.position = board;
    this.render(options);
  };

  ChessBoard.prototype.render = function (options) {
    options = options || {};
    var animate = options.animate !== false;
    var wanted = {};
    var square, node;

    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        var piece = this.position[row] && this.position[row][col];
        if (piece) wanted[piece.square] = piece;
      }
    }

    /* Remove nodes whose square is now empty or holds a different piece. */
    for (square in this.pieceNodes) {
      if (!Object.prototype.hasOwnProperty.call(this.pieceNodes, square)) continue;
      var current = wanted[square];
      node = this.pieceNodes[square];
      if (!current || node.dataset.type !== current.type || node.dataset.color !== current.color) {
        node.parentNode && node.parentNode.removeChild(node);
        delete this.pieceNodes[square];
      }
    }

    for (square in wanted) {
      if (!Object.prototype.hasOwnProperty.call(wanted, square)) continue;
      if (this.pieceNodes[square]) continue;
      node = this._createPiece(wanted[square]);
      this.pieceNodes[square] = node;
      this.piecesLayer.appendChild(node);
      this._placePiece(node, square, false);
    }

    for (square in this.pieceNodes) {
      if (!Object.prototype.hasOwnProperty.call(this.pieceNodes, square)) continue;
      this._placePiece(this.pieceNodes[square], square, animate);
    }

    this._sizeGlyphs();
    this._drawMarkers();
  };

  ChessBoard.prototype._createPiece = function (piece) {
    var node = document.createElement('div');
    node.className = 'piece ' + piece.color;
    node.dataset.type = piece.type;
    node.dataset.color = piece.color;
    node.dataset.square = piece.square;

    var glyph = document.createElement('span');
    glyph.className = 'glyph';
    glyph.textContent = GLYPHS[piece.type];
    node.appendChild(glyph);

    node.setAttribute('aria-label', (piece.color === 'w' ? 'White' : 'Black') + ' ' + piece.type + ' on ' + piece.square);
    return node;
  };

  ChessBoard.prototype._placePiece = function (node, square, animate) {
    var rc = this._squareToRowCol(square);
    if (!animate) node.classList.add('no-anim');
    node.dataset.square = square;
    node.style.left = (rc.col * 12.5) + '%';
    node.style.top = (rc.row * 12.5) + '%';
    if (!animate) {
      /* Force layout so the transition does not replay the jump we just made. */
      void node.offsetWidth;
      node.classList.remove('no-anim');
    }
  };

  /*
   * Moving a piece rekeys its node so the next render treats it as the same
   * element and animates smoothly. Captured pieces are dropped here.
   */
  ChessBoard.prototype.applyMove = function (move) {
    var moving = this.pieceNodes[move.from];
    var captureSquare = move.isEnPassant
      ? move.to.charAt(0) + (move.color === 'w' ? '5' : '4')
      : move.to;

    var captured = this.pieceNodes[captureSquare];
    if (captured) {
      captured.parentNode && captured.parentNode.removeChild(captured);
      delete this.pieceNodes[captureSquare];
    }

    if (moving) {
      delete this.pieceNodes[move.from];
      this.pieceNodes[move.to] = moving;
      this._placePiece(moving, move.to, true);
    }

    if (move.isCastle) {
      var rank = move.color === 'w' ? '1' : '8';
      var kingside = move.to.charAt(0) === 'g';
      var rookFrom = (kingside ? 'h' : 'a') + rank;
      var rookTo = (kingside ? 'f' : 'd') + rank;
      var rook = this.pieceNodes[rookFrom];
      if (rook) {
        delete this.pieceNodes[rookFrom];
        this.pieceNodes[rookTo] = rook;
        this._placePiece(rook, rookTo, true);
      }
    }

    this.lastMove = { from: move.from, to: move.to };
  };

  /* ---------- markers ---------- */

  ChessBoard.prototype.setLastMove = function (move) {
    this.lastMove = move ? { from: move.from, to: move.to } : null;
    this._drawMarkers();
  };

  ChessBoard.prototype.setCheckSquare = function (square) {
    this.checkSquare = square || null;
    this._drawMarkers();
  };

  ChessBoard.prototype.setHighlights = function (squares) {
    this.highlighted = squares || [];
    this._drawMarkers();
  };

  ChessBoard.prototype._drawMarkers = function () {
    this.markersLayer.innerHTML = '';
    var self = this;

    function add(square, className) {
      if (!square) return;
      var rc = self._squareToRowCol(square);
      var mark = document.createElement('div');
      mark.className = 'mark ' + className;
      mark.style.left = (rc.col * 12.5) + '%';
      mark.style.top = (rc.row * 12.5) + '%';
      self.markersLayer.appendChild(mark);
    }

    if (this.lastMove) {
      add(this.lastMove.from, 'lastmove');
      add(this.lastMove.to, 'lastmove');
    }

    for (var i = 0; i < this.highlighted.length; i++) add(this.highlighted[i], 'highlight');

    if (this.checkSquare) add(this.checkSquare, 'check');
    if (this.selected) add(this.selected, 'selected');

    for (var j = 0; j < this.legalForSelected.length; j++) {
      var option = this.legalForSelected[j];
      add(option.to, 'target' + (option.isCapture ? ' capture' : ''));
    }
  };

  /* ---------- interaction ---------- */

  ChessBoard.prototype.setInteractive = function (on) {
    this.interactive = !!on;
    this.el.classList.toggle('static', !on);
    if (!on) this.clearSelection();
  };

  ChessBoard.prototype.setMovableColor = function (color) {
    this.movableColor = color;
    this.clearSelection();
  };

  ChessBoard.prototype.clearSelection = function () {
    this.selected = null;
    this.legalForSelected = [];
    this._drawMarkers();
  };

  ChessBoard.prototype._canPickUp = function (node) {
    if (!this.interactive || !node) return false;
    if (this.movableColor === 'none' || !this.movableColor) return false;
    if (this.movableColor !== 'both' && node.dataset.color !== this.movableColor) return false;
    return true;
  };

  ChessBoard.prototype._select = function (square) {
    var moves = this.legalMoves(square) || [];
    if (!moves.length) { this.clearSelection(); return false; }
    this.selected = square;
    this.legalForSelected = moves;
    this._drawMarkers();
    return true;
  };

  ChessBoard.prototype._findOption = function (square) {
    for (var i = 0; i < this.legalForSelected.length; i++) {
      if (this.legalForSelected[i].to === square) return this.legalForSelected[i];
    }
    return null;
  };

  ChessBoard.prototype._squareFromPoint = function (clientX, clientY) {
    var rect = this.el.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    var col = Math.floor((clientX - rect.left) / (rect.width / 8));
    var row = Math.floor((clientY - rect.top) / (rect.height / 8));
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;
    return this._rowColToSquare(row, col).name;
  };

  ChessBoard.prototype._attempt = function (from, to) {
    var option = this._findOption(to);
    this.clearSelection();

    if (!option) {
      this.onIllegal(from, to);
      return;
    }

    if (option.isPromotion) {
      var self = this;
      this._askPromotion(this.position, to, function (piece) {
        if (piece) self.onMove(from, to, piece);
      });
      return;
    }

    this.onMove(from, to, null);
  };

  ChessBoard.prototype._bindEvents = function () {
    var self = this;

    this.el.addEventListener('pointerdown', function (event) {
      if (!self.interactive || event.button !== 0) return;
      if (self.promoOpen) return;

      var square = self._squareFromPoint(event.clientX, event.clientY);
      if (!square) return;

      var node = self.pieceNodes[square];

      /* Clicking a legal destination completes a move started earlier. */
      if (self.selected && self.selected !== square && self._findOption(square)) {
        event.preventDefault();
        self._attempt(self.selected, square);
        return;
      }

      if (self.selected === square) { self.clearSelection(); return; }
      if (!self._canPickUp(node)) { self.clearSelection(); return; }
      if (!self._select(square)) return;

      event.preventDefault();
      capturePointer(self.el, event.pointerId);

      self.drag = {
        pointerId: event.pointerId,
        from: square,
        node: node,
        moved: false,
        startX: event.clientX,
        startY: event.clientY
      };
    });

    this.el.addEventListener('pointermove', function (event) {
      var drag = self.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;

      var dx = event.clientX - drag.startX;
      var dy = event.clientY - drag.startY;

      /* A few pixels of slop so a sloppy click is still a click. */
      if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;

      if (!drag.moved) {
        drag.moved = true;
        drag.node.classList.add('dragging');
      }

      var rect = self.el.getBoundingClientRect();
      var size = rect.width / 8;
      drag.node.style.left = ((event.clientX - rect.left - size / 2) / rect.width * 100) + '%';
      drag.node.style.top = ((event.clientY - rect.top - size / 2) / rect.height * 100) + '%';
      event.preventDefault();
    });

    function endDrag(event) {
      var drag = self.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      self.drag = null;

      drag.node.classList.remove('dragging');
      releasePointer(self.el, event.pointerId);

      if (!drag.moved) return;   /* treated as a click: selection stays up */

      var target = self._squareFromPoint(event.clientX, event.clientY);

      /* Snap home first; if the move is accepted the app re-renders anyway. */
      self._placePiece(drag.node, drag.from, false);

      if (!target || target === drag.from) { self.clearSelection(); return; }
      self._attempt(drag.from, target);
    }

    this.el.addEventListener('pointerup', endDrag);
    this.el.addEventListener('pointercancel', endDrag);

    this.el.addEventListener('contextmenu', function (event) {
      if (self.selected) { event.preventDefault(); self.clearSelection(); }
    });
  };

  /* ---------- promotion ---------- */

  ChessBoard.prototype._askPromotion = function (position, square, callback) {
    var self = this;
    var color = square.charAt(1) === '8' ? 'w' : 'b';

    this.promoOpen = true;

    var overlay = document.createElement('div');
    overlay.className = 'promo';

    var inner = document.createElement('div');
    inner.className = 'promo-inner';

    var prompt = document.createElement('p');
    prompt.textContent = translate('promo.prompt', 'Promote to');
    inner.appendChild(prompt);

    var options = document.createElement('div');
    options.className = 'promo-options';

    var fallbackNames = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };

    ['q', 'r', 'b', 'n'].forEach(function (type) {
      var button = document.createElement('button');
      button.className = 'promo-option piece ' + color;
      button.type = 'button';
      button.title = translate('piece.' + type, fallbackNames[type]);
      button.innerHTML = '<span class="glyph">' + GLYPHS[type] + '</span>';
      button.addEventListener('click', function () { close(type); });
      options.appendChild(button);
    });

    inner.appendChild(options);
    overlay.appendChild(inner);

    /* Clicking away cancels rather than silently queening. */
    overlay.addEventListener('pointerdown', function (event) {
      if (event.target === overlay) close(null);
    });

    function close(type) {
      if (!self.promoOpen) return;
      self.promoOpen = false;
      overlay.parentNode && overlay.parentNode.removeChild(overlay);
      document.removeEventListener('keydown', onKey);
      callback(type);
    }

    function onKey(event) {
      if (event.key === 'Escape') close(null);
      var map = { q: 'q', r: 'r', b: 'b', n: 'n' };
      if (map[event.key.toLowerCase()]) close(map[event.key.toLowerCase()]);
    }

    document.addEventListener('keydown', onKey);
    this.el.appendChild(overlay);
  };

  ChessBoard.GLYPHS = GLYPHS;
  global.ChessBoard = ChessBoard;

})(typeof globalThis !== 'undefined' ? globalThis : this);
