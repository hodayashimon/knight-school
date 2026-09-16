# Knight School

A complete chess game and an interactive course, in one page. No dependencies, no
build step, no network calls — eight JavaScript files, one stylesheet and an HTML
file.

## Running it

Open `index.html` in a browser. That is the whole procedure.

Everything loads as classic `<script>` tags rather than ES modules, specifically so
that opening the file directly from disk works — ES modules are blocked over
`file://` by browser security policy.

If you would rather serve it over HTTP (needed only if you want to run the test
pages from a real origin), any static server will do:

```bash
npx serve .
```

## What is in it

**Play** — a full game against the computer at four strengths, or two people on one
screen. Legal-move highlighting, drag or click to move, undo, board flip, captured
material with a running score, the move list in algebraic notation, and export of
the game (PGN) or position (FEN) to the clipboard.

**Learn** — 34 lessons across seven chapters, from how a rook moves to escorting a
pawn home. Most lessons include an exercise: a scripted line to follow, a capture
drill, or checkmate practice against the engine. Wrong moves are taken back with an
explanation rather than accepted silently. Progress is saved.

**Puzzles** — 13 tactics puzzles, graded, covering forks, pins, skewers, discovered
and double check, back-rank mates, deflection, underpromotion and Philidor's Legacy.

**Guide** — a manual for the interface itself: every control, where it lives, and
the things that are not guessable.

**Languages** — the interface ships in English, Hebrew and Russian, switchable from
the menu beside the tabs, and remembers the choice. Right-to-left languages flip the whole
page *except* the board, which keeps its fixed geometry: the a-file stays on White's
left, as on a real board.

## Adding a language

Two steps, both in `js/i18n.js`:

1. Add an entry to `LANGUAGES`: `{ code: 'fr', name: 'Français', dir: 'ltr' }`
2. Add a table with the same keys to `STRINGS`

Any key you leave out falls back to English rather than rendering blank, so a
partial translation is usable from the first string. Run `I18n.audit()` in the
console, or open `tests.html`, to list exactly which keys a language is still
missing — the fallback means nothing else would reveal a gap. Optionally add a matching
section to `js/guide.js` to translate the in-app manual; it falls back to English
too.

Move notation stays international (K Q R B N) in every language, because that is
what chess sites, books and databases use. The lesson prose in `js/lessons.js` is
currently English only.

## Files

```
index.html          the page
css/style.css       all styling
js/i18n.js          interface translation — add a language here
js/engine.js        rules engine — move generation, legality, FEN, SAN, PGN
js/ai.js            the opponent — negamax, alpha-beta, quiescence, evaluation
js/board.js         the board component — rendering, drag and click, promotion
js/lessons.js       curriculum data
js/puzzles.js       puzzle data
js/guide.js         in-app manual data
js/app.js           the four modes, wired together
sw.js               offline caching for the hosted copy — see below
tests.html          engine and AI test suite
validate.html       curriculum validation
```

## Running it offline

The **local copy** (opened from disk, or the desktop shortcut) already works with
no connection at all - the app never makes a network call, so there is nothing
for a connection to interrupt.

A copy opened from a **URL** (GitHub Pages or anywhere else it is hosted) is a
website: the first load needs a connection, same as any site. `sw.js` is what
makes it keep working after that. It is a service worker that caches every asset
the first time the page loads successfully, and serves that cache when a later
load has no network - open it once while online, and it keeps working offline
from then on, including installed as a PWA.

It is registered from `index.html`, guarded to skip `file://` entirely:
service workers require a secure context, which `file://` never is and the
local copy does not need one anyway. `localhost` counts as secure for testing,
but a minimal hand-rolled server can still trip up registration in ways a real
static host will not - if you see a service-worker console error while testing
locally, check whether it reproduces on the actual hosted URL before treating
it as a bug in `sw.js`.

An update pushed to the hosted copy reaches a visitor the next time they have a
connection - the worker fetches fresh and re-populates the cache rather than
serving a stale copy forever.

