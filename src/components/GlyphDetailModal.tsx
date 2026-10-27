import React, { useState } from 'react';
import { X, Copy, Check, Star, Download, Plus } from 'lucide-react';
import { Glyph } from '../types';

interface GlyphDetailModalProps {
  glyph: Glyph | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (glyph: Glyph) => void;
  onCopy: (glyph: Glyph, textToCopy?: string) => void;
  onAddToScratchpad: (char: string) => void;
  onOpenExport: (glyph: Glyph) => void;
}

export const GlyphDetailModal: React.FC<GlyphDetailModalProps> = ({
  glyph,
  onClose,
  isFavorite,
  onToggleFavorite,
  onCopy,
  onAddToScratchpad,
  onOpenExport,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!glyph) return null;

  const copyField = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    onCopy(glyph, value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  const encodingRows = [
    { key: 'char', label: 'Znak', value: glyph.char },
    { key: 'hex', label: 'Unicode Code Point', value: glyph.hex },
    { key: 'dec', label: 'Desítkový kód (Dec)', value: String(glyph.dec) },
    ...(glyph.htmlEntity ? [{ key: 'htmlEntity', label: 'HTML entita (Named)', value: glyph.htmlEntity }] : []),
    { key: 'htmlNumeric', label: 'HTML numerický (Dec)', value: glyph.htmlNumeric },
    { key: 'htmlHex', label: 'HTML hexadecimální', value: glyph.htmlHex },
    { key: 'css', label: 'CSS Escape kód', value: glyph.css },
    { key: 'js', label: 'JavaScript escape', value: glyph.js },
    { key: 'utf8Bytes', label: 'UTF-8 bajty v hexu', value: glyph.utf8Bytes },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-nums px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
              {glyph.hex}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Detail znaku
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(glyph)}
              className={`p-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors cursor-pointer ${
                isFavorite ? 'text-amber-500' : 'text-zinc-400 hover:text-amber-500'
              }`}
              title={isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Zavřít (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Main Visual Display */}
          <div className="flex items-center gap-5 p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-20 h-20 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-5xl font-normal text-zinc-900 dark:text-zinc-100 shrink-0 select-all shadow-xs">
              {glyph.char}
            </div>

            <div className="space-y-2 min-w-0">
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white truncate">
                  {glyph.czechName}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {glyph.name}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => copyField('primary', glyph.char)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:text-zinc-950 dark:bg-zinc-100 dark:hover:bg-white rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {copiedKey === 'primary' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Zkopírováno!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Kopírovat</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onAddToScratchpad(glyph.char)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 rounded-lg transition-colors cursor-pointer shadow-xs dark:shadow-none"
                >
                  <Plus className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                  <span>Do schránky</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenExport(glyph);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 rounded-lg transition-colors cursor-pointer shadow-xs dark:shadow-none"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Encodings Table */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Formáty kódování
            </h4>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/40 shadow-xs dark:shadow-none">
              {encodingRows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group"
                >
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {row.label}
                  </span>

                  <div className="flex items-center gap-2">
                    <code className="font-mono-nums text-zinc-900 dark:text-zinc-200 text-xs bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                      {row.value}
                    </code>

                    <button
                      onClick={() => copyField(row.key, row.value)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      title={`Kopírovat ${row.label}`}
                    >
                      {copiedKey === row.key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
