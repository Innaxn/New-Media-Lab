import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Fade,
  LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { CookieLevelConfig } from "../../api/types";

interface Props {
  level: CookieLevelConfig;
  onComplete: (passed: boolean) => void;
}

// Shared types

interface BannerProps {
  onCorrect: () => void;
  onWrong: () => void;
  disabled: boolean;
}

// Fake browser chrome

function BrowserChrome({ url }: { url: string }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: "#2d2d2d",
        borderRadius: "8px 8px 0 0",
        px: 1.5,
        py: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
          <Box
            key={i}
            sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c }}
          />
        ))}
      </Box>
      <Box
        sx={{
          flex: 1,
          bgcolor: "#1a1a1a",
          borderRadius: "4px",
          px: 1.5,
          py: 0.5,
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: "0.6875rem",
          color: theme.palette.terminal.muted,
        }}
      >
        🔒 {url}
      </Box>
    </Box>
  );
}

// Fake page content (blurred background)

function FakePageContent() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2.5,
        filter: "blur(2px)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          height: 18,
          bgcolor: theme.palette.terminal.raised,
          borderRadius: 1,
          mb: 1.5,
          width: "70%",
        }}
      />
      {[90, 80, 95, 60, 75].map((w, i) => (
        <Box
          key={i}
          sx={{
            height: 10,
            bgcolor: theme.palette.terminal.border,
            borderRadius: 1,
            mb: 1,
            width: `${w}%`,
          }}
        />
      ))}
    </Box>
  );
}

// Base button style factory

const makeBaseBtn = (disabled: boolean) =>
  ({
    border: "none",
    borderRadius: "4px",
    cursor: disabled ? "default" : "pointer",
    fontFamily: '"Share Tech Mono", monospace',
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    transition: "all 0.15s",
    pointerEvents: disabled ? "none" : "auto",
  }) as const;

// ─── Level banners — each is a standalone component with its own hooks ────────

/**
 * Easy-1: Ghost button — Accept is bold, Reject is a tiny grey link.
 * No local state needed.
 */
