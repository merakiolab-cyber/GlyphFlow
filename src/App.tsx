import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { GlyphGrid } from './components/GlyphGrid';
import { GlyphDetailModal } from './components/GlyphDetailModal';
import { ExportModal } from './components/ExportModal';
import { Scratchpad } from './components/Scratchpad';
import { FavoritesView } from './components/FavoritesView';
import { HistoryView } from './components/HistoryDrawer';
import { SyncView } from './components/SyncModal';
import { IconsLibraryView } from './components/IconsLibraryView';
import { TypographyStudioView } from './components/TypographyStudioView';
import { useUnicodeData } from './hooks/useUnicodeData';
import { useFavorites } from './hooks/useFavorites';
import { useHistory } from './hooks/useHistory';
import { Glyph } from './types';
import { localDB } from './db/indexedDb';
import { parseSyncQueryParam } from './utils/safePayload';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('gf_theme') as 'dark' | 'light') || 'dark';
  });

  const [activeView, setActiveView] = useState<
    'catalog' | 'icons' | 'typography' | 'favorites' | 'history' | 'scratchpad' | 'sync'
  >('catalog');

  const [gridDensity, setGridDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [scratchpadText, setScratchpadText] = useState<string>(() => {
    return localStorage.getItem('gf_scratchpad') || '';
  });

  // Modals state
  const [inspectedGlyph, setInspectedGlyph] = useState<Glyph | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportTargetGlyph, setExportTargetGlyph] = useState<Glyph | null>(null);
  const [exportCustomText, setExportCustomText] = useState<string>('');

  // Hooks
  const {
    allGlyphs,
    filteredGlyphs,
    categoryCounts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    categories,
  } = useUnicodeData();

  const {
    favorites,
    isFavorite,
    toggleFavorite,
    reloadFavorites,
  } = useFavorites();

  const {
    copyHistory,
    searchHistory,
    recordCopy,
    recordSearch,
    clearCopyHistory,
    clearSearchHistory,
  } = useHistory();

  // Handle Theme switching & html class
  useEffect(() => {
    localStorage.setItem('gf_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.className = 'bg-[#121214] text-zinc-100 antialiased selection:bg-zinc-700 selection:text-white';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.className = 'bg-[#FAFAFA] text-zinc-900 antialiased selection:bg-zinc-200 selection:text-zinc-900';
    }
  }, [theme]);

  // Persist Scratchpad
  useEffect(() => {
    localStorage.setItem('gf_scratchpad', scratchpadText);
  }, [scratchpadText]);

  // Check URL sync parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const syncParam = params.get('sync');
    if (syncParam) {
      const chars = parseSyncQueryParam(syncParam);
      if (chars) {
        const glyphMap = new Map(allGlyphs.map((g) => [g.char, g]));
        void (async () => {
          for (const char of chars) {
            const glyph = glyphMap.get(char);
            if (!glyph) continue;
            await localDB.addFavorite({
              char: glyph.char,
              hex: glyph.hex,
              addedAt: Date.now(),
              tags: [glyph.category],
            });
          }
          reloadFavorites();
        })();
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [allGlyphs, reloadFavorites]);

  // Debounce search history recording
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!searchQuery.trim()) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      recordSearch(searchQuery, filteredGlyphs.length);
    }, 1200);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, filteredGlyphs.length, recordSearch]);

  // Copy handler
  const handleCopyGlyph = useCallback(
    async (glyph: Glyph, textToCopy?: string) => {
      const text = textToCopy || glyph.char;
      await navigator.clipboard.writeText(text);
      await recordCopy(glyph);
    },
    [recordCopy]
  );

  const handleCopyCharDirect = useCallback(
    async (char: string) => {
      await navigator.clipboard.writeText(char);
      const matched = allGlyphs.find((g) => g.char === char);
      if (matched) {
        await recordCopy(matched);
      }
    },
    [allGlyphs, recordCopy]
  );

  // Scratchpad actions
  const handleAddToScratchpad = useCallback((char: string) => {
    setScratchpadText((prev) => prev + char);
  }, []);

  const handleClearScratchpad = useCallback(() => {
    setScratchpadText('');
  }, []);

  // Export Modal Triggers
  const handleOpenExportWithGlyph = useCallback((glyph: Glyph) => {
    setExportTargetGlyph(glyph);
    setExportCustomText(glyph.char);
    setIsExportOpen(true);
  }, []);

  const handleOpenExportWithText = useCallback((text: string) => {
    setExportTargetGlyph(null);
    setExportCustomText(text || 'Ω');
    setIsExportOpen(true);
  }, []);

  const favoriteChars = new Set(favorites.map((f) => f.char));

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#121214]' : 'bg-[#FAFAFA]'}`}>
      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        favoritesCount={favorites.length}
        scratchpadCount={Array.from(scratchpadText).length}
        theme={theme}
        setTheme={setTheme}
        onOpenExportStudio={() => handleOpenExportWithText(scratchpadText || 'Ω')}
      />

      {/* Full-Screen Responsive Workspace */}
      <div className="flex-1 w-full overflow-hidden flex flex-col md:flex-row">
        {/* VIEW 1: CATALOG (Full screen responsive split) */}
        {activeView === 'catalog' && (
          <>
            <aside className="w-full md:w-60 lg:w-64 bg-zinc-950/40 md:border-r border-b md:border-b-0 border-zinc-800/80 p-3 sm:p-4 overflow-y-auto shrink-0 max-h-48 md:max-h-none">
              <CategoryNav
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(catId) => {
                  if (catId === 'favorites') {
                    setActiveView('favorites');
                  } else {
                    setSelectedCategory(catId);
                  }
                }}
                categoryCounts={categoryCounts}
                favoritesCount={favorites.length}
              />
            </aside>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
              <div className="w-full max-w-4xl">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  resultsCount={filteredGlyphs.length}
                  totalCount={allGlyphs.length}
                  recentSearches={searchHistory}
                  onSelectRecentSearch={(q) => setSearchQuery(q)}
                  onClearRecentSearches={clearSearchHistory}
                />
              </div>

              <div className="w-full max-w-4xl">
                <Scratchpad
                  value={scratchpadText}
                  onChange={setScratchpadText}
                  onClear={handleClearScratchpad}
                  onOpenExport={handleOpenExportWithText}
                />
              </div>

              <div className="w-full">
                <GlyphGrid
                  glyphs={filteredGlyphs}
                  favoriteChars={favoriteChars}
                  onToggleFavorite={toggleFavorite}
                  onCopy={handleCopyGlyph}
                  onInspect={setInspectedGlyph}
                  onAddToScratchpad={handleAddToScratchpad}
                  onExport={handleOpenExportWithGlyph}
                  density={gridDensity}
                  setDensity={setGridDensity}
                  searchQuery={searchQuery}
                  onResetSearch={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                />
              </div>
            </main>
          </>
        )}

        {/* VIEW 2: ICONS LIBRARY (1000+ Icons Generator) */}
        {activeView === 'icons' && (
          <IconsLibraryView />
        )}

        {/* VIEW 3: TYPOGRAPHY & OPENTYPE STUDIO (Phase 3) */}
        {activeView === 'typography' && (
          <TypographyStudioView />
        )}

        {/* VIEW 4: FAVORITES */}
        {activeView === 'favorites' && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <FavoritesView
              favorites={favorites}
              allGlyphs={allGlyphs}
              onToggleFavorite={toggleFavorite}
              onCopy={handleCopyGlyph}
              onInspect={setInspectedGlyph}
              onAddToScratchpad={handleAddToScratchpad}
              onExport={handleOpenExportWithGlyph}
              onBackToCatalog={() => setActiveView('catalog')}
            />
          </main>
        )}

        {/* VIEW 4: SCRATCHPAD EXPANDED */}
        {activeView === 'scratchpad' && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
            <Scratchpad
              value={scratchpadText}
              onChange={setScratchpadText}
              onClear={handleClearScratchpad}
              onOpenExport={handleOpenExportWithText}
            />

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-medium text-zinc-300">
                Rychlý výběr běžných znaků a emojis
              </h3>
              <div className="flex flex-wrap gap-2 text-xl font-normal">
                {['😀', '😂', '😎', '😍', '🤔', '👍', '👎', '👏', '🙏', '🔥', '⭐', '💯', '💡', '📌', '🎯', '₿', '€', '$', '±', '≠', '≈', '∞', '√', '∑', '∫', '←', '→', '„', '“', '”', '—', '©', '®', '™', '§', '⌘', '⌥'].map((c) => (
                  <button
                    key={c}
                    onClick={() => handleAddToScratchpad(c)}
                    className="w-10 h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-100 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                    title={`Přidat ${c}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* VIEW 5: HISTORY */}
        {activeView === 'history' && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <HistoryView
              copyHistory={copyHistory}
              searchHistory={searchHistory}
              onClearCopyHistory={clearCopyHistory}
              onClearSearchHistory={clearSearchHistory}
              onApplySearch={(q) => {
                setSearchQuery(q);
                setActiveView('catalog');
              }}
              onCopyChar={handleCopyCharDirect}
              onBackToCatalog={() => setActiveView('catalog')}
            />
          </main>
        )}

        {/* VIEW 6: SYNC & BACKUP */}
        {activeView === 'sync' && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
            <SyncView
              onBackToCatalog={() => setActiveView('catalog')}
              onDataRestored={reloadFavorites}
            />
          </main>
        )}
      </div>

      {/* MODAL: Character Detail */}
      {inspectedGlyph && (
        <GlyphDetailModal
          glyph={inspectedGlyph}
          onClose={() => setInspectedGlyph(null)}
          isFavorite={favoriteChars.has(inspectedGlyph.char)}
          onToggleFavorite={toggleFavorite}
          onCopy={handleCopyGlyph}
          onAddToScratchpad={handleAddToScratchpad}
          onOpenExport={handleOpenExportWithGlyph}
        />
      )}

      {/* MODAL: Export Studio */}
      {isExportOpen && (
        <ExportModal
          initialGlyph={exportTargetGlyph}
          initialText={exportCustomText}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
