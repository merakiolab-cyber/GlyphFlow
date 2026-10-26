import React from 'react';
import { SearchX, LayoutGrid, Grid3X3, Grid2X2 } from 'lucide-react';
import { Glyph } from '../types';
import { GlyphCard } from './GlyphCard';

interface GlyphGridProps {
  glyphs: Glyph[];
  favoriteChars: Set<string>;
  onToggleFavorite: (glyph: Glyph) => void;
  onCopy: (glyph: Glyph, textToCopy?: string) => void;
  onInspect: (glyph: Glyph) => void;
  onAddToScratchpad: (char: string) => void;
  onExport: (glyph: Glyph) => void;
  density: 'compact' | 'normal' | 'spacious';
  setDensity: (density: 'compact' | 'normal' | 'spacious') => void;
  searchQuery: string;
  onResetSearch: () => void;
}

export const GlyphGrid: React.FC<GlyphGridProps> = ({
  glyphs,
  favoriteChars,
  onToggleFavorite,
  onCopy,
  onInspect,
  onAddToScratchpad,
  onExport,
  density,
  setDensity,
  searchQuery,
  onResetSearch,
}) => {
  const gridClasses =
    density === 'compact'
      ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2'
      : density === 'spacious'
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3';

  return (
    <div className="w-full">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-zinc-800/80">
        <div className="text-xs text-zinc-400 font-mono-nums">
          <span className="font-semibold text-zinc-200">{glyphs.length}</span> znaků
          {searchQuery && (
            <span className="text-zinc-500 ml-1.5">
              pro dotaz &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setDensity('compact')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              density === 'compact'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Kompaktní mřížka"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDensity('normal')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              density === 'normal'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Standardní mřížka"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDensity('spacious')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              density === 'spacious'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Vzdušné velké karty"
          >
            <Grid2X2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {glyphs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
            <SearchX className="w-5 h-5 text-zinc-400" />
          </div>
          <h3 className="text-sm font-medium text-zinc-200 mb-1">
            Nebyly nalezeny žádné znaky
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            Zkuste hledat podle kódu, českého názvu nebo zvolte jinou kategorii.
          </p>
          <button
            onClick={onResetSearch}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-950 bg-zinc-200 hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            Zobrazit všechny znaky
          </button>
        </div>
      ) : (
        <div className={`grid ${gridClasses}`}>
          {glyphs.map((glyph, idx) => (
            <GlyphCard
              key={`${glyph.char}-${glyph.hex}-${glyph.category}-${idx}`}
              glyph={glyph}
              isFavorite={favoriteChars.has(glyph.char)}
              onToggleFavorite={onToggleFavorite}
              onCopy={onCopy}
              onInspect={onInspect}
              onAddToScratchpad={onAddToScratchpad}
              onExport={onExport}
              density={density}
            />
          ))}
        </div>
      )}
    </div>
  );
};
