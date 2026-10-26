import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Copy,
  Check,
  Download,
  SlidersHorizontal,
  Code2,
  Image as ImageIcon,
  Upload,
  Layers,
  Sparkles,
  Trash2,
  CheckSquare,
  Square as SquareIcon,
  Archive,
  Palette,
  FileCode,
  ExternalLink,
  Zap,
  Folder,
} from 'lucide-react';
import { icons as LucideIcons } from 'lucide-react';
import { ICON_THEMES, getAllLucideIcons } from '../data/iconsCatalog';
import { ALL_CURATED_CUSTOM_ICONS, CURATED_COLLECTIONS } from '../data/curatedCustomIconSets';
import { CustomIconItem, IconItem, IconStyle } from '../types';
import { localDB } from '../db/indexedDb';
import {
  generateStyledSvgMarkup,
  formatSvgForFigma,
  generateFigmaBatchBoard,
  generateReactJsxCode,
  generateTailwindSvgSnippet,
  generateDataUri,
  downloadIconsZip,
} from '../utils/figmaBridge';
import { FigmaBridgeModal } from './FigmaBridgeModal';
import { CustomIconsManagerModal } from './CustomIconsManagerModal';
import { parseUploadedSvg, sanitizeViewBox } from '../utils/svgSanitize';

const DESIGNER_COLORS = [
  { name: 'Bílá / Kyanidová (Cyan)', color: '#FFFFFF', secondary: '#00F2FE' },
  { name: 'Čistý grafit / Azurová', color: '#18181B', secondary: '#38BDF8' },
  { name: 'Kyanidová (Cyan) / Hluboká modř', color: '#00F2FE', secondary: '#0284C7' },
  { name: 'Smaragdová (Emerald) / Mint', color: '#10B981', secondary: '#34D399' },
  { name: 'Královská fialová / Růžová', color: '#8B5CF6', secondary: '#EC4899' },
  { name: 'Západ slunce (Amber) / Oranž', color: '#F59E0B', secondary: '#EA580C' },
  { name: 'Korálová (Rose) / Karmín', color: '#F43F5E', secondary: '#BE123C' },
];

