import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Layers,
  Code2,
  FileCode,
  Zap,
  FolderArchive,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { IconItem, IconStyle } from '../types';
import {
  formatSvgForFigma,
  generateFigmaBatchBoard,
  generateFigmaPluginBundle,
  generateFigmaTokensJson,
  IconExportConfig,
} from '../utils/figmaBridge';

interface FigmaBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  allIcons: IconItem[];
  selectedIcons: IconItem[];
}

export const FigmaBridgeModal: React.FC<FigmaBridgeModalProps> = ({
  isOpen,
  onClose,
  allIcons,
  selectedIcons,
}) => {
  const [activeTab, setActiveTab] = useState<'clipboard' | 'plugin' | 'batch' | 'tokens'>('clipboard');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isDownloadingPlugin, setIsDownloadingPlugin] = useState(false);

  if (!isOpen) return null;

  const sampleIcon: IconItem = allIcons[0] || {
    id: 'sparkles',
    name: 'Sparkles',
    czechName: 'Jiskry / AI',
    category: 'web-ui',
    tags: ['ai', 'magic', 'star'],
    svgPath: 'm12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z',
  };

  const defaultConfig: IconExportConfig = {
    style: 'outline',
    strokeWidth: 2,
    color: '#00F2FE',
    size: 24,
  };

  const handleCopySample = async () => {
    const figmaSvg = formatSvgForFigma(sampleIcon, defaultConfig);
    await navigator.clipboard.writeText(figmaSvg);
    setCopiedType('sample');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyBatch = async () => {
    const iconsToBatch = selectedIcons.length > 0 ? selectedIcons : allIcons.slice(0, 20);
    const batchSvg = generateFigmaBatchBoard(iconsToBatch, defaultConfig, 5);
    await navigator.clipboard.writeText(batchSvg);
    setCopiedType('batch');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyTokens = async () => {
    const iconsToExport = selectedIcons.length > 0 ? selectedIcons : allIcons.slice(0, 30);
    const tokensJson = generateFigmaTokensJson(iconsToExport, defaultConfig);
    await navigator.clipboard.writeText(tokensJson);
    setCopiedType('tokens');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadPlugin = async () => {
    setIsDownloadingPlugin(true);
    try {
      await generateFigmaPluginBundle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloadingPlugin(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Figma Plugin Bridge
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
                  v1.3 Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Přímé propojení s desktopovou aplikací Figma pro vkládání vektorů 1 kliknutím
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-950 px-6 gap-2 shrink-0 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('clipboard')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'clipboard'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Nativní schránka (Ctrl+V)</span>
          </button>
          <button
            onClick={() => setActiveTab('plugin')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'plugin'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Figma Desktop Plugin (.zip)</span>
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'batch'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Design System Board</span>
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tokens'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Tokens Studio (JSON)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: CLIPBOARD BRIDGE */}
          {activeTab === 'clipboard' && (
            <div className="space-y-5">
              <div className="bg-cyan-950/20 border border-cyan-800/40 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-zinc-300 leading-relaxed">
                  <p className="font-semibold text-cyan-300">
                    Bleskové vkládání bez nutnosti instalace
                  </p>
                  <p>
                    Kód každé ikony v GlyphFlow je optimalizován speciálně pro Figma parser. Po kliknutí
                    na <strong>Kopírovat pro Figmu</strong> stačí přejít do Figmy a stisknout{' '}
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-cyan-300 font-mono">
                      Ctrl + V
                    </kbd>{' '}
                    nebo{' '}
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-cyan-300 font-mono">
                      Cmd + V
                    </kbd>
                    . Ikona se ihned vloží jako čistý vektorový Frame s pojmenovanými vrstvami!
                  </p>
                </div>
              </div>

              {/* Interactive Tester */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Otestovat přenos do Figmy
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Ikona: {sampleIcon.name}</div>
                      <div className="text-xs text-zinc-500">Formátováno pro Figma vector engine</div>
                    </div>
                  </div>

                  <button
                    onClick={handleCopySample}
                    className="w-full sm:w-auto px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950"
                  >
                    {copiedType === 'sample' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Zkopírováno! Nyní stiskněte Ctrl+V ve Figmě</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Zkopírovat do Figmy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-zinc-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Automaticky zachovává Auto-Layout a proporce 24x24 px</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vytváří samostatné vektorové uzly bez zbytečných obalových skupin</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FIGMA DESKTOP PLUGIN */}
          {activeTab === 'plugin' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    GlyphFlow Desktop Plugin pro Figma
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Oficiální lokální plugin pro Figma Desktop využívající Figma Plugin API.
                  </p>
                </div>
                <button
                  onClick={handleDownloadPlugin}
                  disabled={isDownloadingPlugin}
                  className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingPlugin ? 'Generuji ZIP...' : 'Stáhnout Plugin (.zip)'}</span>
                </button>
              </div>

              {/* Installation Guide */}
              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Jednoduchá instalace (30 sekund):
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-300">
                  <li>
                    Stáhněte a rozbalte balíček{' '}
                    <code className="text-cyan-300 font-mono">glyphflow-figma-plugin.zip</code> do libovolné složky.
                  </li>
                  <li>
                    Otevřete aplikaci <strong>Figma Desktop</strong>.
                  </li>
                  <li>
                    V horním menu vyberte:{' '}
                    <span className="text-zinc-200 font-medium">Plugins</span> &rarr;{' '}
                    <span className="text-zinc-200 font-medium">Development</span> &rarr;{' '}
                    <span className="text-cyan-300 font-medium">Import plugin from manifest...</span>
                  </li>
                  <li>
                    Zvolte soubor <code className="text-cyan-300 font-mono">manifest.json</code> z rozbaleného balíčku.
                  </li>
                  <li>
                    Hotovo! Plugin se objeví ve vašich Pluginech a vloží ikony přímo na plátno bez omezení schránky.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: BATCH COMPONENT BOARD */}
          {activeTab === 'batch' && (
            <div className="space-y-5">
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Generátor Design System Boardu
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Vytvoří jediný uspořádaný Frame s mřížkou ikon, popisky a podkladem, který můžete vložit přímo do svého Figma Design Systemu.
                  </p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-between gap-4">
                  <div className="text-xs text-zinc-300">
                    <span className="font-semibold text-white">
                      {selectedIcons.length > 0 ? selectedIcons.length : 20} ikon
                    </span>{' '}
                    bude vygenerováno do elegantního Figma Artboardu.
                  </div>
                  <button
                    onClick={handleCopyBatch}
                    className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    {copiedType === 'batch' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Zkopírováno pro Figmu!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Kopírovat celý Board pro Figmu</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TOKENS STUDIO */}
          {activeTab === 'tokens' && (
            <div className="space-y-5">
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Figma Tokens / Tokens Studio Export
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Exportuje definice ikon ve formátu pro populární Figma plugin Tokens Studio (Figma Tokens) nebo nativní Figma Variables.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleCopyTokens}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {copiedType === 'tokens' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>JSON zkopírován</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopírovat Tokens JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-400 max-h-40 overflow-y-auto">
                  <pre>
                    {generateFigmaTokensJson(
                      selectedIcons.length > 0 ? selectedIcons.slice(0, 5) : allIcons.slice(0, 5),
                      defaultConfig
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Figma Bridge připraven pro vkládání</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
