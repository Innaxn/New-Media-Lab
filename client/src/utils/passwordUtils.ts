/*
functions that take inputs and return calculated results. It's what the game stages call to do the actual password analysis.
- evaluateRule(password, rule, bannedPatterns)
Runs a single backend-defined rule against a password. It handles three cases — minLength checks character count, 
noCommon checks against the banned word list, and anything else uses the rule's regex pattern via new RegExp(rule.pattern).test(password).

!!!!One thing to be aware of: the backend team needs to know that pattern is treated as a JS regex string, not a Python regex or a Java regex!!!

- evaluateCriteria(password, config)
Calls evaluateRule for every rule in the backend config and returns a plain object like { minLength: true, upper: false, symbol: true, ... }. 
This drives the checklist in Stage 1 — each checkbox is green or grey based on the value for its rule id.

-scorePassword(password, config)
Counts how many rules pass, normalises that to a 0–5 scale regardless of how many rules the backend sends, and returns the number. Stage 1 uses this to decide whether the password is strong enough to proceed (>= minStrengthToPass).

-estimateCrackTime(password)
Estimates how long a brute-force attack would take at 10 billion guesses per second.

-getStrengthInfo(password, config)
Combines scorePassword and estimateCrackTime into one object { level, label, color, crackTime } that the UI consumes directly — the label ("Weak", "Good", "Strong"), the colour for the strength bar segments, and the crack time string.

-evaluatePassphrase(words, minWords)
Used by Stage 4. Takes the current list of selected words, estimates entropy in bits, gets the crack time for the joined phrase
and returns a strength object with a readiness flag (ready: true once enough words are selected) that controls whether the 
Finalise button is enabled.
The key design principle is that all the rules come from the backend config — evaluateRule and evaluateCriteria don't hardcode any password 
requirements. If the backend changes the rules (adds a "no repeating characters" rule, 
raises the minimum length to 16, changes the banned words list), the frontend picks it up 
automatically without any code changes
*/

import type { PasswordBuildConfig, PasswordRule } from "../api/types";
import type {
  PasswordCriteria,
  StrengthInfo,
  PassphraseStrength,
} from "../types";

export function evaluateRule(
  password: string,
  rule: PasswordRule,
  bannedPatterns: string[],
): boolean {
  if (rule.id === "minLength") return password.length >= (rule.value ?? 8);
  if (rule.id === "noCommon")
    return !bannedPatterns.some((w) =>
      password.toLowerCase().includes(w.toLowerCase()),
    );
  if (rule.pattern) {
    try {
      return new RegExp(rule.pattern).test(password);
    } catch {
      return false;
    }
  }
  return false;
}

export function evaluateCriteria(
  password: string,
  config: PasswordBuildConfig,
): PasswordCriteria {
  return Object.fromEntries(
    config.rules.map((rule) => [
      rule.id,
      evaluateRule(password, rule, config.bannedPatterns),
    ]),
  );
}

export function scorePassword(
  password: string,
  config: PasswordBuildConfig,
): number {
  if (password.length === 0) return 0;
  const criteria = evaluateCriteria(password, config);
  const passed = Object.values(criteria).filter(Boolean).length;
  const total = config.rules.length || 1;
  return Math.round((passed / total) * 5);
}

export function estimateCrackTime(pw: string): string {
  if (!pw) return "—";
  let c = 0;
  if (/[a-z]/.test(pw)) c += 26;
  if (/[A-Z]/.test(pw)) c += 26;
  if (/[0-9]/.test(pw)) c += 10;
  if (/[^A-Za-z0-9]/.test(pw)) c += 32;
  c = Math.max(c, 26);
  const s = Math.pow(c, pw.length) / 1e10;
  if (s < 1) return "instantly";
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  if (s < 86400) return `${Math.round(s / 3600)} hrs`;
  if (s < 31536000) return `${Math.round(s / 86400)} days`;
  if (s < 3.15e9) return `${Math.round(s / 31536000)} yrs`;
  if (s < 3.15e12) return `${Math.round(s / 3.15e9)}k yrs`;
  return "centuries";
}

const STRENGTH_LABELS = [
  "Very Weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
  "Excellent",
];
const STRENGTH_COLORS = [
  "#f85149",
  "#ff8c00",
  "#d29922",
  "#8aff00",
  "#00ff9d",
  "#00e5ff",
];

export function getStrengthInfo(
  password: string,
  config: PasswordBuildConfig,
): StrengthInfo {
  const level = scorePassword(password, config) as StrengthInfo["level"];
  if (password.length === 0)
    return {
      level: 0,
      label: "Awaiting input",
      color: "#444e5c",
      crackTime: "—",
    };
  return {
    level,
    label: STRENGTH_LABELS[level] ?? "Unknown",
    color: STRENGTH_COLORS[level] ?? "#444e5c",
    crackTime: estimateCrackTime(password),
  };
}

const PH_COLORS = ["#f85149", "#ff8c00", "#d29922", "#8aff00", "#00ff9d"];

export function evaluatePassphrase(
  words: string[],
  minWords: number,
): PassphraseStrength {
  const bits = Math.round(words.length * Math.log2(100));
  const crack = estimateCrackTime(words.join("-"));
  let label = "Start adding words",
    ci = 0;
  if (words.length >= 1 && words.length < 2) {
    label = "Too short";
    ci = 0;
  } else if (words.length >= 2 && words.length < minWords) {
    label = "Getting there…";
    ci = 1;
  } else if (words.length === minWords) {
    label = "Good passphrase";
    ci = 3;
  } else if (words.length > minWords) {
    label = "Excellent passphrase";
    ci = 4;
  }
  return {
    bits,
    crackTime: crack,
    label,
    color: PH_COLORS[ci],
    ready: words.length >= minWords,
  };
}