export const IconsLibraryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || params.get('search') || '';
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || params.get('theme') || 'all-icons';
  });
  const [selectedStyle, setSelectedStyle] = useState<IconStyle>(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('style') as IconStyle;
    return ['outline', 'solid', 'duotone', 'colored', 'modern3d'].includes(s) ? s : 'outline';
  });
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [iconColor, setIconColor] = useState<string>('#FFFFFF');
  const [secondaryColor, setSecondaryColor] = useState<string>('#00F2FE');
  const [iconSize, setIconSize] = useState<number>(24);

  // Custom uploaded icons from IndexedDB
  const [customIcons, setCustomIcons] = useState<CustomIconItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-selection mode for Figma batch & ZIP download
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(new Set());

  // Modal inspection
  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  // Phase 3 modals
  const [isFigmaBridgeOpen, setIsFigmaBridgeOpen] = useState(false);
  const [isCustomManagerOpen, setIsCustomManagerOpen] = useState(false);
  const [selectedCustomCollection, setSelectedCustomCollection] = useState<string>('all');

  // Load custom icons from local IndexedDB
  const loadCustomIcons = async () => {
    try {
      const items = await localDB.getCustomIcons();
      setCustomIcons(items);
    } catch (e) {
      console.warn('Failed to load custom icons', e);
    }
  };

  useEffect(() => {
    loadCustomIcons();
  }, []);

  // Extract unique collections (curated + user-uploaded)
  const allCustomCollections = useMemo(() => {
    const list: string[] = CURATED_COLLECTIONS.map((c) => c.name);
    customIcons.forEach((c) => {
      const col = c.collection || 'Moje ikony';
      if (!list.includes(col)) list.push(col);
    });
    return list;
  }, [customIcons]);

  // Merge built-in Lucide icons with curated sets & custom uploaded icons
  const allIcons = useMemo(() => {
    const builtIn = getAllLucideIcons();

    // Curated vector icons (Finance, IT, AI)
    const curatedFormatted: IconItem[] = ALL_CURATED_CUSTOM_ICONS.map((c) => ({
      id: c.id,
      name: c.name,
      czechName: c.czechName,
      category: c.category,
      tags: [...c.tags, 'curated', c.collection || 'GlyphFlow'],
      svgPath: c.svgContent,
      viewBox: c.viewBox,
      isCustom: true,
      isCurated: true,
      collection: c.collection,
    }));

    const curatedIds = new Set(ALL_CURATED_CUSTOM_ICONS.map((c) => c.id));

    // User-uploaded custom icons from IndexedDB (excluding any seeded duplicates)
    const customFormatted: IconItem[] = customIcons
      .filter((c) => !curatedIds.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        czechName: c.czechName,
        category: c.category || 'custom-icons',
        tags: [...c.tags, 'custom', 'upload', c.collection || 'Moje ikony'],
        svgPath: c.svgContent,
        viewBox: c.viewBox,
        isCustom: true,
        isCurated: false,
        collection: c.collection || 'Moje ikony',
      }));

    return [...curatedFormatted, ...customFormatted, ...builtIn];
  }, [customIcons]);

  // Filtering
  const filteredIcons = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allIcons.filter((icon) => {
      // Category filter
      if (selectedCategory !== 'all-icons') {
        if (selectedCategory === 'custom-icons') {
          if (!icon.isCustom) return false;
        } else if (icon.category !== selectedCategory) {
          return false;
        }
      }

      // Sub-collection filter when viewing custom-icons
      if (selectedCategory === 'custom-icons' && selectedCustomCollection !== 'all') {
        const matchesCollection =
          icon.collection === selectedCustomCollection ||
          icon.tags.some((t) => t.toLowerCase() === selectedCustomCollection.toLowerCase());
        if (!matchesCollection) return false;
      }

      // Full text search in Czech & English
      if (q) {
        return (
          icon.name.toLowerCase().includes(q) ||
          icon.czechName.toLowerCase().includes(q) ||
          icon.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allIcons, searchQuery, selectedCategory, selectedCustomCollection]);

  // Handle uploading custom SVG files
  const handleUploadSvgFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') continue;

      try {
        const text = await file.text();
        const parsed = parseUploadedSvg(text);
        if (!parsed) continue;

        const viewBox = parsed.viewBox;
        const innerContent = parsed.inner;
        const cleanName = file.name.replace('.svg', '');

        const customItem: CustomIconItem = {
          id: `custom-${Date.now()}-${i}`,
          name: cleanName,
          czechName: cleanName,
          category: 'custom-icons',
          tags: ['custom', 'vlastni', cleanName.toLowerCase()],
          svgContent: innerContent,
          viewBox,
          addedAt: Date.now(),
        };

        await localDB.addCustomIcon(customItem);
      } catch (err) {
        console.error('Error importing SVG', err);
      }
    }

    await loadCustomIcons();
    setSelectedCategory('custom-icons');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteCustomIcon = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Opravdu chcete tuto vlastní ikonu smazat?')) {
      await localDB.removeCustomIcon(id);
      await loadCustomIcons();
      if (selectedIcon?.id === id) setSelectedIcon(null);
    }
  };

  // Toggle icon selection
  const toggleSelectIcon = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIconIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    const ids = new Set(filteredIcons.slice(0, 100).map((i) => i.id));
    setSelectedIconIds(ids);
  };

  const deselectAll = () => {
    setSelectedIconIds(new Set());
  };

  // Export config
  const exportConfig = {
    style: selectedStyle,
    strokeWidth,
    color: iconColor,
    secondaryColor,
    size: iconSize,
  };

  // Copy helper
  const handleCopy = async (type: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1400);
  };

  // Figma Batch Copy
  const handleCopyBatchToFigma = async () => {
    const selectedList = allIcons.filter((i) => selectedIconIds.has(i.id));
    if (selectedList.length === 0) return;

    const figmaBoardSvg = generateFigmaBatchBoard(selectedList, exportConfig);
    await navigator.clipboard.writeText(figmaBoardSvg);
    setCopiedType('figma-batch');
    setTimeout(() => setCopiedType(null), 1800);
  };

  // Batch ZIP Download
  const handleDownloadBatchZip = async () => {
    const selectedList = allIcons.filter((i) => selectedIconIds.has(i.id));
    if (selectedList.length === 0) return;

    setIsZipping(true);
    try {
      await downloadIconsZip(selectedList, exportConfig);
    } finally {
      setIsZipping(false);
    }
  };

  // Single icon PNG download
  const handleDownloadPng = (icon: IconItem, res = 512) => {
    const canvas = document.createElement('canvas');
    canvas.width = res;
    canvas.height = res;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgMarkup = generateStyledSvgMarkup(icon, { ...exportConfig, size: res });
    const img = new Image();
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, res, res);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = pngUrl;
        anchor.download = `${icon.id}_${selectedStyle}.png`;
        anchor.click();
        URL.revokeObjectURL(pngUrl);
      });
    };
    img.src = url;
  };

  // Render icon inside the card matching selected style (WYSIWYG from figmaBridge engine)
  const renderIconPreview = (icon: IconItem, previewSize = 26) => {
    const markup = generateStyledSvgMarkup(icon, {
      style: selectedStyle,
      strokeWidth,
      color: iconColor,
      secondaryColor,
      size: previewSize,
    });

    return (
      <div
        className="flex items-center justify-center shrink-0 pointer-events-none"
        style={{ width: previewSize, height: previewSize }}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  };

  const handleCopyCardForFigma = async (icon: IconItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const figmaSvg = formatSvgForFigma(icon, exportConfig);
    await navigator.clipboard.writeText(figmaSvg);
    setCopiedCardId(icon.id);
    setTimeout(() => setCopiedCardId(null), 1800);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden select-none">
      {/* Hidden File Input for Custom SVG uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".svg,image/svg+xml"
        onChange={handleUploadSvgFiles}
        className="hidden"
      />

      {/* Sidebar: Categories, Custom Uploads, and Style Presets */}
      <aside className="w-full md:w-64 bg-zinc-950/60 md:border-r border-b md:border-b-0 border-zinc-800/80 p-3 sm:p-4 overflow-y-auto shrink-0 space-y-5">
        {/* Custom SVG Set Upload Banner */}
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vlastní & kurátorské sady</span>
            </span>
            <span className="text-[10px] font-mono-nums text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded font-medium">
              {allIcons.filter((i) => i.isCustom).length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-snug">
            3 kurátorské sady (Finance, IT, AI) + podpora vlastního SVG nahrávání do offline paměti.
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setIsCustomManagerOpen(true)}
              className="flex-1 py-1.5 px-2 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Folder className="w-3 h-3 text-cyan-400" />
              <span>Spravovat</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              title="Rychlý upload souborů"
            >
              <Upload className="w-3 h-3 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div>
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800/80">
            <h3 className="text-xs font-semibold text-zinc-400">
              Kategorie ikon
            </h3>
            <span className="text-[10px] font-mono-nums text-zinc-500">
              {allIcons.length} celkem
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {ICON_THEMES.map((theme) => {
              const isSelected = selectedCategory === theme.id;
              const count =
                theme.id === 'all-icons'
                  ? allIcons.length
                  : theme.id === 'custom-icons'
                  ? allIcons.filter((i) => i.isCustom).length
                  : allIcons.filter((i) => i.category === theme.id).length;

              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedCategory(theme.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="truncate">{theme.name}</span>
                  <span className="text-[10px] font-mono-nums text-zinc-500 shrink-0 ml-1">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Styles */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 mb-2">
            Styl ikony
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'outline', label: 'Outline (Čára)' },
              { id: 'solid', label: 'Solid (Plná)' },
              { id: 'duotone', label: 'Duotone (2-tón)' },
              { id: 'colored', label: 'Colored' },
              { id: 'modern3d', label: '3D Dlaždice' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStyle(st.id as IconStyle)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-colors cursor-pointer ${
                  selectedStyle === st.id
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Global Customizer Engine */}
        <div className="pt-3 border-t border-zinc-800 space-y-3">
          <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Parametry zobrazení & exportu</span>
          </h3>

          {/* Stroke Width Slider */}
          {selectedStyle !== 'solid' && (
            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span>Tloušťka tahu</span>
                <span className="font-mono-nums text-zinc-200">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.5"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full accent-zinc-200 cursor-pointer"
              />
            </div>
          )}

          {/* Color Palettes */}
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Barva (Primární)
            </label>
            <div className="flex items-center gap-1.5 mb-2">
              <input
                type="color"
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="w-7 h-7 rounded border border-zinc-800 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="w-full py-1 px-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono-nums uppercase"
              />
            </div>

            {/* Quick designer palette chips */}
            <div className="flex flex-wrap gap-1">
              {DESIGNER_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setIconColor(c.color);
                    setSecondaryColor(c.secondary);
                  }}
                  className="w-5 h-5 rounded-md border border-zinc-700 cursor-pointer hover:scale-110 transition-transform shadow-xs"
                  style={{
                    background:
                      selectedStyle === 'duotone'
                        ? `linear-gradient(135deg, ${c.color} 50%, ${c.secondary} 50%)`
                        : c.color,
                  }}
                  title={`${c.name} (Primární: ${c.color}, Sekundární: ${c.secondary})`}
                />
              ))}
            </div>
          </div>

          {/* Secondary Color for Duotone */}
          {selectedStyle === 'duotone' && (
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Sekundární tón (Duotone)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-7 h-7 rounded border border-zinc-800 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full py-1 px-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono-nums uppercase"
                />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 flex flex-col">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80 shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="relative flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl">
              <div className="pl-3 pr-2 text-zinc-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hledat v 1600+ ikonách (např. 'user', 'shield', 'cart', 'heart')..."
                className="w-full py-2 pr-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Batch & Figma Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Direct Figma Bridge Button */}
            <button
              onClick={() => setIsFigmaBridgeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0"
              title="Otevřít Figma Desktop Bridge & Export Studio"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Figma Bridge</span>
            </button>

            {/* Custom Sets Manager Button */}
            <button
              onClick={() => setIsCustomManagerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Spravovat a nahrávat vlastní SVG sady"
            >
              <Folder className="w-3.5 h-3.5 text-zinc-400" />
              <span>Vlastní sady ({allIcons.filter((i) => i.isCustom).length})</span>
            </button>

            <button
              onClick={() => {
                setIsMultiSelectMode(!isMultiSelectMode);
                if (isMultiSelectMode) deselectAll();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer shrink-0 ${
                isMultiSelectMode
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Hromadný výběr</span>
            </button>

            {isMultiSelectMode && (
              <>
                <button
                  onClick={selectAllFiltered}
                  className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 rounded-lg border border-zinc-800 cursor-pointer"
                >
                  Vybrat vše
                </button>
                <button
                  onClick={deselectAll}
                  className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 rounded-lg border border-zinc-800 cursor-pointer"
                >
                  Zrušit
                </button>
              </>
            )}

            <span className="text-xs font-mono-nums text-zinc-400 ml-1 shrink-0">
              {filteredIcons.length} nalezeno
            </span>
          </div>
        </div>

        {/* Custom Icons Sub-Collection Filter (When viewing custom-icons) */}
        {selectedCategory === 'custom-icons' && allIcons.some((i) => i.isCustom) && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0">
            <span className="text-xs text-zinc-500 shrink-0">Sada:</span>
            <button
              onClick={() => setSelectedCustomCollection('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCustomCollection === 'all'
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Všechny sady ({allIcons.filter((i) => i.isCustom).length})
            </button>
            {allCustomCollections.map((col) => {
              const count = allIcons.filter(
                (i) => i.isCustom && (i.collection === col || i.tags.some((t) => t.toLowerCase() === col.toLowerCase()))
              ).length;
              return (
                <button
                  key={col}
                  onClick={() => setSelectedCustomCollection(col)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCustomCollection === col
                      ? 'bg-zinc-100 text-zinc-900 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <span>{col}</span>
                  <span className="text-[10px] opacity-70 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Floating Batch Action Toolbar (When icons are selected) */}
        {selectedIconIds.size > 0 && (
          <div className="p-3 bg-zinc-900/95 border border-zinc-700 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-in fade-in">
            <div className="text-xs text-zinc-200 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Vybráno <strong>{selectedIconIds.size}</strong> ikon</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyBatchToFigma}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
                title="Kopírovat pro přímé vložení (Ctrl+V) do Figma"
              >
                {copiedType === 'figma-batch' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'figma-batch' ? 'Zkopírováno pro Figma!' : 'Kopírovat set pro Figma'}</span>
              </button>

              <button
                onClick={handleDownloadBatchZip}
                disabled={isZipping}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5 text-zinc-400" />
                <span>{isZipping ? 'Balím ZIP...' : 'Stáhnout jako ZIP (.zip)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Icons Grid */}
        <div className="flex-1">
          {filteredIcons.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
              Nebyly nalezeny žádné ikony pro zadané kritérium.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2.5">
              {filteredIcons.map((icon) => {
                const isSelected = selectedIconIds.has(icon.id);

                return (
                  <div
                    key={icon.id}
                    onClick={(e) => {
                      if (isMultiSelectMode) {
                        toggleSelectIcon(icon.id, e);
                      } else {
                        setSelectedIcon(icon);
                      }
                    }}
                    className={`group relative flex flex-col items-center justify-between p-3 rounded-xl border transition-all cursor-pointer aspect-square ${
                      isSelected
                        ? 'bg-zinc-800 border-cyan-400/80 shadow-md ring-1 ring-cyan-400/50'
                        : 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                    title={icon.czechName}
                  >
                    {/* Checkbox toggle if multi-select */}
                    {isMultiSelectMode && (
                      <button
                        onClick={(e) => toggleSelectIcon(icon.id, e)}
                        className="absolute top-1.5 left-1.5 text-zinc-400 hover:text-white p-0.5"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <SquareIcon className="w-3.5 h-3.5 text-zinc-600" />
                        )}
                      </button>
                    )}

                    {/* Custom icon delete badge (only for user-uploaded custom icons) */}
                    {icon.isCustom && !icon.isCurated && (
                      <button
                        onClick={(e) => handleDeleteCustomIcon(icon.id, e)}
                        className="absolute top-1.5 right-1.5 p-1 text-zinc-500 hover:text-rose-400 opacity-60 hover:opacity-100 transition-opacity"
                        title="Smazat tuto vlastní ikonu"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    {/* Quick 1-Click Figma Copy Button on hover */}
                    <button
                      onClick={(e) => handleCopyCardForFigma(icon, e)}
                      className="opacity-0 group-hover:opacity-100 absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-zinc-950/90 hover:bg-cyan-950 border border-zinc-750 hover:border-cyan-500 text-zinc-400 hover:text-cyan-300 rounded text-[9px] font-medium flex items-center gap-1 transition-all cursor-pointer z-10"
                      title="Zkopírovat pro Figmu (Ctrl+V)"
                    >
                      {copiedCardId === icon.id ? (
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <Zap className="w-2.5 h-2.5 text-cyan-400" />
                      )}
                      <span>{copiedCardId === icon.id ? 'Zkopírováno' : 'Figma'}</span>
                    </button>

                    {/* Rendered Icon */}
                    <div className="flex-1 flex items-center justify-center my-1 group-hover:scale-110 transition-transform">
                      {renderIconPreview(icon)}
                    </div>

                    {/* Label */}
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 truncate w-full text-center">
                      {icon.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* SINGLE ICON DETAIL MODAL: FIGMA BRIDGE & EXPORT */}
      {selectedIcon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedIcon(null)}
        >
          <div
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {selectedIcon.czechName}
                </h3>
                <p className="text-xs text-zinc-400">
                  {selectedIcon.name} · {selectedStyle.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedIcon(null)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Big Preview Area */}
            <div className="w-full h-36 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center relative">
              <div className="scale-125">
                {renderIconPreview(selectedIcon, 40)}
              </div>

              <span className="absolute bottom-2 left-2 text-[10px] font-mono-nums text-zinc-500">
                viewBox: {selectedIcon.viewBox || '0 0 24 24'}
              </span>
            </div>

            {/* FIGMA & AI GENERATOR BUTTONS */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Figma Bridge & Formáty pro AI
              </span>

              {/* 1-Click Copy for Figma */}
              <button
                onClick={() => handleCopy('figma', formatSvgForFigma(selectedIcon, exportConfig))}
                className="w-full py-2.5 px-3 text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                title="Vložte přímo do Figma pomocí Ctrl+V"
              >
                {copiedType === 'figma' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === 'figma' ? 'Zkopírováno pro Figma (Vložte Ctrl+V)!' : 'Kopírovat pro Figma (vektorový SVG)'}</span>
              </button>

              {/* React JSX */}
              <button
                onClick={() => handleCopy('jsx', generateReactJsxCode(selectedIcon, exportConfig))}
                className="w-full py-2 px-3 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedType === 'jsx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copiedType === 'jsx' ? 'React JSX zkopírováno!' : 'Kopírovat React JSX komponentu (TypeScript)'}</span>
              </button>

              {/* Tailwind CSS inline SVG */}
              <button
                onClick={() => handleCopy('tailwind', generateTailwindSvgSnippet(selectedIcon, exportConfig))}
                className="w-full py-2 px-3 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedType === 'tailwind' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copiedType === 'tailwind' ? 'Tailwind SVG zkopírováno!' : 'Kopírovat Tailwind CSS SVG snippet'}</span>
              </button>

              {/* Direct Downloads: SVG and PNG */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    const svg = generateStyledSvgMarkup(selectedIcon, exportConfig);
                    const blob = new Blob([svg], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedIcon.id}_${selectedStyle}.svg`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="py-2 px-3 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Stáhnout SVG</span>
                </button>

                <button
                  onClick={() => handleDownloadPng(selectedIcon, 512)}
                  className="py-2 px-3 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Stáhnout PNG (512px)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIGMA BRIDGE MODAL */}
      <FigmaBridgeModal
        isOpen={isFigmaBridgeOpen}
        onClose={() => setIsFigmaBridgeOpen(false)}
        allIcons={allIcons}
        selectedIcons={allIcons.filter((i) => selectedIconIds.has(i.id))}
      />

      {/* CUSTOM ICONS MANAGER MODAL */}
      <CustomIconsManagerModal
        isOpen={isCustomManagerOpen}
        onClose={() => setIsCustomManagerOpen(false)}
        customIcons={customIcons}
        onIconsUpdated={loadCustomIcons}
      />
    </div>
  );
};
