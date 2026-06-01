import { QUESTION_MAP, type Question } from './questions'

/**
 * Free-text questions are parsed by keyword matching only — we look for
 * specific feature words in the player's input and route to the matching
 * predicate. We do NOT attempt grammar/negation parsing; "does your
 * character have glasses?" and "you don't have glasses, right?" both
 * resolve to the same `glasses` predicate and are answered truthfully
 * about the bot's character.
 */

/** Map of question id → keywords/phrases that should route to it. */
const KEYWORD_MAP: Record<string, string[]> = {
  // Identity / age
  male: ['man', 'male', 'guy', 'boy', 'dude', 'gentleman'],
  female: ['woman', 'female', 'girl', 'lady'],
  young: ['young', 'kid', 'child'],
  elderly: ['elderly', 'old', 'older', 'senior'],
  smile: ['smile', 'smiling', 'happy', 'grin', 'grinning'],

  // Skin
  light: ['light skin', 'pale skin', 'fair skin', 'pale-skinned', 'fair-skinned'],
  medium: ['medium skin', 'tan skin', 'olive skin'],
  dark: ['dark skin', 'dark-skinned'],

  // Hair color
  black: ['black hair'],
  brown: ['brown hair', 'brunette'],
  blonde: ['blond hair', 'blonde hair', 'blond', 'blonde'],
  red: ['red hair', 'redhead', 'ginger'],
  grayWhite: ['gray hair', 'grey hair', 'white hair', 'silver hair'],

  // Hair length
  bald: ['bald', 'no hair'],
  long: ['long hair', 'long-haired'],
  short: ['short hair', 'short-haired'],

  // Accessories / features
  glasses: ['glasses', 'spectacles', 'specs', 'eyewear'],
  hat: ['hat', 'cap', 'beanie'],
  earrings: ['earring', 'earrings'],
  freckles: ['freckle', 'freckles', 'freckled'],
  beard: ['beard', 'goatee'],
  mustache: ['mustache', 'moustache', 'stache'],
  facialHair: ['facial hair', 'facial-hair'],
  bigNose: ['big nose', 'large nose', 'big-nose'],
}

export interface FreeTextMatch {
  question: Question
  /** Which keyword in the input string matched. */
  matchedKeyword: string
}

export function parseFreeTextQuestion(text: string): FreeTextMatch | null {
  const lc = text.toLowerCase()
  type Candidate = { qid: string; kw: string }
  const candidates: Candidate[] = []
  for (const [qid, kws] of Object.entries(KEYWORD_MAP)) {
    for (const kw of kws) {
      // Whole-word-ish check: keyword must appear bordered by non-letter
      // chars (or start/end), so "blond" matches but won't false-positive
      // off "blonded" or "manchester".
      const idx = lc.indexOf(kw)
      if (idx === -1) continue
      const before = idx === 0 ? '' : lc[idx - 1]
      const after = idx + kw.length >= lc.length ? '' : lc[idx + kw.length]
      const boundary = (ch: string) => ch === '' || !/[a-z]/.test(ch)
      if (boundary(before) && boundary(after)) {
        candidates.push({ qid, kw })
      }
    }
  }
  if (candidates.length === 0) return null
  // Prefer the longest keyword match so e.g. "facial hair" beats "hair"
  // and "red hair" beats "hair" (which isn't even a key but illustrates).
  candidates.sort((a, b) => b.kw.length - a.kw.length)
  const top = candidates[0]
  const q = QUESTION_MAP[top.qid]
  if (!q) return null
  return { question: q, matchedKeyword: top.kw }
}
