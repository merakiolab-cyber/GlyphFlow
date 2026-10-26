import { useCallback, useEffect, useState } from 'react';
import { localDB } from '../db/indexedDb';
import { CopyHistoryItem, Glyph, SearchHistoryItem } from '../types';

export function useHistory() {
  const [copyHistory, setCopyHistory] = useState<CopyHistoryItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [copies, searches] = await Promise.all([
        localDB.getCopyHistory(50),
        localDB.getSearchHistory(15),
      ]);
      setCopyHistory(copies);
      setSearchHistory(searches);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recordCopy = useCallback(async (glyph: Glyph) => {
    await localDB.recordCopy({
      char: glyph.char,
      hex: glyph.hex,
      name: glyph.name,
      czechName: glyph.czechName,
    });
    const updated = await localDB.getCopyHistory(50);
    setCopyHistory(updated);
  }, []);

  const recordSearch = useCallback(async (query: string, resultsCount: number) => {
    if (!query.trim()) return;
    await localDB.recordSearch(query, resultsCount);
    const updated = await localDB.getSearchHistory(15);
    setSearchHistory(updated);
  }, []);

  const clearCopyHistory = useCallback(async () => {
    await localDB.clearCopyHistory();
    setCopyHistory([]);
  }, []);

  const clearSearchHistory = useCallback(async () => {
    await localDB.clearSearchHistory();
    setSearchHistory([]);
  }, []);

  return {
    copyHistory,
    searchHistory,
    recordCopy,
    recordSearch,
    clearCopyHistory,
    clearSearchHistory,
    reloadHistory: loadData,
    isLoading,
  };
}
