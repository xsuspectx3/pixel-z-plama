import React, { useEffect } from 'react';
import { RotateCcw, Grid, Flame } from 'lucide-react';
import { soundManager } from '../game/audio';

interface FailureModalProps {
  nearMissDistance: number | null;
  funnyQuote: string;
  attempts: number;
  onRetry: () => void;
  onOpenLevels: () => void;
}

export const FailureModal: React.FC<FailureModalProps> = ({
  nearMissDistance,
  funnyQuote,
  attempts,
  onRetry,
  onOpenLevels,
}) => {
  const isNearMiss = nearMissDistance !== null && nearMissDistance > 0;

  // Allow pressing Space to instantly retry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyR' || e.key === 'Enter') {
        e.preventDefault();
        onRetry();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRetry]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xs p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-white/20 shadow-2xl text-white text-center flex flex-col items-center">
        {/* Near miss banner or comic reaction */}
        {isNearMiss ? (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-rose-500/40 animate-pulse">
              <Flame className="w-8 h-8 fill-current" />
            </div>

            <div className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
              BİR PİKSEL KALDI!
            </div>

            <h3 className="text-3xl font-black tracking-tight text-rose-400 drop-shadow-md">
              SADECE {nearMissDistance} PİKSEL!
            </h3>

            <p className="text-slate-300 text-xs mt-1">
              Milimetre farkla kaçırdın! Birazcık daha güç toplasaydın konmuştun!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Sad/Funny face icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
              <span className="text-2xl font-black">X_X</span>
            </div>

            <h3 className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-300 via-rose-300 to-indigo-200 bg-clip-text text-transparent">
              {funnyQuote}
            </h3>

            <p className="text-slate-300 text-xs mt-1">
              Sorun yok, PIKO hemen tekrar denemeye hazır!
            </p>
          </div>
        )}

        {/* Attempts counter */}
        <div className="my-3 text-xs text-slate-400">
          Toplam Deneme: <span className="font-bold text-white">#{attempts}</span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onRetry();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-pink-500/30 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TEKRAR DENE (Boşluk)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenLevels();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-98 border border-white/10 text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Seviyeler</span>
          </button>
        </div>
      </div>
    </div>
  );
};