function BannerEasy1({ onCorrect, onWrong, disabled }: BannerProps) {
  const theme = useTheme();
  const t = theme.palette.terminal;
  const btn = makeBaseBtn(disabled);

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        sx={{ fontSize: "0.75rem", color: t.muted, mb: 1.5, lineHeight: 1.6 }}
      >
        We use cookies to personalise content and analyse traffic.{" "}
        <span
          style={{
            color: theme.palette.primary.main,
            textDecoration: "underline",
            fontSize: "0.7rem",
            cursor: "pointer",
          }}
        >
          Privacy Policy
        </span>
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          component="button"
          onClick={onWrong}
          sx={{
            ...btn,
            bgcolor: t.phosphor,
            color: t.void,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            "&:hover": { opacity: 0.85 },
          }}
        >
          Accept All Cookies
        </Box>
        {/* Ghost reject — deliberately hard to see */}
        <Box
          component="button"
          onClick={onCorrect}
          sx={{
            ...btn,
            background: "none",
            color: "#555",
            fontSize: "0.65rem",
            textDecoration: "underline",
            p: 0,
            "&:hover": { color: t.muted },
          }}
        >
          manage preferences
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Easy-2: Fake ✕ that accepts; real Reject is labelled but less prominent.
 * No local state needed.
 */
function BannerEasy2({ onCorrect, onWrong, disabled }: BannerProps) {
  const theme = useTheme();
  const t = theme.palette.terminal;
  const btn = makeBaseBtn(disabled);

  return (
    <Box sx={{ p: 2, position: "relative" }}>
      {/* Fake close button — triggers accept */}
      <Box
        component="button"
        onClick={onWrong}
        sx={{
          ...btn,
          position: "absolute",
          top: 8,
          right: 8,
          background: "none",
          color: t.muted,
          fontSize: "1rem",
          lineHeight: 1,
          "&:hover": { color: theme.palette.text.primary },
        }}
      >
        ✕
      </Box>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: t.muted,
          mb: 1.5,
          lineHeight: 1.6,
          pr: 4,
        }}
      >
        We'd love to give you the best experience with personalised cookies.
        Click "Got it!" to continue.
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Box
          component="button"
          onClick={onWrong}
          sx={{
            ...btn,
            bgcolor: "#1565c0",
            color: "#fff",
            px: 2.5,
            py: 1,
            fontWeight: 700,
          }}
        >
          Got it!
        </Box>
        <Box
          component="button"
          onClick={onCorrect}
          sx={{
            ...btn,
            bgcolor: t.raised,
            color: t.muted,
            border: `1px solid ${t.border}`,
            px: 2,
            py: 1,
            "&:hover": { borderColor: t.borderLit },
          }}
        >
          Reject non-essential
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Medium-1: Double-negative checkbox language.
 * Has local state — checkbox is pre-ticked (wrong default).
 */
function BannerMedium1({ onCorrect, onWrong, disabled }: BannerProps) {
  const theme = useTheme();
  const t = theme.palette.terminal;
  const btn = makeBaseBtn(disabled);

  // Hook is always called — no conditional return above this
  const [checked, setChecked] = useState(true);

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        sx={{ fontSize: "0.75rem", color: t.muted, mb: 1.5, lineHeight: 1.7 }}
      >
        By not objecting to our use of cookies you agree to processing. Deselect
        to opt out.
      </Typography>
      <Box sx={{ mb: 1.5 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.75rem",
            color: theme.palette.text.primary,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            disabled={disabled}
            style={{ accentColor: t.coral }}
          />
          Do not uncheck to disable non-essential cookies
        </label>
      </Box>
      <Box
        component="button"
        onClick={() => (checked ? onWrong() : onCorrect())}
        sx={{
          ...btn,
          bgcolor: "#1565c0",
          color: "#fff",
          px: 2.5,
          py: 1,
          fontWeight: 700,
        }}
      >
        Confirm my choices
      </Box>
    </Box>
  );
}

/**
 * Hard-2: Roach Motel — multi-step rejection flow.
 * Has local state — step counter.
 */
function BannerHard2({ onCorrect, onWrong, disabled }: BannerProps) {
  const theme = useTheme();
  const t = theme.palette.terminal;
  const btn = makeBaseBtn(disabled);

  // Hook is always called — no conditional return above this
  const [step, setStep] = useState(0);

  const STEPS = [
    {
      text: "We use cookies for analytics, advertising, and personalisation.",
      accept: { label: "Accept All", action: onWrong },
      reject: { label: "Manage", action: () => setStep(1) },
    },
    {
      text: "Choose your preference:",
      accept: { label: "Personalised experience", action: onWrong },
      reject: { label: "No personalisation", action: () => setStep(2) },
    },
    {
      text: "Are you sure? You'll miss out on features.",
      accept: { label: "Keep personalisation", action: onWrong },
      reject: { label: "Confirm reject", action: onCorrect },
    },
  ] as const;

  const current = STEPS[step];

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontSize: "0.75rem", color: t.muted, mb: 1.5 }}>
        {current.text}
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
        <Box
          component="button"
          onClick={current.accept.action}
          sx={{
            ...btn,
            bgcolor: t.phosphor,
            color: t.void,
            px: 2.5,
            py: 1,
            fontWeight: 700,
          }}
        >
          {current.accept.label}
        </Box>
        <Box
          component="button"
          onClick={current.reject.action}
          sx={{
            ...btn,
            bgcolor: t.raised,
            border: `1px solid ${t.border}`,
            color: t.muted,
            px: 2,
            py: 1,
          }}
        >
          {current.reject.label}
        </Box>
      </Box>
      <Typography
        sx={{
          fontSize: "0.6rem",
          color: t.ghost,
          fontFamily: '"Share Tech Mono", monospace',
        }}
      >
        Step {step + 1} / 3
      </Typography>
    </Box>
  );
}

/**
 * Fallback for levels that use the generic escape type but have no
 * specific banner variant built yet.
 */
function BannerFallback({ onCorrect }: BannerProps) {
  const theme = useTheme();
  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography
        sx={{ fontSize: "0.75rem", color: theme.palette.terminal.muted }}
      >
        We use cookies to improve your experience.
      </Typography>
      <Button
        size="small"
        variant="outlined"
        color="secondary"
        onClick={onCorrect}
      >
        Reject all non-essential cookies
      </Button>
    </Box>
  );
}

