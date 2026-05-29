import type { Character, HairColor, SkinTone, EyeColor } from './characters'

const SKIN_COLORS: Record<SkinTone, string> = {
  light: '#f5d6b0',
  medium: '#c69365',
  dark: '#7a4a2b',
}

const SKIN_SHADE: Record<SkinTone, string> = {
  light: '#dcb487',
  medium: '#9a6a3f',
  dark: '#4e2a14',
}

const HAIR_COLORS: Record<HairColor, string> = {
  black: '#1b1b1f',
  brown: '#5b3a1e',
  blonde: '#e7c25d',
  red: '#b34a1e',
  gray: '#9ca3af',
  white: '#ececec',
  none: 'transparent',
}

const HAIR_SHADE: Record<HairColor, string> = {
  black: '#000000',
  brown: '#3d2611',
  blonde: '#b89438',
  red: '#7d2e0e',
  gray: '#6b7280',
  white: '#c9c9c9',
  none: 'transparent',
}

const EYE_COLORS: Record<EyeColor, string> = {
  brown: '#5a3825',
  blue: '#2563eb',
  green: '#16a34a',
}

const OUTLINE = '#1b1b1f'

interface AvatarProps {
  character: Character
  size?: number
}

/**
 * Procedurally drawn cartoon portrait inspired by classic Guess Who? card art:
 * heavy outlines, exaggerated features, beige card background.
 */
