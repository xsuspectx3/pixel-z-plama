import React from 'react';
import { Pause, RotateCcw, Zap, Flag } from 'lucide-react';
import { LevelDefinition } from '../types/game';
import { soundManager } from '../game/audio';

interface InGameHUDProps {
  level: LevelDefinition;
  attempts: number;
  chargeRatio: number;
  chargeSeconds: number;
  isCharging: boolean;
  landingFeedback: string | null;
  currentObstacle: number;
  totalObstacles: number;
  onPause: () => void;
  onRestart: () => void;
}

export const InGameHUD: React.FC<InGameHUDProps> = ({
  level,
  attempts,
  chargeRatio,
  isCharging,
  landingFeedback,
  currentObstacle,
  totalObstacles,
  onPause,
  onRestart,
}) => {
  const progressPercent = Math.min(100, Math.round((currentObstacle / Math.max(1, totalObstacles)) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3.5 z-10">
      {/* Top Header Bar & Progress Tracker */}
      <div className="w-full flex flex-col gap-1.5 pointer-events-auto">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Level Info */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/75 border border-white/15 backdrop-blur-md text-white shadow-sm">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">
                Seviye {level.id}
              </span>
              <span className="text-xs font-bold text-white block -mt-0.5">
                {level.name}
              </span>
            </div>

            {/* Attempt counter */}
            <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/65 border border-white/10 backdrop-blur-md text-xs font-semibold text-slate-300">
              Deneme: <span className="text-white font-bold">#{attempts}</span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundManager.playClick();
                onRestart();
              }}
              className="p-2.5 rounded-xl bg-slate-900/75 hover:bg-slate-900/95 active:scale-95 transition border border-white/15 text-white/90 shadow-sm cursor-pointer"
              title="Yeniden Başlat (R)"
              aria-label="Yeniden Başlat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onPause();
              }}
              className="p-2.5 rounded-xl bg-slate-900/75 hover:bg-slate-900/95 active:scale-95 transition border border-white/15 text-white/90 shadow-sm cursor-pointer"
              title="Duraklat (ESC)"
              aria-label="Duraklat"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Level Platform Progress Tracker */}
        <div className="w-full px-3 py-1.5 rounded-xl bg-slate-900/75 border border-white/10 backdrop-blur-md flex items-center gap-2.5 shadow-sm">
          <div className="flex items-center gap-1 text-[10px] font-bold text-pink-300 shrink-0">
            <span>ENGEL</span>
          </div>

          <div className="flex-1 h-2 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-1 shrink-0 text-xs font-black text-emerald-400">
            <span>{currentObstacle}/{totalObstacles}</span>
            <Flag className="w-3.5 h-3.5 text-amber-400 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Center Landing Quality Feedback Pop */}
      {landingFeedback && (
        <div className="self-center animate-bounce">
          <div
            className={`px-4 py-1.5 rounded-full font-black text-sm tracking-wider shadow-lg backdrop-blur-md border ${
              landingFeedback === 'MÜKEMMEL!'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/40'
                : landingFeedback === 'HARİKA!'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30'
                : 'bg-rose-500 text-white border-rose-400 shadow-rose-500/30'
            }`}
          >
            {landingFeedback}
          </div>
        </div>
      )}

      {/* Bottom Area: Charging Bar & Tutorial Tip */}
      <div className="w-full flex flex-col items-center gap-2 pb-2">
        {/* Charging Power Meter (Active while holding) */}
        {isCharging && (
          <div className="w-full max-w-xs px-4 py-2 rounded-2xl bg-slate-950/85 border border-white/20 backdrop-blur-md shadow-xl flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-center text-xs font-bold text-white">
              <span className="flex items-center gap-1 text-pink-400">
                <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
                GÜÇ ŞARJI
              </span>
              <span className={chargeRatio >= 0.98 ? 'text-amber-300 animate-pulse' : 'text-slate-300'}>
                %{Math.round(chargeRatio * 100)} {chargeRatio >= 0.98 ? '(MAX)' : ''}
              </span>
            </div>

            {/* Gauge Bar */}
            <div className="w-full h-3 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  chargeRatio >= 0.98
                    ? 'bg-gradient-to-r from-pink-500 via-amber-400 to-yellow-300 shadow-lg shadow-amber-400/50'
                    : 'bg-gradient-to-r from-pink-500 to-rose-400'
                }`}
                style={{ width: `${Math.max(4, Math.min(100, chargeRatio * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Tutorial / Tip Banner */}
        <div className="px-3.5 py-1.5 rounded-full bg-slate-900/65 border border-white/10 backdrop-blur-xs text-[11px] font-medium text-slate-300 shadow-sm text-center max-w-xs">
          {level.tip}
        </div>

        {/* Desktop Controls Info (Subtle) */}
        <div className="hidden sm:block text-[10px] text-slate-400/80">
          Boşluk / Dokun: Güç Topla & Zıpla • R: Baştan Başla • ESC: Duraklat
        </div>
      </div>
    </div>
  );
};
