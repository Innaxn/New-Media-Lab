import { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Typography, Button, Alert, LinearProgress, Chip, Fade } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { GameShell } from '../GameShell';
import { LevelPicker } from '../LevelPicker';
import type { Difficulty } from '../../api/types';

const INFO_TEXT = `Cookie banners are those popups you see on almost every website asking if you agree to "cookies".

What are cookies?
Cookies are small files websites save on your device to remember things about you — like that you're logged in, or which products you looked at. Some cookies are necessary for the site to work. Others track your behaviour across the internet to show you targeted ads.

You have the right to say no to tracking cookies. But many websites make it very hard to do so — they use tricks called "dark patterns":
• The "Accept All" button is big and green, while "Reject" is tiny and grey.
• The ✕ button looks like it closes the banner but actually accepts all cookies.
• Confusing language like "Don't uncheck to disable" — designed to make you give up.
• Multi-step flows that make you click through several screens to say no.

In Europe, these tricks are against the law. In this challenge you will learn to recognise and avoid them.`;


// ─── Cookie banner dark-pattern level definition ──────────────────────────────

interface CookieLevel {
  difficulty: Difficulty;
  title:      string;
  instruction: string;
  BannerComponent: React.ComponentType<BannerProps>;
  debrief:    string;
}

interface BannerProps {
  onCorrect: () => void;
  onWrong:   () => void;
  disabled:  boolean;
}

// ─── Easy: ghost button ───────────────────────────────────────────────────────

function BannerEasy1({ onCorrect, onWrong, disabled }: BannerProps) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const isDark = theme.palette.mode === 'dark';
  const base = { border: 'none', borderRadius: '6px', cursor: disabled ? 'default' : 'pointer', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: '0.8125rem', transition: 'all 0.15s', pointerEvents: disabled ? 'none' as const : 'auto' as const };

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontSize: '0.75rem', color: isDark ? p.inkSoft : '#4a5568', mb: 1.5, lineHeight: 1.6 }}>
        We use cookies to personalise content and analyse traffic.{' '}
        <Box component="span" sx={{ color: '#2563eb', textDecoration: 'underline', fontSize: '0.7rem', cursor: 'pointer' }}>Privacy Policy</Box>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box component="button" onClick={onWrong}
          sx={{ ...base, bgcolor: p.primary, color: '#fff', px: 2.5, py: 1, '&:hover': { opacity: 0.85 } }}>
          Accept All
        </Box>
        {/* Ghost reject — deliberately hard to see */}
        <Box component="button" onClick={onCorrect}
          sx={{ ...base, background: 'none', color: isDark ? '#555' : '#bbb', fontSize: '0.65rem', textDecoration: 'underline', p: 0 }}>
          manage preferences
        </Box>
      </Box>
    </Box>
  );
}

// ─── Easy: fake ✕ ─────────────────────────────────────────────────────────────

function BannerEasy2({ onCorrect, onWrong, disabled }: BannerProps) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const isDark = theme.palette.mode === 'dark';
  const base = { border: 'none', borderRadius: '6px', cursor: disabled ? 'default' : 'pointer', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: '0.8125rem', transition: 'all 0.15s', pointerEvents: disabled ? 'none' as const : 'auto' as const };

  return (
    <Box sx={{ p: 2, position: 'relative' }}>
      <Box component="button" onClick={onWrong}
        sx={{ ...base, position: 'absolute', top: 8, right: 8, background: 'none', color: p.inkSoft, fontSize: '1.1rem', lineHeight: 1 }}>
        ✕
      </Box>
      <Typography sx={{ fontSize: '0.75rem', color: isDark ? p.inkSoft : '#4a5568', mb: 1.5, lineHeight: 1.6, pr: 4 }}>
        We'd love to give you the best experience with personalised cookies. Click "Got it!" to continue.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Box component="button" onClick={onWrong} sx={{ ...base, bgcolor: '#1565c0', color: '#fff', px: 2.5, py: 1 }}>Got it!</Box>
        <Box component="button" onClick={onCorrect} sx={{ ...base, bgcolor: isDark ? p.raisedBg : '#f0eeeb', color: p.inkSoft, border: `1px solid ${p.border}`, px: 2, py: 1 }}>Reject non-essential</Box>
      </Box>
    </Box>
  );
}

// ─── Medium: double negative ──────────────────────────────────────────────────

