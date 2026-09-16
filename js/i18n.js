/*!
 * i18n.js - interface translation.
 *
 * Adding a language means two things and nothing else:
 *   1. add an entry to LANGUAGES
 *   2. add a table of the same keys to STRINGS
 *
 * Any key a translation is missing falls back to English rather than showing
 * a blank or a raw key, so a partial translation is still usable.
 *
 * Placeholders are written {likeThis} and filled from the second argument.
 */
(function (global) {
  'use strict';

  var LANGUAGES = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'he', name: 'עברית', dir: 'rtl' },
    { code: 'ru', name: 'Русский', dir: 'ltr' }
  ];

  var STRINGS = {

    /* ================================================================ */
    en: {
      'app.name': 'Knight School',
      'app.tagline': 'play, learn, solve',
      'app.docTitle': 'Knight School',

      'tab.play': 'Play',
      'tab.learn': 'Learn',
      'tab.puzzles': 'Puzzles',
      'tab.guide': 'Guide',

      'lang.label': 'Language',
      'footnote': 'Click or drag to move. In Play mode, <span class="kbd">f</span> flips the board and <span class="kbd">u</span> takes a move back.',

      'side.white': 'White',
      'side.black': 'Black',

      'status.loading': 'Loading…',
      'status.toMove': '{side} to move',
      'status.check': '{side} to move - check!',
      'status.thinking': 'The computer is thinking…',
      'status.defending': 'The computer is defending…',
      'status.checkmate': 'Checkmate - {side} wins.',
      'status.drawBy': 'Draw by {reason}.',
      'status.wellDone': 'Well done.',

      'reason.stalemate': 'stalemate',
      'reason.insufficient material': 'insufficient material',
      'reason.threefold repetition': 'threefold repetition',
      'reason.the fifty-move rule': 'the fifty-move rule',

      'play.game': 'Game',
      'play.opponent': 'Opponent',
      'play.computer': 'Computer',
      'play.twoPlayers': 'Two players, one screen',
      'play.strength': 'Strength',
      'play.yourColour': 'Your colour',
      'play.newGame': 'New game',
      'play.undo': 'Undo',
      'play.flip': 'Flip board',
      'play.moves': 'Moves',
      'play.noMoves': 'No moves yet. White starts.',
      'play.copyMoves': 'Copy moves',
      'play.copyPosition': 'Copy position',
      'play.copied': 'Copied',
      'play.copyFallback': 'Press Ctrl+C',

      'level.1': 'Beginner',
      'level.2': 'Casual',
      'level.3': 'Club',
      'level.4': 'Strong',

      'learn.title': 'Learn chess',
      'learn.intro': '{chapters} chapters, from how the pieces move to the endgames that decide games. Work through them in order, or jump to whatever you want to fix.',
      'learn.progress': '{done} of {total} lessons complete',
      'learn.resetProgress': 'Reset progress',
      'learn.allLessons': '← All lessons',
      'learn.previous': '← Previous',
      'learn.next': 'Next →',
      'learn.counter': 'Lesson {n} of {total}',
      'learn.badgeExercise': 'exercise',
      'learn.badgePractice': 'practice',
      'learn.playDemo': 'Play demonstration',
      'learn.playingDemo': 'Playing…',

      'task.yourMove': 'Your move',
      'task.practice': 'Practice',
      'task.solved': 'Solved',
      'task.notThatOne': 'Not that one',
      'task.drawn': 'Drawn',
      'task.drawnText': 'That ended in a draw rather than mate. Watch for stalemate - give the king a square unless you are giving check.',
      'task.wrongMove': '{san} is legal, but it is not the idea here.',
      'task.hint': 'Hint',
      'task.restart': 'Restart',
      'task.tryAgain': 'Try again',
      'task.leftToCapture': '{n} left to capture.',

      'puzzles.title': 'Tactics puzzles',
      'puzzles.intro': 'Every position has one idea. White to move in all of them. Play your move on the board - the opponent replies automatically.',
      'puzzles.progress': '{done} of {total} puzzles solved',
      'puzzles.allPuzzles': '← All puzzles',
      'puzzles.findMove': 'Find the move',
      'puzzles.whiteToPlay': 'White to play and win.',
      'puzzles.keepGoing': 'Good - now keep going.',
      'puzzles.solved': 'Solved.',
      'puzzles.tryAgain': 'Try again',
      'puzzles.stronger': '{san} is legal, but there is something stronger.',
      'puzzles.showSolution': 'Show solution',
      'puzzles.solutionPrefix': 'Solution: ',
      'puzzles.playAgain': 'Play again',
      'puzzles.counter': 'Puzzle {n} of {total}',

      'guide.title': 'Quick guide',

      'promo.prompt': 'Promote to',
      'piece.q': 'Queen',
      'piece.r': 'Rook',
      'piece.b': 'Bishop',
      'piece.n': 'Knight'
    },

    /* ================================================================ */
    he: {
      'app.name': 'Knight School',
      'app.tagline': 'לשחק, ללמוד, לפתור',
      'app.docTitle': 'Knight School',

      'tab.play': 'משחק',
      'tab.learn': 'לימוד',
      'tab.puzzles': 'תרגילים',
      'tab.guide': 'הוראות',

      'lang.label': 'שפה',
      'footnote': 'לחיצה או גרירה מזיזה כלי. במצב משחק, <span class="kbd">f</span> הופך את הלוח ו־<span class="kbd">u</span> מבטל מהלך.',

      'side.white': 'הלבן',
      'side.black': 'השחור',

      'status.loading': 'טוען…',
      'status.toMove': 'תור {side}',
      'status.check': 'תור {side} - שח!',
      'status.thinking': 'המחשב חושב…',
      'status.defending': 'המחשב מגן…',
      'status.checkmate': 'מט - {side} ניצח.',
      'status.drawBy': 'תיקו בשל {reason}.',
      'status.wellDone': 'כל הכבוד.',

      'reason.stalemate': 'פט',
      'reason.insufficient material': 'חוסר חומר מספיק',
      'reason.threefold repetition': 'חזרה שלוש פעמים על אותה עמדה',
      'reason.the fifty-move rule': 'חוק חמישים המהלכים',

      'play.game': 'משחק',
      'play.opponent': 'יריב',
      'play.computer': 'מחשב',
      'play.twoPlayers': 'שני שחקנים, מסך אחד',
      'play.strength': 'רמת קושי',
      'play.yourColour': 'הצבע שלך',
      'play.newGame': 'משחק חדש',
      'play.undo': 'ביטול מהלך',
      'play.flip': 'היפוך הלוח',
      'play.moves': 'מהלכים',
      'play.noMoves': 'עדיין אין מהלכים. הלבן פותח.',
      'play.copyMoves': 'העתקת מהלכים',
      'play.copyPosition': 'העתקת עמדה',
      'play.copied': 'הועתק',
      'play.copyFallback': 'Ctrl+C להעתקה',

      'level.1': 'מתחיל',
      'level.2': 'חובב',
      'level.3': 'מועדון',
      'level.4': 'חזק',

      'learn.title': 'ללמוד שחמט',
      'learn.intro': '{chapters} פרקים, מתנועת הכלים ועד סופי המשחק שמכריעים משחקים. אפשר לעבור לפי הסדר, או לקפוץ למה שרוצים לחזק.',
      'learn.progress': '{done} מתוך {total} שיעורים הושלמו',
      'learn.resetProgress': 'איפוס התקדמות',
      'learn.allLessons': '→ כל השיעורים',
      'learn.previous': '→ הקודם',
      'learn.next': 'הבא ←',
      'learn.counter': 'שיעור {n} מתוך {total}',
      'learn.badgeExercise': 'תרגיל',
      'learn.badgePractice': 'אימון',
      'learn.playDemo': 'הצגת הדגמה',
      'learn.playingDemo': 'מדגים…',

      'task.yourMove': 'המהלך שלך',
      'task.practice': 'אימון',
      'task.solved': 'נפתר',
      'task.notThatOne': 'לא זה',
      'task.drawn': 'תיקו',
      'task.drawnText': 'זה נגמר בתיקו ולא במט. שים לב לפט - צריך להשאיר למלך משבצה, אלא אם מוסרים שח.',
      'task.wrongMove': '{san} חוקי, אבל זה לא הרעיון כאן.',
      'task.hint': 'רמז',
      'task.restart': 'התחלה מחדש',
      'task.tryAgain': 'ניסיון נוסף',
      'task.leftToCapture': 'נשארו {n} לאכול.',

      'puzzles.title': 'תרגילי טקטיקה',
      'puzzles.intro': 'בכל עמדה יש רעיון אחד. בכולם הלבן משחק. משחקים על הלוח - היריב עונה אוטומטית.',
      'puzzles.progress': '{done} מתוך {total} תרגילים נפתרו',
      'puzzles.allPuzzles': '→ כל התרגילים',
      'puzzles.findMove': 'המהלך הנכון',
      'puzzles.whiteToPlay': 'הלבן משחק ומנצח.',
      'puzzles.keepGoing': 'יפה - עכשיו ממשיכים.',
      'puzzles.solved': 'נפתר.',
      'puzzles.tryAgain': 'ניסיון נוסף',
      'puzzles.stronger': '{san} חוקי, אבל יש משהו חזק יותר.',
      'puzzles.showSolution': 'הצגת פתרון',
      'puzzles.solutionPrefix': 'פתרון: ',
      'puzzles.playAgain': 'שוב',
      'puzzles.counter': 'תרגיל {n} מתוך {total}',

      'guide.title': 'מדריך מהיר',

      'promo.prompt': 'הכתרה ל־',
      'piece.q': 'מלכה',
      'piece.r': 'צריח',
      'piece.b': 'רץ',
      'piece.n': 'פרש'
    },

    /* ================================================================ */
    ru: {
      'app.name': 'Knight School',
      'app.tagline': 'играть, учиться, решать',
      'app.docTitle': 'Knight School',

      'tab.play': 'Игра',
      'tab.learn': 'Обучение',
      'tab.puzzles': 'Задачи',
      'tab.guide': 'Руководство',

      'lang.label': 'Язык',
      'footnote': 'Нажмите или перетащите, чтобы сделать ход. В режиме игры <span class="kbd">f</span> переворачивает доску, а <span class="kbd">u</span> отменяет ход.',

      'side.white': 'Белые',
      'side.black': 'Чёрные',

      'status.loading': 'Загрузка…',
      'status.toMove': 'Ход: {side}',
      'status.check': 'Ход: {side} - шах!',
      'status.thinking': 'Компьютер думает…',
      'status.defending': 'Компьютер защищается…',
      'status.checkmate': 'Мат - {side} выиграли.',
      'status.drawBy': 'Ничья: {reason}.',
      'status.wellDone': 'Отлично.',

      'reason.stalemate': 'пат',
      'reason.insufficient material': 'недостаточно материала',
      'reason.threefold repetition': 'троекратное повторение позиции',
      'reason.the fifty-move rule': 'правило пятидесяти ходов',

      'play.game': 'Игра',
      'play.opponent': 'Соперник',
      'play.computer': 'Компьютер',
      'play.twoPlayers': 'Два игрока на одном экране',
      'play.strength': 'Уровень',
      'play.yourColour': 'Ваш цвет',
      'play.newGame': 'Новая игра',
      'play.undo': 'Отменить ход',
      'play.flip': 'Перевернуть доску',
      'play.moves': 'Ходы',
      'play.noMoves': 'Ходов пока нет. Белые начинают.',
      'play.copyMoves': 'Копировать ходы',
      'play.copyPosition': 'Копировать позицию',
      'play.copied': 'Скопировано',
      'play.copyFallback': 'Нажмите Ctrl+C',

      'level.1': 'Новичок',
      'level.2': 'Любитель',
      'level.3': 'Клубный',
      'level.4': 'Сильный',

      'learn.title': 'Учиться шахматам',
      'learn.intro': 'Глав: {chapters} - от того, как ходят фигуры, до окончаний, которые решают партию. Можно идти по порядку или сразу перейти к тому, что хочется подтянуть.',
      'learn.progress': 'Пройдено уроков: {done} из {total}',
      'learn.resetProgress': 'Сбросить прогресс',
      'learn.allLessons': '← Все уроки',
      'learn.previous': '← Назад',
      'learn.next': 'Далее →',
      'learn.counter': 'Урок {n} из {total}',
      'learn.badgeExercise': 'упражнение',
      'learn.badgePractice': 'практика',
      'learn.playDemo': 'Показать пример',
      'learn.playingDemo': 'Идёт показ…',

      'task.yourMove': 'Ваш ход',
      'task.practice': 'Практика',
      'task.solved': 'Решено',
      'task.notThatOne': 'Не этот ход',
      'task.drawn': 'Ничья',
      'task.drawnText': 'Получилась ничья, а не мат. Следите за патом - у короля должно оставаться поле, если вы не объявляете шах.',
      'task.wrongMove': '{san} - ход допустимый, но идея здесь другая.',
      'task.hint': 'Подсказка',
      'task.restart': 'Начать заново',
      'task.tryAgain': 'Ещё попытка',
      'task.leftToCapture': 'Осталось взять: {n}.',

      'puzzles.title': 'Тактические задачи',
      'puzzles.intro': 'В каждой позиции одна идея. Везде ход белых. Сделайте ход на доске - соперник ответит сам.',
      'puzzles.progress': 'Решено задач: {done} из {total}',
      'puzzles.allPuzzles': '← Все задачи',
      'puzzles.findMove': 'Найдите ход',
      'puzzles.whiteToPlay': 'Белые начинают и выигрывают.',
      'puzzles.keepGoing': 'Верно - продолжайте.',
      'puzzles.solved': 'Решено.',
      'puzzles.tryAgain': 'Ещё попытка',
      'puzzles.stronger': '{san} - ход допустимый, но есть сильнее.',
      'puzzles.showSolution': 'Показать решение',
      'puzzles.solutionPrefix': 'Решение: ',
      'puzzles.playAgain': 'Ещё раз',
      'puzzles.counter': 'Задача {n} из {total}',

      'guide.title': 'Краткое руководство',

      'promo.prompt': 'Превратить в',
      'piece.q': 'Ферзь',
      'piece.r': 'Ладья',
      'piece.b': 'Слон',
      'piece.n': 'Конь'
    }
  };

  var current = 'en';
  var listeners = [];

  function fill(text, vars) {
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (match, key) {
      return vars[key] !== undefined ? vars[key] : match;
    });
  }

  var I18n = {
    languages: LANGUAGES,

    /* Falls back to English, then to the key itself, so a missing string is
       always visible as something rather than an empty element. */
    t: function (key, vars) {
      var table = STRINGS[current] || {};
      var text = table[key];
      if (text === undefined) text = STRINGS.en[key];
      if (text === undefined) return key;
      return fill(text, vars);
    },

    current: function () { return current; },

    dir: function () {
      for (var i = 0; i < LANGUAGES.length; i++) {
        if (LANGUAGES[i].code === current) return LANGUAGES[i].dir;
      }
      return 'ltr';
    },

    has: function (code) { return !!STRINGS[code]; },

    /*
     * Compares every language table against English and reports what is
     * missing or left over. Translating is incremental by design - a missing
     * key falls back rather than breaking - so this is how you find the gaps
     * instead of hunting for an English string in a translated screen.
     */
    audit: function () {
      var reference = Object.keys(STRINGS.en);
      var report = {};

      for (var code in STRINGS) {
        if (!Object.prototype.hasOwnProperty.call(STRINGS, code)) continue;
        if (code === 'en') continue;

        var table = STRINGS[code];
        var missing = [];
        var unknown = [];
        var i;

        for (i = 0; i < reference.length; i++) {
          if (table[reference[i]] === undefined) missing.push(reference[i]);
        }
        for (var key in table) {
          if (!Object.prototype.hasOwnProperty.call(table, key)) continue;
          if (STRINGS.en[key] === undefined) unknown.push(key);
        }

        report[code] = {
          translated: reference.length - missing.length,
          total: reference.length,
          missing: missing,
          unknown: unknown
        };
      }

      return report;
    },

    set: function (code) {
      if (!STRINGS[code] || code === current) return false;
      current = code;
      this.save();
      this.applyToDocument();
      for (var i = 0; i < listeners.length; i++) listeners[i](code);
      return true;
    },

    onChange: function (fn) { listeners.push(fn); },

    /* Sets document direction and language, and fills every element that
       carries a data-i18n attribute. */
    applyToDocument: function () {
      var html = document.documentElement;
      html.setAttribute('lang', current);
      html.setAttribute('dir', this.dir());

      var titleKey = 'app.docTitle';
      document.title = this.t(titleKey);

      var nodes = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].textContent = this.t(nodes[i].getAttribute('data-i18n'));
      }

      var htmlNodes = document.querySelectorAll('[data-i18n-html]');
      for (var j = 0; j < htmlNodes.length; j++) {
        htmlNodes[j].innerHTML = this.t(htmlNodes[j].getAttribute('data-i18n-html'));
      }
    },

    save: function () {
      try { global.localStorage.setItem('chess.language', current); } catch (err) { /* ignore */ }
    },

    /* Remembered choice first, then the browser's language, then English. */
    detect: function () {
      var saved = null;
      try { saved = global.localStorage.getItem('chess.language'); } catch (err) { saved = null; }
      if (saved && STRINGS[saved]) { current = saved; return; }

      var nav = (global.navigator && (navigator.language || navigator.userLanguage)) || 'en';
      var base = String(nav).toLowerCase().split('-')[0];
      if (STRINGS[base]) current = base;
    }
  };

  I18n.detect();

  global.I18n = I18n;

})(typeof globalThis !== 'undefined' ? globalThis : this);
