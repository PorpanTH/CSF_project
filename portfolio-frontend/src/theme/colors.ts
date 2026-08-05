// Categorical identity colors — dataviz-skill default order, slots 1-3.
// Only the first three slots clear all-pairs CVD separation in both light/dark
// (needed here because pie slices are all visible at once, not just adjacent).
// Anything past the top 3 categories folds into "other" rather than adding a 4th hue.
// NOTE: a mono-red palette fails CVD validation (worst pair ΔE 5.9, below the 6.0 floor).
// These are the validated reference default from the dataviz skill's palette.md, proven
// safe across colorblind simulations; they keep data identity distinct while UI chrome
// (header, buttons, tabs) stays true red/white/black. Status colors (good/critical/warning)
// are reserved separately and never re-themed per dataviz standards.
export const CATEGORICAL = {
  slot1: '#2a78d6', // blue
  slot2: '#eb6834', // orange
  slot3: '#1baf7a', // aqua
  other: '#9ca3af', // neutral gray for overflow
} as const

export const CATEGORICAL_ORDER = [CATEGORICAL.slot1, CATEGORICAL.slot2, CATEGORICAL.slot3, CATEGORICAL.other]

// Status/polarity colors — fixed and reserved for gain/loss meaning only.
// Never reused as a categorical series color, so a status cue never impersonates an identity.
export const STATUS = {
  good: '#0ca30c',
  goodText: '#006300',
  critical: '#d03b3b',
  warning: '#fab219',
  neutralMidpoint: '#f0efec',
  neutralMidpointDark: '#383835',
} as const

// Brand chrome — red + white identity per brand requirement.
// Used for UI chrome (headers, buttons, nav, accents) only — never for data encoding,
// so it can't collide with the reserved red "critical/loss" status color above.
export const BRAND = {
  900: '#7f1d1d',
  800: '#991b1b',
  700: '#b91c1c',
  600: '#dc2626',
  500: '#ef4444',
  200: '#fecaca',
  100: '#fee2e2',
  50: '#fef2f2',
} as const

// Chart chrome & ink (light mode)
export const INK = {
  surface: '#fcfcfb',
  page: '#f9f9f7',
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
} as const
