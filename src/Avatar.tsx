import { createAvatar } from '@dicebear/core'
import { personas } from '@dicebear/collection'
import { useMemo } from 'react'
import type { Character, HairColor, SkinTone } from './characters'

/**
 * Avatars are rendered with the DiceBear "personas" style (CC BY 4.0,
 * https://personas.draftbit.com/) — illustrated portraits instead of the
 * earlier hand-drawn cartoon. We map each Character's declared features
 * (hair color/length, beard, glasses, etc.) to deterministic personas
 * options so questions still match what you see, then overlay earrings
 * and freckles ourselves because personas doesn't support those.
 */

const SKIN_COLOR: Record<SkinTone, string> = {
  light: 'eeb4a4',
  medium: 'd78774',
  dark: '623d36',
}

const HAIR_COLOR: Record<HairColor, string> = {
  black: '2e2e3a',
  brown: '6c4545',
  blonde: 'f1c272',
  red: 'e15c66',
  gray: '9b9b9b',
  white: 'ececec',
  none: '6c4545', // unused when bald
}

type PersonasHair =
  | 'long'
  | 'sideShave'
  | 'shortCombover'
  | 'curlyHighTop'
  | 'bobCut'
  | 'curly'
  | 'pigtails'
  | 'curlyBun'
  | 'buzzcut'
  | 'bobBangs'
  | 'bald'
  | 'balding'
  | 'cap'
  | 'bunUndercut'
  | 'fade'
  | 'beanie'
  | 'straightBun'
  | 'extraLong'
  | 'shortComboverChops'
  | 'mohawk'

function pickHair(c: Character): PersonasHair {
  if (c.hat) {
    // Render every hat as a cap; we post-process the cap fill colour
    // so each character's declared hatColor shows through.
    return 'cap'
  }
  if (c.hairLength === 'bald') {
    return c.hairColor === 'none' ? 'bald' : 'balding'
  }
  if (c.gender === 'female') {
    if (c.hairLength === 'long') {
      // Vary by id for visual diversity.
      const opts: PersonasHair[] = ['long', 'extraLong', 'straightBun']
      return opts[c.id % opts.length]
    }
    const opts: PersonasHair[] = ['bobCut', 'bobBangs']
    return opts[c.id % opts.length]
  }
  // male
  if (c.hairLength === 'long') return 'long'
  // Avoid 'buzzcut' / 'fade' here — at small avatar sizes they read as bald,
  // which is confusing alongside the actually-bald characters.
  const opts: PersonasHair[] = ['shortCombover', 'curly']
  return opts[c.id % opts.length]
}

type PersonasFacialHair = 'beardMustache' | 'goatee' | 'walrus' | 'shadow' | 'pyramid' | 'soulPatch'

function pickFacialHair(c: Character): PersonasFacialHair | null {
  if (c.beard && c.mustache) return 'beardMustache'
  if (c.beard && !c.mustache) return 'pyramid' // visible chin beard; shadow was too subtle
  if (!c.beard && c.mustache) return 'walrus'
  return null
}

/** Hex-without-# color for the hat (taken from hatColor, which has '#'). */
function hatColorHex(c: Character): string | null {
  if (!c.hat || !c.hatColor) return null
  return c.hatColor.replace('#', '')
}

interface AvatarProps {
  character: Character
  size?: number
}

function overlayMarkup(c: Character): string {
  const parts: string[] = []
  if (c.freckles) {
    parts.push(
      '<g fill="#7a3e1c" opacity="0.55">' +
        '<circle cx="22.5" cy="32" r="0.6"/>' +
        '<circle cx="25" cy="33.5" r="0.6"/>' +
        '<circle cx="27.5" cy="32.5" r="0.6"/>' +
        '<circle cx="36.5" cy="32.5" r="0.6"/>' +
        '<circle cx="39" cy="33.5" r="0.6"/>' +
        '<circle cx="41.5" cy="32" r="0.6"/>' +
        '</g>'
    )
  }
  if (c.earrings) {
    parts.push(
      '<circle cx="17.5" cy="33" r="0.9" fill="#facc15" stroke="#92400e" stroke-width="0.25"/>' +
        '<circle cx="46.5" cy="33" r="0.9" fill="#facc15" stroke="#92400e" stroke-width="0.25"/>'
    )
  }
  return parts.join('')
}

export function Avatar({ character: c, size = 140 }: AvatarProps) {
  const svgString = useMemo(() => {
    const facialHair = pickFacialHair(c)
    const hair = pickHair(c)
    // Hat-wearing characters: color the hat (via hairColor) with their declared hatColor.
    // Bald characters: hair color is irrelevant but personas needs *something*.
    const hairColorHex = c.hat ? (hatColorHex(c) ?? HAIR_COLOR[c.hairColor]) : HAIR_COLOR[c.hairColor]

    const avatar = createAvatar(personas, {
      seed: c.name,
      // ----- Body / clothes -----
      body: ['rounded'],
      clothingColor: ['3a4a6b'], // matches our app's accent blue
      // ----- Head / face -----
      skinColor: [SKIN_COLOR[c.skinTone]],
      hair: [hair],
      hairColor: [hairColorHex],
      eyes: [c.glasses ? 'glasses' : 'open'],
      // 'lips' renders pink/glossy which made every neutral-mouthed character
      // look like they were wearing lipstick. 'smirk' reads as neutral.
      mouth: [c.smile ? 'smile' : 'smirk'],
      nose: c.age === 'elderly' ? ['wrinkles'] : c.bigNose ? ['mediumRound'] : ['smallRound'],
      // ----- Facial hair -----
      facialHair: facialHair ? [facialHair] : ['shadow'],
      facialHairProbability: facialHair ? 100 : 0,
    })
    // Inject explicit dims (so the SVG fills its container) and bake earrings
    // / freckles directly into the same SVG so we only render one element.
    let svg = avatar
      .toString()
      .replace(
        /<svg /,
        '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" '
      )
    // Personas's 'cap' hair variant has a hard-coded peach fill (#F29C65)
    // that ignores hairColor. Override it with the character's declared
    // hatColor so Bernard reads brown, Eric blue, Maria red, etc.
    if (c.hat && c.hatColor) {
      svg = svg.replace(/#F29C65/gi, c.hatColor)
    }
    const overlay = overlayMarkup(c)
    if (overlay) {
      svg = svg.replace('</svg>', overlay + '</svg>')
    }
    return svg
  }, [c])

  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#f7ecd2',
        borderRadius: 6,
        overflow: 'hidden',
      }}
      aria-label={`Portrait of ${c.name}`}
      role="img"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  )
}