## Correctness

Both test pages need to be served over HTTP, not opened from disk, because the
browser pane treats local files as static snapshots.

**`tests.html`** — 160 assertions. The important ones are the **perft** counts: the
move generator is run to a fixed depth from six standard positions with published
node counts (the starting position, Kiwipete, and four others chosen to stress
castling, en passant, promotion and pinned pieces). Matching those numbers exactly
is what demonstrates the rules are right, including the awkward corners. The rest
covers FEN round-tripping, SAN disambiguation, castling rights, en passant expiry,
the draw rules, and the AI's tactical sanity and time budget.

**`validate.html`** — 924 checks over the lessons and puzzles. For every position it
confirms the FEN round-trips, both kings are present, and the side *not* to move is
not in check (which would make the position impossible). For every scripted line it
plays each move and confirms it is legal, that the notation written in the data is
exactly what the engine produces, and that anything marked `#` really is mate and
anything marked `+` really is check. Capture drills are solved by search to prove
they can actually be completed with the named piece alone.

This matters more than it sounds. The validator caught six genuine errors during
development, including a bishop move to a square the bishop could not reach and
three promotions that gave check without being written as checks.

## Notes on the engine

The board is [0x88](https://www.chessprogramming.org/0x88): a 128-entry array where
a square is off the board exactly when `index & 0x88` is non-zero, which makes
boundary checks a single bitwise AND. Attack tables are derived at load time rather
than hardcoded, so the geometry can be read and checked.

```js
var game = new Chess();                    // or new Chess(fen)
game.moves();                              // ['a3', 'a4', 'Nf3', …]
game.moves({ square: 'e2', verbose: true });
game.move('e4');                           // SAN, 'e2e4', or {from,to,promotion}
game.undo();
game.fen();
game.isCheckmate();  game.isStalemate();  game.isDraw();
game.gameResult();                         // {over, winner, reason}
game.perft(4);
```

`move()` returns `null` for an illegal move rather than throwing, and leaves the
position untouched.

## Notes on the AI

Negamax with alpha-beta, iterative deepening under a time budget, MVV-LVA capture
ordering, killer moves, and a quiescence search so the engine never evaluates a
position in the middle of a trade. Evaluation is material, piece-square tables
tapered between middlegame and endgame, the bishop pair, and doubled and isolated
pawns.

Root moves are searched with a full window so every one gets an exact score rather
than a bound. The weaker levels need that: they pick *among* the root scores — with
added noise, and an occasional deliberate mistake — instead of always taking the
maximum, which produces the kind of errors a human makes rather than random moves.

The search runs on the main thread. Web Workers are unavailable over `file://`, and
keeping the app openable by double-clicking was worth more than the responsiveness.
The top level is capped at 2.5 seconds a move.

## Adding lessons or puzzles

Both are plain data. Add an entry to `js/lessons.js` or `js/puzzles.js` and reload —
then open `validate.html`, which will tell you if the position is illegal or any
move in the line does not work.

In a `line`, even indices are the learner's moves and odd indices are the
opponent's automatic replies. `accept` offers alternatives for a given learner ply,
or `'*'` to accept any legal move.

```js
{
  id: 'skewer-1',
  title: 'Step Aside',
  theme: 'Skewer',
  difficulty: 2,
  fen: '3q4/8/8/3k4/8/8/8/R3K3 w - - 0 1',
  line: ['Rd1+', 'Kc5', 'Rxd8'],
  hint: 'King and queen are on the same file.',
  success: 'A pin stops a piece moving; a skewer forces it to.'
}
```

## Browser support

Any current browser. Uses pointer events, CSS grid, `aspect-ratio` and
`ResizeObserver`. Pieces are drawn with Unicode chess glyphs — the solid ones for
both colours, separated by outline rather than fill, which renders far more
consistently across fonts than mixing solid and hollow glyphs.

Progress is kept in `localStorage`, wrapped so that blocked storage degrades to
"progress is not saved" instead of breaking the page.
