/*!
 * puzzles.js - tactics practice.
 *
 * Same contract as the lesson tasks: even indices in `line` are the solver's
 * moves, odd indices are the opponent's automatic replies. Everything here is
 * checked by validate.html, including that positions claiming mate really are
 * mate.
 */
(function (global) {
  'use strict';

  global.CHESS_PUZZLES = [
    {
      id: 'back-rank-1',
      title: 'Air Supply',
      theme: 'Back rank',
      difficulty: 1,
      fen: '7k/1R6/8/8/8/8/8/R6K w - - 0 1',
      line: ['Ra8#'],
      hint: 'One rook already covers the seventh rank. Where does the other one belong?',
      success: 'The rook on b7 takes away g7 and h7, so the eighth rank is mate.'
    },
    {
      id: 'queen-mate-1',
      title: 'Corner Work',
      theme: 'Mate in one',
      difficulty: 1,
      fen: '7k/8/6K1/8/8/8/8/1Q6 w - - 0 1',
      line: ['Qb8#'],
      hint: 'Your king already guards g7 and h7. The queen only has to cover the last rank.',
      success: 'King and queen together. The king does half the work in every queen mate.'
    },
    {
      id: 'arabian-mate',
      title: 'The Arabian',
      theme: 'Mate in one',
      difficulty: 2,
      fen: '7k/3R4/5N2/8/8/8/8/6K1 w - - 0 1',
      line: ['Rh7#'],
      hint: 'The knight on f6 is already guarding g8 - and one more square you need.',
      success: 'Rook and knight, side by side. This one is called the Arabian mate, and it is a thousand years old.'
    },
    {
      id: 'knight-fork-queen',
      title: 'Awkward Geometry',
      theme: 'Fork',
      difficulty: 1,
      fen: '6k1/5ppp/2q5/5N2/8/8/5PPP/6K1 w - - 0 1',
      line: ['Ne7+', 'Kh8', 'Nxc6'],
      hint: 'Find the square that is a knight\'s move from both g8 and c6.',
      success: 'The queen cannot capture on e7 - no queen line reaches it. That is why knight forks are so hard to see coming.'
    },
    {
      id: 'queen-double-attack',
      title: 'Two Birds',
      theme: 'Double attack',
      difficulty: 1,
      fen: '6k1/6pp/8/r7/8/8/8/3Q2K1 w - - 0 1',
      line: ['Qd5+', 'Kf8', 'Qxa5'],
      hint: 'One queen move gives check along a diagonal and hits the rook along a rank.',
      success: 'Check first, collect second. The check is what stops Black defending the rook.'
    },
    {
      id: 'pawn-fork',
      title: 'The Humble Fork',
      theme: 'Fork',
      difficulty: 2,
      fen: '6k1/6pp/8/3q1n2/8/3PP3/8/6K1 w - - 0 1',
      line: ['e4', 'Qd6', 'exf5'],
      hint: 'A pawn attacks two squares. Is there one push that hits both black pieces - and is it defended?',
      success: 'The pawn on d3 is what makes it work. An undefended forking pawn just gets eaten.'
    },
    {
      id: 'pin-and-pile-on',
      title: 'Nowhere To Run',
      theme: 'Pin',
      difficulty: 2,
      fen: '4k3/8/2n5/1B6/3P4/8/8/4K3 w - - 0 1',
      line: ['d5', 'Kf8', 'dxc6'],
      hint: 'The knight is pinned against the king and cannot move. So attack it again.',
      success: 'Black had to spend a move breaking the pin, and the knight was still hanging when he had finished.'
    },
    {
      id: 'skewer-1',
      title: 'Step Aside',
      theme: 'Skewer',
      difficulty: 2,
      fen: '3q4/8/8/3k4/8/8/8/R3K3 w - - 0 1',
      line: ['Rd1+', 'Kc5', 'Rxd8'],
      hint: 'King and queen are on the same file. Get your rook onto it with check.',
      success: 'A pin stops a piece moving; a skewer forces it to.'
    },
    {
      id: 'bishop-battery',
      title: 'Long Diagonal',
      theme: 'Mate in one',
      difficulty: 2,
      fen: '6k1/5p1p/8/8/3Q4/8/1B5K/8 w - - 0 1',
      line: ['Qg7#'],
      hint: 'The bishop on b2 is aiming down the long diagonal. What is it defending once the queen moves?',
      success: 'The queen steps right next to the king because the bishop behind her makes it untouchable.'
    },
    {
      id: 'deflection-mate-2',
      title: 'Only One Guard',
      theme: 'Mate in two',
      difficulty: 3,
      fen: 'r5k1/5ppp/8/8/8/1R6/5PPP/1R4K1 w - - 0 1',
      line: ['Rb8+', 'Rxb8', 'Rxb8#'],
      hint: 'Black has exactly one defender of the back rank. Make it capture something.',
      success: 'The rook was doing the only job that mattered, so it was worth a whole rook to drag it off.'
    },
    {
      id: 'double-check-queen',
      title: 'Two At Once',
      theme: 'Double check',
      difficulty: 3,
      fen: '3q3k/8/8/4N3/8/8/1B6/6K1 w - - 0 1',
      line: ['Nf7+', 'Kg8', 'Nxd8'],
      hint: 'Move the knight off the bishop\'s diagonal so that both pieces check at once.',
      success: 'Against a double check, capturing the checker is not enough - which is why the queen could not take on f7.'
    },
    {
      id: 'smothered',
      title: "Philidor's Legacy",
      theme: 'Smothered mate',
      difficulty: 3,
      fen: '5rk1/6pp/8/6N1/8/8/8/3Q2K1 w - - 0 1',
      line: ['Qb3+', 'Kh8', 'Nf7+', 'Kg8', 'Nh6+', 'Kh8', 'Qg8+', 'Rxg8', 'Nf7#'],
      hint: 'Every move is check. The fourth one gives away the queen on purpose.',
      success: 'The rook was forced onto g8, and then the knight mated a king surrounded entirely by his own pieces.'
    },
    {
      id: 'underpromote',
      title: 'Not A Queen',
      theme: 'Promotion',
      difficulty: 3,
      fen: '8/2q1P1k1/8/8/8/8/8/K7 w - - 0 1',
      line: ['e8=N+', 'Kf7', 'Nxc7'],
      hint: 'A new queen on e8 does not attack anything useful. What would?',
      success: 'The one case where underpromotion is clearly right: the knight arrives with check and a fork.'
    }
  ];

})(typeof globalThis !== 'undefined' ? globalThis : this);
