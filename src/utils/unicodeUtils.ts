import { Glyph } from '../types';

/**
 * Converts a code point number to standard hexadecimal string (e.g. 0x03B4 -> "U+03B4")
 */
export function formatUnicodeHex(codePoint: number): string {
  const hex = codePoint.toString(16).toUpperCase();
  return `U+${hex.padStart(4, '0')}`;
}

/**
 * Gets UTF-8 byte representation in hex format (e.g. '€' -> 'E2 82 AC')
 */
export function getUtf8Bytes(char: string): string {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(char);
    return Array.from(bytes)
      .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');
  } catch {
    return '';
  }
}

/**
 * Gets CSS escape representation (e.g. '\03B4')
 */
export function getCssEscape(codePoint: number): string {
  return `\\${codePoint.toString(16).padStart(4, '0')}`;
}

/**
 * Gets JS escape sequence (e.g. '\u03B4' or '\u{1F680}')
 */
export function getJsEscape(codePoint: number): string {
  if (codePoint > 0xFFFF) {
    return `\\u{${codePoint.toString(16)}}`;
  }
  return `\\u${codePoint.toString(16).padStart(4, '0')}`;
}

/**
 * Helper to build a standard Glyph object
 */
export function createGlyph(
  char: string,
  czechName: string,
  nameEn: string,
  category: string,
  tags: string[] = [],
  htmlEntity?: string,
  subCategory?: string
): Glyph {
  const codePoint = char.codePointAt(0) || 0;
  const hex = formatUnicodeHex(codePoint);
  const dec = codePoint;
  const utf8Bytes = getUtf8Bytes(char);
  const css = getCssEscape(codePoint);
  const js = getJsEscape(codePoint);
  const htmlNumeric = `&#${dec};`;
  const htmlHex = `&#x${codePoint.toString(16).toUpperCase()};`;

  return {
    char,
    name: nameEn,
    czechName,
    category,
    subCategory,
    codePoint,
    hex,
    dec,
    htmlEntity: htmlEntity ? (htmlEntity.startsWith('&') ? htmlEntity : `&${htmlEntity};`) : undefined,
    htmlNumeric,
    htmlHex,
    css,
    js,
    utf8Bytes,
    tags: [
      ...tags,
      czechName.toLowerCase(),
      nameEn.toLowerCase(),
      hex.toLowerCase(),
      String(dec),
    ],
  };
}

/**
 * Remove Czech and foreign diacritics for ultra-fast, forgiving fuzzy search
 */
export function normalizeSearchString(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
