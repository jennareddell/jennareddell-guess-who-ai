import type { Character, HairColor, SkinTone, EyeColor } from './characters'

const SKIN_COLORS: Record<SkinTone, string> = {
  light: '#f5d6b0',
  medium: '#c89876',
  dark: '#6b4226',
}

const HAIR_COLORS: Record<HairColor, string> = {
  black: '#1f2937',
  brown: '#5b3a1e',
  blonde: '#e9c46a',
  red: '#c0392b',
  gray: '#9ca3af',
  white: '#f3f4f6',
  none: 'transparent',
}

const EYE_COLORS: Record<EyeColor, string> = {
  brown: '#5a3825',
  blue: '#2563eb',
  green: '#16a34a',
}

interface AvatarProps {
  character: Character
  size?: number
}

/** Procedurally drawn cartoon portrait based on character features. */
export function Avatar({ character: c, size = 140 }: AvatarProps) {
  const skin = SKIN_COLORS[c.skinTone]
  const hair = HAIR_COLORS[c.hairColor]
  const eye = EYE_COLORS[c.eyeColor]
  const isBald = c.hairLength === 'bald'

  // Mouth: smile -> upward curve, neutral -> straight line
  const mouthPath = c.smile
    ? 'M 40 72 Q 50 82 60 72'
    : 'M 42 76 L 58 76'

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Portrait of ${c.name}`}
    >
      {/* Background */}
      <rect width="100" height="100" fill="#fef9f1" />

      {/* Neck/shoulders */}
      <path d="M 30 100 Q 30 86 50 86 Q 70 86 70 100 Z" fill={skin} />
      <path
        d="M 18 100 Q 18 90 32 86 L 68 86 Q 82 90 82 100 Z"
        fill="#475569"
      />

      {/* Head */}
      <ellipse cx="50" cy="50" rx="26" ry="30" fill={skin} />

      {/* Ears */}
      <ellipse cx="22" cy="54" rx="4" ry="6" fill={skin} />
      <ellipse cx="78" cy="54" rx="4" ry="6" fill={skin} />

      {/* Earrings */}
      {c.earrings && (
        <>
          <circle cx="22" cy="60" r="2" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" />
          <circle cx="78" cy="60" r="2" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" />
        </>
      )}

      {/* Hair - long (back layer) */}
      {!isBald && c.hairLength === 'long' && (
        <path
          d="M 22 50 Q 22 28 50 22 Q 78 28 78 50 L 78 84 Q 78 78 72 76 L 72 60 Q 72 50 65 48 L 35 48 Q 28 50 28 60 L 28 76 Q 22 78 22 84 Z"
          fill={hair}
        />
      )}

      {/* Hair - short (top of head) */}
      {!isBald && c.hairLength === 'short' && (
        <path
          d="M 24 48 Q 24 26 50 24 Q 76 26 76 48 Q 76 38 50 36 Q 32 38 24 48 Z"
          fill={hair}
        />
      )}

      {/* Eyebrows */}
      {!isBald || c.hairColor !== 'none' ? (
        <>
          <path
            d="M 33 42 Q 38 39 43 42"
            stroke={c.hairColor === 'none' ? '#5b3a1e' : hair}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 57 42 Q 62 39 67 42"
            stroke={c.hairColor === 'none' ? '#5b3a1e' : hair}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M 33 42 Q 38 39 43 42"
            stroke="#5b3a1e"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 57 42 Q 62 39 67 42"
            stroke="#5b3a1e"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Eyes */}
      <ellipse cx="38" cy="50" rx="3.5" ry="4" fill="white" />
      <ellipse cx="62" cy="50" rx="3.5" ry="4" fill="white" />
      <circle cx="38" cy="51" r="2" fill={eye} />
      <circle cx="62" cy="51" r="2" fill={eye} />
      <circle cx="38.6" cy="50.2" r="0.6" fill="white" />
      <circle cx="62.6" cy="50.2" r="0.6" fill="white" />

      {/* Freckles */}
      {c.freckles && (
        <g fill="#a16207" opacity="0.65">
          <circle cx="33" cy="60" r="0.9" />
          <circle cx="38" cy="62" r="0.9" />
          <circle cx="43" cy="60" r="0.9" />
          <circle cx="57" cy="60" r="0.9" />
          <circle cx="62" cy="62" r="0.9" />
          <circle cx="67" cy="60" r="0.9" />
        </g>
      )}

      {/* Nose */}
      <path
        d="M 50 54 Q 47 62 50 65 Q 53 62 50 54"
        fill="none"
        stroke="#000"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Mustache */}
      {c.mustache && (
        <path
          d="M 38 70 Q 42 67 50 70 Q 58 67 62 70 Q 58 72 50 71 Q 42 72 38 70 Z"
          fill={c.hairColor === 'none' ? '#3f3f46' : hair}
        />
      )}

      {/* Mouth */}
      <path
        d={mouthPath}
        stroke="#7c2d12"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Beard */}
      {c.beard && (
        <path
          d="M 28 64 Q 30 86 50 88 Q 70 86 72 64 Q 70 76 60 80 Q 50 82 40 80 Q 30 76 28 64 Z"
          fill={c.hairColor === 'none' ? '#3f3f46' : hair}
          opacity="0.95"
        />
      )}

      {/* Glasses */}
      {c.glasses && (
        <g
          stroke="#111827"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        >
          <circle cx="38" cy="50" r="6.5" fill="rgba(255,255,255,0.25)" />
          <circle cx="62" cy="50" r="6.5" fill="rgba(255,255,255,0.25)" />
          <line x1="44.5" y1="50" x2="55.5" y2="50" />
          <line x1="31.5" y1="50" x2="26" y2="48" />
          <line x1="68.5" y1="50" x2="74" y2="48" />
        </g>
      )}

      {/* Hat */}
      {c.hat && c.hatColor && (
        <g>
          <rect x="20" y="26" width="60" height="4" fill={c.hatColor} />
          <path
            d="M 28 26 Q 28 12 50 10 Q 72 12 72 26 Z"
            fill={c.hatColor}
          />
          <rect x="28" y="22" width="44" height="3" fill="rgba(0,0,0,0.25)" />
        </g>
      )}
    </svg>
  )
}