export function Avatar({ character: c, size = 140 }: AvatarProps) {
  const skin = SKIN_COLORS[c.skinTone]
  const skinShade = SKIN_SHADE[c.skinTone]
  const hair = HAIR_COLORS[c.hairColor]
  const hairShade = HAIR_SHADE[c.hairColor]
  const eye = EYE_COLORS[c.eyeColor]
  const isBald = c.hairLength === 'bald'
  // Blond facial hair would blend with skin — bump to a darker amber.
  const facialHairColor =
    c.hairColor === 'none' ? '#3a2418' : c.hairColor === 'blonde' ? hairShade : hair
  const browColor = c.hairColor === 'none' || c.hairColor === 'white' || c.hairColor === 'gray'
    ? '#3a2418'
    : hairShade

  return (
    <svg
      viewBox="0 0 100 110"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Portrait of ${c.name}`}
      style={{ display: 'block' }}
    >
      {/* Beige card background */}
      <rect width="100" height="110" fill="#f7ecd2" />
      <rect width="100" height="110" fill="none" stroke="#d9c69a" strokeWidth="1.5" />

      {/* Shirt / shoulders */}
      <path
        d="M 8 110 Q 10 92 30 86 L 70 86 Q 90 92 92 110 Z"
        fill="#3a4a6b"
        stroke={OUTLINE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Shirt collar v */}
      <path
        d="M 42 86 L 50 96 L 58 86"
        fill={skin}
        stroke={OUTLINE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Neck */}
      <path
        d="M 41 78 L 41 88 Q 50 92 59 88 L 59 78 Z"
        fill={skin}
        stroke={OUTLINE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Ears (behind head) */}
      <ellipse cx="21" cy="56" rx="4.5" ry="7" fill={skin} stroke={OUTLINE} strokeWidth="1.5" />
      <ellipse cx="79" cy="56" rx="4.5" ry="7" fill={skin} stroke={OUTLINE} strokeWidth="1.5" />
      <path d="M 21 55 Q 23 56 22 60" stroke={skinShade} strokeWidth="1" fill="none" />
      <path d="M 79 55 Q 77 56 78 60" stroke={skinShade} strokeWidth="1" fill="none" />

      {/* Earrings */}
      {c.earrings && (
        <>
          <circle cx="21" cy="64" r="2.4" fill="#fbbf24" stroke={OUTLINE} strokeWidth="1" />
          <circle cx="79" cy="64" r="2.4" fill="#fbbf24" stroke={OUTLINE} strokeWidth="1" />
        </>
      )}

      {/* Head */}
      <ellipse
        cx="50"
        cy="50"
        rx="27"
        ry="31"
        fill={skin}
        stroke={OUTLINE}
        strokeWidth="2"
      />

      {/* Long hair back layer (drawn behind face/ears) */}
      {!isBald && c.hairLength === 'long' && (
        <path
          d="M 22 50 Q 22 24 50 20 Q 78 24 78 50 L 80 88 Q 74 80 70 76 L 70 58 Q 70 50 62 50 L 38 50 Q 30 50 30 58 L 30 76 Q 26 80 20 88 Z"
          fill={hair}
          stroke={OUTLINE}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      )}

      {/* Short hair: classic helmet-cap with a tuft */}
      {!isBald && c.hairLength === 'short' && (
        <>
          <path
            d="M 23 48 Q 23 24 50 22 Q 77 24 77 48 Q 76 40 66 38 Q 58 36 50 36 Q 38 36 32 40 Q 26 42 23 48 Z"
            fill={hair}
            stroke={OUTLINE}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* hair texture lines */}
          <path
            d="M 32 32 Q 36 24 44 24"
            stroke={hairShade}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 50 22 Q 56 26 62 30"
            stroke={hairShade}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Bald shine highlight */}
      {isBald && (
        <ellipse
          cx="44"
          cy="32"
          rx="6"
          ry="3"
          fill="#ffffff"
          opacity="0.35"
        />
      )}

      {/* Eyebrows */}
      <path
        d="M 32 42 Q 38 38 44 42"
        stroke={browColor}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 56 42 Q 62 38 68 42"
        stroke={browColor}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Eyes: white sclera + colored iris + pupil + highlight */}
      <ellipse cx="38" cy="50" rx="4" ry="4.4" fill="white" stroke={OUTLINE} strokeWidth="1.2" />
      <ellipse cx="62" cy="50" rx="4" ry="4.4" fill="white" stroke={OUTLINE} strokeWidth="1.2" />
      <circle cx="38" cy="51" r="2.4" fill={eye} />
      <circle cx="62" cy="51" r="2.4" fill={eye} />
      <circle cx="38" cy="51" r="1.1" fill={OUTLINE} />
      <circle cx="62" cy="51" r="1.1" fill={OUTLINE} />
      <circle cx="38.8" cy="50" r="0.7" fill="white" />
      <circle cx="62.8" cy="50" r="0.7" fill="white" />

      {/* Cheek blush (subtle, on smiling characters) */}
      {c.smile && (
        <>
          <ellipse cx="30" cy="64" rx="3.6" ry="2" fill="#f4a4a4" opacity="0.55" />
          <ellipse cx="70" cy="64" rx="3.6" ry="2" fill="#f4a4a4" opacity="0.55" />
        </>
      )}

      {/* Freckles */}
      {c.freckles && (
        <g fill="#a16207" opacity="0.7">
          <circle cx="32" cy="60" r="1" />
          <circle cx="37" cy="63" r="1" />
          <circle cx="42" cy="60" r="1" />
          <circle cx="58" cy="60" r="1" />
          <circle cx="63" cy="63" r="1" />
          <circle cx="68" cy="60" r="1" />
        </g>
      )}

      {/* Nose */}
      {c.bigNose ? (
        // Big, bulbous, hooked cartoon nose
        <path
          d="M 50 46
             Q 44 54 43 62
             Q 43 70 50 70
             Q 57 70 57 62
             Q 56 54 50 46 Z"
          fill={skin}
          stroke={OUTLINE}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      ) : (
        // Standard small nose
        <path
          d="M 50 52 Q 46 62 50 66 Q 54 62 50 52"
          fill="none"
          stroke={OUTLINE}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* Nostril shading */}
      {c.bigNose && (
        <>
          <ellipse cx="46.5" cy="66" rx="1.2" ry="0.8" fill={skinShade} />
          <ellipse cx="53.5" cy="66" rx="1.2" ry="0.8" fill={skinShade} />
        </>
      )}

      {/* Mustache */}
      {c.mustache && (
        <path
          d="M 34 71
             Q 40 67 48 70
             Q 50 72 52 70
             Q 60 67 66 71
             Q 60 76 50 74
             Q 40 76 34 71 Z"
          fill={facialHairColor}
          stroke={OUTLINE}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      )}

      {/* Mouth */}
      {c.smile ? (
        // Toothy smile
        <g>
          <path
            d="M 40 76 Q 50 86 60 76 Q 50 82 40 76 Z"
            fill="#7c2d12"
            stroke={OUTLINE}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M 42 77 Q 50 81 58 77"
            fill="white"
            stroke="none"
          />
        </g>
      ) : (
        <path
          d={c.mustache ? 'M 42 78 Q 50 80 58 78' : 'M 42 78 Q 50 81 58 78'}
          stroke={OUTLINE}
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Beard */}
      {c.beard && (
        <path
          d="M 24 60
             Q 26 86 50 90
             Q 74 86 76 60
             Q 72 76 64 82
             Q 56 86 50 86
             Q 44 86 36 82
             Q 28 76 24 60 Z"
          fill={facialHairColor}
          stroke={OUTLINE}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}

      {/* Glasses */}
      {c.glasses && (
        <g
          stroke={OUTLINE}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        >
          <circle cx="38" cy="50" r="7.5" fill="rgba(255,255,255,0.18)" />
          <circle cx="62" cy="50" r="7.5" fill="rgba(255,255,255,0.18)" />
          <line x1="45.5" y1="50" x2="54.5" y2="50" />
          <line x1="30.5" y1="49" x2="25" y2="46" />
          <line x1="69.5" y1="49" x2="75" y2="46" />
        </g>
      )}

      {/* Hat */}
      {c.hat && c.hatColor && (
        <g stroke={OUTLINE} strokeWidth="1.8" strokeLinejoin="round">
          {/* brim */}
          <ellipse cx="50" cy="28" rx="34" ry="4" fill={c.hatColor} />
          {/* crown */}
          <path
            d="M 26 28 Q 26 8 50 6 Q 74 8 74 28 Z"
            fill={c.hatColor}
          />
          {/* hat band */}
          <rect x="26" y="24" width="48" height="4" fill="rgba(0,0,0,0.35)" stroke="none" />
        </g>
      )}
    </svg>
  )
}
