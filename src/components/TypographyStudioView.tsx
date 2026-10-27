import React, { useState, useMemo, useRef } from 'react';
import {
  Type,
  Sparkles,
  Sliders,
  Copy,
  Check,
  RotateCcw,
  Eye,
  Columns,
  Code2,
  Info,
  Maximize2,
  SlidersHorizontal,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { OpenTypeFeatureConfig, TypographyMetrics } from '../types';
import { getUtf8Bytes, formatUnicodeHex } from '../utils/unicodeUtils';

const DEFAULT_OPENTYPE_FEATURES: OpenTypeFeatureConfig[] = [
  // Ligatures
  {
    tag: 'liga',
    name: 'Standardní ligatury',
    description: 'Sloučení sousedních znaků (fi, fl, ff, ffi, ffl) pro čistší sazbu bez kolizí.',
    category: 'ligatures',
    enabled: true,
    sampleText: 'fi fl ff ffi ffl office final flower',
  },
  {
    tag: 'dlig',
    name: 'Diskréční ligatury',
    description: 'Dekorativní a historické znakové vazby (st, ct, sp, Th).',
    category: 'ligatures',
    enabled: false,
    sampleText: 'st ct sp Th the structure contrast',
  },
  {
    tag: 'calt',
    name: 'Kontextové / Kódovací ligatury',
    description: 'Programátorské spojování šipek a operátorů (->, =>, !=, ===, <=, >=).',
    category: 'ligatures',
    enabled: true,
    sampleText: '-> => != === >= <= <!-- -->',
  },

  // Figures & Numbers (Crucial for Crypto/DeFi)
  {
    tag: 'tnum',
    name: 'Tabulární číslice (Tabular Nums)',
    description: 'Jednotná šířka všech číslic – naprostá nutnost pro DeFi grafy, tabulky a účetnictví.',
    category: 'figures',
    enabled: true,
    sampleText: '0123456789 $1,234,567.89 0.04820 BTC',
  },
  {
    tag: 'zero',
    name: 'Přeškrtnutá nula (Slashed Zero)',
    description: 'Zřetelné odlišení číslice nula (0̸) od písmene O v heslech, adresách a kódu.',
    category: 'figures',
    enabled: true,
    sampleText: '0 000 100 0x9482A0F8 O0O0',
  },
  {
    tag: 'frac',
    name: 'Pravé typografické zlomky',
    description: 'Převádí zápisy jako 1/2, 3/4, 5/8 na proporcionální diagonální zlomky.',
    category: 'figures',
    enabled: false,
    sampleText: '1/2 3/4 1/4 5/8 7/8 9/10',
  },
  {
    tag: 'onum',
    name: 'Skákavé / Staré číslice (Oldstyle)',
    description: 'Minuskové číslice s horními a dolními dotahy vhodné pro plynulý knižní text.',
    category: 'figures',
    enabled: false,
    sampleText: 'Roku 1984 a v roce 2026 bylo 350 lidí',
  },

  // Stylistic Sets
  {
    tag: 'ss01',
    name: 'Stylistická sada 1 (Alternate shapes)',
    description: 'Jednobříškové a, otevřené g nebo alternativní tvary verzálek.',
    category: 'stylistic',
    enabled: false,
    sampleText: 'a g Q R & aalborg google quantum',
  },
  {
    tag: 'ss02',
    name: 'Stylistická sada 2 (Geometric digits)',
    description: 'Alternativní ploché tvary číslic a symbolů.',
    category: 'stylistic',
    enabled: false,
    sampleText: '1 2 3 4 5 6 7 8 9 0 $ & %',
  },
  {
    tag: 'ss03',
    name: 'Stylistická sada 3 (Curved / Round)',
    description: 'Zaoblené konce tahů a měkčí křivky.',
    category: 'stylistic',
    enabled: false,
    sampleText: 'J K Q R W y',
  },

  // Casing & Layout
  {
    tag: 'case',
    name: 'Tvary přizpůsobené verzálkám (Case)',
    description: 'Posouvá závorky ( ), [ ], { }, pomlčky a středníky do středu velkých písmen.',
    category: 'casing',
    enabled: true,
    sampleText: '(HODL) [DEFI] {CRYPTO} A-B-C ¿QUE?',
  },
  {
    tag: 'smcp',
    name: 'Malé kapitálky (Small Caps)',
    description: 'Převede malá písmena na zmenšené proporcionální verzálky.',
    category: 'casing',
    enabled: false,
    sampleText: 'GlyphFlow Typography Studio 2026',
  },
  {
    tag: 'kern',
    name: 'Optický Kerning',
    description: 'Vyrovnává optické mezery mezi problematickými páry písmen (AV, Ta, Ve).',
    category: 'layout',
    enabled: true,
    sampleText: 'AV AW Ta Te To Ve Vo WA Yo',
  },
];

const PRESET_TEXTS = [
  {
    id: 'czech-pangram',
    title: 'Český Pangram & Diakritika',
    text: 'Příliš žluťoučký kůň úpěl ďábelské ódy na bílém sněhu. Nechť již vzkvétá 100% krása české typografie!',
  },
  {
    id: 'defi-table',
    title: 'DeFi & Finanční data',
    text: `BTC/USD:   $68,490.50   +4.82%   Vol: $1,420,900
ETH/USD:    $3,512.10   -1.25%   Vol:   $890,400
SOL/USD:      $148.90  +12.40%   Vol:   $450,200
Staking: 0.04820000 BTC | APR: 12.5% | 0/0̸ Slashed`,
  },
  {
    id: 'code-ligatures',
    title: 'Programování & Ligatury',
    text: `const match = (val !== null && x => y);
if (count >= 100 || status === 'ready') {
  // Arrow: -> <-- <=> != === <= >=
}`,
  },
  {
    id: 'fractions-pairs',
    title: 'Ligatury & Zlomky',
    text: 'fi, fl, ff, ffi, ffl, st, ct. Poměr: 1/2 šálku, 3/4 lžíce, 5/8 metru. (TEST) [CASE] {ALIGNED}',
  },
];

const FONTS_LIST = [
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif" },
  { name: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
  { name: 'Inter / System Sans', family: "Inter, system-ui, -apple-system, sans-serif" },
  { name: 'Segoe UI (Windows)', family: "'Segoe UI', Tahoma, Geneva, sans-serif" },
  { name: 'Consolas (Windows Mono)', family: "Consolas, 'Courier New', monospace" },
  { name: 'Georgia (Serif)', family: "Georgia, 'Times New Roman', serif" },
  { name: 'Arial (Clean)', family: "Arial, Helvetica, sans-serif" },
];

export const TypographyStudioView: React.FC = () => {
  const [features, setFeatures] = useState<OpenTypeFeatureConfig[]>(DEFAULT_OPENTYPE_FEATURES);
  const [selectedFont, setSelectedFont] = useState<string>(FONTS_LIST[0].family);
  const [customFontName, setCustomFontName] = useState<string>('');
  const [sampleText, setSampleText] = useState<string>(PRESET_TEXTS[0].text);
  const [fontSize, setFontSize] = useState<number>(24);
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [copiedCodeType, setCopiedCodeType] = useState<string | null>(null);

  // Inspector inspected char
  const [inspectedChar, setInspectedChar] = useState<string>('Q');

  // Compute CSS font-feature-settings string
  const fontFeatureSettingsCss = useMemo(() => {
    const active = features.filter((f) => f.enabled);
    if (active.length === 0) return 'normal';
    return active.map((f) => `"${f.tag}" 1`).join(', ');
  }, [features]);

  const activeFontFamily = customFontName.trim() ? `"${customFontName.trim()}", ${selectedFont}` : selectedFont;

  const toggleFeature = (tag: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.tag === tag ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleResetFeatures = () => {
    setFeatures(DEFAULT_OPENTYPE_FEATURES);
  };

  const handleCopyCss = async () => {
    const css = `/* GlyphFlow OpenType Setup */
font-feature-settings: ${fontFeatureSettingsCss};
font-variant-numeric: ${features.find(f => f.tag === 'tnum')?.enabled ? 'tabular-nums' : 'normal'} ${features.find(f => f.tag === 'zero')?.enabled ? 'slashed-zero' : ''} ${features.find(f => f.tag === 'frac')?.enabled ? 'diagonal-fractions' : ''};
font-variant-ligatures: ${features.find(f => f.tag === 'liga')?.enabled ? 'common-ligatures' : 'no-common-ligatures'} ${features.find(f => f.tag === 'dlig')?.enabled ? 'discretionary-ligatures' : ''};
`;
    await navigator.clipboard.writeText(css);
    setCopiedCodeType('css');
    setTimeout(() => setCopiedCodeType(null), 2500);
  };

  // Inspect character details
  const inspectedMetrics = useMemo(() => {
    if (!inspectedChar) return null;
    const codePoint = inspectedChar.codePointAt(0) || 0;
    const hex = formatUnicodeHex(codePoint);
    const bytes = getUtf8Bytes(inspectedChar);

    // Detect general script/block
    let block = 'Basic Latin';
    if (codePoint >= 0x0080 && codePoint <= 0x00FF) block = 'Latin-1 Supplement';
    else if (codePoint >= 0x0100 && codePoint <= 0x017F) block = 'Latin Extended-A';
    else if (codePoint >= 0x0370 && codePoint <= 0x03FF) block = 'Greek & Coptic';
    else if (codePoint >= 0x20A0 && codePoint <= 0x20CF) block = 'Currency Symbols';
    else if (codePoint >= 0x2200 && codePoint <= 0x22FF) block = 'Mathematical Operators';
    else if (codePoint >= 0x1F300) block = 'Emojis & Symbols';

    return {
      char: inspectedChar,
      codePoint,
      hex,
      dec: codePoint,
      bytes,
      block,
      htmlHex: `&#x${codePoint.toString(16).toUpperCase()};`,
      htmlDec: `&#${codePoint};`,
      cssEsc: `\\${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
    };
  }, [inspectedChar]);

  return (
    <div className="flex-1 w-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xs dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-zinc-950 dark:text-white tracking-tight">
                Typografická analýza & OpenType Studio
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 rounded">
                OpenType v1.3
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Interaktivní testování systémových fontů, ligatur, tabulárních čísel a stylistických sad v reálném čase
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              isCompareMode
                ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-zinc-950 font-semibold shadow-xs'
                : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800 shadow-xs dark:shadow-none'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isCompareMode ? 'Vypnout porovnání' : 'Porovnat Před / Po'}</span>
          </button>

          <button
            onClick={handleCopyCss}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {copiedCodeType === 'css' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSS zkopírováno!</span>
              </>
            ) : (
              <>
                <Code2 className="w-3.5 h-3.5" />
                <span>Kopírovat CSS nastavení</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: OpenType Features & Font Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Font Selection & System Font */}
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-xs dark:shadow-none">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Výběr písma & Systémový font Windows
            </h3>
            <div className="space-y-2">
              <select
                value={selectedFont}
                onChange={(e) => {
                  setSelectedFont(e.target.value);
                  setCustomFontName('');
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
              >
                {FONTS_LIST.map((f) => (
                  <option key={f.name} value={f.family}>
                    {f.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nebo zadejte název fontu ve Windows (např. Cascadia Code, Fira Code)..."
                  value={customFontName}
                  onChange={(e) => setCustomFontName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Sliders: Size, Line Height, Spacing */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
                  <span>Velikost</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-medium">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-cyan-500 dark:accent-cyan-400 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
                  <span>Výška řádku</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-medium">{lineHeight}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.2"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full accent-cyan-500 dark:accent-cyan-400 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
                  <span>Prostrkání</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-medium">{letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="6"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full accent-cyan-500 dark:accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* OpenType Features Toggles by Category */}
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 shadow-xs dark:shadow-none">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                OpenType funkce ({features.filter((f) => f.enabled).length} aktivních)
              </h3>
              <button
                onClick={handleResetFeatures}
                className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {features.map((feature) => (
                <div
                  key={feature.tag}
                  onClick={() => toggleFeature(feature.tag)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    feature.enabled
                      ? 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-500/40 shadow-2xs'
                      : 'bg-zinc-50/80 hover:bg-zinc-100/80 dark:bg-zinc-950/60 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-cyan-300">
                        {feature.tag}
                      </span>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                        {feature.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        feature.enabled
                          ? 'bg-cyan-600 border-cyan-600 text-white dark:bg-cyan-500 dark:border-cyan-400 dark:text-zinc-950'
                          : 'border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                      }`}
                    >
                      {feature.enabled && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Canvas & Metrics Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Presets Bar */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs text-zinc-600 dark:text-zinc-500 shrink-0">Předvolby:</span>
            {PRESET_TEXTS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSampleText(preset.text)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  sampleText === preset.text
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs'
                    : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:border-zinc-800 shadow-xs dark:shadow-none'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          {/* Live Preview Box */}
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-xs dark:shadow-none">
            <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                <span className="font-mono">Písmo: {activeFontFamily}</span>
              </div>
              <div className="font-mono text-[11px] text-zinc-500 truncate max-w-xs">
                font-feature-settings: {fontFeatureSettingsCss}
              </div>
            </div>

            {/* Split Comparison or Single View */}
            {isCompareMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 min-h-[300px]">
                {/* Standard / Raw */}
                <div className="p-5 space-y-2 bg-white dark:bg-zinc-950/40">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Výchozí vykreslení (Bez OpenType)
                  </div>
                  <div
                    style={{
                      fontFamily: activeFontFamily,
                      fontSize: `${fontSize}px`,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      fontFeatureSettings: 'normal',
                    }}
                    className="text-zinc-900 dark:text-white whitespace-pre-wrap select-text focus:outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setSampleText(e.currentTarget.innerText)}
                  >
                    {sampleText}
                  </div>
                </div>

                {/* Enhanced with OpenType */}
                <div className="p-5 space-y-2 bg-cyan-50/40 dark:bg-zinc-950/80">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Aktivní OpenType funkce</span>
                  </div>
                  <div
                    style={{
                      fontFamily: activeFontFamily,
                      fontSize: `${fontSize}px`,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      fontFeatureSettings: fontFeatureSettingsCss,
                    }}
                    className="text-cyan-950 dark:text-cyan-50 whitespace-pre-wrap select-text focus:outline-none font-medium"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setSampleText(e.currentTarget.innerText)}
                  >
                    {sampleText}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 min-h-[300px] bg-white dark:bg-zinc-950/80 flex flex-col justify-center">
                <div
                  style={{
                    fontFamily: activeFontFamily,
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                    letterSpacing: `${letterSpacing}px`,
                    fontFeatureSettings: fontFeatureSettingsCss,
                  }}
                  className="text-zinc-900 dark:text-white whitespace-pre-wrap select-text focus:outline-none"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => setSampleText(e.currentTarget.innerText)}
                >
                  {sampleText}
                </div>
              </div>
            )}

            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Text výše lze přímo upravovat kliknutím a psaním.</span>
              <button
                onClick={() => setSampleText('')}
                className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Vymazat text
              </button>
            </div>
          </div>

          {/* Deep Glyph Metrics & Anatomy Diagram */}
          {inspectedMetrics && (
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Anatomie & Metriky znaku
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Vyberte znak:</span>
                  <div className="flex gap-1">
                    {['Q', 'a', 'g', 'fi', '0', '&', '€', 'Ω', 'ř'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setInspectedChar(c)}
                        className={`w-6 h-6 rounded text-xs font-mono transition-colors cursor-pointer flex items-center justify-center ${
                          inspectedChar === c
                            ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-zinc-950 font-bold shadow-xs'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:border-transparent'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Baseline & Anatomy Diagram */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 relative overflow-hidden flex items-center justify-center min-h-[160px]">
                {/* Horizontal Typography Guide Lines */}
                <div className="absolute inset-x-4 top-[25%] border-b border-dashed border-red-500/50 flex justify-between text-[9px] font-mono text-red-600 dark:text-red-400 px-2 pointer-events-none">
                  <span>Ascender / Verzálky</span>
                  <span>+750</span>
                </div>
                <div className="absolute inset-x-4 top-[40%] border-b border-dashed border-amber-500/50 flex justify-between text-[9px] font-mono text-amber-600 dark:text-amber-400 px-2 pointer-events-none">
                  <span>Střední výška (X-Height)</span>
                  <span>+500</span>
                </div>
                <div className="absolute inset-x-4 top-[70%] border-b border-cyan-500/80 flex justify-between text-[9px] font-mono text-cyan-600 dark:text-cyan-400 px-2 pointer-events-none">
                  <span>Základní dotažnice (Baseline)</span>
                  <span>0</span>
                </div>
                <div className="absolute inset-x-4 top-[88%] border-b border-dashed border-indigo-500/50 flex justify-between text-[9px] font-mono text-indigo-600 dark:text-indigo-400 px-2 pointer-events-none">
                  <span>Dolní dotažnice (Descender)</span>
                  <span>-250</span>
                </div>

                {/* Character Rendered Large */}
                <div
                  style={{
                    fontFamily: activeFontFamily,
                    fontFeatureSettings: fontFeatureSettingsCss,
                  }}
                  className="text-8xl font-normal text-zinc-950 dark:text-white select-none z-10 transition-all drop-shadow-sm"
                >
                  {inspectedMetrics.char}
                </div>
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
                  <div className="text-zinc-500 text-[10px]">Unicode CodePoint</div>
                  <div className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold mt-1">
                    {inspectedMetrics.hex} ({inspectedMetrics.dec})
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
                  <div className="text-zinc-500 text-[10px]">Unicode Blok</div>
                  <div className="text-zinc-800 dark:text-zinc-200 font-medium truncate mt-1">
                    {inspectedMetrics.block}
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
                  <div className="text-zinc-500 text-[10px]">UTF-8 Byte Sequence</div>
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {inspectedMetrics.bytes}
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
                  <div className="text-zinc-500 text-[10px]">CSS Escape / Entity</div>
                  <div className="font-mono text-zinc-700 dark:text-zinc-300 truncate mt-1">
                    {inspectedMetrics.cssEsc}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
