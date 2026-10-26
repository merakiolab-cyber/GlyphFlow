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
  AlertCircle,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { CustomIconItem } from '../types';
import { localDB } from '../db/indexedDb';
import { parseUploadedSvg, sanitizeViewBox } from '../utils/svgSanitize';

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

  // Extract unique collections
  const collections = Array.from(
    new Set(customIcons.map((i) => i.collection || 'Moje ikony'))
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Správce vlastních sad ikon
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 rounded">
                  {customIcons.length} ikon uloženo v IndexedDB
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Nahrávejte a organizujte vlastní SVG balíčky do lokální databáze s plnou offline podporou
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

        {/* Action Controls & Collection Selector */}
        <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedCollection('Všechny sady')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCollection === 'Všechny sady'
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
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
                      ? 'bg-zinc-100 text-zinc-900 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
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
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Zálohovat vlastní ikony jako JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Zálohovat JSON</span>
              </button>
            )}

            {selectedCollection !== 'Všechny sady' && (
              <button
                onClick={handleDeleteCurrentCollection}
                className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
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
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/10'
                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20'
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
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Přetáhněte sem SVG soubory nebo klikněte pro výběr
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md">
              Podporuje jednotlivé soubory i hromadný výběr desítek SVG ikon najednou.
              Ikony se automaticky vyčistí a uloží do sady{' '}
              <span className="text-zinc-200 font-medium">
                "{selectedCollection === 'Všechny sady' ? 'Moje ikony' : selectedCollection}"
              </span>
              .
            </p>
          </div>

          {feedbackMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* New Collection Form */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-300 w-full sm:w-auto">
              <Folder className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>Vytvořit novou kolekci pro organizaci:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Název sady (např. Fintech, Mobile UI)..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 flex-1 sm:w-60"
              />
              <button
                onClick={() => {
                  if (newCollectionName.trim()) {
                    setSelectedCollection(newCollectionName.trim());
                    setNewCollectionName('');
                  }
                }}
                disabled={!newCollectionName.trim()}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Vytvořit</span>
              </button>
            </div>
          </div>

          {/* Icons Grid in current collection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
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
                    className="group relative bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-lg p-2.5 flex flex-col items-center justify-center transition-all aspect-square"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center text-white"
                      dangerouslySetInnerHTML={{
                        __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sanitizeViewBox(icon.viewBox)}" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon.svgContent}</svg>`,
                      }}
                    />
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 mt-2 truncate w-full text-center">
                      {icon.name}
                    </span>

                    {/* Delete overlay button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIcon(icon.id);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-zinc-950/80 hover:bg-red-950 border border-zinc-800 hover:border-red-800 text-zinc-400 hover:text-red-300 rounded transition-all cursor-pointer"
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
        <div className="px-6 py-3.5 border-t border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span>Ukládáno do prohlížeče / IndexedDB offline úložiště</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Hotovo
          </button>
        </div>
      </div>
    </div>
  );
};
