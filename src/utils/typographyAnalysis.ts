import { FontFamilyOption, TypographyMetrics } from '../types';

export const SYSTEM_FONT_FAMILIES: FontFamilyOption[] = [
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', system-ui, sans-serif",
    category: 'sans',
    isInstalledInWindows: false,
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', ui-monospace, monospace",
    category: 'mono',
    isInstalledInWindows: false,
  },
  {
    id: 'segoe-ui',
    name: 'Segoe UI (Windows výchozí)',
    family: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    category: 'system',
    isInstalledInWindows: true,
  },
  {
    id: 'segoe-ui-symbol',
    name: 'Segoe UI Symbol',
    family: "'Segoe UI Symbol', 'Segoe UI', sans-serif",
    category: 'system',
    isInstalledInWindows: true,
  },
  {
    id: 'arial',
    name: 'Arial',
    family: "Arial, Helvetica, sans-serif",
    category: 'sans',
    isInstalledInWindows: true,
  },
  {
    id: 'times',
    name: 'Times New Roman',
    family: "'Times New Roman', Times, serif",
    category: 'serif',
    isInstalledInWindows: true,
  },
  {
    id: 'georgia',
    name: 'Georgia',
    family: "Georgia, Cambria, serif",
    category: 'serif',
    isInstalledInWindows: true,
  },
  {
    id: 'consolas',
    name: 'Consolas',
    family: "Consolas, 'Courier New', monospace",
    category: 'mono',
    isInstalledInWindows: true,
  },
];

/**
 * Resolves the official Unicode block for a code point
 */
export function getUnicodeBlock(codePoint: number): string {
  if (codePoint <= 0x007F) return 'Basic Latin (ASCII)';
  if (codePoint <= 0x00FF) return 'Latin-1 Supplement';
  if (codePoint <= 0x017F) return 'Latin Extended-A';
  if (codePoint <= 0x024F) return 'Latin Extended-B';
  if (codePoint <= 0x036F) return 'Combining Diacritical Marks';
  if (codePoint <= 0x03FF) return 'Greek and Coptic (Řecká abeceda)';
  if (codePoint <= 0x04FF) return 'Cyrillic (Azbuka)';
  if (codePoint <= 0x206F) return 'General Punctuation (Interpunkce)';
  if (codePoint <= 0x209F) return 'Superscripts and Subscripts (Indexy)';
  if (codePoint <= 0x20CF) return 'Currency Symbols (Měny)';
  if (codePoint <= 0x20FF) return 'Combining Diacritical Marks for Symbols';
  if (codePoint <= 0x214F) return 'Letterlike Symbols (Písmenné symboly)';
  if (codePoint <= 0x218F) return 'Number Forms (Číselné tvary)';
  if (codePoint <= 0x21FF) return 'Arrows (Směrové šipky)';
  if (codePoint <= 0x22FF) return 'Mathematical Operators (Matematika)';
  if (codePoint <= 0x23FF) return 'Miscellaneous Technical (Technické znaky)';
  if (codePoint <= 0x243F) return 'Control Pictures';
  if (codePoint <= 0x257F) return 'Box Drawing (Rámečky)';
  if (codePoint <= 0x259F) return 'Block Elements';
  if (codePoint <= 0x25FF) return 'Geometric Shapes (Geometrie)';
  if (codePoint <= 0x26FF) return 'Miscellaneous Symbols (Různé symboly)';
  if (codePoint <= 0x27BF) return 'Dingbats (Typografické ozdoby)';
  if (codePoint <= 0x28FF) return 'Braille Patterns (Braillovo písmo)';
  if (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) return 'Miscellaneous Symbols and Pictographs (Emojis)';
  if (codePoint >= 0x1F600 && codePoint <= 0x1F64F) return 'Emoticons (Smajlíci)';
  if (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) return 'Transport and Map Symbols';
  if (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) return 'Supplemental Symbols and Pictographs';
  return 'Unicode Standard Block';
}

/**
 * Resolves General Unicode Category
 */
