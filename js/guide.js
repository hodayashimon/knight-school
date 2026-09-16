/*!
 * guide.js - the in-app manual, per language.
 *
 * This is deliberately about the interface, not about chess. The rules are
 * taught in Learn; this answers "where is the button and what does it do".
 *
 * A language with no entry here falls back to English.
 */
(function (global) {
  'use strict';

  global.CHESS_GUIDE = {

    /* ================================================================ */
    en: {
      intro: 'Everything you can press, and the handful of things that are not obvious. ' +
             'Nothing here is about the rules of chess - those are in the Learn tab.',

      sections: [
        {
          title: 'Moving a piece',
          rows: [
            ['Click a piece',
             'Dots appear on every square it may legally move to. A ring drawn around a whole square means a capture rather than a quiet move.'],
            ['Click a dot',
             'Plays the move. That is the whole interaction - two clicks.'],
            ['Drag instead',
             'Press on a piece and drag it. Release on the destination square. Releasing anywhere else puts it back.'],
            ['Cancel a selection',
             'Click the same piece again, or right-click anywhere on the board.'],
            ['No dots appeared',
             'That piece has no legal move, it is not your turn, or the position is already finished. In a capture drill, only the piece being drilled will light up.'],
            ['Promoting a pawn',
             'A chooser appears over the board with queen, rook, bishop and knight. Click one, or press Q, R, B or N. Escape cancels the move entirely.']
          ]
        },
        {
          title: 'Reading the board',
          rows: [
            ['Yellow squares', 'The move that was just played - both the square it left and the square it landed on.'],
            ['Red glow', 'The king that is currently in check.'],
            ['Blue squares', 'Squares the lesson you are reading is pointing at.'],
            ['Letters and numbers', 'Coordinates, along the bottom and left edges. They follow the board when you flip it, so they always read correctly from your side.'],
            ['Rows above and below', 'Pieces each side has lost. The small number is the material lead, counted in pawns - so "+3" means three pawns\' worth ahead.'],
            ['The bar above the board', 'Whose turn it is, whether someone is in check, whether the computer is thinking, and how the game ended.']
          ]
        },
        {
          title: 'Play',
          note: 'The controls live in the Game panel, to the side of the board - or underneath it on a narrow window.',
          rows: [
            ['Opponent', 'Computer, or two players sharing one screen. Switching starts a fresh game.'],
            ['Strength', 'Four levels. Beginner and Casual miss things and blunder on purpose; Club and Strong do not. Strong thinks for up to a couple of seconds a move.'],
            ['Your colour', 'White or Black. Choosing Black starts a new game, flips the board, and the computer opens.'],
            ['New game', 'Resets to the starting position with the current settings.'],
            ['Undo', 'Takes back your move and the computer\'s reply together, so it is your turn again. Click repeatedly to keep going back. Greyed out while the computer is thinking. Against a second human it takes back one move at a time.'],
            ['Flip board', 'Turns the board around. It does not change whose turn it is or affect the game.'],
            ['Moves', 'The game so far in chess notation, newest at the bottom.'],
            ['Copy moves', 'Puts the game on your clipboard, ready to paste into any chess site or app.'],
            ['Copy position', 'Copies just the current position, as a FEN string.']
          ]
        },
        {
          title: 'Learn',
          rows: [
            ['The chapter list', 'The chapters run in a sensible order, but nothing is locked - jump anywhere.'],
            ['The circle beside a lesson', 'Fills in green once you have finished that lesson. The count beside each chapter title tracks the same thing.'],
            ['"exercise" or "practice"', 'That lesson has something to do on the board. Lessons with no badge are reading only, and are marked done when you open them.'],
            ['Hint', 'One nudge toward the idea. It costs nothing and does not mark the lesson differently.'],
            ['Restart', 'Puts the position back and lets you try the exercise again.'],
            ['Previous / Next', 'Moves through every lesson in order, across chapter boundaries.'],
            ['Play demonstration', 'On lessons that show a sequence, plays the moves for you at reading speed.'],
            ['All lessons', 'At the top of the lesson panel - goes back to the chapter list.'],
            ['Reset progress', 'On the chapter list, under the intro. Clears every tick.']
          ]
        },
        {
          title: 'Puzzles',
          rows: [
            ['The three dots', 'Difficulty, from one to three. Themes are listed beside each title.'],
            ['A wrong move', 'Is taken back for you, with a note saying it was legal but not the point. Nothing is lost - just try again.'],
            ['Hint', 'Describes the idea without naming the move.'],
            ['Show solution', 'Prints the entire winning line, if you would rather just see it.'],
            ['Restart', 'Replays the same puzzle from the beginning.']
          ]
        },
        {
          title: 'Language',
          rows: [
            ['The language menu', 'Top of the page, beside the tabs. Switching translates the interface immediately and remembers your choice.'],
            ['What gets translated', 'Every button, label and message, and this guide. The lesson explanations themselves are currently English only.'],
            ['Hebrew and other RTL languages', 'The page flips to right-to-left, but the board never does - files still run a to h from left to right, exactly as on a real board.'],
            ['Move notation', 'Stays international (K Q R B N), because that is what every chess site, book and database uses.']
          ]
        },
        {
          title: 'Keyboard',
          rows: [
            ['F', 'Flip the board (Play mode).'],
            ['U', 'Take back a move (Play mode).'],
            ['Q  R  B  N', 'Pick the piece when promoting a pawn.'],
            ['Escape', 'Cancel the promotion chooser.']
          ]
        },
        {
          title: 'Easy to miss',
          rows: [
            ['Castling',
             'Move the king two squares toward the rook - the rook jumps across by itself. Clicking the rook just selects the rook.'],
            ['En passant',
             'Click your pawn and a dot appears on an empty diagonal square. That is the capture; the enemy pawn comes off even though you never land on it.'],
            ['Your progress is local',
             'Ticks, solved puzzles and your language choice are stored in this browser only. They survive closing the tab, but not clearing site data, and they do not follow you to another device.'],
            ['Narrow windows stack',
             'Below about 900 pixels wide, the panels move underneath the board instead of beside it. Scroll down to reach them.'],
            ['Leaving a lesson is safe',
             'Switching to Play and back keeps your place in a half-finished sequence.'],
            ['The board locks while the computer thinks',
             'Pieces will not pick up for a moment on the higher levels. The bar above the board says so.']
          ]
        }
      ]
    },

    /* ================================================================ */
    he: {
      intro: 'כל מה שאפשר ללחוץ עליו, והדברים הבודדים שאי אפשר לנחש. ' +
             'אין כאן שום דבר על חוקי השחמט - אלה נמצאים בלשונית הלימוד.',

      sections: [
        {
          title: 'הזזת כלי',
          rows: [
            ['לחיצה על כלי',
             'נקודות מופיעות על כל משבצת שהכלי רשאי לזוז אליה. טבעת מסביב למשבצת שלמה פירושה אכילה, ולא מהלך רגיל.'],
            ['לחיצה על נקודה',
             'מבצעת את המהלך. זו כל האינטראקציה - שתי לחיצות.'],
            ['גרירה במקום',
             'לוחצים על כלי וגוררים אותו. משחררים על משבצת היעד. שחרור בכל מקום אחר מחזיר אותו למקומו.'],
            ['ביטול בחירה',
             'לחיצה נוספת על אותו כלי, או לחיצה ימנית בכל מקום על הלוח.'],
            ['לא הופיעו נקודות',
             'לכלי הזה אין מהלך חוקי, זה לא התור שלך, או שהעמדה כבר הסתיימה. בתרגיל אכילה רק הכלי שמתאמנים עליו יגיב.'],
            ['הכתרת רגלי',
             'חלון בחירה נפתח מעל הלוח עם מלכה, צריח, רץ ופרש. לוחצים על אחד מהם, או מקישים Q, R, B או N. מקש Escape מבטל את המהלך לגמרי.']
          ]
        },
        {
          title: 'קריאת הלוח',
          rows: [
            ['משבצות צהובות', 'המהלך שזה עתה שוחק - גם המשבצת שממנה יצא הכלי וגם זו שאליה הגיע.'],
            ['זוהר אדום', 'המלך שנמצא כרגע בשח.'],
            ['משבצות כחולות', 'משבצות שהשיעור הנוכחי מצביע עליהן.'],
            ['אותיות ומספרים', 'קואורדינטות, בשוליים התחתונים והשמאליים של הלוח. הן מתהפכות יחד עם הלוח, כך שתמיד נקראות נכון מהצד שלך.'],
            ['השורות מעל ומתחת ללוח', 'הכלים שכל צד איבד. המספר הקטן הוא יתרון החומר, בספירת רגלים - כלומר "3+" פירושו יתרון בשווי שלושה רגלים.'],
            ['הפס מעל הלוח', 'תור של מי, האם מישהו בשח, האם המחשב חושב, ואיך המשחק הסתיים.']
          ]
        },
        {
          title: 'משחק',
          note: 'הפקדים נמצאים בפאנל "משחק", לצד הלוח - או מתחתיו בחלון צר.',
          rows: [
            ['יריב', 'מחשב, או שני שחקנים שחולקים מסך אחד. החלפה מתחילה משחק חדש.'],
            ['רמת קושי', 'ארבע רמות. "מתחיל" ו"חובב" מפספסים דברים ומשגים בכוונה; "מועדון" ו"חזק" לא. הרמה החזקה חושבת עד כשתי שניות למהלך.'],
            ['הצבע שלך', 'לבן או שחור. בחירה בשחור מתחילה משחק חדש, הופכת את הלוח, והמחשב פותח.'],
            ['משחק חדש', 'איפוס לעמדת הפתיחה עם ההגדרות הנוכחיות.'],
            ['ביטול מהלך', 'מבטל את המהלך שלך ואת תשובת המחשב יחד, כך שהתור חוזר אליך. אפשר ללחוץ שוב ושוב כדי לחזור עוד אחורה. מעומעם בזמן שהמחשב חושב. מול שחקן אנושי שני מבטל מהלך אחד בכל פעם.'],
            ['היפוך הלוח', 'מסובב את הלוח. לא משנה את התור ולא משפיע על המשחק.'],
            ['מהלכים', 'המשחק עד כה בסימון שחמט, החדש ביותר למטה.'],
            ['העתקת מהלכים', 'מעתיקה את המשחק ללוח הגזירים, מוכן להדבקה בכל אתר או אפליקציית שחמט.'],
            ['העתקת עמדה', 'מעתיקה רק את העמדה הנוכחית, כמחרוזת FEN.']
          ]
        },
        {
          title: 'לימוד',
          rows: [
            ['רשימת הפרקים', 'הפרקים מסודרים בסדר הגיוני, אבל שום דבר לא נעול - אפשר לקפוץ לכל מקום.'],
            ['העיגול ליד שיעור', 'מתמלא בירוק אחרי סיום השיעור. המונה ליד כותרת הפרק סופר את אותו הדבר.'],
            ['התגית "תרגיל" או "אימון"', 'לשיעור הזה יש משהו לעשות על הלוח. שיעורים בלי תגית הם קריאה בלבד, ומסומנים כהושלמו ברגע שפותחים אותם.'],
            ['רמז', 'דחיפה קטנה לכיוון הרעיון. לא עולה כלום ולא משנה את סימון השיעור.'],
            ['התחלה מחדש', 'מחזירה את העמדה ומאפשרת לנסות את התרגיל שוב.'],
            ['הקודם / הבא', 'מעבר בין כל השיעורים לפי הסדר, גם בין פרקים.'],
            ['הצגת הדגמה', 'בשיעורים שמציגים רצף מהלכים, משחקת אותם במהירות קריאה.'],
            ['כל השיעורים', 'בראש פאנל השיעור - חזרה לרשימת הפרקים.'],
            ['איפוס התקדמות', 'ברשימת הפרקים, מתחת להקדמה. מוחק את כל הסימונים.']
          ]
        },
        {
          title: 'תרגילים',
          rows: [
            ['שלוש הנקודות', 'דרגת קושי, מאחת עד שלוש. הנושא מופיע ליד כל כותרת.'],
            ['מהלך שגוי', 'מוחזר אוטומטית, עם הערה שהוא חוקי אבל לא הנקודה. שום דבר לא אבד - פשוט מנסים שוב.'],
            ['רמז', 'מתאר את הרעיון בלי לנקוב במהלך.'],
            ['הצגת פתרון', 'מדפיסה את כל רצף הפתרון, למי שמעדיף פשוט לראות.'],
            ['התחלה מחדש', 'משחקת את אותו תרגיל מההתחלה.']
          ]
        },
        {
          title: 'שפה',
          rows: [
            ['תפריט השפה', 'בראש הדף, ליד הלשוניות. החלפה מתרגמת את הממשק מיד וזוכרת את הבחירה.'],
            ['מה מתורגם', 'כל כפתור, תווית והודעה, וגם המדריך הזה. הסברי השיעורים עצמם הם כרגע באנגלית בלבד.'],
            ['עברית ושפות מימין לשמאל', 'הדף מתהפך לימין-לשמאל, אבל הלוח לעולם לא - הטורים עדיין רצים a עד h משמאל לימין, בדיוק כמו בלוח אמיתי.'],
            ['סימון המהלכים', 'נשאר בינלאומי (K Q R B N), כי זה מה שכל אתר, ספר ומאגר שחמט משתמשים בו.']
          ]
        },
        {
          title: 'מקלדת',
          rows: [
            ['F', 'היפוך הלוח (במצב משחק).'],
            ['U', 'ביטול מהלך (במצב משחק).'],
            ['Q  R  B  N', 'בחירת הכלי בהכתרת רגלי.'],
            ['Escape', 'ביטול חלון ההכתרה.']
          ]
        },
        {
          title: 'קל לפספס',
          rows: [
            ['הצרחה',
             'מזיזים את המלך שתי משבצות לכיוון הצריח - הצריח קופץ לבד. לחיצה על הצריח רק בוחרת את הצריח.'],
            ['אכילה דרך הילוכו',
             'לוחצים על הרגלי ומופיעה נקודה על משבצת אלכסונית ריקה. זו האכילה; הרגלי היריב יורד מהלוח למרות שאף פעם לא נוחתים עליו.'],
            ['ההתקדמות נשמרת מקומית',
             'הסימונים, התרגילים שנפתרו ובחירת השפה נשמרים בדפדפן הזה בלבד. הם שורדים סגירת לשונית, אבל לא ניקוי נתוני אתרים, והם לא עוברים למחשב אחר.'],
            ['חלון צר מסדר בערימה',
             'מתחת לרוחב של כ-900 פיקסלים, הפאנלים עוברים אל מתחת ללוח במקום לצדו. צריך לגלול למטה כדי להגיע אליהם.'],
            ['יציאה משיעור בטוחה',
             'מעבר ללשונית המשחק וחזרה שומר על המקום ברצף שלא הושלם.'],
            ['הלוח ננעל בזמן שהמחשב חושב',
             'ברמות הגבוהות הכלים לא יורמו לרגע. הפס מעל הלוח אומר את זה.']
          ]
        }
      ]
    },

    /* ================================================================ */
    ru: {
      intro: 'Всё, что можно нажать, и несколько вещей, о которых трудно догадаться. ' +
             'О правилах шахмат здесь ничего нет - они во вкладке «Обучение».',

      sections: [
        {
          title: 'Как сделать ход',
          rows: [
            ['Нажать на фигуру',
             'На каждом поле, куда она может пойти по правилам, появится точка. Кольцо вокруг поля означает взятие, а не тихий ход.'],
            ['Нажать на точку',
             'Ход сделан. Вот и всё взаимодействие - два нажатия.'],
            ['Или перетащить',
             'Нажмите на фигуру и тяните её. Отпустите на поле назначения. Если отпустить в другом месте, фигура вернётся назад.'],
            ['Отменить выбор',
             'Нажмите на ту же фигуру ещё раз или щёлкните правой кнопкой в любом месте доски.'],
            ['Точек не появилось',
             'У этой фигуры нет ходов по правилам, сейчас не ваш ход, или партия уже закончена. В упражнении на взятия отзывается только та фигура, которую вы отрабатываете.'],
            ['Превращение пешки',
             'Над доской появится выбор: ферзь, ладья, слон, конь. Нажмите на нужную фигуру или клавишу Q, R, B либо N. Escape отменяет ход целиком.']
          ]
        },
        {
          title: 'Как читать доску',
          rows: [
            ['Жёлтые поля', 'Только что сделанный ход - и поле, откуда фигура ушла, и поле, куда пришла.'],
            ['Красное свечение', 'Король, которому сейчас объявлен шах.'],
            ['Синие поля', 'Поля, на которые указывает открытый урок.'],
            ['Буквы и цифры', 'Координаты по нижнему и левому краю. Они переворачиваются вместе с доской, поэтому всегда читаются правильно с вашей стороны.'],
            ['Ряды над доской и под ней', 'Фигуры, потерянные каждой стороной. Маленькое число - перевес в материале, считая в пешках: «+3» означает перевес в три пешки.'],
            ['Полоса над доской', 'Чей ход, есть ли шах, думает ли компьютер и чем закончилась партия.']
          ]
        },
        {
          title: 'Игра',
          note: 'Настройки находятся на панели «Игра» рядом с доской - или под ней, если окно узкое.',
          rows: [
            ['Соперник', 'Компьютер или два игрока за одним экраном. Переключение начинает новую партию.'],
            ['Уровень', 'Четыре уровня. «Новичок» и «Любитель» намеренно ошибаются и зевают, «Клубный» и «Сильный» - нет. Сильный думает до двух секунд на ход.'],
            ['Ваш цвет', 'Белые или чёрные. Если выбрать чёрные, начнётся новая партия, доска перевернётся, и компьютер сделает первый ход.'],
            ['Новая игра', 'Возврат к начальной позиции с текущими настройками.'],
            ['Отменить ход', 'Отменяет ваш ход вместе с ответом компьютера, так что ход снова за вами. Нажимайте ещё, чтобы вернуться дальше. Недоступно, пока компьютер думает. Против второго человека отменяется по одному ходу.'],
            ['Перевернуть доску', 'Поворачивает доску. Очередь хода и саму партию это не меняет.'],
            ['Ходы', 'Партия в шахматной нотации, последний ход внизу.'],
            ['Копировать ходы', 'Кладёт партию в буфер обмена - можно вставить на любом шахматном сайте или в приложении.'],
            ['Копировать позицию', 'Копирует только текущую позицию, строкой FEN.']
          ]
        },
        {
          title: 'Обучение',
          rows: [
            ['Список глав', 'Главы идут в разумном порядке, но ничего не заблокировано - можно начать с любого места.'],
            ['Кружок рядом с уроком', 'Заполняется зелёным, когда урок пройден. Счётчик рядом с названием главы показывает то же самое.'],
            ['Метка «упражнение» или «практика»', 'В этом уроке есть что делать на доске. Уроки без метки - только для чтения и отмечаются пройденными при открытии.'],
            ['Подсказка', 'Небольшой намёк на идею. Ничего не стоит и не влияет на отметку урока.'],
            ['Начать заново', 'Возвращает позицию и позволяет пройти упражнение ещё раз.'],
            ['Назад / Далее', 'Переход по всем урокам подряд, в том числе между главами.'],
            ['Показать пример', 'В уроках с готовой последовательностью проигрывает ходы в спокойном темпе.'],
            ['Все уроки', 'Вверху панели урока - возврат к списку глав.'],
            ['Сбросить прогресс', 'В списке глав, под вступлением. Снимает все отметки.']
          ]
        },
        {
          title: 'Задачи',
          rows: [
            ['Три точки', 'Сложность, от одной до трёх. Тема указана рядом с названием.'],
            ['Неверный ход', 'Отменяется сам, с пометкой, что ход допустим, но идея другая. Ничего не теряется - просто попробуйте снова.'],
            ['Подсказка', 'Описывает идею, не называя сам ход.'],
            ['Показать решение', 'Выводит всю выигрывающую последовательность, если хочется просто посмотреть.'],
            ['Начать заново', 'Проигрывает ту же задачу с начала.']
          ]
        },
        {
          title: 'Язык',
          rows: [
            ['Меню языка', 'Вверху страницы, рядом со вкладками. Переключение сразу переводит интерфейс и запоминает выбор.'],
            ['Что переведено', 'Все кнопки, подписи и сообщения, а также это руководство. Сами тексты уроков пока только на английском.'],
            ['Иврит и другие языки справа налево', 'Страница разворачивается справа налево, но доска - никогда: вертикали по-прежнему идут от a до h слева направо, как на настоящей доске.'],
            ['Запись ходов', 'Остаётся международной (K Q R B N) - именно её используют все шахматные сайты, книги и базы.']
          ]
        },
        {
          title: 'Клавиатура',
          rows: [
            ['F', 'Перевернуть доску (в режиме игры).'],
            ['U', 'Отменить ход (в режиме игры).'],
            ['Q  R  B  N', 'Выбор фигуры при превращении пешки.'],
            ['Escape', 'Закрыть окно превращения.']
          ]
        },
        {
          title: 'Легко упустить',
          rows: [
            ['Рокировка',
             'Двигайте короля на два поля в сторону ладьи - ладья перепрыгнет сама. Нажатие на ладью просто выберет ладью.'],
            ['Взятие на проходе',
             'Нажмите на свою пешку, и точка появится на пустом поле по диагонали. Это и есть взятие: пешка соперника снимается, хотя вы на неё не встаёте.'],
            ['Прогресс хранится локально',
             'Отметки, решённые задачи и выбранный язык сохраняются только в этом браузере. Они переживут закрытие вкладки, но не очистку данных сайта, и не перейдут на другое устройство.'],
            ['В узком окне всё складывается в столбик',
             'При ширине меньше примерно 900 пикселей панели уходят под доску вместо того, чтобы стоять рядом. Прокрутите вниз.'],
            ['Выйти из урока безопасно',
             'Переключение на вкладку игры и обратно сохраняет место в незаконченной последовательности.'],
            ['Доска блокируется, пока компьютер думает',
             'На высоких уровнях фигуры на мгновение не поднимаются. Полоса над доской об этом сообщает.']
          ]
        }
      ]
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : this);
