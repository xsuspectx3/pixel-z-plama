import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Eye, Trash2, X, AlertTriangle } from 'lucide-react';
import { SaveData } from '../types/game';
import { soundManager } from '../game/audio';

interface SettingsModalProps {
  settings: SaveData['settings'];
  onUpdateSettings: (newSettings: Partial<SaveData['settings']>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xs p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-white/20 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-indigo-300 bg-clip-text text-transparent">
            AYARLAR
          </h3>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles */}
        <div className="py-4 space-y-3">
          {/* SFX */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              {settings.sfx ? (
                <Volume2 className="w-5 h-5 text-pink-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <span className="text-sm font-semibold block">Ses Efektleri</span>
                <span className="text-[10px] text-slate-400">Zıplama ve iniş sesleri</span>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onUpdateSettings({ sfx: !settings.sfx });
              }}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                settings.sfx ? 'bg-pink-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
                  settings.sfx ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Music className={`w-5 h-5 ${settings.music ? 'text-purple-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-sm font-semibold block">Müzik</span>
                <span className="text-[10px] text-slate-400">Hafif arka plan melodisi</span>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onUpdateSettings({ music: !settings.music });
              }}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                settings.music ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
                  settings.music ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Eye className={`w-5 h-5 ${settings.reducedMotion ? 'text-amber-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-sm font-semibold block">Azaltılmış Hareket</span>
                <span className="text-[10px] text-slate-400">Titreşim ve parçacıkları kıs</span>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onUpdateSettings({ reducedMotion: !settings.reducedMotion });
              }}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                settings.reducedMotion ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
                  settings.reducedMotion ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Progress Section */}
        <div className="pt-2 border-t border-white/10">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-98 border border-rose-500/20 text-rose-300 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>İlerlemeyi Sıfırla</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-center animate-in fade-in">
              <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Emin misin?</span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2.5">
                Bütün seviye ve rekorların silinecek.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onResetProgress();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Evet, Sıfırla
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
