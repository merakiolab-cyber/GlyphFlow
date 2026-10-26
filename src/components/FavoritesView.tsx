import React from 'react';
import { Star, ArrowLeft } from 'lucide-react';
import { FavoriteItem, Glyph } from '../types';
import { GlyphCard } from './GlyphCard';

interface FavoritesViewProps {
  favorites: FavoriteItem[];
  allGlyphs: Glyph[];
  onToggleFavorite: (glyph: Glyph) => void;
  onCopy: (glyph: Glyph, textToCopy?: string) => void;
  onInspect: (glyph: Glyph) => void;
  onAddToScratchpad: (char: string) => void;
  onExport: (glyph: Glyph) => void;
  onBackToCatalog: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  allGlyphs,
  onToggleFavorite,
  onCopy,
  onInspect,
  onAddToScratchpad,
  onExport,
  onBackToCatalog,
}) => {
  const glyphMap = new Map(allGlyphs.map((g) => [g.char, g]));
  const favoriteGlyphs = favorites
    .map((fav) => glyphMap.get(fav.char))
    .filter((g): g is Glyph => Boolean(g));

  const favoriteChars = new Set(favorites.map((f) => f.char));

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCatalog}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Zpět do katalogu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Oblíbené znaky</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Uložené symboly s offline přístupem
            </p>
          </div>
        </div>

        <div className="text-xs font-mono-nums text-zinc-400 font-medium">
          {favoriteGlyphs.length} znaků
        </div>
      </div>

      {/* Grid or Empty */}
      {favoriteGlyphs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-amber-400 mb-3">
            <Star className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-medium text-zinc-200 mb-1">
            Zatím nemáte žádné oblíbené znaky
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            Klikněte na hvězdičku u kteréhokoliv znaku v katalogu pro jeho uložení sem.
          </p>
          <button
            onClick={onBackToCatalog}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-950 bg-zinc-200 hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            Zpět do katalogu znaků
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
          {favoriteGlyphs.map((glyph, idx) => (
            <GlyphCard
              key={`${glyph.char}-${glyph.hex}-${glyph.category}-${idx}`}
              glyph={glyph}
              isFavorite={favoriteChars.has(glyph.char)}
              onToggleFavorite={onToggleFavorite}
              onCopy={onCopy}
              onInspect={onInspect}
              onAddToScratchpad={onAddToScratchpad}
              onExport={onExport}
              density="normal"
            />
          ))}
        </div>
      )}
    </div>
  );
};
