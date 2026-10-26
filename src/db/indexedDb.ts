import { CopyHistoryItem, CustomIconItem, FavoriteItem, SearchHistoryItem, SyncData, UserSettings } from '../types';
import { parseBackupPayload } from '../utils/safePayload';
import { sanitizeSvgInner, sanitizeViewBox } from '../utils/svgSanitize';

const DB_NAME = 'GlyphFlow_OfflineDB';
const DB_VERSION = 2; // Incremented for custom_icons store

class LocalDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase | null> | null = null;
  private hasIndexedDb: boolean = typeof indexedDB !== 'undefined';

  private async getDB(): Promise<IDBDatabase | null> {
    if (!this.hasIndexedDb) return null;
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('favorites')) {
            db.createObjectStore('favorites', { keyPath: 'char' });
          }
          if (!db.objectStoreNames.contains('copy_history')) {
            const copyStore = db.createObjectStore('copy_history', { keyPath: 'char' });
            copyStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
          if (!db.objectStoreNames.contains('search_history')) {
            const searchStore = db.createObjectStore('search_history', { keyPath: 'id' });
            searchStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains('custom_icons')) {
            const iconStore = db.createObjectStore('custom_icons', { keyPath: 'id' });
            iconStore.createIndex('category', 'category', { unique: false });
            iconStore.createIndex('addedAt', 'addedAt', { unique: false });
          }
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };

        request.onerror = (e) => {
          console.warn('IndexedDB failed to open, falling back to LocalStorage', e);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB exception, falling back to LocalStorage', err);
        resolve(null);
      }
    });

    return this.initPromise;
  }

  // --- FAVORITES ---
  async getFavorites(): Promise<FavoriteItem[]> {
    const db = await this.getDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('favorites', 'readonly');
          const store = tx.objectStore('favorites');
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => resolve(this.getFallbackFavorites());
        } catch {
          resolve(this.getFallbackFavorites());
        }
      });
    }
    return this.getFallbackFavorites();
  }

  async addFavorite(item: FavoriteItem): Promise<void> {
    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction('favorites', 'readwrite');
        tx.objectStore('favorites').put(item);
      } catch (err) {
        console.warn(err);
      }
    }
    // Sync fallback
    const list = this.getFallbackFavorites().filter(f => f.char !== item.char);
    list.unshift(item);
    localStorage.setItem('gf_favorites', JSON.stringify(list));
  }

  async removeFavorite(char: string): Promise<void> {
    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction('favorites', 'readwrite');
        tx.objectStore('favorites').delete(char);
      } catch (err) {
        console.warn(err);
      }
    }
    const list = this.getFallbackFavorites().filter(f => f.char !== char);
    localStorage.setItem('gf_favorites', JSON.stringify(list));
  }

  private getFallbackFavorites(): FavoriteItem[] {
    try {
      const data = localStorage.getItem('gf_favorites');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // --- COPY HISTORY ---
  async getCopyHistory(limit = 40): Promise<CopyHistoryItem[]> {
    const db = await this.getDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('copy_history', 'readonly');
          const store = tx.objectStore('copy_history');
          const request = store.getAll();
          request.onsuccess = () => {
            const items: CopyHistoryItem[] = request.result || [];
            items.sort((a, b) => b.timestamp - a.timestamp);
            resolve(items.slice(0, limit));
          };
          request.onerror = () => resolve(this.getFallbackCopyHistory(limit));
        } catch {
          resolve(this.getFallbackCopyHistory(limit));
        }
      });
    }
    return this.getFallbackCopyHistory(limit);
  }

  async recordCopy(item: { char: string; hex: string; name: string; czechName?: string }): Promise<void> {
    const db = await this.getDB();
    const existingList = await this.getCopyHistory(100);
    const existing = existingList.find(x => x.char === item.char);
    const updated: CopyHistoryItem = {
      ...item,
      timestamp: Date.now(),
      count: (existing?.count || 0) + 1,
    };

    if (db) {
      try {
        const tx = db.transaction('copy_history', 'readwrite');
        tx.objectStore('copy_history').put(updated);
      } catch (err) {
        console.warn(err);
      }
    }

    const filtered = existingList.filter(x => x.char !== item.char);
    filtered.unshift(updated);
    localStorage.setItem('gf_copy_history', JSON.stringify(filtered.slice(0, 100)));
  }

  async clearCopyHistory(): Promise<void> {
    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction('copy_history', 'readwrite');
        tx.objectStore('copy_history').clear();
      } catch (err) {
        console.warn(err);
      }
    }
    localStorage.removeItem('gf_copy_history');
  }

  private getFallbackCopyHistory(limit: number): CopyHistoryItem[] {
    try {
      const data = localStorage.getItem('gf_copy_history');
      const items: CopyHistoryItem[] = data ? JSON.parse(data) : [];
      return items.slice(0, limit);
    } catch {
      return [];
    }
  }

  // --- SEARCH HISTORY ---
  async getSearchHistory(limit = 15): Promise<SearchHistoryItem[]> {
    const db = await this.getDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('search_history', 'readonly');
          const store = tx.objectStore('search_history');
          const request = store.getAll();
          request.onsuccess = () => {
            const items: SearchHistoryItem[] = request.result || [];
            items.sort((a, b) => b.timestamp - a.timestamp);
            resolve(items.slice(0, limit));
          };
          request.onerror = () => resolve(this.getFallbackSearchHistory(limit));
        } catch {
          resolve(this.getFallbackSearchHistory(limit));
        }
      });
    }
    return this.getFallbackSearchHistory(limit);
  }

  async recordSearch(query: string, resultsCount: number): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) return;

    const id = trimmed.toLowerCase();
    const item: SearchHistoryItem = {
      id,
      query: trimmed,
      timestamp: Date.now(),
      resultsCount,
    };

    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction('search_history', 'readwrite');
        tx.objectStore('search_history').put(item);
      } catch (err) {
        console.warn(err);
      }
    }

    const list = this.getFallbackSearchHistory(50).filter(s => s.id !== id);
    list.unshift(item);
    localStorage.setItem('gf_search_history', JSON.stringify(list.slice(0, 50)));
  }

  async clearSearchHistory(): Promise<void> {
    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction('search_history', 'readwrite');
        tx.objectStore('search_history').clear();
      } catch (err) {
        console.warn(err);
      }
    }
    localStorage.removeItem('gf_search_history');
  }

  private getFallbackSearchHistory(limit: number): SearchHistoryItem[] {
    try {
      const data = localStorage.getItem('gf_search_history');
      const items: SearchHistoryItem[] = data ? JSON.parse(data) : [];
      return items.slice(0, limit);
    } catch {
      return [];
    }
  }

  private sanitizeStoredIcons(items: CustomIconItem[]): CustomIconItem[] {
    return items
      .map((icon) => {
        const inner = sanitizeSvgInner(icon.svgContent);
        if (!inner) return null;
        return { ...icon, svgContent: inner, viewBox: sanitizeViewBox(icon.viewBox) };
      })
      .filter((icon): icon is CustomIconItem => icon !== null);
  }

  // --- CUSTOM ICONS (PHASE 3) ---
  async getCustomIcons(): Promise<CustomIconItem[]> {
    const db = await this.getDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('custom_icons', 'readonly');
          const store = tx.objectStore('custom_icons');
          const request = store.getAll();
          request.onsuccess = () => resolve(this.sanitizeStoredIcons(request.result || []));
          request.onerror = () => resolve(this.sanitizeStoredIcons(this.getFallbackCustomIcons()));
        } catch {
          resolve(this.sanitizeStoredIcons(this.getFallbackCustomIcons()));
        }
      });
    }
    return this.sanitizeStoredIcons(this.getFallbackCustomIcons());
  }

  async addCustomIcon(icon: CustomIconItem): Promise<void> {
    const safeInner = sanitizeSvgInner(icon.svgContent);
    if (!safeInner) return;
    icon = { ...icon, svgContent: safeInner, viewBox: sanitizeViewBox(icon.viewBox) };
    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction('custom_icons', 'readwrite');
        tx.objectStore('custom_icons').put(icon);
      } catch (err) {
        console.warn(err);
      }
    }
    const list = this.getFallbackCustomIcons().filter(i => i.id !== icon.id);
    list.unshift(icon);
    localStorage.setItem('gf_custom_icons', JSON.stringify(list));
  }

  async bulkAddCustomIcons(icons: CustomIconItem[]): Promise<void> {
    icons = icons
      .map((icon) => {
        const inner = sanitizeSvgInner(icon.svgContent);
        if (!inner) return null;
        return { ...icon, svgContent: inner, viewBox: sanitizeViewBox(icon.viewBox) };
      })
      .filter((icon): icon is CustomIconItem => icon !== null);
    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction('custom_icons', 'readwrite');
        const store = tx.objectStore('custom_icons');
        for (const icon of icons) {
          store.put(icon);
        }
      } catch (err) {
        console.warn(err);
      }
    }
    const current = this.getFallbackCustomIcons();
    const newMap = new Map(current.map(i => [i.id, i]));
    for (const icon of icons) {
      newMap.set(icon.id, icon);
    }
    const updated = Array.from(newMap.values()).sort(
      (a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0)
    );
    localStorage.setItem('gf_custom_icons', JSON.stringify(updated));
  }

  async removeCustomIcon(id: string): Promise<void> {
    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction('custom_icons', 'readwrite');
        tx.objectStore('custom_icons').delete(id);
      } catch (err) {
        console.warn(err);
      }
    }
    const list = this.getFallbackCustomIcons().filter(i => i.id !== id);
    localStorage.setItem('gf_custom_icons', JSON.stringify(list));
  }

  async deleteCustomIconsByCollection(collection: string): Promise<void> {
    const all = await this.getCustomIcons();
    const toDelete = all.filter(i => (i.collection || 'default') === collection);
    for (const item of toDelete) {
      await this.removeCustomIcon(item.id);
    }
  }

  async clearCustomIcons(): Promise<void> {
    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction('custom_icons', 'readwrite');
        tx.objectStore('custom_icons').clear();
      } catch (err) {
        console.warn(err);
      }
    }
    localStorage.removeItem('gf_custom_icons');
  }

  private getFallbackCustomIcons(): CustomIconItem[] {
    try {
      const data = localStorage.getItem('gf_custom_icons');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // --- SETTINGS ---
  async getSettings(): Promise<UserSettings | null> {
    try {
      const data = localStorage.getItem('gf_settings');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    localStorage.setItem('gf_settings', JSON.stringify(settings));
    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction('settings', 'readwrite');
        tx.objectStore('settings').put({ key: 'user_settings', ...settings });
      } catch (err) {
        console.warn(err);
      }
    }
  }

  // --- EXPORT & SYNC ---
  async exportAllData(): Promise<SyncData> {
    const favorites = await this.getFavorites();
    const copyHistory = await this.getCopyHistory(100);
    const customIcons = await this.getCustomIcons();
    const settings = (await this.getSettings()) || {
      theme: 'dark',
      defaultCopyFormat: 'char',
      gridDensity: 'normal',
      soundFeedback: false,
      autoAddToScratchpad: false,
      activeFontFamily: 'sans',
    };

    return {
      version: '1.3.0',
      exportedAt: new Date().toISOString(),
      favorites,
      copyHistory,
      customIcons,
      settings,
    };
  }

  async importAllData(data: SyncData): Promise<void> {
    const safe = parseBackupPayload(data);

    for (const fav of safe.favorites) {
      await this.addFavorite(fav);
    }

    for (const item of safe.copyHistory) {
      await this.recordCopy(item);
    }

    if (safe.customIcons) {
      await this.bulkAddCustomIcons(safe.customIcons);
    }

    if (safe.settings) {
      await this.saveSettings(safe.settings);
    }
  }

  async clearAllData(): Promise<void> {
    await this.clearCopyHistory();
    await this.clearSearchHistory();
    localStorage.removeItem('gf_favorites');
    localStorage.removeItem('gf_custom_icons');
    const db = await this.getDB();
    if (db) {
      try {
        const tx = db.transaction(['favorites', 'copy_history', 'search_history', 'custom_icons'], 'readwrite');
        tx.objectStore('favorites').clear();
        tx.objectStore('copy_history').clear();
        tx.objectStore('search_history').clear();
        if (db.objectStoreNames.contains('custom_icons')) {
          tx.objectStore('custom_icons').clear();
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }
}

export const localDB = new LocalDatabase();
