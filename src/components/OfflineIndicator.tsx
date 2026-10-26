import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono-nums text-zinc-400 bg-zinc-800/40 border border-zinc-700/40 rounded">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
        <span>Offline připraveno</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 px-3.5 py-2 text-xs shadow-xl backdrop-blur-md">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Režim offline — používá se lokální paměť</span>
    </div>
  );
};
