# Guess Who? vs AI

An interactive web version of the classic *Guess Who?* board game, where you
play head-to-head against an AI bot. Both players draw a secret character
from the same lineup of 24, then take turns asking yes/no questions until one
correctly identifies the other's character.

## How to play

1. Pick your own secret character from the lineup (or have one chosen at
   random).
2. On your turn, click a yes/no question from the categorized list. The bot
   answers truthfully about its own character, and the board automatically
   flips down every character that no longer matches.
3. When you're confident, click **Make my guess** and click a face on the
   board to commit.
4. On the bot's turn, it asks you a question. Answer truthfully about *your*
   character — the bot uses that answer to narrow down its own candidate set.
5. First player to make a correct guess wins. A wrong guess means you lose,
   so don't guess too early.

## How the AI works

The bot tracks the set of characters still consistent with everything it has
heard so far. On each turn it:

- **Picks a question** that maximizes information gain — concretely, the
  question whose yes/no split among remaining candidates is closest to 50/50,
  skipping any question that wouldn't split the set.
- **Guesses** when there's only one candidate left (or occasionally when
  there are exactly two and it feels like taking the coin flip).

See `src/ai.ts` for the implementation.

## Stack

- [Vite](https://vitejs.dev) + React 19 + TypeScript
- Character portraits are rendered with the
  [DiceBear "personas"](https://personas.draftbit.com/) style
  ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), by Draftbit),
  fed deterministic options so each character's hair, beard, glasses, hat,
  etc. match its declared properties.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
```
