import React, { useState } from 'react';
import { Star, Check, Info, Plus, Download } from 'lucide-react';
import { Glyph } from '../types';

interface GlyphCardProps {
  glyph: Glyph;
  isFavorite: boolean;
  onToggleFavorite: (glyph: Glyph) => void;
  onCopy: (glyph: Glyph, textToCopy?: string) => void;
  onInspect: (glyph: Glyph) => void;
  onAddToScratchpad: (char: string) => void;
  onExport: (glyph: Glyph) => void;
  density: 'compact' | 'normal' | 'spacious';
}

export const GlyphCard: React.FC<GlyphCardProps> = ({
  glyph,
  isFavorite,
  onToggleFavorite,
  onCopy,
  onInspect,
  onAddToScratchpad,
  onExport,
  density,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(glyph, glyph.char);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const cardPadding =
    density === 'compact' ? 'p-2' : density === 'spacious' ? 'p-4' : 'p-3';

  const charSize =
    density === 'compact'
      ? 'text-2xl sm:text-3xl'
      : density === 'spacious'
      ? 'text-4xl sm:text-5xl'
      : 'text-3xl sm:text-4xl';

  return (
    <div
      onClick={handleCopyClick}
      className={`group relative flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition-colors cursor-pointer select-none ${cardPadding}`}
      title={`Kliknutím zkopírujete znak ${glyph.char} (${glyph.czechName})`}
    >
      {/* Top: Hex Code & Favorite */}
      <div className="flex items-center justify-between gap-1 w-full text-[10px] text-zinc-500 font-mono-nums">
        <span className="font-normal tracking-wide group-hover:text-zinc-300 transition-colors">
          {glyph.hex}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(glyph);
          }}
          className={`p-0.5 rounded transition-colors cursor-pointer ${
            isFavorite
              ? 'text-amber-400'
              : 'text-zinc-600 hover:text-amber-400 opacity-40 group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Center: Character Typography */}
      <div className="my-3 flex items-center justify-center min-h-[58px]">
        <span
          className={`${charSize} font-sans font-normal text-zinc-100 group-hover:text-white group-hover:scale-105 transition-transform duration-100`}
        >
          {glyph.char}
        </span>
      </div>

      {/* Bottom: Title & Subtle Action Icons */}
      <div className="w-full pt-1.5 border-t border-zinc-800/60 flex items-center justify-between gap-1">
        <span
          className="text-[11px] font-normal text-zinc-400 group-hover:text-zinc-200 truncate"
          title={`${glyph.czechName} (${glyph.name})`}
        >
          {glyph.czechName}
        </span>

        <div className="flex items-center gap-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToScratchpad(glyph.char);
            }}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Přidat do textové schránky"
          >
            <Plus className="w-3 h-3" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspect(glyph);
            }}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Detail kódů a encodings"
          >
            <Info className="w-3 h-3" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport(glyph);
            }}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Exportovat SVG / PNG"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Micro Toast Feedback */}
      {copied && (
        <div className="absolute inset-0 bg-zinc-900/95 border border-zinc-600 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-100 backdrop-blur-sm animate-in fade-in duration-75">
          <Check className="w-3.5 h-3.5 text-zinc-200" />
          <span>Zkopírováno</span>
        </div>
      )}
    </div>
  );
};
