import React, { useState } from 'react';
import { X, Download, Copy, Check, Image as ImageIcon, Code2 } from 'lucide-react';
import { ExportOptions, Glyph } from '../types';
import { fontFamiliesList } from '../design-system/tokens';
import { downloadPng, downloadSvg, copySvgToClipboard } from '../utils/exportUtils';

interface ExportModalProps {
  initialGlyph?: Glyph | null;
  initialText?: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  initialGlyph,
  initialText,
  onClose,
}) => {
  const [text, setText] = useState<string>(
    initialText || (initialGlyph ? initialGlyph.char : 'Ω')
  );
  const [format, setFormat] = useState<'svg' | 'png'>('svg');
  const [fontSize, setFontSize] = useState<number>(128);
  const [fontFamily, setFontFamily] = useState<string>(
    "'Plus Jakarta Sans', system-ui, sans-serif"
  );
  const [fontWeight, setFontWeight] = useState<string>('500');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [bgColor, setBgColor] = useState<string>('#121214');
  const [isTransparent, setIsTransparent] = useState<boolean>(true);
  const [resolution, setResolution] = useState<number>(512);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const exportOptions: ExportOptions = {
    format,
    fontSize,
    fontFamily,
    fontWeight,
    textColor,
    bgColor,
    isTransparent,
    padding: 32,
    width: 512,
    height: 512,
    resolution,
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const safeFilename = `glyph_${encodeURIComponent(text.slice(0, 10))}`;
      if (format === 'svg') {
        downloadSvg(text, exportOptions, safeFilename);
      } else {
        await downloadPng(text, exportOptions, safeFilename);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopySvg = async () => {
    const ok = await copySvgToClipboard(text, exportOptions);
    if (ok) {
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 1400);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Export grafiky (SVG & PNG)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 self-start">
              Živý náhled
            </span>

            <div
              className="w-full aspect-square max-w-[280px] rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 overflow-hidden relative shadow-xs"
              style={{
                backgroundColor: isTransparent ? 'transparent' : bgColor,
                backgroundImage: isTransparent
                  ? 'radial-gradient(circle, rgba(120,120,120,0.2) 1px, transparent 1px)'
                  : 'none',
                backgroundSize: '16px 16px',
              }}
            >
              <span
                style={{
                  fontFamily,
                  fontSize: `${fontSize * 0.55}px`,
                  fontWeight,
                  color: textColor,
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {text || ' '}
              </span>

              {isTransparent && (
                <span className="absolute bottom-2 left-2 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono-nums bg-white/90 dark:bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                  Průhledné
                </span>
              )}
            </div>

            <div className="text-[11px] font-mono-nums text-zinc-500 text-center">
              {format === 'png' ? `${resolution} × ${resolution} px` : 'Vektorové SVG'}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">
                Znak k exportu
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full py-1.5 px-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white font-mono-nums text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">
                Formát
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormat('svg')}
                  className={`py-1.5 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    format === 'svg'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-transparent'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Vektorové SVG</span>
                </button>
                <button
                  onClick={() => setFormat('png')}
                  className={`py-1.5 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    format === 'png'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-transparent'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Rastrové PNG</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">
                Písmo
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full py-1.5 px-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {fontFamiliesList.map((f) => (
                  <option key={f.id} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1 flex justify-between">
                  <span>Velikost</span>
                  <span className="font-mono-nums text-zinc-900 dark:text-zinc-300 font-medium">{fontSize}px</span>
                </label>
                <input
                  type="range"
                  min="48"
                  max="256"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-cyan-500 dark:accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">
                  Řez písma
                </label>
                <select
                  value={fontWeight}
                  onChange={(e) => setFontWeight(e.target.value)}
                  className="w-full py-1.5 px-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none"
                >
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="700">Bold (700)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">
                  Barva znaku
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full py-1 px-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded text-zinc-900 dark:text-white font-mono-nums uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">
                  Pozadí
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  <label className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTransparent}
                      onChange={(e) => setIsTransparent(e.target.checked)}
                      className="accent-cyan-500 rounded cursor-pointer"
                    />
                    <span>Průhledné</span>
                  </label>
                  {!isTransparent && (
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-800 bg-transparent cursor-pointer ml-auto"
                    />
                  )}
                </div>
              </div>
            </div>

            {format === 'png' && (
              <div>
                <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">
                  Rozlišení PNG
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[128, 256, 512, 1024].map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`py-1 rounded text-center font-mono-nums transition-colors cursor-pointer ${
                        resolution === res
                          ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white font-medium border border-zinc-900 dark:border-zinc-700 shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-transparent'
                      }`}
                    >
                      {res}px
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <div>
            {format === 'svg' && (
              <button
                onClick={handleCopySvg}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-300 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-transparent rounded-lg transition-colors cursor-pointer shadow-xs dark:shadow-none"
              >
                {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSvg ? 'SVG kód zkopírován!' : 'Kopírovat SVG kód'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Zavřít
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:text-zinc-950 dark:bg-zinc-100 dark:hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generuji...' : `Stáhnout ${format.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
