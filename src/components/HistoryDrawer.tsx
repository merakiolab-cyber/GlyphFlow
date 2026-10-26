import React, { useState } from 'react';
import { History, Trash2, Search, ArrowLeft, Check, Copy, Clock } from 'lucide-react';
import { CopyHistoryItem, SearchHistoryItem } from '../types';

interface HistoryViewProps {
  copyHistory: CopyHistoryItem[];
  searchHistory: SearchHistoryItem[];
  onClearCopyHistory: () => void;
  onClearSearchHistory: () => void;
  onApplySearch: (query: string) => void;
  onCopyChar: (char: string) => void;
  onBackToCatalog: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  copyHistory,
  searchHistory,
  onClearCopyHistory,
  onClearSearchHistory,
  onApplySearch,
  onCopyChar,
  onBackToCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'copied' | 'searches'>('copied');
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  const handleCopy = (char: string) => {
    onCopyChar(char);
    setCopiedChar(char);
    setTimeout(() => setCopiedChar(null), 1200);
  };

  const formatTimestamp = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return 'Právě teď';
    if (diffSec < 3600) return `Před ${Math.floor(diffSec / 60)} min`;
    if (diffSec < 86400) return `Před ${Math.floor(diffSec / 3600)} h`;
    return new Date(ts).toLocaleDateString('cs-CZ');
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCatalog}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Zpět do katalogu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              <span>Historie aktivit</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Lokální historie zkopírovaných znaků a hledání
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('copied')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'copied'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Zkopírované ({copyHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('searches')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'searches'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Hledané výrazy ({searchHistory.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Copied Glyphs */}
      {activeTab === 'copied' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Poslední zkopírované symboly
            </span>
            {copyHistory.length > 0 && (
              <button
                onClick={onClearCopyHistory}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vymazat historii</span>
              </button>
            )}
          </div>

          {copyHistory.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs bg-zinc-900/20 rounded-xl border border-zinc-800">
              Zatím jste nezkopírovali žádný znak.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {copyHistory.map((item) => (
                <div
                  key={`${item.char}-${item.hex}`}
                  onClick={() => handleCopy(item.char)}
                  className="flex items-center justify-between p-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-normal text-white w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800">
                      {item.char}
                    </span>
                    <div>
                      <h4 className="text-xs font-medium text-zinc-200 truncate max-w-[150px]">
                        {item.czechName || item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-mono-nums text-zinc-500">
                        <span>{item.hex}</span>
                        <span>·</span>
                        <span>{item.count}×</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-[10px] text-zinc-500">
                    <span className="font-mono-nums">{formatTimestamp(item.timestamp)}</span>
                    <button
                      className="p-1 rounded text-zinc-400 group-hover:text-zinc-200"
                      title="Kopírovat"
                    >
                      {copiedChar === item.char ? (
                        <Check className="w-3.5 h-3.5 text-zinc-200" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Searches */}
      {activeTab === 'searches' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Historie hledaných výrazů
            </span>
            {searchHistory.length > 0 && (
              <button
                onClick={onClearSearchHistory}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vymazat historii hledání</span>
              </button>
            )}
          </div>

          {searchHistory.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs bg-zinc-900/20 rounded-xl border border-zinc-800">
              Zatím nemáte žádnou historii vyhledávání.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800 bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onApplySearch(item.query)}
                  className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-zinc-850 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                    <span className="text-zinc-300 group-hover:text-white">
                      {item.query}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono-nums text-zinc-500">
                    <span>{item.resultsCount} výsledků</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
