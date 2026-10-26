/**
 * Minimalist Design System Tokens
 * Clean, airy, spacious, distraction-free aesthetic (Linear / Notion inspired).
 */

export const DS = {
  colors: {
    dark: {
      bg: '#121214',
      surface: '#18181B',
      surfaceHover: '#202024',
      border: '#27272A',
      borderSubtle: '#1E1E22',
      textPrimary: '#FAFAFA',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
    },
    light: {
      bg: '#FAFAFA',
      surface: '#FFFFFF',
      surfaceHover: '#F4F4F5',
      border: '#E4E4E7',
      borderSubtle: '#F4F4F5',
      textPrimary: '#18181B',
      textSecondary: '#71717A',
      textMuted: '#A1A1AA',
    },
  },
  typography: {
    sans: 'font-sans',
    mono: 'font-mono-nums',
  },
} as const;

export const fontFamiliesList = [
  { id: 'sans', name: 'Plus Jakarta Sans (Moderní Sans)', value: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { id: 'mono', name: 'JetBrains Mono (Monospace)', value: "'JetBrains Mono', ui-monospace, monospace" },
  { id: 'serif', name: 'Tradiční Serif', value: "Georgia, Cambria, 'Times New Roman', serif" },
  { id: 'system', name: 'Systémové písmo', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
];
