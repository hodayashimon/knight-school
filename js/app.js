/*!
 * app.js - wires the engine, the AI and the board into three modes:
 * Play, Learn and Puzzles. One board component is shared between them.
 */
(function (global) {
  'use strict';

  var Chess = global.Chess;
  var ChessAI = global.ChessAI;
  var ChessBoard = global.ChessBoard;

  var PIECE_NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
  var PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  var FULL_SET = { p: 8, n: 2, b: 2, r: 2, q: 1 };

  var board;
  var mode = 'play';

  /* Short alias - this is called a few hundred times below. */
  function t(key, vars) { return global.I18n.t(key, vars); }

  function sideName(color) { return t(color === 'w' ? 'side.white' : 'side.black'); }

  function $(id) { return document.getElementById(id); }

  function setHTML(node, html) { node.innerHTML = html; }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* Rebuild a FEN with a chosen side to move. Capture drills need this: the
     learner keeps moving while the opponent stays put, which is not a legal
     turn order and so cannot be expressed by playing moves. */
  function forceTurn(fen, color) {
    var parts = fen.split(' ');
    parts[1] = color;
    parts[3] = '-';
    return parts.join(' ');
  }

  /* Legal destinations from a square, one entry per destination so that a
     promotion does not produce four stacked markers. */
  function destinations(game, square, onlyPieceType) {
    var piece = game.get(square);
    if (!piece) return [];
    if (onlyPieceType && piece.type !== onlyPieceType) return [];

    var moves = game.movesFrom(square);
    var seen = {};
    var out = [];
    for (var i = 0; i < moves.length; i++) {
      if (seen[moves[i].to]) continue;
      seen[moves[i].to] = true;
      out.push({ to: moves[i].to, isCapture: moves[i].isCapture, isPromotion: moves[i].isPromotion });
    }
    return out;
  }

  function checkSquareFor(game) {
    return game.inCheck() ? game.kingSquare(game.turn()) : null;
  }

  function syncBoard(game, options) {
    board.setPosition(game.board(), options);
    board.setCheckSquare(checkSquareFor(game));
  }

  /* ---------- saved progress ---------- */

  var Progress = {
    read: function (key) {
      try {
        var raw = global.localStorage.getItem('chess.' + key);
        return raw ? JSON.parse(raw) : {};
      } catch (err) {
        return {};
      }
    },
    write: function (key, value) {
      try {
        global.localStorage.setItem('chess.' + key, JSON.stringify(value));
      } catch (err) {
        /* Private browsing and blocked storage are not worth failing over. */
      }
    },
    mark: function (key, id) {
      var data = this.read(key);
      data[id] = true;
      this.write(key, data);
    },
    has: function (key, id) { return !!this.read(key)[id]; },
    count: function (key) { return Object.keys(this.read(key)).length; }
  };

  /* ---------- captured material ---------- */

  function materialSummary(game) {
    var rows = game.board();
    var counts = { w: {}, b: {} };
    var r, c, p;

    for (r = 0; r < 8; r++) {
      for (c = 0; c < 8; c++) {
        p = rows[r][c];
        if (!p || p.type === 'k') continue;
        counts[p.color][p.type] = (counts[p.color][p.type] || 0) + 1;
      }
    }

    var result = { w: { lost: [], score: 0 }, b: { lost: [], score: 0 } };

    ['w', 'b'].forEach(function (color) {
      var score = 0;
      for (var type in FULL_SET) {
        if (!Object.prototype.hasOwnProperty.call(FULL_SET, type)) continue;
        var alive = counts[color][type] || 0;
        var missing = Math.max(0, FULL_SET[type] - alive);
        for (var i = 0; i < missing; i++) result[color].lost.push(type);
        score += alive * PIECE_VALUES[type];
      }
      result[color].score = score;
    });

    return result;
  }

  function renderCaptured(node, lostTypes, advantage) {
    node.innerHTML = '';
    lostTypes.sort(function (a, b) { return PIECE_VALUES[b] - PIECE_VALUES[a]; });
    for (var i = 0; i < lostTypes.length; i++) {
      node.appendChild(el('span', null, ChessBoard.GLYPHS[lostTypes[i]]));
    }
    if (advantage > 0) node.appendChild(el('span', 'score', '+' + advantage));
  }

  /* =================================================================
     Play
     ================================================================= */

  var Play = {
    game: null,
    ai: null,
    humanColor: 'w',
    opponent: 'computer',
    level: 2,
    thinking: false,

    start: function () {
      this.game = new Chess();
      this.ai = this.ai || new ChessAI(this.level);
      this.ai.setLevel(this.level);
      this.thinking = false;

      board.setOrientation(this.humanColor === 'b' ? 'b' : 'w');
      board.setInteractive(true);
      board.setLastMove(null);
      board.setHighlights([]);
      board.legalMoves = this._legalMoves.bind(this);
      board.onMove = this._onMove.bind(this);

      syncBoard(this.game, { animate: false });
      this.refresh();
      this.maybeAiMove();
    },

    _legalMoves: function (square) {
      if (this.thinking || this.game.isGameOver()) return [];
      var piece = this.game.get(square);
      if (!piece || piece.color !== this.game.turn()) return [];
      if (this.opponent === 'computer' && piece.color !== this.humanColor) return [];
      return destinations(this.game, square);
    },

    _onMove: function (from, to, promotion) {
      var move = this.game.move({ from: from, to: to, promotion: promotion });
      if (!move) return;

      board.applyMove(move);
      board.setCheckSquare(checkSquareFor(this.game));
      this.refresh();
      this.maybeAiMove();
    },

    maybeAiMove: function () {
      if (this.opponent !== 'computer') return;
      if (this.game.isGameOver()) return;
      if (this.game.turn() === this.humanColor) return;

      var self = this;
      this.thinking = true;
      this.refresh();

      this.ai.findMoveAsync(this.game, function (result) {
        self.thinking = false;
        if (!result) { self.refresh(); return; }

        var move = self.game.move({ from: result.from, to: result.to, promotion: result.promotion });
        if (move) {
          board.applyMove(move);
          board.setCheckSquare(checkSquareFor(self.game));
        }
        self.refresh();
      });
    },

    undo: function () {
      if (this.thinking) return;
      if (!this.game.historyLength()) return;

      this.game.undo();
      /* Against the computer, step back past its reply as well so the human
         is on move again rather than watching it think immediately. */
      if (this.opponent === 'computer' && this.game.turn() !== this.humanColor && this.game.historyLength()) {
        this.game.undo();
      }

      var history = this.game.history({ verbose: true });
      board.setLastMove(history.length ? history[history.length - 1] : null);
      syncBoard(this.game, { animate: false });
      this.refresh();
    },

    statusText: function () {
      var game = this.game;
      var result = game.gameResult();

      if (result.over) {
        if (result.reason === 'checkmate') {
          return { text: t('status.checkmate', { side: sideName(result.winner) }), over: true };
        }
        return { text: t('status.drawBy', { reason: t('reason.' + result.reason) }), over: true };
      }

      if (this.thinking) return { text: t('status.thinking'), thinking: true };

      var side = sideName(game.turn());
      return {
        text: game.inCheck() ? t('status.check', { side: side }) : t('status.toMove', { side: side }),
        over: false
      };
    },

    refresh: function () {
      var game = this.game;
      var status = this.statusText();

      var dotClass = 'dot ' + (status.thinking ? 'thinking' : game.turn());
      var statusEl = $('status');
      statusEl.className = 'status' + (status.over ? ' over' : '');
      setHTML(statusEl, '<span class="' + dotClass + '"></span><span>' + status.text + '</span>');

      var material = materialSummary(game);
      var diff = material.w.score - material.b.score;
      var topIsWhite = board.orientation === 'b';

      renderCaptured($('captured-top'),
        topIsWhite ? material.w.lost.slice() : material.b.lost.slice(),
        topIsWhite ? Math.max(0, -diff) : Math.max(0, diff));
      renderCaptured($('captured-bottom'),
        topIsWhite ? material.b.lost.slice() : material.w.lost.slice(),
        topIsWhite ? Math.max(0, diff) : Math.max(0, -diff));

      this.renderPanel();
    },

    renderPanel: function () {
      var self = this;
      var side = $('side');
      side.innerHTML = '';

      /* --- game setup --- */
      var setup = el('div', 'panel');
      setup.appendChild(el('h2', null, t('play.game')));

      var oppField = el('div', 'field');
      oppField.appendChild(el('label', null, t('play.opponent')));
      var oppSelect = el('select');
      [['computer', t('play.computer')], ['human', t('play.twoPlayers')]].forEach(function (option) {
        var o = el('option', null, option[1]);
        o.value = option[0];
        if (self.opponent === option[0]) o.selected = true;
        oppSelect.appendChild(o);
      });
      oppSelect.addEventListener('change', function () {
        self.opponent = oppSelect.value;
        self.start();
      });
      oppField.appendChild(oppSelect);
      setup.appendChild(oppField);

      if (this.opponent === 'computer') {
        var levelField = el('div', 'field');
        levelField.appendChild(el('label', null, t('play.strength')));
        var levelSelect = el('select');
        Object.keys(ChessAI.levels).forEach(function (key) {
          var o = el('option', null, t('level.' + key));
          o.value = key;
          if (String(self.level) === key) o.selected = true;
          levelSelect.appendChild(o);
        });
        levelSelect.addEventListener('change', function () {
          self.level = parseInt(levelSelect.value, 10);
          self.ai.setLevel(self.level);
          self.refresh();
        });
        levelField.appendChild(levelSelect);
        setup.appendChild(levelField);

        var colorField = el('div', 'field');
        colorField.appendChild(el('label', null, t('play.yourColour')));
        var colorSelect = el('select');
        [['w', t('side.white')], ['b', t('side.black')]].forEach(function (option) {
          var o = el('option', null, option[1]);
          o.value = option[0];
          if (self.humanColor === option[0]) o.selected = true;
          colorSelect.appendChild(o);
        });
        colorSelect.addEventListener('change', function () {
          self.humanColor = colorSelect.value;
          self.start();
        });
        colorField.appendChild(colorSelect);
        setup.appendChild(colorField);
      }

      var actions = el('div', 'btn-row');

      var newGame = el('button', 'btn primary', t('play.newGame'));
      newGame.addEventListener('click', function () { self.start(); });
      actions.appendChild(newGame);

      var undo = el('button', 'btn', t('play.undo'));
      undo.disabled = this.thinking || !this.game.historyLength();
      undo.addEventListener('click', function () { self.undo(); });
      actions.appendChild(undo);

      var flip = el('button', 'btn', t('play.flip'));
      flip.addEventListener('click', function () { board.flip(); self.refresh(); });
      actions.appendChild(flip);

      setup.appendChild(actions);
      side.appendChild(setup);

      /* --- move list --- */
      var movesPanel = el('div', 'panel');
      movesPanel.appendChild(el('h2', null, t('play.moves')));

      var history = this.game.history();
      var list = el('div', 'moves');

      if (!history.length) {
        list.appendChild(el('div', 'moves-empty', t('play.noMoves')));
      } else {
        for (var i = 0; i < history.length; i += 2) {
          var row = el('div', 'moves-row');
          row.appendChild(el('span', 'num', (i / 2 + 1) + '.'));
          row.appendChild(el('span', 'ply', history[i]));
          row.appendChild(el('span', 'ply', history[i + 1] || ''));
          list.appendChild(row);
        }
      }
      movesPanel.appendChild(list);

      var copyRow = el('div', 'btn-row');
      copyRow.style.marginTop = '10px';

      var copyPgn = el('button', 'btn small', t('play.copyMoves'));
      copyPgn.addEventListener('click', function () {
        copyText(self.game.pgn(), copyPgn, t('play.copyMoves'));
      });
      copyRow.appendChild(copyPgn);

      var copyFen = el('button', 'btn small', t('play.copyPosition'));
      copyFen.addEventListener('click', function () {
        copyText(self.game.fen(), copyFen, t('play.copyPosition'));
      });
      copyRow.appendChild(copyFen);

      movesPanel.appendChild(copyRow);
      side.appendChild(movesPanel);

      /* keep the list scrolled to the latest move */
      list.scrollTop = list.scrollHeight;
    }
  };

  function copyText(text, button, originalLabel) {
    function done(ok) {
      button.textContent = ok ? t('play.copied') : t('play.copyFallback');
      setTimeout(function () { button.textContent = originalLabel; }, 1400);
    }
    if (global.navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      var area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(area);
      done(ok);
    }
  }

  /* =================================================================
     Scripted line runner - shared by lesson tasks and puzzles
     ================================================================= */

  function LineRunner(options) {
    this.game = options.game;
    this.line = options.line;
    this.accept = options.accept || {};
    this.index = 0;
    this.onProgress = options.onProgress || function () {};
    this.onWrong = options.onWrong || function () {};
    this.onComplete = options.onComplete || function () {};
    this.replyDelay = options.replyDelay || 520;
  }

  LineRunner.prototype.isComplete = function () { return this.index >= this.line.length; };

  LineRunner.prototype.expected = function () { return this.line[this.index]; };

  LineRunner.prototype.accepts = function (san) {
    var allowed = this.accept[this.index];
    if (allowed === '*') return true;
    if (san === this.line[this.index]) return true;
    if (allowed && allowed.indexOf(san) > -1) return true;
    return false;
  };

  /* Returns 'ok', 'wrong' or 'illegal'. A wrong move is taken back. */
  LineRunner.prototype.attempt = function (from, to, promotion) {
    if (this.isComplete()) return 'complete';

    var move = this.game.move({ from: from, to: to, promotion: promotion });
    if (!move) return 'illegal';

    if (!this.accepts(move.san)) {
      this.game.undo();
      this.onWrong(move.san, this.expected());
      return 'wrong';
    }

    this.index++;
    this.onProgress(move);

    if (this.isComplete()) {
      this.onComplete();
      return 'ok';
    }

    this.scheduleReply();
    return 'ok';
  };

  LineRunner.prototype.scheduleReply = function () {
    if (this.isComplete()) return;
    var self = this;

    setTimeout(function () {
      if (self.isComplete()) return;
      var reply = self.game.move(self.line[self.index]);
      if (!reply) return;                       /* validated up front, so this should not happen */
      self.index++;
      self.onProgress(reply, true);
      if (self.isComplete()) self.onComplete();
    }, this.replyDelay);
  };

  /* =================================================================
     Learn
     ================================================================= */

  var Learn = {
    view: 'index',
    chapterIndex: 0,
    lessonIndex: 0,
    game: null,
    runner: null,
    drill: null,
    matePractice: null,
    ai: null,
    state: 'reading',

    flatLessons: function () {
      var out = [];
      CHESS_CURRICULUM.forEach(function (chapter, ci) {
        chapter.lessons.forEach(function (lesson, li) {
          out.push({ chapter: chapter, lesson: lesson, ci: ci, li: li });
        });
      });
      return out;
    },

    current: function () {
      var chapter = CHESS_CURRICULUM[this.chapterIndex];
      return { chapter: chapter, lesson: chapter.lessons[this.lessonIndex] };
    },

    start: function () {
      /* Coming back from another tab should pick the lesson up where it was,
         not throw away a half-finished sequence. */
      if (this.view === 'lesson' && this.game) this.resume();
      else this.showIndex();
    },

    resume: function () {
      var lesson = this.current().lesson;
      board.setOrientation(lesson.orientation || 'w');
      board.setHighlights(lesson.highlight || []);
      syncBoard(this.game, { animate: false });
      this.bindBoard();
      this.renderLessonPanel();
    },

    /* Board wiring depends on the task type and the current state, and is
       needed both when a task begins and when the lesson is resumed. */
    bindBoard: function () {
      var self = this;
      var lesson = this.current().lesson;

      if (!lesson.task) {
        board.setInteractive(false);
        board.legalMoves = function () { return []; };
        return;
      }

      var type = lesson.task.type;
      var finished = this.state === 'done' || this.state === 'drawn';

      board.setInteractive(!finished);
      board.setMovableColor(this.game.turn());
      board.onMove = this.handleMove.bind(this);

      board.legalMoves = function (square) {
        if (self.state === 'done' || self.state === 'drawn') return [];
        if (type === 'line' && (!self.runner || self.runner.isComplete())) return [];
        if (type === 'mate' && self.matePractice && self.matePractice.thinking) return [];

        var piece = self.game.get(square);
        if (!piece || piece.color !== self.game.turn()) return [];

        if (type === 'captureAll') {
          return destinations(self.game, square, self.drill && self.drill.piece);
        }
        return destinations(self.game, square);
      };
    },

    showIndex: function () {
      this.view = 'index';
      this.runner = null;
      this.drill = null;
      this.matePractice = null;

      this.game = new Chess();
      board.setOrientation('w');
      board.setInteractive(false);
      board.setLastMove(null);
      board.setHighlights([]);
      board.legalMoves = function () { return []; };
      syncBoard(this.game, { animate: false });

      var statusEl = $('status');
      statusEl.className = 'status';
      var doneCount = Progress.count('lessons');
      var total = this.flatLessons().length;
      setHTML(statusEl,
        '<span class="dot"></span><span>' + doneCount + ' of ' + total + ' lessons complete</span>');

      $('captured-top').innerHTML = '';
      $('captured-bottom').innerHTML = '';

      this.renderIndexPanel();
    },

    renderIndexPanel: function () {
      var self = this;
      var side = $('side');
      side.innerHTML = '';

      var intro = el('div', 'panel');
      intro.appendChild(el('h2', null, t('learn.title')));
      var p = el('p', 'muted');
      p.textContent = t('learn.intro', { chapters: CHESS_CURRICULUM.length });
      intro.appendChild(p);

      var doneCount = Progress.count('lessons');
      var total = this.flatLessons().length;
      var bar = el('div', 'progress-bar');
      var fill = el('span');
      fill.style.width = (total ? (doneCount / total * 100) : 0) + '%';
      bar.appendChild(fill);
      intro.appendChild(bar);

      if (doneCount > 0) {
        var reset = el('button', 'btn small', t('learn.resetProgress'));
        reset.style.marginTop = '12px';
        reset.addEventListener('click', function () {
          Progress.write('lessons', {});
          self.showIndex();
        });
        intro.appendChild(reset);
      }

      side.appendChild(intro);

      CHESS_CURRICULUM.forEach(function (chapter, ci) {
        var panel = el('div', 'panel chapter');

        var head = el('div', 'chapter-head');
        head.appendChild(el('h3', null, chapter.title));
        var done = chapter.lessons.filter(function (lesson) {
          return Progress.has('lessons', chapter.id + '/' + lesson.id);
        }).length;
        head.appendChild(el('span', 'count', done + '/' + chapter.lessons.length));
        panel.appendChild(head);

        panel.appendChild(el('div', 'summary', chapter.summary));

        var list = el('div', 'lesson-list');
        chapter.lessons.forEach(function (lesson, li) {
          var id = chapter.id + '/' + lesson.id;
          var item = el('button', 'lesson-item' + (Progress.has('lessons', id) ? ' done' : ''));

          var tick = el('span', 'tick', '✓');
          item.appendChild(tick);
          item.appendChild(el('span', null, lesson.title));

          if (lesson.task) {
            var kind = lesson.task.type === 'mate' ? t('learn.badgePractice') : t('learn.badgeExercise');
            item.appendChild(el('span', 'badge', kind));
          }

          item.addEventListener('click', function () { self.openLesson(ci, li); });
          list.appendChild(item);
        });

        panel.appendChild(list);
        side.appendChild(panel);
      });
    },

    openLesson: function (ci, li) {
      var self = this;
      this.view = 'lesson';
      this.chapterIndex = ci;
      this.lessonIndex = li;
      this.state = 'reading';
      this.runner = null;
      this.drill = null;
      this.matePractice = null;

      var lesson = this.current().lesson;

      this.game = new Chess(lesson.fen);
      board.setOrientation(lesson.orientation || 'w');
      board.setLastMove(null);
      board.setHighlights(lesson.highlight || []);
      syncBoard(this.game, { animate: false });

      /* Setup moves are part of the story, so play them where the learner can
         see them rather than baking them into the FEN. */
      if (lesson.setup && lesson.setup.length) {
        board.setInteractive(false);
        this.playSequence(lesson.setup.slice(), 420, function () { self.beginTask(); });
      } else {
        this.beginTask();
      }

      this.renderLessonPanel();
    },

    playSequence: function (moves, delay, done) {
      var self = this;
      if (!moves.length) { done && done(); return; }

      setTimeout(function () {
        var move = self.game.move(moves.shift());
        if (move) {
          board.applyMove(move);
          board.setCheckSquare(checkSquareFor(self.game));
          self.renderLessonPanel();
        }
        self.playSequence(moves, delay, done);
      }, delay);
    },

    beginTask: function () {
      var self = this;
      var lesson = this.current().lesson;

      if (!lesson.task) {
        this.bindBoard();
        this.markDone();
        this.renderLessonPanel();
        return;
      }

      this.state = 'working';

      if (lesson.task.type === 'line') {
        this.runner = new LineRunner({
          game: this.game,
          line: lesson.task.line,
          accept: lesson.task.accept,
          onProgress: function (move) {
            board.applyMove(move);
            board.setCheckSquare(checkSquareFor(self.game));
            board.setMovableColor(self.game.turn());
            self.renderLessonPanel();
          },
          onWrong: function (played, expected) {
            self.state = 'wrong';
            self.lastWrong = played;
            self.renderLessonPanel();
          },
          onComplete: function () {
            self.state = 'done';
            board.setInteractive(false);
            self.markDone();
            self.renderLessonPanel();
          }
        });
      }

      if (lesson.task.type === 'captureAll') {
        this.drill = { piece: lesson.task.piece, remaining: this.countTargets() };
      }

      if (lesson.task.type === 'mate') {
        this.ai = this.ai || new ChessAI(lesson.task.aiLevel || 3);
        this.ai.setLevel(lesson.task.aiLevel || 3);
        this.matePractice = { thinking: false };
      }

      this.bindBoard();
      this.renderLessonPanel();
    },

    countTargets: function () {
      var rows = this.game.board();
      var n = 0;
      for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
          var p = rows[r][c];
          if (p && p.color === 'b' && p.type !== 'k') n++;
        }
      }
      return n;
    },

    handleMove: function (from, to, promotion) {
      var self = this;
      var lesson = this.current().lesson;
      if (!lesson.task || this.state === 'done') return;

      if (lesson.task.type === 'line') {
        /* Clear any previous "not that one" before attempting, and then leave
           the state alone - the runner's callbacks set it to wrong or done, and
           overwriting it here would wipe out a completion. */
        if (this.state === 'wrong') this.state = 'working';

        if (this.runner.attempt(from, to, promotion) === 'wrong') {
          /* The move was taken back, so put the piece visually back too. */
          syncBoard(this.game, { animate: false });
        }
        this.renderLessonPanel();
        return;
      }

      if (lesson.task.type === 'captureAll') {
        var move = this.game.move({ from: from, to: to, promotion: promotion });
        if (!move) return;

        board.applyMove(move);
        this.game.load(forceTurn(this.game.fen(), 'w'));
        board.setCheckSquare(checkSquareFor(this.game));

        this.drill.remaining = this.countTargets();
        if (this.drill.remaining === 0) {
          this.state = 'done';
          board.setInteractive(false);
          this.markDone();
        }
        this.renderLessonPanel();
        return;
      }

      if (lesson.task.type === 'mate') {
        var played = this.game.move({ from: from, to: to, promotion: promotion });
        if (!played) return;

        board.applyMove(played);
        board.setCheckSquare(checkSquareFor(this.game));

        if (this.game.isCheckmate()) {
          this.state = 'done';
          board.setInteractive(false);
          this.markDone();
          this.renderLessonPanel();
          return;
        }

        if (this.game.isGameOver()) {
          this.state = 'drawn';
          board.setInteractive(false);
          this.renderLessonPanel();
          return;
        }

        this.matePractice.thinking = true;
        this.renderLessonPanel();

        this.ai.findMoveAsync(this.game, function (result) {
          self.matePractice.thinking = false;
          if (result) {
            var reply = self.game.move({ from: result.from, to: result.to, promotion: result.promotion });
            if (reply) {
              board.applyMove(reply);
              board.setCheckSquare(checkSquareFor(self.game));
            }
          }
          if (self.game.isGameOver() && !self.game.isCheckmate()) self.state = 'drawn';
          self.renderLessonPanel();
        });
      }
    },

    markDone: function () {
      var current = this.current();
      Progress.mark('lessons', current.chapter.id + '/' + current.lesson.id);
    },

    replay: function () {
      this.openLesson(this.chapterIndex, this.lessonIndex);
    },

    go: function (delta) {
      var flat = this.flatLessons();
      var position = -1;
      for (var i = 0; i < flat.length; i++) {
        if (flat[i].ci === this.chapterIndex && flat[i].li === this.lessonIndex) { position = i; break; }
      }
      var next = position + delta;
      if (next < 0 || next >= flat.length) return;
      this.openLesson(flat[next].ci, flat[next].li);
    },

    runDemo: function () {
      var self = this;
      var lesson = this.current().lesson;
      this.game = new Chess(lesson.fen);
      syncBoard(this.game, { animate: false });
      board.setInteractive(false);

      var moves = (lesson.setup || []).concat(lesson.demo || []);
      this.demoRunning = true;
      this.renderLessonPanel();

      this.playSequence(moves.slice(), 700, function () {
        self.demoRunning = false;
        self.markDone();
        self.renderLessonPanel();
      });
    },

    renderLessonPanel: function () {
      var self = this;
      var current = this.current();
      var lesson = current.lesson;
      var side = $('side');
      side.innerHTML = '';

      /* --- status line above the board --- */
      var statusEl = $('status');
      statusEl.className = 'status';
      var statusText = current.chapter.title + ' — ' + lesson.title;
      var dot = 'dot';
      if (this.matePractice && this.matePractice.thinking) { statusText = t('status.defending'); dot = 'dot thinking'; }
      else if (this.state === 'done') { statusText = t('status.wellDone'); dot = 'dot'; }
      setHTML(statusEl, '<span class="' + dot + '"></span><span>' + statusText + '</span>');

      $('captured-top').innerHTML = '';
      $('captured-bottom').innerHTML = '';

      /* --- lesson text --- */
      var panel = el('div', 'panel');

      var crumb = el('div', 'crumb');
      var back = el('button', null, '← All lessons');
      back.addEventListener('click', function () { self.showIndex(); });
      crumb.appendChild(back);
      crumb.appendChild(el('span', null, current.chapter.title));
      panel.appendChild(crumb);

      panel.appendChild(el('h2', null, lesson.title));

      var text = el('div', 'lesson-text');
      text.innerHTML = lesson.text;
      panel.appendChild(text);

      if (lesson.demo) {
        var demoBtn = el('button', 'btn', this.demoRunning ? t('learn.playingDemo') : t('learn.playDemo'));
        demoBtn.disabled = !!this.demoRunning;
        demoBtn.style.marginTop = '12px';
        demoBtn.addEventListener('click', function () { self.runDemo(); });
        panel.appendChild(demoBtn);
      }

      if (lesson.task) panel.appendChild(this.renderTask(lesson));

      side.appendChild(panel);

      /* --- navigation --- */
      var nav = el('div', 'panel');
      var navRow = el('div', 'btn-row');

      var prev = el('button', 'btn', t('learn.previous'));
      prev.addEventListener('click', function () { self.go(-1); });
      navRow.appendChild(prev);

      var next = el('button', 'btn' + (this.state === 'done' || !lesson.task ? ' primary' : ''), t('learn.next'));
      next.addEventListener('click', function () { self.go(1); });
      navRow.appendChild(next);

      var flat = this.flatLessons();
      var position = 0;
      for (var i = 0; i < flat.length; i++) {
        if (flat[i].ci === this.chapterIndex && flat[i].li === this.lessonIndex) { position = i; break; }
      }
      prev.disabled = position === 0;
      next.disabled = position === flat.length - 1;

      nav.appendChild(navRow);
      nav.appendChild(el('div', 'muted', t('learn.counter', { n: position + 1, total: flat.length })));
      side.appendChild(nav);
    },

    renderTask: function (lesson) {
      var self = this;
      var task = lesson.task;
      var box = el('div', 'task');

      if (this.state === 'done') {
        box.className = 'task correct';
        box.appendChild(el('div', 'label', t('task.solved')));
        box.appendChild(el('div', null, task.success));
      } else if (this.state === 'drawn') {
        box.className = 'task wrong';
        box.appendChild(el('div', 'label', t('task.drawn')));
        box.appendChild(el('div', null,
          'That ended in a draw rather than mate. Watch for stalemate - give the king a square unless you are giving check.'));
      } else if (this.state === 'wrong') {
        box.className = 'task wrong';
        box.appendChild(el('div', 'label', t('task.notThatOne')));
        box.appendChild(el('div', null,
          (this.lastWrong ? t('task.wrongMove', { san: this.lastWrong }) + ' ' : '') + task.hint));
      } else {
        box.appendChild(el('div', 'label', task.type === 'mate' ? t('task.practice') : t('task.yourMove')));
        box.appendChild(el('div', null, task.instruction));

        if (task.type === 'captureAll' && this.drill) {
          box.appendChild(el('div', 'hint-text', t('task.leftToCapture', { n: this.drill.remaining })));
        }
      }

      var actions = el('div', 'task-actions');

      if (this.state !== 'done') {
        var hint = el('button', 'btn small', t('task.hint'));
        hint.addEventListener('click', function () {
          var existing = box.querySelector('.hint-shown');
          if (existing) return;
          var node = el('div', 'hint-text hint-shown', task.hint);
          node.style.marginTop = '8px';
          box.insertBefore(node, actions);
        });
        actions.appendChild(hint);
      }

      var retry = el('button', 'btn small', this.state === 'done' ? t('task.tryAgain') : t('task.restart'));
      retry.addEventListener('click', function () { self.replay(); });
      actions.appendChild(retry);

      box.appendChild(actions);
      return box;
    }
  };

  /* =================================================================
     Puzzles
     ================================================================= */

  var Puzzles = {
    view: 'index',
    index: 0,
    game: null,
    runner: null,
    state: 'working',
    lastWrong: null,

    start: function () {
      if (this.view === 'solve' && this.game) this.resume();
      else this.showIndex();
    },

    resume: function () {
      var puzzle = CHESS_PUZZLES[this.index];
      board.setOrientation(puzzle.orientation || 'w');
      board.setHighlights([]);
      syncBoard(this.game, { animate: false });
      this.bindBoard();
      this.render();
    },

    bindBoard: function () {
      var self = this;
      var finished = this.state === 'done';

      board.setInteractive(!finished);
      board.setMovableColor(this.game.turn());

      board.legalMoves = function (square) {
        if (self.state === 'done' || !self.runner || self.runner.isComplete()) return [];
        var piece = self.game.get(square);
        if (!piece || piece.color !== self.game.turn()) return [];
        return destinations(self.game, square);
      };

      board.onMove = function (from, to, promotion) {
        /* Reset before attempting; the runner's callbacks own the state after. */
        if (self.state === 'wrong') self.state = 'working';

        if (self.runner.attempt(from, to, promotion) === 'wrong') {
          syncBoard(self.game, { animate: false });
        }
        self.render();
      };
    },

    showIndex: function () {
      this.view = 'index';
      this.runner = null;

      this.game = new Chess();
      board.setOrientation('w');
      board.setInteractive(false);
      board.setLastMove(null);
      board.setHighlights([]);
      board.legalMoves = function () { return []; };
      syncBoard(this.game, { animate: false });

      var statusEl = $('status');
      statusEl.className = 'status';
      setHTML(statusEl, '<span class="dot"></span><span>' +
        Progress.count('puzzles') + ' of ' + CHESS_PUZZLES.length + ' puzzles solved</span>');

      $('captured-top').innerHTML = '';
      $('captured-bottom').innerHTML = '';

      this.renderIndexPanel();
    },

    renderIndexPanel: function () {
      var self = this;
      var side = $('side');
      side.innerHTML = '';

      var intro = el('div', 'panel');
      intro.appendChild(el('h2', null, t('puzzles.title')));
      var p = el('p', 'muted');
      p.textContent = t('puzzles.intro');
      intro.appendChild(p);

      var bar = el('div', 'progress-bar');
      var fill = el('span');
      fill.style.width = (Progress.count('puzzles') / CHESS_PUZZLES.length * 100) + '%';
      bar.appendChild(fill);
      intro.appendChild(bar);

      if (Progress.count('puzzles') > 0) {
        var reset = el('button', 'btn small', t('learn.resetProgress'));
        reset.style.marginTop = '12px';
        reset.addEventListener('click', function () {
          Progress.write('puzzles', {});
          self.showIndex();
        });
        intro.appendChild(reset);
      }

      side.appendChild(intro);

      var panel = el('div', 'panel');
      var list = el('div', 'puzzle-list');

      CHESS_PUZZLES.forEach(function (puzzle, i) {
        var item = el('button', 'lesson-item puzzle-item' +
          (Progress.has('puzzles', puzzle.id) ? ' done' : ''));

        item.appendChild(el('span', 'tick', '✓'));

        var label = el('span');
        label.appendChild(el('span', null, puzzle.title));
        label.appendChild(document.createTextNode(' '));
        label.appendChild(el('span', 'theme', puzzle.theme));
        item.appendChild(label);

        var pips = el('span', 'pips');
        for (var d = 1; d <= 3; d++) pips.appendChild(el('span', 'pip' + (d <= puzzle.difficulty ? ' on' : '')));
        item.appendChild(pips);

        item.addEventListener('click', function () { self.open(i); });
        list.appendChild(item);
      });

      panel.appendChild(list);
      side.appendChild(panel);
    },

    open: function (i) {
      var self = this;
      this.view = 'solve';
      this.index = i;
      this.state = 'working';
      this.lastWrong = null;

      var puzzle = CHESS_PUZZLES[i];
      this.game = new Chess(puzzle.fen);

      board.setOrientation(puzzle.orientation || this.game.turn());
      board.setLastMove(null);
      board.setHighlights([]);
      syncBoard(this.game, { animate: false });

      this.runner = new LineRunner({
        game: this.game,
        line: puzzle.line,
        accept: puzzle.accept,
        onProgress: function (move) {
          board.applyMove(move);
          board.setCheckSquare(checkSquareFor(self.game));
          board.setMovableColor(self.game.turn());
          self.render();
        },
        onWrong: function (played) {
          self.state = 'wrong';
          self.lastWrong = played;
          self.render();
        },
        onComplete: function () {
          self.state = 'done';
          board.setInteractive(false);
          Progress.mark('puzzles', puzzle.id);
          self.render();
        }
      });

      this.bindBoard();
      this.render();
    },

    render: function () {
      var self = this;
      var puzzle = CHESS_PUZZLES[this.index];
      var side = $('side');
      side.innerHTML = '';

      var statusEl = $('status');
      statusEl.className = 'status';
      setHTML(statusEl, '<span class="dot ' + this.game.turn() + '"></span><span>' +
        (this.state === 'done' ? t('puzzles.solved') : t('status.toMove', { side: sideName(this.game.turn()) })) + '</span>');

      $('captured-top').innerHTML = '';
      $('captured-bottom').innerHTML = '';

      var panel = el('div', 'panel');

      var crumb = el('div', 'crumb');
      var back = el('button', null, '← All puzzles');
      back.addEventListener('click', function () { self.showIndex(); });
      crumb.appendChild(back);
      crumb.appendChild(el('span', null, puzzle.theme));
      panel.appendChild(crumb);

      panel.appendChild(el('h2', null, puzzle.title));

      var box = el('div', 'task');
      if (this.state === 'done') {
        box.className = 'task correct';
        box.appendChild(el('div', 'label', t('task.solved')));
        box.appendChild(el('div', null, puzzle.success));
      } else if (this.state === 'wrong') {
        box.className = 'task wrong';
        box.appendChild(el('div', 'label', t('puzzles.tryAgain')));
        box.appendChild(el('div', null, t('puzzles.stronger', { san: this.lastWrong })));
      } else {
        box.appendChild(el('div', 'label', t('puzzles.findMove')));
        box.appendChild(el('div', null,
          this.runner.index > 0 ? t('puzzles.keepGoing') : t('puzzles.whiteToPlay')));
      }

      var actions = el('div', 'task-actions');

      if (this.state !== 'done') {
        var hint = el('button', 'btn small', t('task.hint'));
        hint.addEventListener('click', function () {
          if (box.querySelector('.hint-shown')) return;
          var node = el('div', 'hint-text hint-shown', puzzle.hint);
          node.style.marginTop = '8px';
          box.insertBefore(node, actions);
        });
        actions.appendChild(hint);

        var solution = el('button', 'btn small', t('puzzles.showSolution'));
        solution.addEventListener('click', function () {
          if (box.querySelector('.solution-shown')) return;
          var node = el('div', 'hint-text solution-shown', t('puzzles.solutionPrefix') + puzzle.line.join(' '));
          node.style.marginTop = '8px';
          box.insertBefore(node, actions);
        });
        actions.appendChild(solution);
      }

      var restart = el('button', 'btn small', this.state === 'done' ? t('puzzles.playAgain') : t('task.restart'));
      restart.addEventListener('click', function () { self.open(self.index); });
      actions.appendChild(restart);

      box.appendChild(actions);
      panel.appendChild(box);
      side.appendChild(panel);

      var nav = el('div', 'panel');
      var navRow = el('div', 'btn-row');

      var prev = el('button', 'btn', t('learn.previous'));
      prev.disabled = this.index === 0;
      prev.addEventListener('click', function () { self.open(self.index - 1); });
      navRow.appendChild(prev);

      var next = el('button', 'btn' + (this.state === 'done' ? ' primary' : ''), t('learn.next'));
      next.disabled = this.index === CHESS_PUZZLES.length - 1;
      next.addEventListener('click', function () { self.open(self.index + 1); });
      navRow.appendChild(next);

      nav.appendChild(navRow);
      nav.appendChild(el('div', 'muted', t('puzzles.counter', { n: this.index + 1, total: CHESS_PUZZLES.length })));
      side.appendChild(nav);
    }
  };

  /* =================================================================
     Guide - the manual for the interface itself
     ================================================================= */

  var Guide = {
    start: function () {
      /* Nothing to show on the board, so give the text the whole width. */
      document.querySelector('.board-area').classList.add('hidden');
      document.querySelector('.layout').classList.add('wide');

      var side = $('side');
      side.innerHTML = '';

      /* Falls back to English for a language the guide has not been
         written in yet, rather than showing an empty page. */
      var content = CHESS_GUIDE[global.I18n.current()] || CHESS_GUIDE.en;

      var panel = el('div', 'panel guide');
      panel.appendChild(el('h2', null, t('guide.title')));
      panel.appendChild(el('p', 'muted', content.intro));

      content.sections.forEach(function (section) {
        panel.appendChild(el('h3', null, section.title));
        if (section.note) panel.appendChild(el('p', 'muted', section.note));

        var table = el('table', 'guide-table');
        var body = el('tbody');

        section.rows.forEach(function (row) {
          var tr = el('tr');
          tr.appendChild(el('td', 'guide-key', row[0]));
          tr.appendChild(el('td', null, row[1]));
          body.appendChild(tr);
        });

        table.appendChild(body);
        panel.appendChild(table);
      });

      side.appendChild(panel);
    }
  };

  /* =================================================================
     Boot
     ================================================================= */

  var MODES = { play: Play, learn: Learn, puzzles: Puzzles, guide: Guide };

  function switchMode(next) {
    if (!MODES[next]) return;
    mode = next;

    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].setAttribute('aria-selected', String(tabs[i].dataset.mode === next));
    }

    /* Every mode except the guide wants the board back. */
    document.querySelector('.board-area').classList.remove('hidden');
    document.querySelector('.layout').classList.remove('wide');

    board.setMovableColor('both');
    board.clearSelection();
    MODES[next].start();
  }

  /* Builds the language menu from whatever I18n advertises, so adding a
     language to i18n.js is enough to make it appear here. */
  function buildLanguageMenu() {
    var select = $('language');
    select.innerHTML = '';

    global.I18n.languages.forEach(function (language) {
      var option = el('option', null, language.name);
      option.value = language.code;
      if (language.code === global.I18n.current()) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener('change', function () {
      global.I18n.set(select.value);
    });
  }

  function init() {
    global.I18n.applyToDocument();
    board = new ChessBoard($('board'), { orientation: 'w' });
    buildLanguageMenu();

    /* Re-enter the current mode so every rendered string is rebuilt. The
       board keeps its position because each mode resumes rather than resets. */
    global.I18n.onChange(function () {
      global.I18n.applyToDocument();
      buildLanguageMenu();
      MODES[mode].start();
    });

    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      (function (tab) {
        tab.addEventListener('click', function () { switchMode(tab.dataset.mode); });
      })(tabs[i]);
    }

    document.addEventListener('keydown', function (event) {
      if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
      if (event.key === 'f' && mode === 'play') { board.flip(); Play.refresh(); }
      if (event.key === 'u' && mode === 'play') Play.undo();
    });

    switchMode('play');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof globalThis !== 'undefined' ? globalThis : this);
