import type { Character } from './characters'
import { QUESTIONS, type Question } from './questions'

/**
 * Picks the next bot action given the bot's current candidate set.
 *
 * Strategy:
 * - If there's exactly 1 candidate, guess it.
 * - If there are 2 candidates, 50/50 — flip a coin between guessing and asking
 *   a question that splits them (slightly favor guessing to keep games short).
 * - Otherwise, ask the question that minimizes expected remaining candidates
 *   (equivalent to maximizing information gain for binary questions: the
 *   question whose yes/no split is closest to 50/50 among current candidates).
 *
 * Returns either { kind: 'question', question } or { kind: 'guess', character }.
 */
export type BotAction =
  | { kind: 'question'; question: Question }
  | { kind: 'guess'; character: Character }

export function chooseBotAction(
  candidates: Character[],
  askedIds: Set<string>,
): BotAction {
  if (candidates.length === 0) {
    // Shouldn't happen in normal play, but guard anyway.
    throw new Error('Bot has no candidates left.')
  }

  if (candidates.length === 1) {
    return { kind: 'guess', character: candidates[0] }
  }

  const available = QUESTIONS.filter((q) => !askedIds.has(q.id))
  // For each available question, compute the split among candidates.
  // Score = max(yes, no). Smaller is better (closer to 50/50).
  // Skip questions that don't split (all yes or all no).
  let best: { q: Question; score: number; yes: number } | null = null
  for (const q of available) {
    let yes = 0
    for (const c of candidates) if (q.predicate(c)) yes += 1
    const no = candidates.length - yes
    if (yes === 0 || no === 0) continue // useless question
    const score = Math.max(yes, no)
    if (!best || score < best.score) {
      best = { q, score, yes }
    }
  }

  // With 2 candidates, sometimes just guess — like a real player.
  if (candidates.length === 2) {
    if (!best || Math.random() < 0.4) {
      return { kind: 'guess', character: pickRandom(candidates) }
    }
  }

  if (!best) {
    // No useful questions left — guess randomly from remaining candidates.
    return { kind: 'guess', character: pickRandom(candidates) }
  }

  return { kind: 'question', question: best.q }
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}
