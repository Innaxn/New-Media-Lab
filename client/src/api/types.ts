// ─────────────────────────────────────────────────────────────────────────────
// Glass House — API Contract
//
// Matches the backend BNF spec from Back-Front_End_Communication.pdf.
// Every field the backend sends is typed here.
// ─────────────────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';

// ─── Shared across question types ────────────────────────────────────────────

export type QuestionType =
  | 'multiple_choice'
  | 'build_a_password'
  | 'build_a_passphrase'
  | 'spot_the_weakest_password'
  | 'phish_or_legit'
  | 'cookie_banners';

// ─── Multiple Choice ──────────────────────────────────────────────────────────

export interface MultipleChoiceQuestion {
  id: number;
  type: 'multiple_choice';
  question: string;
  options: string[];
  correct_index: number;
  difficulty: Difficulty;
  hint: string;
}

// ─── Build a Password ─────────────────────────────────────────────────────────

export interface PasswordRule {
  regex: string;       // JS-compatible regex string, e.g. "[A-Z]"
  description: string; // Human-readable label for the checklist
}

export interface BuildPasswordQuestion {
  id: number;
  type: 'build_a_password';
  question: string;    // Optional prompt / challenge framing
  difficulty: Difficulty;
  rules: PasswordRule[];
}

// ─── Build a Passphrase ───────────────────────────────────────────────────────

export interface BuildPassphraseQuestion {
  id: number;
  type: 'build_a_passphrase';
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
  explanation: string;  // shown in debrief for all candidates
  entropy_label: string; // e.g. "~6 bits"
}

export interface SpotWeakestQuestion {
  id: number;
  type: 'spot_the_weakest_password';
  difficulty: Difficulty;
  scenario: string;        // context paragraph shown above the lineup
  candidates: PasswordCandidate[];
  hint: string;            // shown after a wrong attempt
}

// ─── Phish or Legit ───────────────────────────────────────────────────────────

export type EmailBodyBlockType = 'text' | 'link' | 'button' | 'divider';
export type PhishingFocusArea  = 'headers' | 'body' | 'full';

export interface EmailHeaders {
  from_name:    string;
  from_address: string;
  reply_to?:    string;
  to:           string;
  date:         string;
  subject:      string;
}

export interface EmailBodyBlock {
  type:     EmailBodyBlockType;
  content?: string;
  href?:    string;
  urgent?:  boolean;
}

export interface PhishingClue {
  label:       string;
  explanation: string;
}

export interface PhishingEmail {
  id:          string;
  is_phishing: boolean;
  focus_area:  PhishingFocusArea;
  headers:     EmailHeaders;
  body?:       EmailBodyBlock[];
  clues:       PhishingClue[];
  explanation: string;
  xp_reward:   number;
}

export interface PhishOrLegitQuestion {
  id:             number;
  type:           'phish_or_legit';
  difficulty:     Difficulty;
  instruction:    string;
  teaching_point: string;
  emails:         PhishingEmail[];
}

// ─── Cookie Banners ───────────────────────────────────────────────────────────
// Cookie banner games are 100% frontend-driven.
// The backend only sends the date and question_type = 'cookie_banners'.
// The frontend picks one easy/medium/hard level from its own bank.

export interface CookieBannersQuestion {
  id:         number;
  type:       'cookie_banners';
  difficulty: Difficulty;
}

// ─── Root document (Game of the Day) ─────────────────────────────────────────
// All question types can appear together in one day's questions array.
// There will always be 3 questions — one per difficulty level.

export type AnyQuestion =
  | MultipleChoiceQuestion
  | BuildPasswordQuestion
  | BuildPassphraseQuestion
  | SpotWeakestQuestion
  | PhishOrLegitQuestion
  | CookieBannersQuestion;

export interface GameOfTheDay {
  date:          string;       // "YYYY-MM-DD"
  question_type: QuestionType; // global type — determines which game component to load
  questions:     AnyQuestion[];
}
