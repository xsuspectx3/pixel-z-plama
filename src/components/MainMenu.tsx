import React from 'react';
import { Play, Grid, Settings as SettingsIcon, Trophy, Sparkles } from 'lucide-react';
import { SaveData } from '../types/game';
import { soundManager } from '../game/audio';

interface MainMenuProps {
  saveData: SaveData;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlay,
  onOpenLevels,
  onOpenSettings,
}) => {
  const completedCount = Object.keys(saveData.completedLevels).length;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-indigo-950/90 via-purple-950/85 to-slate-950/95 backdrop-blur-xs text-white">
      {/* Top Bar with high score badge */}
      <div className="w-full flex justify-between items-center max-w-sm pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold backdrop-blur-md">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{completedCount} / 10 Seviye</span>
        </div>
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition border border-white/15 text-white/90"
          aria-label="Ayarlar"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Main Title & Hero PIKO */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* Animated Cute PIKO Preview */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl shadow-pink-500/30 border-2 border-slate-100 flex flex-col items-center justify-center animate-bounce">
            {/* Eyes */}
            <div className="flex gap-4 mb-1">
              <div className="w-3 h-3 bg-slate-900 rounded-full relative">
                <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5" />
              </div>
              <div className="w-3 h-3 bg-slate-900 rounded-full relative">
                <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5" />
              </div>
            </div>
            {/* Cheeks */}
            <div className="w-full flex justify-between px-3 -mt-1">
              <div className="w-2.5 h-1.5 bg-pink-400/80 rounded-full" />
              <div className="w-2.5 h-1.5 bg-pink-400/80 rounded-full" />
            </div>
            {/* Smile */}
            <div className="w-3 h-1.5 border-b-2 border-slate-900 rounded-full mt-0.5" />
          </div>
          {/* Sparkles around Piko */}
          <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-2 -right-3 animate-pulse" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-md">
          BİR PİKSEL KALDI!
        </h1>
        <p className="text-pink-300 font-semibold text-base mt-2 tracking-wide">
          "Bir zıplama daha!"
        </p>
        <p className="text-slate-400 text-xs mt-1 max-w-xs">
          Basılı tutarak güç topla, doğru anda bırak ve platformlara kon!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-3 pb-4">
        <button
          onClick={() => {
            soundManager.playClick();
            onPlay();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-lg shadow-lg shadow-pink-500/40 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>OYNA (Seviye {saveData.highestUnlockedLevel})</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenLevels();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-98 border border-white/15 font-semibold text-base backdrop-blur-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Grid className="w-5 h-5 text-purple-300" />
          <span>SEVİYELER</span>
        </button>
      </div>
    </div>
  );
};
