/**
 * Tradora Mobile — design tokens derived from the web terminal's dark palette.
 * HSL values converted from artifacts/trading-terminal/src/index.css.
 * The app forces dark mode; both light and dark keys use the same dark theme.
 */

const tradoraDark = {
  // Core surfaces
  background: '#080808',        // hsl(0 0% 3%)
  foreground: '#F2F2F2',        // hsl(0 0% 95%)

  // Cards / elevated surfaces
  card: '#0D0D0D',              // hsl(0 0% 5%)
  cardForeground: '#F2F2F2',

  // Primary action color
  primary: '#3B82F6',           // hsl(217 91% 60%)
  primaryForeground: '#FFFFFF',

  // Secondary surfaces
  secondary: '#1E2129',         // hsl(220 10% 14%)
  secondaryForeground: '#F2F2F2',

  // Muted / subdued
  muted: '#1A1A1A',             // hsl(0 0% 10%)
  mutedForeground: '#999999',   // hsl(0 0% 60%)

  // Accent
  accent: '#3B82F6',
  accentForeground: '#FFFFFF',

  // Destructive
  destructive: '#EF4444',       // hsl(0 84% 60%)
  destructiveForeground: '#FFFFFF',

  // Input / border
  border: '#1F1F1F',            // hsl(0 0% 12%)
  input: '#262626',             // hsl(0 0% 15%)

  // Trading specific — price movement
  up: '#22C55E',                // hsl(142 71% 45%)
  upForeground: '#FFFFFF',
  down: '#DB1640',              // hsl(348 83% 47%)
  downForeground: '#FFFFFF',

  // Legacy aliases for backward compat
  text: '#F2F2F2',
  tint: '#3B82F6',
};

const colors = {
  light: tradoraDark,   // app forces dark, light fallback = dark
  dark: tradoraDark,
  radius: 6,
};

export default colors;
