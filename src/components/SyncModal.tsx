import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Share2,
  Check,
  AlertTriangle,
  Database,
  ArrowLeft,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { localDB } from '../db/indexedDb';
import { SyncData } from '../types';

interface SyncModalProps {
  onBackToCatalog: () => void;
  onDataRestored: () => void;
}

export const SyncView: React.FC<SyncModalProps> = ({
  onBackToCatalog,
  onDataRestored,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = async () => {
    try {
      const data = await localDB.exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `glyphflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setSyncStatus('Záloha byla úspěšně stažena.');
    } catch {
      setErrorMsg('Chyba při exportu zálohy.');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      await localDB.importAllData(parsed as SyncData);
      setSyncStatus('Záloha úspěšně obnovena.');
      onDataRestored();
    } catch {
      setErrorMsg('Neplatný záložní soubor nebo došlo k chybě při načítání.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const favs = await localDB.getFavorites();
      const payload = {
        f: favs.map((x) => x.char),
        v: 1,
      };
      const b64 = btoa(encodeURIComponent(JSON.stringify(payload)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?sync=${b64}`;

      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setSyncStatus('Synchronizační odkaz byl zkopírován do schránky.');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setErrorMsg('Nelze vygenerovat synchronizační odkaz.');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Opravdu chcete vymazat veškerá lokální data (oblíbené i historii)?')) {
      await localDB.clearAllData();
      onDataRestored();
      setSyncStatus('Lokální data byla vyčištěna.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
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
              <Database className="w-4 h-4 text-zinc-400" />
              <span>Lokální databáze & Záloha</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Přenos dat a offline záloha mezi zařízeními
            </p>
          </div>
        </div>
      </div>

      {syncStatus && (
        <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center gap-2.5 text-xs text-zinc-200">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{syncStatus}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-zinc-900 border border-rose-800/80 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Export */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">
              Exportovat zálohu (JSON)
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Stáhněte si kompletní offline zálohu oblíbených položek, historie a nastavení.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="w-full py-2 px-3 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Stáhnout soubor .JSON</span>
          </button>
        </div>

        {/* Card 2: Import */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">
              Obnovit ze zálohy (JSON)
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Nahrajte dříve uložený soubor se zálohou a obnovte svá data.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Vybrat soubor...</span>
          </button>
        </div>

        {/* Card 3: Shareable link */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">
              Synchronizační odkaz
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Vygenerujte rychlý odkaz obsahující oblíbené znaky pro otevření na jiném zařízení.
            </p>
          </div>
          <button
            onClick={handleGenerateShareLink}
            className="w-full py-2 px-3 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Odkaz zkopírován!' : 'Kopírovat odkaz'}</span>
          </button>
        </div>

        {/* Card 4: Clear */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">
              Vyčištění lokálních dat
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Reset lokální databáze na výchozí prázdný stav.
            </p>
          </div>
          <button
            onClick={handleClearAll}
            className="w-full py-2 px-3 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Vymazat data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