export function getGeneralCategory(char: string, codePoint: number): string {
  if (/[A-Z]/.test(char) || (codePoint >= 0x0391 && codePoint <= 0x03A9)) return 'Lu (Velké písmeno / Uppercase)';
  if (/[a-z]/.test(char) || (codePoint >= 0x03B1 && codePoint <= 0x03C9)) return 'Ll (Malé písmeno / Lowercase)';
  if (/[0-9]/.test(char)) return 'Nd (Desítková číslice / Decimal Digit)';
  if (['$', '€', '£', '¥', '₿', '₽', '₹', '₩', '₴'].includes(char)) return 'Sc (Symbol měny / Currency)';
  if (['+', '−', '±', '×', '÷', '=', '≠', '<', '>', '≤', '≥', '√', '∫', '∑', '∞'].includes(char)) return 'Sm (Matematický symbol / Math)';
  if (['„', '“', '”', '‚', '‘', '’', '«', '»', '"', '\''].includes(char)) return 'Pi/Pf (Uvozovka / Quotation)';
  if (['.', ',', ':', ';', '!', '?', '…'].includes(char)) return 'Po (Interpunkce / Punctuation)';
  if (['(', '[', '{', '<'].includes(char)) return 'Ps (Otevírací závorka / Open)';
  if ([')', ']', '}', '>'].includes(char)) return 'Pe (Zavírací závorka / Close)';
  return 'So (Ostatní symbol / Other Symbol)';
}

/**
 * Analyzes OpenType feature compatibility for a glyph
 */
export function analyzeTypography(char: string, codePoint: number): TypographyMetrics {
  const unicodeBlock = getUnicodeBlock(codePoint);
  const generalCategory = getGeneralCategory(char, codePoint);
  const plane = codePoint <= 0xFFFF ? 'Plane 0 (BMP - Basic Multilingual Plane)' : 'Plane 1 (SMP - Supplementary Multilingual Plane)';

  // Calculate binary representation
  const binary = codePoint.toString(2).padStart(16, '0').match(/.{1,4}/g)?.join(' ') || '';

  // Calculate UTF-16 hex
  let utf16 = '';
  if (codePoint <= 0xFFFF) {
    utf16 = `0x${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
  } else {
    const cp = codePoint - 0x10000;
    const high = 0xD800 + (cp >> 10);
    const low = 0xDC00 + (cp & 0x3FF);
    utf16 = `0x${high.toString(16).toUpperCase()} 0x${low.toString(16).toUpperCase()}`;
  }

  const isMathOrFraction = unicodeBlock.includes('Mathematical') || unicodeBlock.includes('Subscripts');
  const isPunctuationOrLetter = generalCategory.includes('letter') || generalCategory.includes('Punctuation');

  const openTypeFeatures = [
    {
      tag: 'kern',
      name: 'Kerning',
      description: 'Optické vyrovnání párů znaků pro přirozené čtení',
      supported: true,
    },
    {
      tag: 'liga',
      name: 'Standard Ligatures',
      description: 'Typografické slitky znaků (např. fi, fl, ff)',
      supported: isPunctuationOrLetter,
    },
    {
      tag: 'calt',
      name: 'Contextual Alternates',
      description: 'Kontextové alternativy tvaru glyfu podle sousedních znaků',
      supported: true,
    },
    {
      tag: 'tnum',
      name: 'Tabular Figures',
      description: 'Znaky s jednotnou šířkou pro tabulky a čísla',
      supported: generalCategory.includes('Digit') || isMathOrFraction,
    },
    {
      tag: 'smcp',
      name: 'Small Capitals',
      description: 'Kapitálky odpovídající střední výšce minusek',
      supported: generalCategory.includes('letter'),
    },
    {
      tag: 'frac',
      name: 'Fractions',
      description: 'Automatické skládání zlomků (např. 1/2 na ½)',
      supported: isMathOrFraction,
    },
  ];

  return {
    unicodeBlock,
    generalCategory,
    bidiClass: 'L (Left-to-Right)',
    plane,
    utf16,
    binary,
    openTypeFeatures,
  };
}
