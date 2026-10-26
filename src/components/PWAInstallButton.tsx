import React, { useState } from 'react';
import { Download, Monitor, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        title="Nainstalovat na plochu Windows"
      >
        <Monitor className="w-3.5 h-3.5 text-zinc-400" />
        <span>Instalovat pro Windows</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Přidat na plochu</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl text-zinc-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Instalace na plochu (iOS)</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                1. Klepněte na <strong>Sdílet</strong> v Safari.<br />
                2. Zvolte <strong>Přidat na plochu</strong>.<br />
                3. Aplikace funguje i zcela offline.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 text-xs font-medium bg-zinc-100 text-zinc-900 rounded-lg font-semibold hover:bg-white"
              >
                Rozumím
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => {
        alert('Aplikaci můžete na Windows nainstalovat klepnutím na ikonu instalace v adresním řádku prohlížeče Chrome nebo Edge.');
      }}
      className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/30 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      title="Instalace na Windows desktop"
    >
      <Monitor className="w-3.5 h-3.5 text-zinc-400" />
      <span>Windows App</span>
    </button>
  );
};
