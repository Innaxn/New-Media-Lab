export type {
  PasswordRule,
  PasswordBuildConfig,
  SpotWeakConfig,
  PassphraseConfig,
  CookieLevelConfig,
  DarkPatternTarget,
  DarkPatternType,
  CookieLevelDifficulty,
  GameConfig,
} from "./api/types";

export type StageId = 0 | 1 | 2 | 3;

export interface PasswordCriteria {
  [ruleId: string]: boolean;
}

export type StrengthLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface StrengthInfo {
  level: StrengthLevel;
  label: string;
  color: string;
  crackTime: string;
}

export interface PassphraseStrength {
  bits: number;
  crackTime: string;
  label: string;
  color: string;
  ready: boolean;
}

export type SelectionState = "idle" | "correct" | "wrong";

export interface StageResult {
  stageId: StageId;
  passed: boolean;
  pointsEarned: number;
}

export interface GameState {
  currentStage: StageId;
  stagesCompleted: boolean[];
  totalScore: number;
  results: StageResult[];
}

export type GameSection = "home" | "password" | "cookies";

export interface PlayerProgress {
  passwordCompleted: boolean;
  cookiesCompleted: boolean;
  totalXP: number;
}
