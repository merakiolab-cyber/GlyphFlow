export interface Glyph {
  char: string;
  name: string;
  czechName: string;
  category: string;
  subCategory?: string;
  codePoint: number;
  hex: string;
  dec: number;
  htmlEntity?: string;
  htmlNumeric: string;
  htmlHex: string;
  css: string;
  js: string;
  utf8Bytes: string;
  tags: string[];
  description?: string;
}

export type IconStyle = 'outline' | 'solid' | 'duotone' | 'colored' | 'modern3d';

export interface IconItem {
  id: string;
  name: string;
  czechName: string;
  category: string;
  tags: string[];
  svgPath: string; // SVG path data (d attribute) or full inner markup
  viewBox?: string;
  isCustom?: boolean;
  isCurated?: boolean;
  collection?: string;
}

export interface CustomIconItem {
  id: string;
  name: string;
  czechName: string;
  category: string;
  collection?: string;
  tags: string[];
  svgContent: string;
  viewBox: string;
  addedAt?: number;
  isCustom?: boolean;
}

export interface IconCollection {
  id: string;
  name: string;
  description?: string;
  count: number;
  createdAt: number;
}

export interface OpenTypeFeatureConfig {
  tag: string;
  name: string;
  description: string;
  category: 'ligatures' | 'figures' | 'stylistic' | 'casing' | 'layout';
  enabled: boolean;
  sampleText?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  iconName: string;
  count?: number;
  description?: string;
}

export interface FavoriteItem {
  char: string;
  hex: string;
  addedAt: number;
  tags: string[];
  note?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  resultsCount: number;
}

export interface CopyHistoryItem {
  char: string;
  hex: string;
  name: string;
  czechName?: string;
  timestamp: number;
  count: number;
}

export interface ExportOptions {
  format: 'svg' | 'png';
  fontSize: number;
  fontFamily: string;
  textColor: string;
  bgColor: string;
  isTransparent: boolean;
  padding: number;
  width: number;
  height: number;
  resolution: number; // e.g. 128, 256, 512, 1024
  fontWeight: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  defaultCopyFormat: 'char' | 'unicode' | 'htmlEntity' | 'css' | 'js';
  gridDensity: 'compact' | 'normal' | 'spacious';
  soundFeedback: boolean;
  autoAddToScratchpad: boolean;
  activeFontFamily: string;
}

export interface SyncData {
  version: string;
  exportedAt: string;
  favorites: FavoriteItem[];
  copyHistory: CopyHistoryItem[];
  customIcons?: CustomIconItem[];
  settings: UserSettings;
}

export interface FontFamilyOption {
  id: string;
  name: string;
  family: string;
  category: 'sans' | 'serif' | 'mono' | 'system';
  isInstalledInWindows?: boolean;
}

export interface TypographyMetrics {
  unicodeBlock: string;
  generalCategory: string;
  bidiClass: string;
  plane: string;
  utf16: string;
  binary: string;
  openTypeFeatures: { tag: string; name: string; description: string; supported?: boolean }[];
}
