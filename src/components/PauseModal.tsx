import React from 'react';
import { Play, RotateCcw, Grid, Settings as SettingsIcon } from 'lucide-react';
import { soundManager } from '../game/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenLevels: () => void;
  onOpenSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenLevels,
  onOpenSettings,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xs p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-white/20 shadow-2xl text-white text-center flex flex-col items-center">
        <h3 className="text-2xl font-black tracking-tight mb-1 bg-gradient-to-r from-pink-400 to-indigo-300 bg-clip-text text-transparent">
          OYUN DURAKLATILDI
        </h3>
        <p className="text-slate-400 text-xs mb-5">Bir nefes al, hazır olduğunda devam et.</p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-pink-500/30 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>DEVAM ET</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-98 border border-white/10 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeniden Başla</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenLevels();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-98 border border-white/10 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Seviye Seçimi</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-98 border border-white/10 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Ayarlar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
