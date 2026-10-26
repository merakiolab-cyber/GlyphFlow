import React, { useState } from 'react';
import { Copy, Trash2, Check, Download } from 'lucide-react';

interface ScratchpadProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  onOpenExport: (text: string) => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({
  value,
  onChange,
  onClear,
  onOpenExport,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const charCount = Array.from(value).length;
  const byteCount = new TextEncoder().encode(value).length;

  return (
    <div className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-zinc-300">
          Textová schránka pro skládání znaků
        </h3>

        <div className="flex items-center gap-2 text-xs font-mono-nums text-zinc-500">
          <span>{charCount} znaků</span>
          <span>·</span>
          <span>{byteCount} B</span>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Kliknutím na znaky v mřížce nebo tlačítko '+' sem přidáte symboly k hromadnému zkopírování..."
          rows={2}
          className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 font-sans text-sm focus:border-zinc-600 focus:outline-none resize-none transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onClear}
          disabled={!value}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-rose-400 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Vymazat</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenExport(value)}
            disabled={!value}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Exportovat jako SVG / PNG"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export grafiky</span>
          </button>

          <button
            onClick={handleCopyAll}
            disabled={!value}
            className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Zkopírováno!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopírovat vše</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
