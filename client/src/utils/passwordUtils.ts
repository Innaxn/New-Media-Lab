import type { PasswordRule } from '../api/types';

export function evaluateRule(password: string, rule: PasswordRule): boolean {
  if (!rule.regex) return true;
  try { return new RegExp(rule.regex).test(password); }
  catch { return false; }
}

export function evaluateRules(password: string, rules: PasswordRule[]): Record<string, boolean> {
  return Object.fromEntries(rules.map(r => [r.regex + r.description, evaluateRule(password, r)]));
}

export function scorePassword(password: string, rules: PasswordRule[]): number {
  if (password.length === 0) return 0;
  const passed = rules.filter(r => evaluateRule(password, r)).length;
  return Math.round((passed / Math.max(rules.length, 1)) * 5);
}

export function estimateCrackTime(pw: string): string {
  if (!pw) return '—';
  let c = 0;
  if (/[a-z]/.test(pw)) c += 26;
  if (/[A-Z]/.test(pw)) c += 26;
  if (/[0-9]/.test(pw)) c += 10;
  if (/[^A-Za-z0-9]/.test(pw)) c += 32;
  c = Math.max(c, 26);
  const s = Math.pow(c, pw.length) / 1e10;
  if (s < 1)        return 'instantly';
  if (s < 60)       return `${Math.round(s)}s`;
  if (s < 3600)     return `${Math.round(s / 60)} min`;
  if (s < 86400)    return `${Math.round(s / 3600)} hrs`;
  if (s < 31536000) return `${Math.round(s / 86400)} days`;
  if (s < 3.15e9)   return `${Math.round(s / 31536000)} yrs`;
  return 'centuries';
}

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const STRENGTH_COLORS_LIGHT = ['#d94f3d', '#e07020', '#b06a00', '#5a8a00', '#0d7a55', '#0d7a55'];
const STRENGTH_COLORS_DARK  = ['#f85149', '#ff8c00', '#d29922', '#8aff00', '#00ff9d', '#00ff9d'];

export function getStrengthInfo(password: string, rules: PasswordRule[], dark = false) {
  const level = scorePassword(password, rules);
  const colors = dark ? STRENGTH_COLORS_DARK : STRENGTH_COLORS_LIGHT;
  if (password.length === 0) return { level: 0, label: 'Start typing…', color: '#a09890', crackTime: '—' };
  return { level, label: STRENGTH_LABELS[level] ?? 'Unknown', color: colors[level] ?? '#a09890', crackTime: estimateCrackTime(password) };
}

export function evaluatePassphrase(words: string[], minWords: number, dark = false) {
  const bits  = Math.round(words.length * Math.log2(100));
  const crack = estimateCrackTime(words.join('-'));
  const colors = dark ? STRENGTH_COLORS_DARK : STRENGTH_COLORS_LIGHT;
  let label = 'Start adding words', ci = 0;
  if (words.length >= 1 && words.length < 2)     { label = 'Too short';          ci = 0; }
  else if (words.length >= 2 && words.length < minWords) { label = 'Getting there…';   ci = 1; }
  else if (words.length === minWords)              { label = 'Good passphrase';   ci = 3; }
  else if (words.length > minWords)                { label = 'Excellent!';        ci = 4; }
  return { bits, crackTime: crack, label, color: colors[ci], ready: words.length >= minWords };
}
