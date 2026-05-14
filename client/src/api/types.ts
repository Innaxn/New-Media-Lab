// Glass House — API Contract
export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType =
  | "multiple_choice"
  | "build_a_password"
  | "build_a_passphrase"
  | "spot_the_weakest_password"
  | "phish_or_legit"
  | "cookie_banners";

// ─── Multiple Choice ──────────────────────────────────────────────────────────

export interface MultipleChoiceQuestion {
  id: number;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correct_index: number;
  hint?: string | null; // optional
}

// ─── Build a Password ─────────────────────────────────────────────────────────

export interface PasswordRule {
  regex: string;
  description: string;
}

export interface BuildPasswordQuestion {
  // id: number;
  difficulty: Difficulty;
  question: string;
  rules: PasswordRule[];
}

// ─── Build a Passphrase ───────────────────────────────────────────────────────

export interface BuildPassphraseQuestion {
  id: number;
  difficulty: Difficulty;
  word_bank: string[];
  min_words: number;
  separator: string;
  success_message: string;
}

// ─── Spot the Weakest Password ────────────────────────────────────────────────

export interface PasswordCandidate {
  id: string;
  value: string;
  is_weakest: boolean;
  explanation: string;
  entropy_label: string;
}

export interface SpotWeakestQuestion {
  id: number;
  difficulty: Difficulty;
  scenario: string;
  candidates: PasswordCandidate[];
  hint: string;
}

// ─── Phish or Legit ───────────────────────────────────────────────────────────

export type EmailBodyBlockType = "text" | "link" | "button" | "divider";
export type PhishingFocusArea = "headers" | "body" | "full";

export interface EmailHeaders {
  from_name: string;
  from_address: string;
  reply_to?: string | null;
  to: string;
  date: string;
  subject: string;
}

export interface EmailBodyBlock {
  type: EmailBodyBlockType;
  content?: string | null;
  href?: string | null;
  urgent?: boolean | null;
}

export interface PhishingClue {
  label: string;
  explanation: string;
}

export interface PhishingEmail {
  id: string;
  is_phishing: boolean;
  focus_area: PhishingFocusArea;
  headers: EmailHeaders;
  body?: EmailBodyBlock[] | null;
  clues: PhishingClue[];
  explanation: string;
}

export interface PhishOrLegitQuestion {
  id: number;
  difficulty: Difficulty;
  instruction: string;
  teaching_point: string;
  emails: PhishingEmail[];
}

// ─── Cookie Banners ───────────────────────────────────────────────────────────
// Fully frontend-driven.
// Backend sends ONLY: { "date": "YYYY-MM-DD", "question_type": "cookie_banners" }
// No questions array. Frontend picks one easy/medium/hard level from its own
// bank, seeded by the date string.

// ─── Root document ────────────────────────────────────────────────────────────
// For cookie_banners, questions will be an empty array [] or absent entirely.

export type AnyQuestion =
  | MultipleChoiceQuestion
  | BuildPasswordQuestion
  | BuildPassphraseQuestion
  | SpotWeakestQuestion
  | PhishOrLegitQuestion;

export interface GameOfTheDay {
  date: string; // "YYYY-MM-DD"
  question_type: QuestionType; // determines which game component to mount
  questions?: AnyQuestion[]; // absent or empty for cookie_banners
}
