import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Fade,
  LinearProgress,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import type { CookieLevelConfig, DarkPatternTarget } from "../../api/types";

interface Props {
  level: CookieLevelConfig;
  onComplete: (passed: boolean) => void;
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

// Tappable dark pattern element wrapper
interface TapTargetProps {
  target: DarkPatternTarget;
  found: boolean;
  onFind: (id: string) => void;
  children: React.ReactNode;
}

function TapTarget({ target, found, onFind, children }: TapTargetProps) {
  const theme = useTheme();
  return (
    <Box
      component={found ? "div" : "button"}
      onClick={!found ? () => onFind(target.id) : undefined}
      title={found ? target.title : "Tap to investigate..."}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        border: found
          ? `2px solid ${theme.palette.terminal.coral}`
          : "2px dashed transparent",
        borderRadius: "3px",
        cursor: found ? "default" : "crosshair",
        background: found ? alpha(theme.palette.terminal.coral, 0.08) : "none",
        transition: "all 0.2s",
        p: 0.25,
        "&:hover:not([disabled])": !found
          ? { borderColor: "#ffd93d", background: alpha("#ffd93d", 0.05) }
          : {},
      }}
    >
      {children}
      {found && (
        <Box
          sx={{
            position: "absolute",
            top: -9,
            right: -9,
            width: 18,
            height: 18,
            borderRadius: "50%",
            bgcolor: theme.palette.terminal.coral,
            color: "white",
            fontSize: "0.5rem",
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✓
        </Box>
      )}
    </Box>
  );
}

// Banner renderers per level
interface BannerProps {
  targets: DarkPatternTarget[];
  found: Set<string>;
  onFind: (id: string) => void;
  levelId: string;
}

function SpotBanner({ targets, found, onFind, levelId }: BannerProps) {
  const getTarget = (id: string) => targets.find((t) => t.id === id);

  // Medium: 3 patterns (ck-medium-2) — streaming service banner
  if (levelId === "ck-medium-2") {
    const t1 = getTarget("dp-pretick")!;
    const t2 = getTarget("dp-asymm")!;
    const t3 = getTarget("dp-fake-close")!;
    return (
      <Box sx={{ p: 2, bgcolor: "white", position: "relative" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography
            sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0d1b2a" }}
          >
            Privacy Settings
          </Typography>
          {t3 && (
            <TapTarget
              target={t3}
              found={found.has("dp-fake-close")}
              onFind={onFind}
            >
              <Box
                component="span"
                sx={{
                  fontSize: "1rem",
                  color: "#aaa",
                  lineHeight: 1,
                  px: 0.5,
                  cursor: "inherit",
                }}
              >
                ✕
              </Box>
            </TapTarget>
          )}
        </Box>
        <Typography
          sx={{
            fontSize: "0.6875rem",
            color: "#718096",
            mb: 1.5,
            lineHeight: 1.6,
          }}
        >
          We use cookies to improve your experience.
        </Typography>
        <Box sx={{ mb: 1.5 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.75rem",
              color: "#0d1b2a",
              marginBottom: 4,
            }}
          >
            <input type="checkbox" checked disabled /> Strictly necessary
          </label>
          {t1 && (
            <TapTarget
              target={t1}
              found={found.has("dp-pretick")}
              onFind={onFind}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.75rem",
                  color: "#0d1b2a",
                  cursor: "inherit",
                }}
              >
                <input type="checkbox" checked readOnly /> Analytics &
                personalisation
              </label>
            </TapTarget>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {t2 && (
            <TapTarget
              target={t2}
              found={found.has("dp-asymm")}
              onFind={onFind}
            >
              <Box
                component="button"
                sx={{
                  background: "#0d1b2a",
                  color: "white",
                  border: "none",
                  px: 2.5,
                  py: 1,
                  borderRadius: 1,
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  cursor: "inherit",
                }}
              >
                Accept All
              </Box>
            </TapTarget>
          )}
          <Box
            component="button"
            sx={{
              background: "none",
              border: "none",
              color: "#bbb",
              fontSize: "0.65rem",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            save preferences
          </Box>
        </Box>
      </Box>
    );
  }

  // Hard: 4 patterns (ck-hard-1) — finance platform banner
  if (levelId === "ck-hard-1") {
    const t1 = getTarget("dp-pretick2")!;
    const t2 = getTarget("dp-shaming")!;
    const t3 = getTarget("dp-asymm2")!;
    const t4 = getTarget("dp-wall")!;
    return (
      <Box sx={{ p: 2, bgcolor: "white" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography
            sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0d1b2a" }}
          >
            Cookie Preferences
          </Typography>
          {t4 && (
            <TapTarget target={t4} found={found.has("dp-wall")} onFind={onFind}>
              <Box
                component="span"
                sx={{
                  fontSize: "0.65rem",
                  color: "#2563eb",
                  textDecoration: "underline",
                  cursor: "inherit",
                }}
              >
                Full details (47 pages)
              </Box>
            </TapTarget>
          )}
        </Box>
        <Box sx={{ mb: 1.5 }}>
          {t1 && (
            <TapTarget
              target={t1}
              found={found.has("dp-pretick2")}
              onFind={onFind}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.75rem",
                  color: "#0d1b2a",
                  cursor: "inherit",
                }}
              >
                <input type="checkbox" checked readOnly /> Marketing cookies
              </label>
            </TapTarget>
          )}
        </Box>
        {t3 && (
          <TapTarget target={t3} found={found.has("dp-asymm2")} onFind={onFind}>
            <Box
              sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 1 }}
            >
              <Box
                component="button"
                sx={{
                  background: "#1565c0",
                  color: "white",
                  border: "none",
                  px: 2.5,
                  py: 1,
                  borderRadius: 1,
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  cursor: "inherit",
                }}
              >
                Accept All
              </Box>
              <Box
                component="button"
                sx={{
                  background: "none",
                  border: "none",
                  color: "#bbb",
                  fontSize: "0.65rem",
                  cursor: "pointer",
                }}
              >
                reject
              </Box>
            </Box>
          </TapTarget>
        )}
        {t2 && (
          <TapTarget
            target={t2}
            found={found.has("dp-shaming")}
            onFind={onFind}
          >
            <Box
              component="button"
              sx={{
                background: "none",
                border: "1px solid #e2e8f0",
                px: 2,
                py: 0.75,
                borderRadius: 1,
                fontSize: "0.6875rem",
                color: "#718096",
                cursor: "inherit",
                fontStyle: "italic",
              }}
            >
              No thanks, I prefer a worse experience
            </Box>
          </TapTarget>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="caption">
        Banner not configured for this level
      </Typography>
    </Box>
  );
}

//Timer

function useTimer(seconds: number, active: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!active) return;
    ref.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          onExpire();
          clearInterval(ref.current!);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [active, onExpire]);
  return remaining;
}

//Main spot component

export function CookieSpotChallenge({ level, onComplete }: Props) {
  const theme = useTheme();
  const targets = level.targets ?? [];
  const total = targets.length;
  const [found, setFound] = useState<Set<string>>(new Set());
  const [lastFound, setLastFound] = useState<DarkPatternTarget | null>(null);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const hasTimer = level.difficulty === "hard";
  const timerSecs = 30;

  const handleExpire = () => {
    if (!finished) setTimedOut(true);
  };
  const remaining = useTimer(timerSecs, hasTimer && !finished, handleExpire);

  const handleFind = (id: string) => {
    if (found.has(id)) return;
    const target = targets.find((t) => t.id === id);
    if (!target) return;
    const newFound = new Set(found).add(id);
    setFound(newFound);
    setLastFound(target);
    if (newFound.size >= total) setTimeout(() => setFinished(true), 500);
  };

  return (
    <Box>
      {/* Counter */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: "0.75rem",
            color: theme.palette.terminal.muted,
          }}
        >
          Found:{" "}
          <span style={{ color: theme.palette.terminal.coral }}>
            {found.size}
          </span>{" "}
          / {total}
        </Typography>
        {hasTimer && !finished && (
          <Typography
            sx={{
              fontFamily: '"Share Tech Mono", monospace',
              fontSize: "0.75rem",
              color:
                remaining <= 8
                  ? theme.palette.terminal.coral
                  : theme.palette.terminal.amber,
            }}
          >
            {remaining}s
          </Typography>
        )}
      </Box>

      {hasTimer && !finished && (
        <LinearProgress
          variant="determinate"
          value={(remaining / timerSecs) * 100}
          sx={{
            height: 2,
            bgcolor: theme.palette.terminal.border,
            mb: 2,
            "& .MuiLinearProgress-bar": {
              bgcolor:
                remaining <= 8
                  ? theme.palette.terminal.coral
                  : theme.palette.terminal.amber,
              transition: "transform 0.1s linear, background-color 0.5s",
            },
          }}
        />
      )}

      {/* Instruction */}
      <Alert
        severity="info"
        icon={false}
        sx={{
          mb: 2,
          fontSize: "0.8rem",
          fontStyle: "italic",
          border: `1px solid ${theme.palette.terminal.borderLit}`,
        }}
      >
        💡 Hover over suspicious elements — if your cursor changes to a
        crosshair, tap to investigate.
      </Alert>

      {/* Fake browser */}
      <Box
        sx={{
          border: `1px solid ${theme.palette.terminal.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          mb: 2,
        }}
      >
        <BrowserChrome url={level.fakeUrl} />
        <Box sx={{ bgcolor: "#f8f9fa", position: "relative" }}>
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
                height: 16,
                bgcolor: "#e2e8f0",
                borderRadius: 1,
                mb: 1,
                width: "65%",
              }}
            />
            {[85, 70, 90, 55].map((w, i) => (
              <Box
                key={i}
                sx={{
                  height: 9,
                  bgcolor: "#edf2f7",
                  borderRadius: 1,
                  mb: 0.75,
                  width: `${w}%`,
                }}
              />
            ))}
          </Box>
          <Box
            sx={{
              bgcolor: "white",
              borderTop: "2px solid #e2e8f0",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <SpotBanner
              targets={targets}
              found={found}
              onFind={handleFind}
              levelId={level.id}
            />
          </Box>
        </Box>
      </Box>

      {/* Last found callout */}
      <Fade in={!!lastFound && !finished}>
        <Box>
          {lastFound && !finished && (
            <Alert
              severity="warning"
              sx={{
                mb: 2,
                fontSize: "0.8125rem",
                borderColor: alpha(theme.palette.terminal.coral, 0.3),
                bgcolor: alpha(theme.palette.terminal.coral, 0.06),
              }}
            >
              <strong>⚠ Dark Pattern Found: {lastFound.title}</strong>
              <br />
              {lastFound.explanation}
              <Box
                component="span"
                sx={{
                  display: "block",
                  mt: 0.5,
                  fontFamily: '"Share Tech Mono", monospace',
                  fontSize: "0.6rem",
                  color: theme.palette.terminal.coral,
                }}
              >
                {lastFound.legalRef}
              </Box>
            </Alert>
          )}
        </Box>
      </Fade>

      {/* Timed out */}
      {timedOut && !finished && (
        <Alert severity="error" sx={{ mb: 2, fontSize: "0.8125rem" }}>
          <strong>Time's up!</strong> You found {found.size}/{total} patterns.
          Here are the ones you missed:
          <Box sx={{ mt: 1 }}>
            {targets
              .filter((t) => !found.has(t.id))
              .map((t) => (
                <Box
                  key={t.id}
                  sx={{
                    fontSize: "0.75rem",
                    color: theme.palette.terminal.coral,
                    mb: 0.5,
                  }}
                >
                  <strong>{t.title}</strong> — {t.explanation}
                </Box>
              ))}
          </Box>
        </Alert>
      )}

      {/* All found */}
      {finished && (
        <Fade in>
          <Box>
            <Alert severity="success" sx={{ mb: 2, fontSize: "0.8125rem" }}>
              <strong>All {total} dark patterns identified!</strong>
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
              Next Level →
            </Button>
          </Box>
        </Fade>
      )}

      {timedOut && !finished && (
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setFound(new Set());
              setLastFound(null);
              setTimedOut(false);
              setFinished(false);
            }}
          >
            Try Again
          </Button>
          <Button variant="outlined" onClick={() => onComplete(false)}>
            Continue Anyway
          </Button>
        </Box>
      )}
    </Box>
  );
}
