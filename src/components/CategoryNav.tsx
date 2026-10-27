import React from 'react';
import {
  Grid,
  Star,
  Coins,
  Calculator,
  ArrowRight,
  Quote,
  Type,
  Pi,
  Square,
  Superscript,
  Sparkles,
  Command,
  Sun,
  Music,
  Zap,
  Eye,
} from 'lucide-react';
import { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  categoryCounts: Record<string, number>;
  favoritesCount: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Grid,
  Star,
  Coins,
  Calculator,
  ArrowRight,
  Quote,
  Type,
  Pi,
  Square,
  Superscript,
  Sparkles,
  Command,
  Sun,
  Music,
  Zap,
  Eye,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  favoritesCount,
}) => {
  return (
    <aside className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Kategorie
        </h2>
        <span className="text-[11px] font-mono-nums text-zinc-400 dark:text-zinc-500">
          {categories.length} sad
        </span>
      </div>

      <div className="flex flex-col gap-0.5 overflow-y-auto pr-1">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Grid;
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'favorites' ? favoritesCount : categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer group ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white font-medium shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    isSelected
                      ? 'text-white dark:text-zinc-100'
                      : 'text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300'
                  }`}
                />
                <span className="truncate">{cat.name}</span>
              </div>

              <span
                className={`text-[10px] font-mono-nums px-1.5 py-0.5 rounded transition-colors shrink-0 ml-1.5 ${
                  isSelected
                    ? 'text-zinc-200 bg-zinc-800 dark:text-zinc-200 dark:bg-zinc-700/60'
                    : 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
