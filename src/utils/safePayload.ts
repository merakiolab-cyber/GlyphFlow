import { CopyHistoryItem, CustomIconItem, FavoriteItem, SyncData, UserSettings } from '../types';
import { sanitizeSvgInner, sanitizeViewBox } from './svgSanitize';

export const MAX_SYNC_PARAM_LENGTH = 4096;
export const MAX_FAVORITES = 2000;
export const MAX_COPY_HISTORY = 200;
export const MAX_CUSTOM_ICONS = 1000;
export const MAX_CHAR_UNITS = 16;

function isNonEmptyString(value: unknown, max = 200): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

function sanitizeFavorite(raw: unknown): FavoriteItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<FavoriteItem>;
  if (!isNonEmptyString(item.char, MAX_CHAR_UNITS) || !isNonEmptyString(item.hex, 12)) return null;
  return {
    char: item.char,
    hex: item.hex,
    addedAt: typeof item.addedAt === 'number' ? item.addedAt : Date.now(),
    tags: Array.isArray(item.tags) ? item.tags.filter((t) => isNonEmptyString(t, 40)).slice(0, 12) : [],
    note: isNonEmptyString(item.note, 200) ? item.note : undefined,
  };
}

function sanitizeCustomIcon(raw: unknown): CustomIconItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<CustomIconItem>;
  if (!isNonEmptyString(item.id, 80) || !isNonEmptyString(item.name, 80)) return null;
  const inner = sanitizeSvgInner(typeof item.svgContent === 'string' ? item.svgContent : '');
  if (!inner) return null;
  return {
    id: item.id,
    name: item.name,
    czechName: isNonEmptyString(item.czechName, 80) ? item.czechName : item.name,
    category: 'custom-icons',
    collection: isNonEmptyString(item.collection, 60) ? item.collection : 'Moje ikony',
    tags: Array.isArray(item.tags) ? item.tags.filter((t) => isNonEmptyString(t, 40)).slice(0, 20) : ['custom'],
    svgContent: inner,
    viewBox: sanitizeViewBox(item.viewBox),
    addedAt: typeof item.addedAt === 'number' ? item.addedAt : Date.now(),
  };
}

function sanitizeSettings(raw: unknown): UserSettings | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const s = raw as Partial<UserSettings>;
  const theme = s.theme === 'light' ? 'light' : 'dark';
  const defaultCopyFormat =
    s.defaultCopyFormat === 'unicode' ||
    s.defaultCopyFormat === 'htmlEntity' ||
    s.defaultCopyFormat === 'css' ||
    s.defaultCopyFormat === 'js'
      ? s.defaultCopyFormat
      : 'char';
  const gridDensity =
    s.gridDensity === 'compact' || s.gridDensity === 'spacious' ? s.gridDensity : 'normal';
  return {
    theme,
    defaultCopyFormat,
    gridDensity,
    soundFeedback: Boolean(s.soundFeedback),
    autoAddToScratchpad: Boolean(s.autoAddToScratchpad),
    activeFontFamily: isNonEmptyString(s.activeFontFamily, 80) ? s.activeFontFamily : 'sans',
  };
}

export function parseBackupPayload(raw: unknown): SyncData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Neplatný formát záložních dat');
  }
  const data = raw as Partial<SyncData>;
  if (!Array.isArray(data.favorites)) {
    throw new Error('Neplatný formát záložních dat');
  }

  const favorites = data.favorites.map(sanitizeFavorite).filter((x): x is FavoriteItem => x !== null).slice(0, MAX_FAVORITES);

  const copyHistory: CopyHistoryItem[] = Array.isArray(data.copyHistory)
    ? data.copyHistory
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const row = item as Partial<CopyHistoryItem>;
          if (!isNonEmptyString(row.char, MAX_CHAR_UNITS) || !isNonEmptyString(row.hex, 12) || !isNonEmptyString(row.name, 80)) {
            return null;
          }
          const sanitized: CopyHistoryItem = {
            char: row.char,
            hex: row.hex,
            name: row.name,
            czechName: isNonEmptyString(row.czechName, 80) ? row.czechName : undefined,
            timestamp: typeof row.timestamp === 'number' ? row.timestamp : Date.now(),
            count: typeof row.count === 'number' && row.count > 0 ? Math.min(row.count, 10_000) : 1,
          };
          return sanitized;
        })
        .filter((x): x is CopyHistoryItem => x !== null)
        .slice(0, MAX_COPY_HISTORY)
    : [];

  const customIcons = Array.isArray(data.customIcons)
    ? data.customIcons.map(sanitizeCustomIcon).filter((x): x is CustomIconItem => x !== null).slice(0, MAX_CUSTOM_ICONS)
    : [];

  return {
    version: isNonEmptyString(data.version, 20) ? data.version : '1.3.0',
    exportedAt: isNonEmptyString(data.exportedAt, 40) ? data.exportedAt : new Date().toISOString(),
    favorites,
    copyHistory,
    customIcons,
    settings: sanitizeSettings(data.settings) ?? {
      theme: 'dark',
      defaultCopyFormat: 'char',
      gridDensity: 'normal',
      soundFeedback: false,
      autoAddToScratchpad: false,
      activeFontFamily: 'sans',
    },
  };
}

export function parseSyncQueryParam(syncParam: string): string[] | null {
  if (!syncParam || syncParam.length > MAX_SYNC_PARAM_LENGTH) return null;
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(syncParam))) as { v?: unknown; f?: unknown };
    if (decoded?.v !== 1 || !Array.isArray(decoded.f)) return null;
    const chars = decoded.f
      .filter((c): c is string => typeof c === 'string' && c.length > 0 && c.length <= MAX_CHAR_UNITS)
      .slice(0, MAX_FAVORITES);
    return chars;
  } catch {
    return null;
  }
}
