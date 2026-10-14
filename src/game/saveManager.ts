import { SaveData } from '../types/game';

const SAVE_KEY = 'bir_piksel_kaldi_save_v1';

const DEFAULT_SAVE: SaveData = {
  highestUnlockedLevel: 1,
  completedLevels: {},
  settings: {
    sfx: true,
    music: true,
    reducedMotion: false,
  },
};

export class SaveManager {
  private static cachedData: SaveData | null = null;

  public static load(): SaveData {
    if (this.cachedData) return this.cachedData;

    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        this.cachedData = { ...DEFAULT_SAVE };
        return this.cachedData;
      }
      const parsed = JSON.parse(raw);
      this.cachedData = {
        highestUnlockedLevel: Math.max(1, Math.min(10, Number(parsed.highestUnlockedLevel) || 1)),
        completedLevels: parsed.completedLevels && typeof parsed.completedLevels === 'object' ? parsed.completedLevels : {},
        settings: {
          sfx: parsed.settings?.sfx !== false,
          music: parsed.settings?.music !== false,
          reducedMotion: Boolean(parsed.settings?.reducedMotion),
        },
      };
      return this.cachedData;
    } catch {
      this.cachedData = { ...DEFAULT_SAVE };
      return this.cachedData;
    }
  }

  public static save(data: SaveData): void {
    this.cachedData = data;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save progress to localStorage', e);
    }
  }

  public static recordLevelCompletion(levelId: number, attempts: number): SaveData {
    const current = this.load();
    const existing = current.completedLevels[levelId];
    const best = existing ? Math.min(existing.bestAttempts, attempts) : attempts;

    const nextLevel = Math.min(10, Math.max(current.highestUnlockedLevel, levelId + 1));

    const updated: SaveData = {
      ...current,
      highestUnlockedLevel: nextLevel,
      completedLevels: {
        ...current.completedLevels,
        [levelId]: {
          completed: true,
          bestAttempts: best,
        },
      },
    };

    this.save(updated);
    return updated;
  }

  public static updateSettings(settings: Partial<SaveData['settings']>): SaveData {
    const current = this.load();
    const updated: SaveData = {
      ...current,
      settings: {
        ...current.settings,
        ...settings,
      },
    };
    this.save(updated);
    return updated;
  }

  public static resetProgress(): SaveData {
    const fresh: SaveData = {
      highestUnlockedLevel: 1,
      completedLevels: {},
      settings: this.load().settings,
    };
    this.save(fresh);
    return fresh;
  }
}
