/*!
 * lessons.js - the teaching curriculum.
 *
 * Every lesson is plain data so it can be checked by machine: validate.html
 * loads each position, plays every scripted move, and fails loudly if a FEN is
 * illegal, a move is not legal, or a claimed mate is not actually mate.
 *
 * Lesson shape
 *   fen          starting position
 *   orientation  which side is at the bottom of the board ('w' | 'b')
 *   text         the explanation, as HTML
 *   highlight    squares to mark while reading
 *   setup        moves played automatically before the learner takes over
 *   demo         moves played automatically as a demonstration
 *   task         what the learner has to do, if anything:
 *                  type 'line'       follow a scripted sequence. Even indices
 *                                    are the learner's moves, odd indices are
 *                                    the opponent's automatic replies.
 *                  type 'captureAll' capture every enemy piece; the opponent
 *                                    never moves.
 *                  type 'mate'       deliver checkmate against the engine.
 *                  accept            extra acceptable moves per learner ply,
 *                                    or '*' to accept any legal move.
 */
(function (global) {
  'use strict';

  global.CHESS_CURRICULUM = [

    /* ================================================================ */
    {
      id: 'basics',
      title: 'The Board and the Pieces',
      summary: 'How the board is described, and how each piece moves.',
      lessons: [
        {
          id: 'the-board',
          title: 'The Board',
          fen: '8/8/8/8/8/8/8/8 w - - 0 1',
          highlight: ['a1', 'h1', 'd4', 'e4', 'd5', 'e5', 'h8'],
          text:
            '<p>A chessboard is eight columns and eight rows of squares. The columns are ' +
            '<strong>files</strong>, named <em>a</em> to <em>h</em> from left to right. The rows are ' +
            '<strong>ranks</strong>, numbered <em>1</em> to <em>8</em> from White\'s side upward.</p>' +
            '<p>Every square gets its name from the two together: the bottom-left corner is ' +
            '<strong>a1</strong>, the top-right is <strong>h8</strong>. The four squares glowing in the ' +
            'middle - d4, e4, d5 and e5 - are the <strong>centre</strong>, and most of the opening ' +
            'is a fight over them.</p>' +
            '<p>One detail worth checking every time you set up: the near-right corner square ' +
            'should be light. If h1 is dark, the board is turned the wrong way.</p>'
        },
        {
          id: 'the-rook',
          title: 'The Rook',
          fen: '4k3/3p4/8/8/p2p4/8/8/R3K3 w - - 0 1',
          text:
            '<p>The <strong>rook</strong> moves in straight lines: any number of squares along a ' +
            'file or a rank. It cannot jump - it stops at the first piece in its path, and if that ' +
            'piece is an enemy, it may capture it by landing on its square.</p>' +
            '<p>Rooks are worth about <strong>five pawns</strong>. They are clumsy in a crowded ' +
            'position and devastating on an open file.</p>',
          task: {
            type: 'captureAll',
            piece: 'r',
            instruction: 'Capture all three black pawns with the rook.',
            hint: 'Work along one line at a time: up the a-file first, then across.',
            success: 'That is the rook\'s whole personality - straight lines, no detours.'
          }
        },
        {
          id: 'the-bishop',
          title: 'The Bishop',
          fen: '3pk3/8/8/6p1/8/4p3/8/2B1K3 w - - 0 1',
          text:
            '<p>The <strong>bishop</strong> moves diagonally, as far as it likes, and also cannot ' +
            'jump over anything.</p>' +
            '<p>Notice what that means: a bishop that starts on a dark square stays on dark squares ' +
            'for the entire game. Half the board is permanently invisible to it. That is why a pair ' +
            'of bishops - one on each colour - is worth more than the sum of its parts.</p>' +
            '<p>A bishop is worth roughly <strong>three pawns</strong>.</p>',
          task: {
            type: 'captureAll',
            piece: 'b',
            instruction: 'Capture all three black pawns with the bishop.',
            hint: 'Every pawn here sits on a dark square. That is not a coincidence.',
            success: 'One colour, forever. Keep it in mind when you choose what to trade.'
          }
        },
        {
          id: 'the-queen',
          title: 'The Queen',
          fen: '4k3/6p1/8/8/3p2p1/8/8/3QK3 w - - 0 1',
          text:
            '<p>The <strong>queen</strong> moves like a rook and a bishop combined - any distance, ' +
            'along files, ranks or diagonals. She is the most powerful piece on the board, worth ' +
            'about <strong>nine pawns</strong>.</p>' +
            '<p>Being powerful also makes her vulnerable: any enemy piece that attacks her forces ' +
            'her to run, because almost every trade loses material for you. Beginners lose games by ' +
            'bringing the queen out early and then spending ten moves saving her.</p>',
          task: {
            type: 'captureAll',
            piece: 'q',
            instruction: 'Capture all three black pawns with the queen.',
            hint: 'She can use a file, then a rank, then another file.',
            success: 'Powerful - but remember she has to be kept safe.'
          }
        },
        {
          id: 'the-knight',
          title: 'The Knight',
          fen: '4k3/8/3p4/8/4p3/2p5/PPP5/1N2K3 w - - 0 1',
          text:
            '<p>The <strong>knight</strong> moves in an L: two squares in one direction, then one ' +
            'square at a right angle. It is the only piece that <strong>jumps</strong> - pieces in ' +
            'between are simply irrelevant to it. Look at the knight below, walled in by its own ' +
            'pawns, and completely unbothered.</p>' +
            '<p>A knight is worth about <strong>three pawns</strong>, like a bishop. It is at its ' +
            'best in closed positions and near the centre. On the edge of the board it loses half ' +
            'its moves, which is where the old advice "a knight on the rim is dim" comes from.</p>',
          task: {
            type: 'captureAll',
            piece: 'n',
            instruction: 'Capture all three black pawns with the knight.',
            hint: 'Two squares one way, one square the other. Your own pawns are not in the way.',
            success: 'Knights take getting used to - they are the piece that surprises people most.'
          }
        },
        {
          id: 'the-pawn',
          title: 'The Pawn',
          fen: '4k3/3p4/8/8/8/8/4P3/4K3 w - - 0 1',
          text:
            '<p>Pawns are the strangest piece on the board, because they move one way and capture ' +
            'another.</p>' +
            '<p>A pawn moves <strong>straight forward</strong> one square - or two squares, but only ' +
            'from its starting position. It captures <strong>diagonally forward</strong>, one square. ' +
            'It can never move backwards, and it can never capture straight ahead: a pawn standing ' +
            'directly in front of another pawn blocks it completely.</p>',
          task: {
            type: 'line',
            instruction: 'Push your pawn two squares to e4. Black will answer d7-d5 - then capture it.',
            line: ['e4', 'd5', 'exd5'],
            hint: 'Pawns capture on the diagonal, so the pawn on e4 takes on d5.',
            success: 'Forward to move, diagonally to capture. Every pawn, every time.'
          }
        },
        {
          id: 'the-king',
          title: 'The King',
          fen: '3rk3/8/8/8/8/8/8/4K3 w - - 0 1',
          text:
            '<p>The <strong>king</strong> moves one square in any direction. He is not worth points, ' +
            'because he is never traded - the whole game is about him.</p>' +
            '<p>There is one rule that makes the king unlike every other piece: he may never move ' +
            'onto a square that an enemy piece attacks. Below, that black rook on d8 controls the ' +
            'entire d-file, so d1 and d2 are simply not available to your king - even though nothing ' +
            'is standing on them.</p>',
          highlight: ['d1', 'd2'],
          task: {
            type: 'line',
            instruction: 'Move your king to a safe square.',
            line: ['Ke2'],
            accept: { 0: ['Kf1', 'Kf2'] },
            hint: 'Anything on the e- or f-file is out of the rook\'s reach.',
            success: 'The king walks, but never into danger.'
          }
        }
      ]
    },

    /* ================================================================ */
    {
      id: 'special',
      title: 'The Special Moves',
      summary: 'Castling, en passant and promotion - the three rules that surprise people.',
      lessons: [
        {
          id: 'castling',
          title: 'Castling',
          fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
          text:
            '<p><strong>Castling</strong> is the only move where two pieces move at once. The king ' +
            'travels two squares toward a rook, and that rook hops over to the square the king ' +
            'crossed.</p>' +
            '<p>You may castle only if <em>all</em> of these are true:</p>' +
            '<ul><li>Neither the king nor that rook has moved yet.</li>' +
            '<li>The squares between them are empty.</li>' +
            '<li>The king is not in check right now.</li>' +
            '<li>The king does not pass through, or land on, an attacked square.</li></ul>' +
            '<p>Note what is <em>not</em> on that list: the rook may be attacked, and the rook may ' +
            'pass over an attacked square. Only the king is fussy.</p>',
          task: {
            type: 'line',
            instruction: 'Castle kingside.',
            line: ['O-O'],
            hint: 'Move the king two squares toward the h1 rook - the rook follows on its own.',
            success: 'King tucked away, rook developed, one move. It is usually the best deal in the opening.'
          }
        },
        {
          id: 'castling-blocked',
          title: 'When You Cannot Castle',
          fen: '4kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1',
          highlight: ['f1'],
          text:
            '<p>Here that black rook on f8 owns the whole f-file - including <strong>f1</strong>, the ' +
            'square your king would have to cross on the way to g1. So castling kingside is illegal, ' +
            'even though f1 and g1 are both empty.</p>' +
            '<p>Queenside is a different story. The king would travel e1-d1-c1, and black\'s rook ' +
            'touches none of those squares.</p>',
          task: {
            type: 'line',
            instruction: 'Castle on the side that is actually legal.',
            line: ['O-O-O'],
            hint: 'The king cannot cross f1. Go the other way.',
            success: 'Queenside castling puts the king on c1 and the rook on d1.'
          }
        },
        {
          id: 'en-passant',
          title: 'En Passant',
          fen: '4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1',
          setup: ['d5'],
          text:
            '<p>Black has just played the pawn from d7 straight past your pawn to d5, using the ' +
            'two-square first move to dodge a capture.</p>' +
            '<p><strong>En passant</strong> - French for "in passing" - exists to close that loophole. ' +
            'When an enemy pawn uses its double step to land beside your pawn, you may capture it ' +
            'exactly as if it had only moved one square. Your pawn goes to d6, and the pawn on d5 ' +
            'comes off the board.</p>' +
            '<p>The catch: you must do it <strong>immediately</strong>. If you play anything else ' +
            'first, the chance is gone for good.</p>',
          highlight: ['d5', 'd6'],
          task: {
            type: 'line',
            instruction: 'Capture the d5 pawn en passant.',
            line: ['exd6'],
            hint: 'Move your e5 pawn diagonally to d6 - the black pawn is removed even though your pawn does not land on it.',
            success: 'The only capture in chess where your piece does not land on the captured piece.'
          }
        },
        {
          id: 'promotion',
          title: 'Promotion',
          fen: '4k3/2P5/8/8/8/8/8/4K3 w - - 0 1',
          text:
            '<p>A pawn that reaches the far end of the board is <strong>promoted</strong>: it is ' +
            'immediately replaced by a queen, rook, bishop or knight of its own colour. Your choice, ' +
            'and it has nothing to do with which pieces you have already lost - nine queens is legal, ' +
            'if improbable.</p>' +
            '<p>Almost always, take the queen. A humble pawn one square from the end is worth more ' +
            'than a bishop, and whole endgames are decided by who gets there first.</p>',
          task: {
            type: 'line',
            instruction: 'Promote the pawn to a queen.',
            line: ['c8=Q+'],
            hint: 'Push the c7 pawn to c8 and pick the queen.',
            success: 'From the weakest piece to the strongest, in one move.'
          }
        },
        {
          id: 'underpromotion',
          title: 'Underpromotion',
          fen: '8/2q1P1k1/8/8/8/8/8/K7 w - - 0 1',
          text:
            '<p>Choosing anything other than a queen is called <strong>underpromotion</strong>, and ' +
            'it is nearly always a mistake - with one honest exception. A knight reaches squares a ' +
            'queen cannot, so a knight can arrive with <em>check</em> where a queen would arrive with ' +
            'nothing.</p>' +
            '<p>Here, a new queen on e8 would leave Black\'s queen alive and well. A new knight ' +
            'checks the king on g7 <em>and</em> attacks the queen on c7 at the same time.</p>',
          task: {
            type: 'line',
            instruction: 'Promote to the piece that wins Black\'s queen.',
            line: ['e8=N+', 'Kf7', 'Nxc7'],
            hint: 'Which piece attacks both g7 and c7 from e8?',
            success: 'A knight fork, delivered by a pawn. Worth remembering that the option exists.'
          }
        }
      ]
    },

    /* ================================================================ */
    {
      id: 'check',
      title: 'Check, Checkmate and Draws',
      summary: 'How the game is actually won - and the ways it slips into a draw.',
      lessons: [
        {
          id: 'check',
          title: 'Check',
          fen: '4k3/8/8/8/Rb6/8/8/1N2K3 w - - 0 1',
          text:
            '<p>When a piece attacks the enemy king, that is <strong>check</strong>. The player in ' +
            'check must deal with it immediately - no other move is legal.</p>' +
            '<p>There are exactly three answers, and it is worth checking all three every single ' +
            'time:</p>' +
            '<ul><li><strong>Move</strong> the king to a safe square.</li>' +
            '<li><strong>Block</strong> the attack by putting a piece in the way.</li>' +
            '<li><strong>Capture</strong> the attacking piece.</li></ul>' +
            '<p>That black bishop on b4 is checking along the diagonal to e1. You could run with the ' +
            'king, block on c3 or d2 with the knight - or simply take the bishop.</p>',
          task: {
            type: 'line',
            instruction: 'Answer the check by capturing the bishop.',
            line: ['Rxb4'],
            hint: 'Your rook on a4 is already looking along the fourth rank.',
            success: 'Capturing the checker is often the cleanest of the three answers.'
          }
        },
        {
          id: 'checkmate',
          title: 'Checkmate',
          fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
          text:
            '<p><strong>Checkmate</strong> is check with no answer: the king is attacked, and there ' +
            'is no move, no block and no capture that saves him. That ends the game instantly - the ' +
            'king is never actually captured.</p>' +
            '<p>Look at the black king below. Its own pawns on f7, g7 and h7 are loyal, and also a ' +
            'wall. If a rook arrives on the eighth rank, the king has nowhere to go.</p>',
          task: {
            type: 'line',
            instruction: 'Deliver checkmate in one move.',
            line: ['Ra8#'],
            hint: 'The whole eighth rank is empty, and the king cannot step up.',
            success: 'The back-rank mate - the most common mate in club chess by a wide margin.'
          }
        },
        {
          id: 'stalemate',
          title: 'Stalemate',
          fen: '7k/1Q6/6K1/8/8/8/8/8 w - - 0 1',
          text:
            '<p><strong>Stalemate</strong> is the cruellest rule in chess. If the player to move is ' +
            '<em>not</em> in check but has no legal move at all, the game is an immediate ' +
            '<strong>draw</strong> - however much material the other side has.</p>' +
            '<p>You are a whole queen up here and mate is available in one move. But play the ' +
            'careless <strong>Qf7</strong> and Black is not in check, cannot move the king to g8 or ' +
            'h7, and has nothing else on the board: a draw, from a completely winning position.</p>' +
            '<p>When your opponent is down to a lone king, count their escape squares before every ' +
            'move.</p>',
          task: {
            type: 'line',
            instruction: 'Find checkmate - and avoid the stalemate.',
            line: ['Qb8#'],
            accept: { 0: ['Qg7#', 'Qh7#'] },
            hint: 'Your king on g6 already guards g7 and h7. Bring the queen somewhere it is defended, or take the back rank.',
            success: 'Mate, not stalemate. Always give the losing king a square to be checked on.'
          }
        },
        {
          id: 'draws',
          title: 'The Other Draws',
          fen: '4k3/8/8/8/8/8/8/3BK3 w - - 0 1',
          text:
            '<p>Stalemate is not the only way a game ends level. The others:</p>' +
            '<ul>' +
            '<li><strong>Insufficient material.</strong> If neither side can possibly force mate, the ' +
            'game is drawn on the spot. King against king, king and bishop against king (the position ' +
            'below), or king and knight against king - none of them can ever mate.</li>' +
            '<li><strong>Threefold repetition.</strong> If the same position occurs three times with ' +
            'the same player to move, either player may claim a draw.</li>' +
            '<li><strong>The fifty-move rule.</strong> If fifty moves pass by each side with no ' +
            'capture and no pawn move, the game is drawn. It exists to stop someone shuffling ' +
            'forever in a dead position.</li>' +
            '<li><strong>Agreement.</strong> Players may simply agree to a draw.</li>' +
            '</ul>' +
            '<p>This app applies all of these automatically while you play.</p>'
        }
      ]
    },

    /* ================================================================ */
    {
      id: 'tactics',
      title: 'Tactics',
      summary: 'The short, forcing patterns that win material. This is where games are decided.',
      lessons: [
        {
          id: 'fork',
          title: 'The Fork',
          fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
          text:
            '<p>A <strong>fork</strong> is one piece attacking two things at once. Your opponent can ' +
            'only save one of them.</p>' +
            '<p>Knights are the great forkers, because their move is so awkward that the two targets ' +
            'usually cannot defend each other. When a fork includes <em>check</em>, it is close to ' +
            'unanswerable: the king must move, and the other piece simply drops.</p>' +
            '<p>Below, one knight move attacks the king on e8 and the rook on a8 together.</p>',
          task: {
            type: 'line',
            instruction: 'Fork the king and the rook.',
            line: ['Nc7+', 'Kf8', 'Nxa8'],
            hint: 'Look for the square that is a knight\'s move from both e8 and a8.',
            success: 'This one has a nickname - the "family fork" - because it so often catches king, queen and rook at once.'
          }
        },
        {
          id: 'pin',
          title: 'The Pin',
          fen: '3qk3/8/5n2/6B1/4P3/8/8/4K3 w - - 0 1',
          text:
            '<p>A <strong>pin</strong> freezes a piece: if it moves, something more valuable behind ' +
            'it is exposed. Only the long-range pieces - bishop, rook and queen - can pin.</p>' +
            '<p>The bishop on g5 is pinning the knight on f6 against the queen on d8. That knight is ' +
            'not really defending anything any more, because moving it hangs the queen.</p>' +
            '<p>The standard follow-up: <strong>attack the pinned piece again</strong>. It cannot run, ' +
            'so pile on.</p>',
          task: {
            type: 'line',
            instruction: 'Attack the pinned knight with a pawn.',
            line: ['e5', 'Qd7', 'exf6'],
            hint: 'Your e-pawn can step forward and hit f6.',
            success: 'Pinned pieces are targets, not defenders. Hit them again.'
          }
        },
        {
          id: 'skewer',
          title: 'The Skewer',
          fen: '3q4/8/8/3k4/8/8/8/R3K3 w - - 0 1',
          text:
            '<p>A <strong>skewer</strong> is a pin turned inside out. The valuable piece is in ' +
            '<em>front</em>: you attack it, it is forced to move, and you take whatever was hiding ' +
            'behind it.</p>' +
            '<p>Here the black king and queen are both sitting on the d-file. Put a rook on that ' +
            'file with check and the king has to step aside - abandoning the queen.</p>',
          task: {
            type: 'line',
            instruction: 'Skewer the king and win the queen.',
            line: ['Rd1+', 'Kc5', 'Rxd8'],
            hint: 'Your rook on a1 can slide along the first rank onto the d-file.',
            success: 'King in front, queen behind, rook on the line. A whole queen for one move.'
          }
        },
        {
          id: 'discovered-attack',
          title: 'The Discovered Attack',
          fen: '3k3q/8/8/8/3B4/8/8/3R2K1 w - - 0 1',
          text:
            '<p>A <strong>discovered attack</strong> is a threat you make by moving a piece ' +
            '<em>out of the way</em>. The rook on d1 is already aiming straight at the black king; ' +
            'the bishop on d4 is the only thing standing in between.</p>' +
            '<p>So move the bishop, and the rook\'s check appears from nowhere. Because the bishop ' +
            'is the piece that moved, it is free to go somewhere useful - and the black queen on h8 ' +
            'is already on its diagonal.</p>' +
            '<p>Black has to answer the check from the rook, which means there is no time to rescue ' +
            'the queen.</p>',
          highlight: ['d1', 'd4', 'd8'],
          task: {
            type: 'line',
            instruction: 'Uncover the rook\'s check without letting the queen escape.',
            line: ['Be5+', 'Ke8', 'Bxh8'],
            hint: 'Move the bishop along the diagonal it is already on, so it keeps attacking h8.',
            success: 'The check came from the rook, so the bishop was free to keep its eye on the queen.'
          }
        },
        {
          id: 'double-check',
          title: 'Double Check',
          fen: '3q3k/8/8/4N3/8/8/1B6/6K1 w - - 0 1',
          text:
            '<p>A <strong>double check</strong> is a discovered attack where the moving piece also ' +
            'gives check. Two pieces are now attacking the king at once.</p>' +
            '<p>This is the most forcing move in chess. Blocking cannot stop two attackers on two ' +
            'different lines, and capturing can only remove one of them - so <strong>the king must ' +
            'move</strong>. Always. Even if the checking pieces are hanging to everything.</p>' +
            '<p>Below, the knight on e5 sits on the bishop\'s diagonal. Move it to f7 and both the ' +
            'knight and the bishop hit h8.</p>',
          task: {
            type: 'line',
            instruction: 'Give double check, then collect the queen.',
            line: ['Nf7+', 'Kg8', 'Nxd8'],
            hint: 'The black queen cannot capture on f7 - she would still be in check from the bishop.',
            success: 'The king had to move, and the knight helped itself to the queen.'
          }
        },
        {
          id: 'back-rank',
          title: 'The Back Rank',
          fen: '4r1k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
          text:
            '<p>After castling, a king is safe behind three pawns - and also trapped behind them. ' +
            'Any rook or queen that reaches the back rank is mate, unless something guards it.</p>' +
            '<p>Black\'s rook on e8 is the only defender of that rank. It is also undefended.</p>' +
            '<p>The cure, for both sides, is a single quiet pawn move: h3 for White, h6 for Black. ' +
            'It is called giving the king <em>luft</em> - German for air - and it has saved more ' +
            'games than any opening.</p>',
          task: {
            type: 'line',
            instruction: 'Take the defender and finish the game.',
            line: ['Rxe8#'],
            hint: 'The rook that captures also delivers the mate.',
            success: 'Play h3 in your own games. You will thank yourself.'
          }
        }
      ]
    },

    /* ================================================================ */
    {
      id: 'mates',
      title: 'Mating Patterns',
      summary: 'Finishing technique: the mates every player should be able to produce on demand.',
      lessons: [
        {
          id: 'ladder-mate',
          title: 'Two Rooks: The Ladder',
          fen: '8/8/4k3/8/8/8/8/RR5K w - - 0 1',
          text:
            '<p>Two rooks mate a lone king without any help from their own king, and the method is ' +
            'mechanical enough to be worth learning as a routine.</p>' +
            '<p>Use one rook to cut the king off along a rank, then bring the other rook to the next ' +
            'rank to check. The king is forced back one row at a time - a ladder - until it runs out ' +
            'of board.</p>' +
            '<p>If the enemy king ever steps toward a rook to attack it, slide that rook far away ' +
            'along its rank. Never let the rooks be captured, and never accidentally take away the ' +
            'king\'s <em>only</em> square without giving check.</p>',
          task: {
            type: 'mate',
            instruction: 'Checkmate the black king. Take as many moves as you need.',
            aiLevel: 3,
            hint: 'Cut the king off with one rook, then check with the other on the next rank.',
            success: 'That is the ladder. It works from any starting position, every time.'
          }
        },
        {
          id: 'queen-mate',
          title: 'King and Queen',
          fen: '8/8/4k3/8/8/8/8/3QK3 w - - 0 1',
          text:
            '<p>A queen cannot mate on her own - the king has to help. The reliable method has two ' +
            'stages.</p>' +
            '<p>First, <strong>shrink the box</strong>. Place the queen a knight\'s move away from ' +
            'the enemy king and simply follow him; his available squares get fewer with every move, ' +
            'and he ends up on the edge.</p>' +
            '<p>Then <strong>walk your king up</strong> to guard the escape squares, and mate.</p>' +
            '<p>Watch for stalemate the whole way. If the enemy king has only one square left and ' +
            'you are not giving check, you have drawn.</p>',
          task: {
            type: 'mate',
            instruction: 'Checkmate the black king with king and queen.',
            aiLevel: 3,
            hint: 'Do not chase with the queen alone. Trap the king on an edge, then bring your king.',
            success: 'Queen and king, on the edge of the board. Now you can convert any won endgame.'
          }
        },
        {
          id: 'rook-mate',
          title: 'King and Rook',
          fen: '8/8/4k3/8/8/8/8/3RK3 w - - 0 1',
          text:
            '<p>King and rook is harder than king and queen, and it is the one that most often gets ' +
            'thrown away on the fifty-move rule.</p>' +
            '<p>The idea is the <strong>opposition</strong>. Put your king directly opposite the ' +
            'enemy king with one square between them, then check with the rook. The enemy king must ' +
            'retreat a rank. Follow him up, take the opposition again, check again.</p>' +
            '<p>Your rook does the checking; your king does the work.</p>',
          task: {
            type: 'mate',
            instruction: 'Checkmate the black king with king and rook.',
            aiLevel: 3,
            hint: 'Kings facing each other with one square between, then check along the rank.',
            success: 'This is the endgame that separates players who convert wins from players who do not.'
          }
        },
        {
          id: 'smothered-mate',
          title: 'Smothered Mate',
          fen: '5rk1/6pp/8/6N1/8/8/8/3Q2K1 w - - 0 1',
          text:
            '<p>The prettiest mate in chess: a lone knight delivers it while the king suffocates ' +
            'among his own pieces.</p>' +
            '<p>The sequence is known as <strong>Philidor\'s Legacy</strong>, and it is worth knowing ' +
            'by heart. Check on the diagonal to force the king into the corner, check with the knight, ' +
            'then give <em>double</em> check so the king must return - and then throw the queen away ' +
            'on g8 so that Black\'s own rook is forced to block the last escape square.</p>',
          task: {
            type: 'line',
            instruction: 'Play the whole sequence. Five moves, all forcing.',
            line: ['Qb3+', 'Kh8', 'Nf7+', 'Kg8', 'Nh6+', 'Kh8', 'Qg8+', 'Rxg8', 'Nf7#'],
            hint: 'Move 4 is a queen sacrifice. The rook has to take, and then it is in the way.',
            success: 'Philidor described this in 1749. It still wins games every day.'
          }
        }
      ]
    },

    /* ================================================================ */
    {
      id: 'openings',
      title: 'Opening Principles',
      summary: 'What to do with your first ten moves, without memorising anything.',
      lessons: [
        {
          id: 'centre',
          title: 'Take the Centre',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          highlight: ['d4', 'e4', 'd5', 'e5'],
          text:
            '<p>A piece in the centre controls more squares than the same piece on the edge - a ' +
            'knight on e4 reaches eight squares, a knight on a1 reaches two. So the opening is a ' +
            'fight for the four central squares.</p>' +
            '<p>Start by putting a pawn there. <strong>1.e4</strong> and <strong>1.d4</strong> are ' +
            'the two most popular first moves in history, and both do the same job: occupy one ' +
            'central square, attack another, and open lines for the bishop and queen behind.</p>',
          task: {
            type: 'line',
            instruction: 'Play a pawn to the centre.',
            line: ['e4'],
            accept: { 0: ['d4'] },
            hint: 'Two squares with the e-pawn or the d-pawn.',
            success: 'Now your bishop and queen both have somewhere to go.'
          }
        },
        {
          id: 'develop',
          title: 'Develop Your Pieces',
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
          text:
            '<p><strong>Development</strong> means getting your knights and bishops off the back ' +
            'rank and into the game. A rough target: every minor piece moved, and the king castled, ' +
            'inside the first ten moves.</p>' +
            '<p>Two habits that come with it:</p>' +
            '<ul><li><strong>Knights before bishops.</strong> It is usually obvious where a knight ' +
            'belongs and less obvious where a bishop belongs, so start with the easy decisions.</li>' +
            '<li><strong>Do not move the same piece twice</strong> without a reason. Every repeat ' +
            'move is a piece you have not developed yet.</li></ul>',
          task: {
            type: 'line',
            instruction: 'Develop a knight toward the centre.',
            line: ['Nf3'],
            accept: { 0: ['Nc3'] },
            hint: 'Nf3 develops and attacks the e5 pawn at the same time.',
            success: 'Developing with a threat is the best kind of developing move.'
          }
        },
        {
          id: 'castle-early',
          title: 'Castle Early',
          fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          text:
            '<p>Castling does two jobs in one move: it takes the king out of the centre, where files ' +
            'are about to be ripped open, and it brings a rook toward the middle where it is ' +
            'useful.</p>' +
            '<p>Do it early. Games where one side leaves the king on e1 while the position opens are ' +
            'usually short, and not in a good way.</p>' +
            '<p>This position is the <strong>Italian Game</strong>, one of the oldest openings there ' +
            'is - and every piece White has moved is doing something.</p>',
          task: {
            type: 'line',
            instruction: 'Castle kingside.',
            line: ['O-O'],
            hint: 'Everything between the king and the h1 rook has already moved out of the way.',
            success: 'King safe, rook active, development nearly finished. This is a healthy opening.'
          }
        },
        {
          id: 'early-queen',
          title: 'Do Not Rush the Queen',
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 4 3',
          orientation: 'b',
          text:
            '<p>You are Black here, and White has gone hunting early: the queen on h5 and the bishop ' +
            'on c4 are both aiming at <strong>f7</strong>, the one square your king defends by ' +
            'himself. The threat is Qxf7 checkmate - the <em>Scholar\'s Mate</em>.</p>' +
            '<p>It works exactly once against anybody, and the refutation teaches the principle. ' +
            'Defend, and make the early queen regret coming out: <strong>g6</strong> blocks the ' +
            'diagonal <em>and</em> attacks her, so you gain a move while she runs.</p>',
          task: {
            type: 'line',
            instruction: 'Stop the mate on f7 and gain time on the queen.',
            line: ['g6', 'Qf3', 'Nf6'],
            accept: { 0: ['Qe7'] },
            hint: 'A pawn move that both blocks the h5-f7 diagonal and attacks the queen.',
            success: 'Every check she has to answer is a move you spend developing. That is why the queen waits.'
          }
        },
        {
          id: 'model-opening',
          title: 'A Model Opening',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          demo: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4'],
          text:
            '<p>Watch the principles run together. This is the Italian Game, and by move five White ' +
            'has a pawn in the centre, two pieces developed, a third pawn supporting the centre, and ' +
            'castling available next move.</p>' +
            '<p>Nothing here is memorised - every move is just "take the centre, develop, prepare to ' +
            'castle". That is genuinely most of opening theory.</p>' +
            '<p>Press <em>Play demonstration</em> to watch the moves.</p>'
        }
      ]
    },

    /* ================================================================ */
    {
      id: 'endgames',
      title: 'Endgames',
      summary: 'Few pieces left, and every move counts. Where knowing one rule beats calculating ten moves.',
      lessons: [
        {
          id: 'square-of-the-pawn',
          title: 'The Square of the Pawn',
          fen: '8/8/8/7P/8/8/8/k6K w - - 0 1',
          text:
            '<p>Can the king catch the pawn? There is a rule that answers it instantly, with no ' +
            'counting of moves.</p>' +
            '<p>Draw a square whose side runs from the pawn to its promotion square - here, from h5 ' +
            'up to h8, so the square is the block h5-h8-e8-e5. If the enemy king is <strong>inside ' +
            'that square</strong> (or can step into it on his move), he catches the pawn. If he is ' +
            'outside it, he never will.</p>' +
            '<p>Black\'s king on a1 is nowhere near. Just push.</p>',
          highlight: ['e5', 'f5', 'g5', 'h5', 'e8', 'f8', 'g8', 'h8'],
          task: {
            type: 'line',
            instruction: 'Promote the pawn. Black cannot stop it.',
            line: ['h6', 'Kb2', 'h7', 'Kc3', 'h8=Q+'],
            hint: 'Do not bother with your king. Just run.',
            success: 'One glance at the square saves you a minute of calculation every time.'
          }
        },
        {
          id: 'escorting-a-pawn',
          title: 'Escorting a Pawn Home',
          fen: '4k3/8/4K3/4P3/8/8/8/8 b - - 0 1',
          setup: ['Kf8'],
          text:
            '<p>A pawn on its own usually does not promote - the enemy king simply stands in front ' +
            'of it. What wins is the pawn <em>and</em> your king working together, with your king ' +
            'leading the way.</p>' +
            '<p>The tool is the <strong>opposition</strong>: kings facing each other with one square ' +
            'between them. Whoever has to move is the one who has to give ground.</p>' +
            '<p>Black has just stepped aside to f8. Take the square he gave up - go to d7, control ' +
            'e8, and the pawn walks in behind you.</p>',
          task: {
            type: 'line',
            instruction: 'Escort the pawn to promotion.',
            line: ['Kd7', 'Kf7', 'e6+', 'Kf8', 'e7+', 'Kf7', 'e8=Q+'],
            hint: 'King first, and take control of the promotion square before you push.',
            success: 'King in front, pawn behind. That is the whole technique.'
          }
        },
        {
          id: 'simplify',
          title: 'Trade When You Are Ahead',
          fen: '6k1/5ppp/8/4p3/3q4/8/5PPP/R2Q2K1 w - - 0 1',
          text:
            '<p>You are a whole rook up. The one thing that can still go wrong is Black\'s queen ' +
            'generating threats against your king.</p>' +
            '<p>The rule of thumb: <strong>when you are ahead in material, trade pieces; when you ' +
            'are behind, keep them on.</strong> Every trade makes your extra rook a larger share of ' +
            'what is left, and takes away your opponent\'s chances of confusing you.</p>' +
            '<p>Trading queens here turns a sharp position into a trivially winning one.</p>',
          task: {
            type: 'line',
            instruction: 'Trade the queens off.',
            line: ['Qxd4', 'exd4'],
            hint: 'Your queen and the black queen are on the same file.',
            success: 'Now it is a rook against nothing, with no counterplay. Convert it calmly.'
          }
        }
      ]
    }
  ];

})(typeof globalThis !== 'undefined' ? globalThis : this);