function BannerMedium1({ onCorrect, onWrong, disabled }: BannerProps) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const isDark = theme.palette.mode === 'dark';
  const [checked, setChecked] = useState(true);
  const base = { border: 'none', borderRadius: '6px', cursor: disabled ? 'default' : 'pointer', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: '0.8125rem', transition: 'all 0.15s', pointerEvents: disabled ? 'none' as const : 'auto' as const };

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontSize: '0.75rem', color: isDark ? p.inkSoft : '#4a5568', mb: 1.5, lineHeight: 1.7 }}>
        By not objecting to our use of cookies you agree to our processing. Deselect to opt out.
      </Typography>
      <Box sx={{ mb: 1.5 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} disabled={disabled}
            style={{ accentColor: p.danger }} />
          Do not uncheck to disable non-essential cookies
        </label>
      </Box>
      <Box component="button" onClick={() => checked ? onWrong() : onCorrect()}
        sx={{ ...base, bgcolor: '#1565c0', color: '#fff', px: 2.5, py: 1 }}>
        Confirm my choices
      </Box>
    </Box>
  );
}

// ─── Medium: spot 3 patterns ─────────────────────────────────────────────────

interface SpotPatternBannerProps extends BannerProps {
  onFoundPattern: (id: string, title: string, explanation: string) => void;
  found: Set<string>;
  totalPatterns: number;
}

