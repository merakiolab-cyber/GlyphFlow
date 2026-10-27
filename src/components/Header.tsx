import React from 'react';
import { Sun, Moon, Sparkles, Layers, Type } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';

interface HeaderProps {
  activeView: 'catalog' | 'icons' | 'typography' | 'favorites' | 'history' | 'scratchpad' | 'sync';
  setActiveView: (view: 'catalog' | 'icons' | 'typography' | 'favorites' | 'history' | 'scratchpad' | 'sync') => void;
  favoritesCount: number;
  scratchpadCount: number;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenExportStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  favoritesCount,
  scratchpadCount,
  theme,
  setTheme,
  onOpenExportStudio,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-3 transition-colors shrink-0 shadow-xs dark:shadow-none">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Zone 1: Minimal Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveView('catalog')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700/60 flex items-center justify-center font-mono-nums font-semibold text-white dark:text-zinc-100 text-sm group-hover:border-cyan-500 transition-colors shadow-xs">
              Ω
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-600 dark:group-hover:text-white transition-colors whitespace-nowrap">
              GlyphFlow
            </span>
          </button>
          <div className="hidden sm:block ml-1">
            <OfflineIndicator />
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <button
            onClick={() => setActiveView('catalog')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeView === 'catalog'
                ? 'text-zinc-950 dark:text-white font-semibold border-b-2 border-zinc-950 dark:border-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent'
            }`}
          >
            Mapa znaků & Emojis
          </button>

          <button
            onClick={() => setActiveView('icons')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeView === 'icons'
                ? 'text-zinc-950 dark:text-white font-semibold border-b-2 border-zinc-950 dark:border-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Knihovna ikon (1600+)</span>
          </button>

          <button
            onClick={() => setActiveView('typography')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeView === 'typography'
                ? 'text-zinc-950 dark:text-white font-semibold border-b-2 border-zinc-950 dark:border-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Typografie & OpenType</span>
          </button>

          <button
            onClick={() => setActiveView('favorites')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeView === 'favorites'
                ? 'text-zinc-950 dark:text-white font-semibold border-b-2 border-zinc-950 dark:border-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent'
            }`}
          >
            <span>Oblíbené</span>
            {favoritesCount > 0 && (
              <span className="text-[10px] font-mono-nums px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded font-medium">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('scratchpad')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeView === 'scratchpad'
                ? 'text-zinc-950 dark:text-white font-semibold border-b-2 border-zinc-950 dark:border-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent'
            }`}
          >
            <span>Schránka</span>
            {scratchpadCount > 0 && (
              <span className="text-[10px] font-mono-nums px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded font-medium">
                {scratchpadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('history')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeView === 'history'
                ? 'text-zinc-950 dark:text-white font-semibold border-b-2 border-zinc-950 dark:border-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent'
            }`}
          >
            Historie
          </button>
        </nav>

        {/* Zone 3: Actions & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          <button
            onClick={onOpenExportStudio}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs dark:shadow-none"
            title="Export do SVG / PNG"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-zinc-400" />
            <span>Export SVG/PNG</span>
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-300 dark:border-zinc-800 shadow-xs dark:shadow-none"
            title={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-800" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav Row */}
      <div className="flex md:hidden items-center justify-around gap-2 pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800/60 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveView('catalog')}
          className={`py-1 px-2 font-medium whitespace-nowrap ${
            activeView === 'catalog'
              ? 'text-zinc-950 dark:text-white font-semibold'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Znaky
        </button>
        <button
          onClick={() => setActiveView('icons')}
          className={`py-1 px-2 font-medium whitespace-nowrap ${
            activeView === 'icons'
              ? 'text-zinc-950 dark:text-white font-semibold'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Ikony
        </button>
        <button
          onClick={() => setActiveView('typography')}
          className={`py-1 px-2 font-medium whitespace-nowrap ${
            activeView === 'typography'
              ? 'text-zinc-950 dark:text-white font-semibold'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Typografie
        </button>
        <button
          onClick={() => setActiveView('favorites')}
          className={`py-1 px-2 font-medium whitespace-nowrap ${
            activeView === 'favorites'
              ? 'text-zinc-950 dark:text-white font-semibold'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Oblíbené {favoritesCount > 0 && `(${favoritesCount})`}
        </button>
        <button
          onClick={() => setActiveView('scratchpad')}
          className={`py-1 px-2 font-medium whitespace-nowrap ${
            activeView === 'scratchpad'
              ? 'text-zinc-950 dark:text-white font-semibold'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Schránka
        </button>
        <button
          onClick={() => setActiveView('history')}
          className={`py-1 px-2 font-medium whitespace-nowrap ${
            activeView === 'history'
              ? 'text-zinc-950 dark:text-white font-semibold'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Historie
        </button>
      </div>
    </header>
  );
};
