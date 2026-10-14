import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { soundManager } from './game/audio';
import { runLevelSolvabilityValidation } from './game/verifyLevels';
import { SaveManager } from './game/saveManager';
import { GameState, SaveData } from './types/game';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { InGameHUD } from './components/InGameHUD';
import { VictoryModal } from './components/VictoryModal';
import { FailureModal } from './components/FailureModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // React State for UI overlays
  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [saveData, setSaveData] = useState<SaveData>(() => SaveManager.load());
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [attempts, setAttempts] = useState<number>(1);
  const [chargeRatio, setChargeRatio] = useState<number>(0);
  const [chargeSeconds, setChargeSeconds] = useState<number>(0);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [landingFeedback, setLandingFeedback] = useState<string | null>(null);

  // Failure and near miss state
  const [nearMissDistance, setNearMissDistance] = useState<number | null>(null);
  const [funnyQuote, setFunnyQuote] = useState<string>('YOK ARTIK!');

  const [currentObstacle, setCurrentObstacle] = useState<number>(1);
  const [totalObstacles, setTotalObstacles] = useState<number>(10);

  // Settings & Navigation Overlays
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Initialize Audio & Save Data
  useEffect(() => {
    // Run developer solvability verification
    runLevelSolvabilityValidation();

    soundManager.setSfxEnabled(saveData.settings.sfx);
    soundManager.setMusicEnabled(saveData.settings.music);
  }, []);

  // Initialize Game Engine on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, {
      onStateChange: (state) => {
        setGameState(state);
        if (state === 'CHARGING') {
          setIsCharging(true);
        } else {
          setIsCharging(false);
          if (state !== 'AIRBORNE') {
            setChargeRatio(0);
          }
        }
      },
      onChargeUpdate: (ratio, seconds) => {
        setChargeRatio(ratio);
        setChargeSeconds(seconds);
      },
      onLandingFeedback: (feedback) => {
        setLandingFeedback(feedback);
        setTimeout(() => setLandingFeedback(null), 1200);
      },
      onAttemptsChange: (newAttempts) => {
        setAttempts(newAttempts);
      },
      onProgressChange: (curr, total) => {
        setCurrentObstacle(curr);
        setTotalObstacles(total);
      },
      onFailure: (nearMissDist, quote, currentAttempts) => {
        setNearMissDistance(nearMissDist);
        setFunnyQuote(quote);
        setAttempts(currentAttempts);
      },
      onLevelComplete: (levelId, finalAttempts) => {
        const updatedSave = SaveManager.recordLevelCompletion(levelId, finalAttempts);
        setSaveData(updatedSave);
      },
    });

    engine.particles.reducedMotion = saveData.settings.reducedMotion;
    engine.init();
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Resize listener for crisp canvas DPI rendering
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Keyboard Controls: SPACE to charge/jump, R to restart, ESC to pause
  useEffect(() => {
    let spaceDown = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!spaceDown && engineRef.current && engineRef.current.state === 'PLAYING') {
          spaceDown = true;
          engineRef.current.startCharging();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        if (engineRef.current && (engineRef.current.state === 'PLAYING' || engineRef.current.state === 'FAILURE')) {
          engineRef.current.restartCurrentLevel();
        }
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (engineRef.current) {
          if (engineRef.current.state === 'PLAYING' || engineRef.current.state === 'CHARGING') {
            engineRef.current.pause();
          } else if (engineRef.current.state === 'PAUSED') {
            engineRef.current.resume();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (spaceDown && engineRef.current && engineRef.current.state === 'CHARGING') {
          spaceDown = false;
          engineRef.current.releaseJump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pointer interaction on canvas (Mobile & Mouse)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    // Only handle primary pointer
    if (!e.isPrimary) return;
    if (engineRef.current && engineRef.current.state === 'PLAYING') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      engineRef.current.startCharging();
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!e.isPrimary) return;
    if (engineRef.current && engineRef.current.state === 'CHARGING') {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      engineRef.current.releaseJump();
    }
  }, []);

  const handlePointerCancel = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!e.isPrimary) return;
    if (engineRef.current && engineRef.current.state === 'CHARGING') {
      engineRef.current.releaseJump();
    }
  }, []);

  // UI Handlers
  const handleStartPlay = () => {
    if (!engineRef.current) return;
    const targetLevel = saveData.highestUnlockedLevel;
    setCurrentLevelId(targetLevel);
    engineRef.current.loadLevel(targetLevel);
    engineRef.current.setState('PLAYING');
    setShowLevelSelect(false);
  };

  const handleSelectLevel = (levelId: number) => {
    if (!engineRef.current) return;
    setCurrentLevelId(levelId);
    engineRef.current.loadLevel(levelId);
    engineRef.current.setState('PLAYING');
    setShowLevelSelect(false);
  };

  const handleNextLevel = () => {
    if (!engineRef.current) return;
    const next = Math.min(10, currentLevelId + 1);
    setCurrentLevelId(next);
    engineRef.current.loadLevel(next);
    engineRef.current.setState('PLAYING');
  };

  const handleReplayLevel = () => {
    if (!engineRef.current) return;
    engineRef.current.restartCurrentLevel();
  };

  const handleUpdateSettings = (newSettings: Partial<SaveData['settings']>) => {
    const updated = SaveManager.updateSettings(newSettings);
    setSaveData(updated);

    if (newSettings.sfx !== undefined) {
      soundManager.setSfxEnabled(newSettings.sfx);
    }
    if (newSettings.music !== undefined) {
      soundManager.setMusicEnabled(newSettings.music);
    }
    if (newSettings.reducedMotion !== undefined && engineRef.current) {
      engineRef.current.particles.reducedMotion = newSettings.reducedMotion;
    }
  };

  const handleResetProgress = () => {
    const fresh = SaveManager.resetProgress();
    setSaveData(fresh);
    setCurrentLevelId(1);
    if (engineRef.current) {
      engineRef.current.loadLevel(1);
      engineRef.current.setState('MAIN_MENU');
    }
  };

  const currentLevelDef = engineRef.current ? engineRef.current.currentLevel : undefined;

  return (
    <main className="w-full h-dvh bg-slate-950 flex items-center justify-center overflow-hidden p-0 sm:p-4 select-none touch-none">
      {/* 9:16 Portrait Aspect-Ratio Device Container */}
      <div className="relative w-full h-full max-w-[420px] max-h-[860px] sm:aspect-[9/16] bg-slate-900 sm:rounded-3xl shadow-2xl sm:border sm:border-white/15 overflow-hidden flex flex-col">
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none block"
        />

        {/* HUD Overlay (Active during gameplay) */}
        {currentLevelDef &&
          (gameState === 'PLAYING' ||
            gameState === 'CHARGING' ||
            gameState === 'AIRBORNE' ||
            gameState === 'LANDING') && (
            <InGameHUD
              level={currentLevelDef}
              attempts={attempts}
              chargeRatio={chargeRatio}
              chargeSeconds={chargeSeconds}
              isCharging={isCharging}
              landingFeedback={landingFeedback}
              currentObstacle={currentObstacle}
              totalObstacles={totalObstacles}
              onPause={() => engineRef.current?.pause()}
              onRestart={() => engineRef.current?.restartCurrentLevel()}
            />
          )}

        {/* Main Menu Screen */}
        {gameState === 'MAIN_MENU' && !showLevelSelect && !showSettings && (
          <MainMenu
            saveData={saveData}
            onPlay={handleStartPlay}
            onOpenLevels={() => setShowLevelSelect(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {/* Level Selection Modal */}
        {showLevelSelect && (
          <LevelSelect
            saveData={saveData}
            onSelectLevel={handleSelectLevel}
            onBack={() => setShowLevelSelect(false)}
          />
        )}

        {/* Victory Modal */}
        {gameState === 'VICTORY' && (
          <VictoryModal
            levelId={currentLevelId}
            attempts={attempts}
            onNextLevel={handleNextLevel}
            onReplay={handleReplayLevel}
            onOpenLevels={() => {
              setShowLevelSelect(true);
              engineRef.current?.setState('LEVEL_SELECT');
            }}
          />
        )}

        {/* Failure & Near Miss Modal */}
        {gameState === 'FAILURE' && (
          <FailureModal
            nearMissDistance={nearMissDistance}
            funnyQuote={funnyQuote}
            attempts={attempts}
            onRetry={handleReplayLevel}
            onOpenLevels={() => {
              setShowLevelSelect(true);
              engineRef.current?.setState('LEVEL_SELECT');
            }}
          />
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && !showSettings && (
          <PauseModal
            onResume={() => engineRef.current?.resume()}
            onRestart={() => engineRef.current?.restartCurrentLevel()}
            onOpenLevels={() => {
              setShowLevelSelect(true);
              engineRef.current?.setState('LEVEL_SELECT');
            }}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            settings={saveData.settings}
            onUpdateSettings={handleUpdateSettings}
            onResetProgress={handleResetProgress}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </main>
  );
};

export default App;
