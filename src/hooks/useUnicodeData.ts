import { useMemo, useState } from 'react';
import { RAW_CHARACTERS } from '../data/characters';
import { CATEGORIES } from '../data/categories';
import { Glyph } from '../types';
import { normalizeSearchString } from '../utils/unicodeUtils';

export function useUnicodeData() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pre-normalize all character search terms for instant sub-millisecond filtering
  const indexedCharacters = useMemo(() => {
    return RAW_CHARACTERS.map((glyph) => {
      const normalizedCzech = normalizeSearchString(glyph.czechName);
      const normalizedName = normalizeSearchString(glyph.name);
      const normalizedHex = glyph.hex.toLowerCase();
      const normalizedChar = glyph.char.toLowerCase();
      const normalizedTags = glyph.tags.map((t) => normalizeSearchString(t)).join(' ');

      return {
        glyph,
        searchIndex: `${normalizedChar} ${normalizedHex} ${normalizedCzech} ${normalizedName} ${normalizedTags} ${glyph.dec}`,
      };
    });
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: RAW_CHARACTERS.length,
    };

    RAW_CHARACTERS.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });

    return counts;
  }, []);

  // Filtered glyphs
  const filteredGlyphs = useMemo(() => {
    const query = normalizeSearchString(searchQuery);

    return indexedCharacters
      .filter(({ glyph, searchIndex }) => {
        // Category match
        if (selectedCategory !== 'all' && selectedCategory !== 'favorites') {
          if (glyph.category !== selectedCategory) {
            return false;
          }
        }

        // Search query match
        if (query) {
          // Direct character match
          if (glyph.char === searchQuery) return true;

          // Unicode hex match (e.g. "U+03B4" or "03b4")
          const cleanQuery = query.replace('u+', '');
          if (glyph.hex.toLowerCase().includes(cleanQuery)) return true;

          // Full text search index match
          return searchIndex.includes(query);
        }

        return true;
      })
      .map(({ glyph }) => glyph);
  }, [indexedCharacters, selectedCategory, searchQuery]);

  return {
    allGlyphs: RAW_CHARACTERS,
    filteredGlyphs,
    categoryCounts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    categories: CATEGORIES,
  };
}
