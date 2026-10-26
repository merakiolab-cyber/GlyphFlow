import { useCallback, useEffect, useState } from 'react';
import { localDB } from '../db/indexedDb';
import { FavoriteItem, Glyph } from '../types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteChars, setFavoriteChars] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const items = await localDB.getFavorites();
      setFavorites(items);
      setFavoriteChars(new Set(items.map((i) => i.char)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(
    async (glyph: Glyph) => {
      const isFav = favoriteChars.has(glyph.char);
      if (isFav) {
        await localDB.removeFavorite(glyph.char);
        setFavoriteChars((prev) => {
          const next = new Set(prev);
          next.delete(glyph.char);
          return next;
        });
        setFavorites((prev) => prev.filter((f) => f.char !== glyph.char));
      } else {
        const item: FavoriteItem = {
          char: glyph.char,
          hex: glyph.hex,
          addedAt: Date.now(),
          tags: [glyph.category],
        };
        await localDB.addFavorite(item);
        setFavoriteChars((prev) => new Set(prev).add(glyph.char));
        setFavorites((prev) => [item, ...prev.filter((f) => f.char !== glyph.char)]);
      }
    },
    [favoriteChars]
  );

  const isFavorite = useCallback(
    (char: string) => favoriteChars.has(char),
    [favoriteChars]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    reloadFavorites: loadFavorites,
    isLoading,
  };
}