//Banner registry — maps level id -> component

const BANNER_MAP: Record<string, React.ComponentType<BannerProps>> = {
  "ck-easy-1": BannerEasy1,
  "ck-easy-2": BannerEasy2,
  "ck-medium-1": BannerMedium1,
  "ck-hard-2": BannerHard2,
};

function LevelBanner(props: BannerProps & { levelId: string }) {
  const { levelId, ...rest } = props;
  const Banner = BANNER_MAP[levelId] ?? BannerFallback;
  return <Banner {...rest} />;
}

// Timer hook

function useTimer(seconds: number, active: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep onExpire stable via ref so the interval doesn't re-register on every render
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          onExpireRef.current();
          clearInterval(intervalRef.current!);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  return remaining;
}

//Main component

export function CookieEscapeChallenge({ level, onComplete }: Props) {
  const theme = useTheme();

  const [result, setResult] = useState<"idle" | "won" | "lost">("idle");
  const [timedOut, setTimedOut] = useState(false);

  const hasTimer = level.difficulty === "hard";
  const timerSecs = 30;

  const handleExpire = useCallback(() => {
    setTimedOut(true);
    setResult("lost");
  }, []);

  const remaining = useTimer(
    timerSecs,
    hasTimer && result === "idle",
    handleExpire,
  );

  const handleCorrect = useCallback(() => setResult("won"), []);
  const handleWrong = useCallback(() => setResult("lost"), []);

  const handleRetry = useCallback(() => {
    setResult("idle");
    setTimedOut(false);
  }, []);

  return (
    <Box>
      {/* Timer bar — hard levels only */}
      {hasTimer && result === "idle" && (
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.terminal.muted,
                letterSpacing: "0.1em",
              }}
            >
              TIME REMAINING
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color:
                  remaining <= 8
                    ? theme.palette.terminal.coral
                    : theme.palette.terminal.amber,
                fontFamily: '"Share Tech Mono", monospace',
              }}
            >
              {remaining}s
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(remaining / timerSecs) * 100}
            sx={{
              height: 3,
              bgcolor: theme.palette.terminal.border,
              "& .MuiLinearProgress-bar": {
                bgcolor:
                  remaining <= 8
                    ? theme.palette.terminal.coral
                    : theme.palette.terminal.amber,
                transition: "transform 0.1s linear, background-color 0.5s",
              },
            }}
          />
        </Box>
      )}

      {/* Fake browser window */}
      <Box
        sx={{
          border: `1px solid ${theme.palette.terminal.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          mb: 2,
        }}
      >
        <BrowserChrome url={level.fakeUrl} />
        <Box sx={{ bgcolor: "#fafafa" }}>
          <FakePageContent />
          <Box
            sx={{
              bgcolor: "white",
              borderTop: "2px solid #e2e8f0",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
              <Typography
                sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0d1b2a" }}
              >
                Privacy Preferences
              </Typography>
            </Box>
            <LevelBanner
              levelId={level.id}
              onCorrect={handleCorrect}
              onWrong={handleWrong}
              disabled={result !== "idle"}
            />
          </Box>
        </Box>
      </Box>

      {/* Result feedback */}
      <Fade in={result !== "idle"}>
        <Box>
          {result === "won" && (
            <>
              <Alert severity="success" sx={{ mb: 2, fontSize: "0.8125rem" }}>
                <strong>{"✓ Cookies rejected!"}</strong>
                <br />
                <br />
                {level.debrief}
              </Alert>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onComplete(true)}
                sx={{ minWidth: 160 }}
              >
                Next Level 
              </Button>
            </>
          )}
          {result === "lost" && (
            <>
              <Alert severity="error" sx={{ mb: 2, fontSize: "0.8125rem" }}>
                <strong>{timedOut ? "Time's up!" : "Caught!"}</strong>{" "}
                {timedOut
                  ? "You ran out of time"
                  : "You clicked the wrong option"}{" "}
                — in the real world, cookies would now be set.
                <br />
                <br />
                {level.debrief}
              </Alert>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleRetry}
                  sx={{ minWidth: 120 }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => onComplete(false)}
                  sx={{ minWidth: 120 }}
                >
                  Continue Anyway
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Fade>
    </Box>
  );
}
