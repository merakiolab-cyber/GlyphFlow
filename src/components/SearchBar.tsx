import React, { useEffect, useRef, useState } from 'react';
import { Search, X, History, Clock } from 'lucide-react';
import { SearchHistoryItem } from '../types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultsCount: number;
  totalCount: number;
  recentSearches: SearchHistoryItem[];
  onSelectRecentSearch: (query: string) => void;
  onClearRecentSearches: () => void;
}

const QUICK_SEARCH_TAGS = [
  { label: 'Kryptoměny', query: 'crypto' },
  { label: 'Matematika', query: 'matematika' },
  { label: 'Řecká písmena', query: 'recke' },
  { label: 'Šipky', query: 'sipka' },
  { label: 'Uvozovky', query: 'uvozovky' },
  { label: 'Zlomky', query: 'zlomek' },
  { label: 'Mac zkratky', query: 'cmd' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  resultsCount,
  totalCount,
  recentSearches,
  onSelectRecentSearch,
  onClearRecentSearches,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === 'Escape') {
        setShowHistoryDropdown(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowHistoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center bg-white dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 focus-within:border-cyan-500 dark:focus-within:border-zinc-600 rounded-xl transition-colors shadow-xs dark:shadow-none">
        <div className="pl-3.5 pr-2 text-zinc-400 dark:text-zinc-500 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (recentSearches.length > 0 && !value) {
              setShowHistoryDropdown(true);
            }
          }}
          placeholder="Hledat znak, název (např. 'euro', 'delta', 'odmocnina', 'U+03B4')..."
          className="w-full py-2.5 pr-24 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 bg-transparent focus:outline-none"
        />

        {value && (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="p-1 mr-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded transition-colors cursor-pointer"
            title="Vymazat (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="pr-3 flex items-center gap-2 shrink-0 pointer-events-none">
          <span className="hidden sm:inline-block text-[11px] font-mono-nums px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 font-medium">
            ⌘K
          </span>
          <span className="text-xs font-mono-nums text-zinc-700 dark:text-zinc-300 font-medium">
            {resultsCount} <span className="text-zinc-400 dark:text-zinc-500">/ {totalCount}</span>
          </span>
        </div>
      </div>

      {showHistoryDropdown && recentSearches.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-2 animate-in fade-in"
        >
          <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              Nedávná hledání
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearRecentSearches();
                setShowHistoryDropdown(false);
              }}
              className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Vymazat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-48 overflow-y-auto">
            {recentSearches.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectRecentSearch(item.query);
                  setShowHistoryDropdown(false);
                }}
                className="flex items-center justify-between px-2.5 py-1.5 text-xs text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 rounded-lg text-left transition-colors cursor-pointer group"
              >
                <span className="flex items-center gap-2 truncate">
                  <Clock className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 shrink-0" />
                  <span className="truncate">{item.query}</span>
                </span>
                <span className="text-[10px] font-mono-nums text-zinc-400 dark:text-zinc-500 shrink-0">
                  {item.resultsCount} nalezeno
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Search Chips */}
      <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 no-scrollbar text-xs">
        <span className="text-zinc-500 font-medium shrink-0">Filtry:</span>
        {QUICK_SEARCH_TAGS.map((tag) => (
          <button
            key={tag.query}
            onClick={() => onChange(tag.query)}
            className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              value === tag.query
                ? 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-950 font-medium shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/80'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
};
