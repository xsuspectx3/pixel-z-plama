import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, RotateCcw, Grid, Sparkles, Heart } from 'lucide-react';
import { soundManager } from '../game/audio';

interface VictoryModalProps {
  levelId: number;
  attempts: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevels: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelId,
  attempts,
  onNextLevel,
  onReplay,
  onOpenLevels,
}) => {
  const isFinalLevel = levelId === 10;

  useEffect(() => {
    // Confetti blast on victory
    try {
      confetti({
        particleCount: isFinalLevel ? 120 : 65,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#a855f7', '#38bdf8', '#fde047', '#34d399'],
      });
      if (isFinalLevel) {
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
      }
    } catch {
      // safe fallback
    }
  }, [isFinalLevel]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xs p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-white/20 shadow-2xl text-white text-center flex flex-col items-center">
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mb-4 shadow-lg shadow-amber-400/30 animate-bounce">
          {isFinalLevel ? <Heart className="w-8 h-8 fill-current text-rose-600" /> : <Trophy className="w-8 h-8 fill-current" />}
        </div>

        <h3 className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-pink-300 to-indigo-200 bg-clip-text text-transparent">
          {isFinalLevel ? "İNANILMAZ! PİKO'YU KURTARDIN!" : 'SEVİYE TAMAMLANDI!'}
        </h3>

        <p className="text-slate-300 text-xs mt-1">
          {isFinalLevel
            ? 'Bütün platformları ustalıkla aştın ve oyunu bitirdin!'
            : `Seviye ${levelId} başarıyla tamamlandı!`}
        </p>

        {/* Stats card */}
        <div className="w-full my-4 p-3 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-around text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Deneme Sayısı</span>
            <span className="text-lg font-bold text-amber-300">{attempts}</span>
          </div>
          <div className="w-px h-8 bg-white/15" />
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Performans</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-center">
              <Sparkles className="w-3.5 h-3.5" />
              {attempts === 1 ? 'Kusursuz!' : attempts <= 3 ? 'Harika!' : 'Usta!'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {!isFinalLevel ? (
            <button
              onClick={() => {
                soundManager.playClick();
                onNextLevel();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-pink-500/30 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>SONRAKİ SEVİYE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                soundManager.playClick();
                onReplay();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>BÜTÜN SEVİYELERİ TEKRAR OYNA</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onReplay();
              }}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-98 border border-white/10 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tekrar Oyna</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenLevels();
              }}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-98 border border-white/10 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Seviyeler</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
