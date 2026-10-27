import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Folder,
  Layers,
  Sparkles,
  Check,
  Download,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { CustomIconItem } from '../types';
import { localDB } from '../db/indexedDb';
import { parseUploadedSvg, sanitizeViewBox } from '../utils/svgSanitize';
import {
  CURATED_COLLECTIONS,
  ALL_CURATED_CUSTOM_ICONS,
  CuratedCollectionInfo,
} from '../data/curatedCustomIconSets';

interface CustomIconsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customIcons: CustomIconItem[];
  onIconsUpdated: () => void;
}

export const CustomIconsManagerModal: React.FC<CustomIconsManagerModalProps> = ({
  isOpen,
  onClose,
  customIcons,
  onIconsUpdated,
}) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('Všechny sady');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Extract unique collections (curated + user custom)
  const collections = Array.from(
    new Set([
      ...CURATED_COLLECTIONS.map((c) => c.name),
      ...customIcons.map((i) => i.collection || 'Moje ikony'),
    ])
  );

  const filteredIcons =
    selectedCollection === 'Všechny sady'
      ? customIcons
      : customIcons.filter((i) => (i.collection || 'Moje ikony') === selectedCollection);

  const parseAndAddSvgFiles = async (files: FileList | File[], targetCollection: string) => {
    setIsProcessing(true);
    const newItems: CustomIconItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.svg')) continue;

      try {
        const text = await file.text();
        const parsed = parseUploadedSvg(text);
        if (!parsed) continue;

        const viewBox = parsed.viewBox;
        const innerContent = parsed.inner;
        const baseName = file.name.replace(/\.svg$/i, '').replace(/[-_]/g, ' ');
        const cleanId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const customItem: CustomIconItem = {
          id: cleanId,
          name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
          czechName: baseName.charAt(0).toUpperCase() + baseName.slice(1),
          category: 'custom-icons',
          collection: targetCollection,
          tags: ['custom', targetCollection.toLowerCase(), ...baseName.toLowerCase().split(' ')],
          svgContent: innerContent,
          viewBox,
          addedAt: Date.now(),
        };

        newItems.push(customItem);
      } catch (err) {
        console.warn('Failed to parse SVG file', file.name, err);
      }
    }

    if (newItems.length > 0) {
      await localDB.bulkAddCustomIcons(newItems);
      onIconsUpdated();
      setFeedbackMessage(`Úspěšně nahráno ${newItems.length} SVG ikon!`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }

    setIsProcessing(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const targetCol = selectedCollection === 'Všechny sady' ? 'Moje ikony' : selectedCollection;
      await parseAndAddSvgFiles(e.dataTransfer.files, targetCol);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const targetCol = selectedCollection === 'Všechny sady' ? 'Moje ikony' : selectedCollection;
      await parseAndAddSvgFiles(e.target.files, targetCol);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteIcon = async (id: string) => {
    await localDB.removeCustomIcon(id);
    onIconsUpdated();
  };

  const handleDeleteCurrentCollection = async () => {
    if (selectedCollection === 'Všechny sady') return;
    if (window.confirm(`Opravdu chcete smazat všechny ikony ze sady "${selectedCollection}"?`)) {
      await localDB.deleteCustomIconsByCollection(selectedCollection);
      onIconsUpdated();
      setSelectedCollection('Všechny sady');
    }
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(customIcons, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glyphflow_custom_icons_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInstallCuratedSet = async (curatedSet: CuratedCollectionInfo) => {
    setIsProcessing(true);
    try {
      await localDB.bulkAddCustomIcons(curatedSet.icons);
      onIconsUpdated();
      setFeedbackMessage(`Sada "${curatedSet.name}" (${curatedSet.icons.length} ikon) byla úspěšně uložena do IndexedDB!`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      console.error('Failed to install curated set', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInstallAllCuratedSets = async () => {
    setIsProcessing(true);
    try {
      await localDB.bulkAddCustomIcons(ALL_CURATED_CUSTOM_ICONS);
      onIconsUpdated();
      setFeedbackMessage(`Všech 36 ikon ze sad Finance, IT a AI bylo úspěšně uloženo do IndexedDB!`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      console.error('Failed to install all curated sets', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center text-zinc-700 dark:text-zinc-200">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-950 dark:text-white tracking-tight">
                  Správce vlastních sad ikon
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 rounded">
                  {customIcons.length} ikon uloženo v IndexedDB
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Nahrávejte a organizujte vlastní SVG balíčky do lokální databáze s plnou offline podporou
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls & Collection Selector */}
        <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedCollection('Všechny sady')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCollection === 'Všechny sady'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:border-zinc-800 shadow-xs dark:shadow-none'
              }`}
            >
              Všechny sady ({customIcons.length})
            </button>
            {collections.map((col) => {
              const count = customIcons.filter((i) => (i.collection || 'Moje ikony') === col).length;
              return (
                <button
                  key={col}
                  onClick={() => setSelectedCollection(col)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCollection === col
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs'
                      : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:border-zinc-800 shadow-xs dark:shadow-none'
                  }`}
                >
                  <Folder className="w-3 h-3 text-zinc-400" />
                  <span>{col}</span>
                  <span className="text-[10px] opacity-70 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {customIcons.length > 0 && (
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs dark:shadow-none"
                title="Zálohovat vlastní ikony jako JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Zálohovat JSON</span>
              </button>
            )}

            {selectedCollection !== 'Všechny sady' && (
              <button
                onClick={handleDeleteCurrentCollection}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:border-rose-800/50 dark:text-rose-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs dark:shadow-none"
                title="Smazat tuto sadu"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Smazat sadu</span>
              </button>
            )}
          </div>
        </div>

        {/* Drop zone & Upload Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Curated Pre-built Packs Showcase */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Doporučené kurátorské sady GlyphFlow</span>
                </h3>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Ručně navržené vektorové ikony pro Finance & Krypto, Software/IT a Umělou inteligenci.
                </p>
              </div>
              <button
                onClick={handleInstallAllCuratedSets}
                disabled={isProcessing}
                className="px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-950 bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-400 dark:hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Nainstalovat všech 36 ikon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              {CURATED_COLLECTIONS.map((cSet) => {
                const isAlreadyInstalled = cSet.icons.every((ci) =>
                  customIcons.some((saved) => saved.id === ci.id)
                );
                return (
                  <div
                    key={cSet.id}
                    className="p-3 bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 rounded-lg flex flex-col justify-between space-y-2.5 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                          {cSet.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                          {cSet.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                        {cSet.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900">
                      {/* Mini Preview Icons */}
                      <div className="flex items-center -space-x-1.5">
                        {cSet.icons.slice(0, 4).map((icon) => (
                          <div
                            key={icon.id}
                            className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-300 p-0.5 shadow-xs"
                            dangerouslySetInnerHTML={{
                              __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-full h-full">${icon.svgContent}</svg>`,
                            }}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => handleInstallCuratedSet(cSet)}
                        disabled={isProcessing}
                        className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer flex items-center gap-1 ${
                          isAlreadyInstalled
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/50'
                            : 'text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:border-zinc-750'
                        }`}
                      >
                        {isAlreadyInstalled ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Uloženo</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Uložit do DB</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-cyan-500 bg-cyan-50/50 dark:border-cyan-400 dark:bg-cyan-950/10'
                : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:bg-zinc-900/20'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".svg"
              multiple
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-3 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Přetáhněte sem SVG soubory nebo klikněte pro výběr
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
              Podporuje jednotlivé soubory i hromadný výběr desítek SVG ikon najednou.
              Ikony se automaticky vyčistí a uloží do sady{' '}
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                "{selectedCollection === 'Všechny sady' ? 'Moje ikony' : selectedCollection}"
              </span>
              .
            </p>
          </div>

          {feedbackMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* New Collection Form */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 w-full sm:w-auto">
              <Folder className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span>Vytvořit novou kolekci pro organizaci:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Název sady (např. Fintech, Mobile UI)..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 flex-1 sm:w-60"
              />
              <button
                onClick={() => {
                  if (newCollectionName.trim()) {
                    setSelectedCollection(newCollectionName.trim());
                    setNewCollectionName('');
                  }
                }}
                disabled={!newCollectionName.trim()}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Vytvořit</span>
              </button>
            </div>
          </div>

          {/* Icons Grid in current collection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                Ikony v zobrazení ({filteredIcons.length}):
              </span>
            </div>

            {filteredIcons.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                V této sadě zatím nejsou žádné nahrané ikony. Přetáhněte SVG soubory výše.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {filteredIcons.map((icon) => (
                  <div
                    key={icon.id}
                    className="group relative bg-white hover:bg-zinc-50 dark:bg-zinc-900/70 dark:hover:bg-zinc-850 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-lg p-2.5 flex flex-col items-center justify-center transition-all aspect-square shadow-2xs"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center text-zinc-800 dark:text-white"
                      dangerouslySetInnerHTML={{
                        __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sanitizeViewBox(icon.viewBox)}" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon.svgContent}</svg>`,
                      }}
                    />
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-zinc-200 mt-2 truncate w-full text-center">
                      {icon.name}
                    </span>

                    {/* Delete overlay button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIcon(icon.id);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-white/90 hover:bg-rose-50 border border-zinc-300 hover:border-rose-300 text-zinc-500 hover:text-rose-600 dark:bg-zinc-950/80 dark:hover:bg-rose-950 dark:border-zinc-800 dark:hover:border-rose-800 dark:text-zinc-400 dark:hover:text-rose-300 rounded transition-all cursor-pointer shadow-xs"
                      title="Smazat ikonu"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
          <span>Ukládáno do prohlížeče / IndexedDB offline úložiště</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
          >
            Hotovo
          </button>
        </div>
      </div>
    </div>
  );
};
