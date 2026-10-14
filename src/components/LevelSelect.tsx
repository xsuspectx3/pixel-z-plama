import React from 'react';
import { ArrowLeft, Lock, Star, Play } from 'lucide-react';
import { LEVELS } from '../game/levels';
import { SaveData } from '../types/game';
import { soundManager } from '../game/audio';

interface LevelSelectProps {
  saveData: SaveData;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  saveData,
  onSelectLevel,
  onBack,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col p-4 bg-gradient-to-b from-indigo-950/95 via-purple-950/90 to-slate-950/95 backdrop-blur-md text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <button
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Menü</span>
        </button>

        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-pink-400 to-indigo-300 bg-clip-text text-transparent">
          SEVİYELER
        </h2>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-pink-300">
          {Object.keys(saveData.completedLevels).length} / 10
        </div>
      </div>

      {/* Levels Grid (Scrollable) */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
        {LEVELS.map((level) => {
          const isUnlocked = level.id <= saveData.highestUnlockedLevel;
          const completedInfo = saveData.completedLevels[level.id];
          const isCompleted = Boolean(completedInfo?.completed);

          return (
            <div
              key={level.id}
              onClick={() => {
                if (isUnlocked) {
                  soundManager.playClick();
                  onSelectLevel(level.id);
                }
              }}
              className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                isUnlocked
                  ? 'bg-white/10 hover:bg-white/15 border-white/20 active:scale-[0.99] cursor-pointer shadow-sm'
                  : 'bg-white/5 border-white/5 opacity-55 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-lg shadow-sm ${
                    isCompleted
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950'
                      : isUnlocked
                      ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {isUnlocked ? level.id : <Lock className="w-5 h-5 text-white/50" />}
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{level.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        level.difficulty === 'Çok Kolay' || level.difficulty === 'Kolay'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : level.difficulty === 'Orta'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {level.difficulty}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {level.platforms.length} Engel
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{level.tip}</p>
                </div>
              </div>

              {/* Status / Attempts */}
              <div className="flex items-center gap-2">
                {isCompleted && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current text-emerald-400" />
                    <span>{completedInfo?.bestAttempts} deneme</span>
                  </div>
                )}
                {isUnlocked && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
