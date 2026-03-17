// ─────────────────────────────────────────────────────────────────────────────
// API Contract — Glass House
//
// These types define the shape of responses the backend will send.
// The frontend is fully driven by these payloads; no hardcoded game content.
// ─────────────────────────────────────────────────────────────────────────────

// ── Password: Build Stage ────────────────────────────────────────────────────

/** A single validation rule for the password builder, sent by the backend. */
export interface PasswordRule {
  /** Unique key used to evaluate the rule on the frontend */
  id: string;
  /** Human-readable label shown in the checklist */
  label: string;
  /**
   * JS-compatible regex string (without delimiters).
   * Frontend will call `new RegExp(pattern).test(password)`.
   * Special ids: "minLength" uses `password.length >= value` instead.
   */
  pattern?: string;
  /** Used when id === "minLength" */
  value?: number;
  /** Points awarded when this criterion is met */
  points: number;
}

export interface PasswordBuildConfig {
  /** Minimum strength score (0–5) required to proceed */
  minStrengthToPass: number;
  /** Ordered list of validation rules */
  rules: PasswordRule[];
  /** Words that invalidate a password regardless of other rules */
  bannedPatterns: string[];
  /** Feedback message shown after successfully building a password */
  successMessage: string;
}

// ── Password: Spot the Weak Stage ────────────────────────────────────────────

export interface PasswordCandidate {
  id: string;
  value: string;
  /** If true, this is the weakest (the answer) */
  isWeakest: boolean;
  /** Explanation shown after the user answers */
  explanation: string;
  /** Short entropy descriptor shown in the debrief */
  entropyLabel: string;
}

export interface SpotWeakConfig {
  /** Introductory scenario text */
  scenario: string;
  candidates: PasswordCandidate[];
  /** Hint shown after a wrong attempt */
  hint: string;
}

// ── Password: Passphrase Builder Stage ───────────────────────────────────────

export interface PassphraseConfig {
  /** Pool of words the player can assemble into a passphrase */
  wordBank: string[];
  /** Minimum number of words required to pass */
  minWords: number;
  /** Separator character between words (e.g. "-", " ", ".") */
  separator: string;
  successMessage: string;
}

// ── Cookie Trap Level ─────────────────────────────────────────────────────────

export type DarkPatternType =
  | "pre_ticked"
  | "ghost_button"
  | "visual_asymmetry"
  | "fake_close"
  | "confirm_shaming"
  | "hidden_reject"
  | "forced_action"
  | "double_negative";

export interface DarkPatternTarget {
  /** Unique key for this element within the level */
  id: string;
  /** What kind of dark pattern it is */
  type: DarkPatternType;
  /** Short title shown in the debrief card */
  title: string;
  /** Full explanation shown when found */
  explanation: string;
  /** Relevant GDPR / EDPB article citation */
  legalRef: string;
}

export type CookieLevelDifficulty = "easy" | "medium" | "hard";

export interface CookieLevelConfig {
  id: string;
  title: string;
  difficulty: CookieLevelDifficulty;
  /** URL shown in the fake browser chrome */
  fakeUrl: string;
  /** Introductory instruction shown above the browser */
  instruction: string;
  /** Type of challenge */
  challengeType: "spot" | "escape";
  /** For 'escape': which button selector id is the correct reject action */
  correctActionId?: string;
  /** For 'spot': dark patterns to find */
  targets?: DarkPatternTarget[];
  /** XP rewarded on completion */
  xpReward: number;
  /** Debrief text shown at end */
  debrief: string;
}

// ── Phishing Module ───────────────────────────────────────────────────────────

export type PhishingLevelDifficulty = "easy" | "medium" | "hard";

/**
 * A single annotatable clue within an email section.
 * The frontend highlights these after the verdict is submitted.
 */
export interface PhishingClue {
  /** Short label shown in the clue badge */
  label: string;
  /** Full explanation shown in the debrief */
  explanation: string;
}

/**
 * The email header block — sender, reply-to, date, subject.
 * All fields are optional so the backend can omit ones not relevant
 * to the level's focus (e.g. a "headers only" level may omit body).
 */
export interface EmailHeaders {
  fromName: string;
  fromAddress: string;
  /** If present and different from fromAddress, shown as a red flag */
  replyTo?: string;
  to: string;
  date: string;
  subject: string;
}

/**
 * A single paragraph/block in the email body.
 * type drives rendering:
 *   'text'   — plain paragraph
 *   'link'   — anchor with a display label and a real (potentially spoofed) href
 *   'button' — CTA button
 *   'divider'— horizontal rule separator
 */
export type EmailBodyBlockType = "text" | "link" | "button" | "divider";

export interface EmailBodyBlock {
  type: EmailBodyBlockType;
  /** Main content — paragraph text, link label, button label */
  content?: string;
  /**
   * For type 'link' | 'button': the URL the element points to.
   * Shown on hover in the UI to teach URL inspection.
   */
  href?: string;
  /**
   * If true the text is rendered with urgency styling (bold + warning colour).
   * Used to highlight social engineering pressure language.
   */
  urgent?: boolean;
}

/**
 * Describes what section(s) of the email this level asks the player to
 * analyse. Drives which panels are shown/highlighted.
 *   'headers'  — focus on From / Reply-To anomalies
 *   'body'     — focus on email content and links
 *   'full'     — both sections visible, player analyses everything
 */
export type PhishingFocusArea = "headers" | "body" | "full";

/**
 * One email challenge within a phishing level.
 * The backend sends an array of these; the player judges each in sequence.
 */
export interface PhishingEmail {
  id: string;
  isPhishing: boolean;
  focusArea: PhishingFocusArea;
  headers: EmailHeaders;
  /** Omitted when focusArea === 'headers' */
  body?: EmailBodyBlock[];
  /**
   * Clues revealed in the debrief after the player submits their verdict.
   * For phishing emails: red flags. For legitimate emails: trust signals.
   */
  clues: PhishingClue[];
  /** Short explanation shown in the result card */
  explanation: string;
  /** XP awarded for a correct verdict on this email */
  xpReward: number;
}

export interface PhishingLevel {
  id: string;
  title: string;
  difficulty: PhishingLevelDifficulty;
  /** Instruction shown at the top of the level */
  instruction: string;
  /**
   * Teaching point shown before the emails start.
   * Tells the player what to look for in this level.
   */
  teachingPoint: string;
  emails: PhishingEmail[];
}

// ── Aggregated Game Config ─────────────────────────────────────────────────────

export interface GameConfig {
  passwordBuild: PasswordBuildConfig;
  spotWeak: SpotWeakConfig;
  passphrase: PassphraseConfig;
  cookieLevels: CookieLevelConfig[];
  phishingLevels: PhishingLevel[];
}

// ── API Response envelope ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
