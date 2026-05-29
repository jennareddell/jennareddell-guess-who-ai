import type { Character } from './characters'

export interface Question {
  id: string
  /** The question as asked by the bot to the player, second person. */
  text: string
  /** Returns true if the character has the trait. */
  predicate: (c: Character) => boolean
}

export const QUESTIONS: Question[] = [
  { id: 'male', text: 'Is your character a man?', predicate: (c) => c.gender === 'male' },
  { id: 'female', text: 'Is your character a woman?', predicate: (c) => c.gender === 'female' },
  { id: 'glasses', text: 'Does your character wear glasses?', predicate: (c) => c.glasses },
  { id: 'hat', text: 'Is your character wearing a hat?', predicate: (c) => c.hat },
  { id: 'beard', text: 'Does your character have a beard?', predicate: (c) => c.beard },
  { id: 'mustache', text: 'Does your character have a mustache?', predicate: (c) => c.mustache },
  {
    id: 'facialHair',
    text: 'Does your character have any facial hair?',
    predicate: (c) => c.beard || c.mustache,
  },
  { id: 'earrings', text: 'Does your character wear earrings?', predicate: (c) => c.earrings },
  { id: 'freckles', text: 'Does your character have freckles?', predicate: (c) => c.freckles },
  { id: 'smile', text: 'Is your character smiling?', predicate: (c) => c.smile },
  { id: 'bigNose', text: 'Does your character have a big nose?', predicate: (c) => c.bigNose },

  { id: 'black', text: 'Does your character have black hair?', predicate: (c) => c.hairColor === 'black' },
  { id: 'brown', text: 'Does your character have brown hair?', predicate: (c) => c.hairColor === 'brown' },
  { id: 'blonde', text: 'Does your character have blonde hair?', predicate: (c) => c.hairColor === 'blonde' },
  { id: 'red', text: 'Does your character have red hair?', predicate: (c) => c.hairColor === 'red' },
  {
    id: 'grayWhite',
    text: 'Does your character have gray or white hair?',
    predicate: (c) => c.hairColor === 'gray' || c.hairColor === 'white',
  },
  { id: 'bald', text: 'Is your character bald?', predicate: (c) => c.hairLength === 'bald' },
  { id: 'long', text: 'Does your character have long hair?', predicate: (c) => c.hairLength === 'long' },
  {
    id: 'short',
    text: 'Does your character have short hair?',
    predicate: (c) => c.hairLength === 'short',
  },

  { id: 'young', text: 'Is your character young?', predicate: (c) => c.age === 'young' },
  { id: 'elderly', text: 'Is your character elderly?', predicate: (c) => c.age === 'elderly' },

  {
    id: 'light',
    text: 'Does your character have light skin?',
    predicate: (c) => c.skinTone === 'light',
  },
  {
    id: 'medium',
    text: 'Does your character have medium skin?',
    predicate: (c) => c.skinTone === 'medium',
  },
  { id: 'dark', text: 'Does your character have dark skin?', predicate: (c) => c.skinTone === 'dark' },
]

export const QUESTION_MAP: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
)