function BannerMediumSpot({ onFoundPattern, found, disabled }: SpotPatternBannerProps) {
  const theme = useTheme();
  const p = theme.palette.gh;

  const target = (id: string, title: string, explanation: string, children: React.ReactNode) => (
    <Box
      component={found.has(id) ? 'div' : 'button'}
      onClick={!found.has(id) && !disabled ? () => onFoundPattern(id, title, explanation) : undefined}
      sx={{
        display: 'inline-flex', alignItems: 'center', position: 'relative',
        border: found.has(id) ? `2px solid ${p.danger}` : '2px dashed transparent',
        borderRadius: '4px', cursor: found.has(id) || disabled ? 'default' : 'crosshair',
        bgcolor: found.has(id) ? alpha(p.danger, 0.08) : 'none',
        p: 0.25, transition: 'all 0.2s', background: 'none',
        '&:hover:not(:disabled)': !found.has(id) ? { borderColor: p.warning, bgcolor: alpha(p.warning, 0.05) } : {},
      }}
    >
      {children}
      {found.has(id) && (
        <Box sx={{ position: 'absolute', top: -9, right: -9, width: 18, height: 18, borderRadius: '50%', bgcolor: p.danger, color: '#fff', fontSize: '0.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>Cookie Preferences</Typography>
        {target('dp-close', 'Fake Close Button', 'This ✕ accepts cookies instead of closing. EDPB: dismissal must equal rejection.',
          <Box component="span" sx={{ fontSize: '1rem', color: p.inkSoft, cursor: 'crosshair', px: 0.5 }}>✕</Box>
        )}
      </Box>
      <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', mb: 1.25, lineHeight: 1.6 }}>We use cookies to improve your experience.</Typography>
      <Box sx={{ mb: 1.25 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', marginBottom: 4 }}>
          <input type="checkbox" checked disabled /> Strictly necessary
        </label>
        {target('dp-pretick', 'Pre-ticked Box', 'Analytics cookies pre-selected = no valid consent. GDPR Recital 32.',
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', cursor: 'crosshair' }}>
            <input type="checkbox" checked readOnly /> Analytics & personalisation
          </label>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {target('dp-asymm', 'Visual Asymmetry', 'Bold "Accept All" vs tiny grey "save preferences" nudges users toward full consent. Prohibited by EDPB Guidelines 03/2022.',
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box component="span" style={{ background: '#0d1b2a', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8125rem', cursor: 'crosshair' }}>Accept All</Box>
            <Box component="span" style={{ fontSize: '0.65rem', color: '#bbb', cursor: 'crosshair' }}>save preferences</Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Hard: multi-step roach motel ────────────────────────────────────────────

function BannerHard({ onCorrect, onWrong, disabled }: BannerProps) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const [step, setStep] = useState(0);
  const base = { border: 'none', borderRadius: '6px', cursor: disabled ? 'default' : 'pointer', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: '0.8125rem', transition: 'all 0.15s', pointerEvents: disabled ? 'none' as const : 'auto' as const };

  const STEPS = [
    { text: 'We use cookies for analytics, advertising and personalisation.',
      accept: { label: 'Accept All', action: onWrong },
      reject: { label: 'Manage', action: () => setStep(1) } },
    { text: 'Choose your preference:',
      accept: { label: 'Personalised experience', action: onWrong },
      reject: { label: 'No personalisation', action: () => setStep(2) } },
    { text: "Are you sure? You'll miss personalised features.",
      accept: { label: 'Keep personalisation', action: onWrong },
      reject: { label: 'Confirm reject', action: onCorrect } },
  ] as const;
  const current = STEPS[step];

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1.5 }}>{current.text}</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 0.75 }}>
        <Box component="button" onClick={current.accept.action} sx={{ ...base, bgcolor: p.primary, color: '#fff', px: 2.5, py: 1 }}>{current.accept.label}</Box>
        <Box component="button" onClick={current.reject.action} sx={{ ...base, bgcolor: 'background.default', border: `1px solid ${p.border}`, color: 'text.secondary', px: 2, py: 1 }}>{current.reject.label}</Box>
      </Box>
      <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontFamily: 'monospace' }}>Step {step + 1} / 3</Typography>
    </Box>
  );
}

// ─── Cookie level bank ────────────────────────────────────────────────────────
// Fully frontend-defined. Backend only sends date + question_type = 'cookie_banners'.

const COOKIE_LEVELS: CookieLevel[] = [
  {
    difficulty: 'easy',
    title: 'The News Site',
    instruction: 'Reject all non-essential cookies to continue reading.',
    BannerComponent: BannerEasy1,
    debrief: 'The reject option was tiny and grey on purpose — to make you give up and click Accept instead. This kind of visual trick is illegal in Europe.',
  },
  {
    difficulty: 'easy',
    title: 'The Travel Blog',
    instruction: 'The X looks like it closes the banner — but does it? Reject cookies correctly.',
    BannerComponent: BannerEasy2,
    debrief: 'That X button accepted all cookies instead of closing the banner. Always look for an actual Reject or Manage option rather than clicking the X.',
  },
  {
    difficulty: 'medium',
    title: 'The Shopping Portal',
    instruction: 'Read carefully — the language is designed to confuse. Opt out of tracking.',
    BannerComponent: BannerMedium1,
    debrief: 'The wording was intentionally confusing — a double negative designed to trick you. The law requires cookie banners to use clear, plain language.',
  },
  {
    difficulty: 'medium',
    title: 'The Streaming Service',
    instruction: 'This banner has 3 sneaky tricks hidden in it. Tap each one to identify it.',
    BannerComponent: BannerMedium1, // overridden below by SpotMode
    debrief: 'You spotted all three tricks: a pre-ticked box, the tiny grey reject button vs big Accept, and a fake close button. Regulators have fined major companies millions for exactly these patterns.',
  },
  {
    difficulty: 'hard',
    title: 'The Social Network',
    instruction: 'Reject all cookies. The site will make you go through 3 steps to say no — do not give up.',
    BannerComponent: BannerHard,
    debrief: 'You made it through the multi-step trap. The law says rejecting cookies must be just as easy as accepting them — one click should be enough.',
  },
];

// ─── Level selector by difficulty ─────────────────────────────────────────────

function pickLevelForDifficulty(d: Difficulty): CookieLevel {
  const pool = COOKIE_LEVELS.filter(l => l.difficulty === d);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Escape challenge wrapper ─────────────────────────────────────────────────

function EscapeChallenge({ level, onDone }: { level: CookieLevel; onDone: (passed: boolean) => void }) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const isDark = theme.palette.mode === 'dark';
  const [result, setResult]   = useState<'idle' | 'won' | 'lost'>('idle');
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(level.difficulty === 'hard' ? 30 : 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (level.difficulty !== 'hard') return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current!); setTimedOut(true); setResult('lost'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [level.difficulty]);

  const Banner = level.BannerComponent;

  return (
    <Box>
      {level.difficulty === 'hard' && result === 'idle' && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', letterSpacing: '0.1em' }}>TIME REMAINING</Typography>
            <Typography variant="caption" sx={{ color: timeLeft <= 8 ? p.danger : p.warning, fontFamily: 'monospace' }}>{timeLeft}s</Typography>
          </Box>
          <LinearProgress variant="determinate" value={(timeLeft / 30) * 100}
            sx={{ height: 3, bgcolor: p.border, '& .MuiLinearProgress-bar': { bgcolor: timeLeft <= 8 ? p.danger : p.warning, transition: 'transform 0.1s linear, background-color 0.5s' } }} />
        </Box>
      )}

      {/* Fake browser window */}
      <Box sx={{ border: `1px solid ${p.border}`, borderRadius: '8px', overflow: 'hidden', mb: 2, boxShadow: 1 }}>
        <Box sx={{ bgcolor: isDark ? '#21293a' : '#e8e6e0', px: 1.5, py: 0.875, display: 'flex', alignItems: 'center', gap: 1 }}>
          {['#ff5f57','#febc2e','#28c840'].map((c,i) => <Box key={i} sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: c }} />)}
          <Typography sx={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'text.disabled', ml: -3 }}>🔒 example-site.eu</Typography>
        </Box>
        <Box sx={{ bgcolor: isDark ? p.raisedBg : '#fafaf8' }}>
          <Box sx={{ p: 2.5, filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' }}>
            {[80,65,90,55].map((w,i) => <Box key={i} sx={{ height: 10, bgcolor: isDark ? p.border : '#e2e8f0', borderRadius: 1, mb: 1, width: `${w}%` }} />)}
          </Box>
          <Box sx={{ bgcolor: isDark ? p.cardBg : '#ffffff', borderTop: `2px solid ${p.border}`, boxShadow: '0 -4px 12px rgba(0,0,0,0.07)' }}>
            <Box sx={{ px: 2, pt: 1.25, pb: 0 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>Privacy Preferences</Typography>
            </Box>
            <Banner onCorrect={() => setResult('won')} onWrong={() => setResult('lost')} disabled={result !== 'idle'} />
          </Box>
        </Box>
      </Box>

      <Fade in={result !== 'idle'}>
        <Box>
          {result === 'won' && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}><strong>✓ Cookies rejected!</strong><br /><br />{level.debrief}</Alert>
              <Button variant="contained" color="primary" onClick={() => onDone(true)}>Next Level →</Button>
            </>
          )}
          {result === 'lost' && (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>{timedOut ? "Time's up!" : 'Caught!'}</strong>{' '}
                {timedOut ? 'You ran out of time.' : 'You clicked the wrong option.'} In the real world, cookies would now be set.
                <br /><br />{level.debrief}
              </Alert>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button variant="outlined" color="secondary" onClick={() => { setResult('idle'); setTimedOut(false); setTimeLeft(level.difficulty === 'hard' ? 30 : 0); }}>Try Again</Button>
                <Button variant="outlined" onClick={() => onDone(false)}>Continue Anyway</Button>
              </Box>
            </>
          )}
        </Box>
      </Fade>
    </Box>
  );
}

// ─── Spot challenge (medium-2) ────────────────────────────────────────────────

function SpotChallenge({ level, onDone }: { level: CookieLevel; onDone: (passed: boolean) => void }) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const isDark = theme.palette.mode === 'dark';
  const [found, setFound]         = useState<Set<string>>(new Set());
  const [lastFound, setLastFound] = useState<{ title: string; explanation: string } | null>(null);
  const [done, setDone]           = useState(false);
  const TOTAL = 3;

  const handleFound = (id: string, title: string, explanation: string) => {
    if (found.has(id)) return;
    const next = new Set(found).add(id);
    setFound(next);
    setLastFound({ title, explanation });
    if (next.size >= TOTAL) setTimeout(() => setDone(true), 500);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          Found: <Box component="span" sx={{ color: p.danger }}>{found.size}</Box> / {TOTAL}
        </Typography>
        <Chip label="Tap suspicious elements" size="small" sx={{ height: 20, fontSize: '0.55rem', bgcolor: alpha(p.warning, 0.1), color: p.warning, border: `1px solid ${alpha(p.warning, 0.25)}` }} />
      </Box>

      <Box sx={{ border: `1px solid ${p.border}`, borderRadius: '8px', overflow: 'hidden', mb: 2, boxShadow: 1 }}>
        <Box sx={{ bgcolor: isDark ? '#21293a' : '#e8e6e0', px: 1.5, py: 0.875, display: 'flex', alignItems: 'center', gap: 1 }}>
          {['#ff5f57','#febc2e','#28c840'].map((c,i) => <Box key={i} sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: c }} />)}
          <Typography sx={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'text.disabled', ml: -3 }}>🔒 streammax.eu</Typography>
        </Box>
        <Box sx={{ bgcolor: isDark ? p.raisedBg : '#fafaf8' }}>
          <Box sx={{ p: 2.5, filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' }}>
            {[75,90,60].map((w,i) => <Box key={i} sx={{ height: 10, bgcolor: isDark ? p.border : '#e2e8f0', borderRadius: 1, mb: 1, width: `${w}%` }} />)}
          </Box>
          <Box sx={{ bgcolor: isDark ? p.cardBg : '#ffffff', borderTop: `2px solid ${p.border}` }}>
            <BannerMediumSpot
              onCorrect={() => {}} onWrong={() => {}} disabled={false}
              onFoundPattern={handleFound} found={found} totalPatterns={TOTAL}
            />
          </Box>
        </Box>
      </Box>

      {lastFound && !done && (
        <Fade in>
          <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8125rem' }}>
            <strong>⚠ Found: {lastFound.title}</strong><br />{lastFound.explanation}
          </Alert>
        </Fade>
      )}

      {done && (
        <Fade in>
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}><strong>All {TOTAL} patterns found!</strong><br /><br />{level.debrief}</Alert>
            <Button variant="contained" color="primary" onClick={() => onDone(true)}>Next Level →</Button>
          </Box>
        </Fade>
      )}
    </Box>
  );
}

// ─── Cookie level runner ──────────────────────────────────────────────────────

function CookieLevelRunner({ level, onDone }: { level: CookieLevel; onDone: (passed: boolean) => void }) {
  const isSpot = level.title === 'The Streaming Service';
  return isSpot ? <SpotChallenge level={level} onDone={onDone} /> : <EscapeChallenge level={level} onDone={onDone} />;
}

// ─── Main game ────────────────────────────────────────────────────────────────

interface Props { date: string; onBack: () => void; }

export default function CookieBannersGame({ date, onBack }: Props) {
  const theme = useTheme();
  const p = theme.palette.gh;

  // Pick one level per difficulty from the bank (deterministic per date)
  const [levels] = useState<CookieLevel[]>(() => {
    const seed = date.replace(/-/g, '');
    const pick = (d: Difficulty) => {
      const pool = COOKIE_LEVELS.filter(l => l.difficulty === d);
      return pool[parseInt(seed) % pool.length];
    };
    return [pick('easy'), pick('medium'), pick('hard')];
  });

  const [activeLevel, setActiveLevel] = useState<Difficulty | null>(null);
  const [completed, setCompleted]     = useState<Set<Difficulty>>(new Set());
  const [allDone, setAllDone]         = useState(false);

  const handleDone = useCallback((d: Difficulty) => {
    setCompleted(prev => { const next = new Set(prev).add(d); if (next.size === 3) setTimeout(() => setAllDone(true), 600); return next; });
    setActiveLevel(null);
  }, []);

  if (activeLevel) {
    const level = levels.find(l => l.difficulty === activeLevel)!;
    return (
      <GameShell title={`Cookie Trap — ${level.title}`} difficulty={activeLevel} date={date} onBack={() => setActiveLevel(null)}
        infoTitle="What are cookie banners?" infoContent={INFO_TEXT}>
        <Typography variant="overline" sx={{ display: 'block', mb: 1, color: p.danger }}>Level — {activeLevel}</Typography>
        <Typography variant="h3" sx={{ mb: 1 }}>{level.title}</Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>{level.instruction}</Typography>
        <CookieLevelRunner level={level} onDone={() => handleDone(activeLevel)} />
      </GameShell>
    );
  }

  if (allDone) {
    return (
      <GameShell title="Cookie Trap" difficulty="hard" date={date} progress={100} onBack={onBack}
      infoTitle="What are cookie banners?" infoContent={INFO_TEXT}>
        <Box sx={{ textAlign: 'center', py: 8 }} className="slide-up">
          <EmojiEventsIcon sx={{ fontSize: 56, color: p.danger, mb: 2 }} />
          <Typography variant="h2" sx={{ mb: 1 }}>All levels complete!</Typography>
          <Alert severity="success" sx={{ maxWidth: 420, mx: 'auto', mt: 2, textAlign: 'left' }}>
            Rejecting cookies must always be as easy as accepting them. If a website makes it hard to say no, that's not an accident — it's a deliberate trick, and often illegal.
          </Alert>
        </Box>
      </GameShell>
    );
  }

  return (
    <GameShell title="Cookie Trap" difficulty="easy" date={date} onBack={onBack}
      infoTitle="What are cookie banners?" infoContent={INFO_TEXT}>
      <Typography variant="overline" sx={{ display: 'block', mb: 1, color: p.danger }}>Today's Challenge</Typography>
      <Typography variant="h2" sx={{ mb: 1 }}>Cookie Trap</Typography>
      <Typography variant="body2" sx={{ mb: 4, maxWidth: 520 }}>
        Websites use sneaky tricks in cookie popups to get you to agree to tracking. Learn to spot and avoid them — three levels, getting trickier each time.
      </Typography>
      <LevelPicker
        levels={levels.map(l => ({ difficulty: l.difficulty, subtitle: l.title }))}
        completed={completed}
        onSelect={setActiveLevel}
      />
    </GameShell>
  );
}
