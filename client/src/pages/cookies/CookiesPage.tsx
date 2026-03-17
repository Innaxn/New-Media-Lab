import { useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useAsync } from "../../hooks/useAsync";
import { fetchCookieLevels } from "../../api/gameApi";
import { LoadingState } from "../../components/LoadingState";
import { CookieEscapeChallenge } from "./CookieEscapeChallenge";
import { CookieSpotChallenge } from "./CookieSpotChallenge";
import type { CookieLevelConfig, CookieLevelDifficulty } from "../../api/types";

// Difficulty badge

const DIFF_STYLES: Record<
  CookieLevelDifficulty,
  { label: string; color: string }
> = {
  easy: { label: "Easy", color: "#00ff9d" },
  medium: { label: "Medium", color: "#d29922" },
  hard: { label: "Hard", color: "#f85149" },
};

// level selector card

interface LevelCardProps {
  level: CookieLevelConfig;
  index: number;
  locked: boolean;
  completed: boolean;
  active: boolean;
  onSelect: () => void;
}

function LevelCard({
  level,
  index,
  locked,
  completed,
  active,
  onSelect,
}: LevelCardProps) {
  const theme = useTheme();
  const diff = DIFF_STYLES[level.difficulty];

  return (
    <Card
      elevation={active ? 3 : 1}
      onClick={!locked ? onSelect : undefined}
      sx={{
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.5 : 1,
        border: `1px solid`,
        borderColor: active
          ? theme.palette.terminal.coral
          : completed
            ? alpha(theme.palette.terminal.phosphor, 0.4)
            : theme.palette.terminal.border,
        borderRadius: "6px",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
        '&:hover:not([style*="not-allowed"])': !locked
          ? {
              borderColor: theme.palette.terminal.coral,
              transform: "translateY(-2px)",
              boxShadow: `0 6px 24px ${alpha(theme.palette.terminal.coral, 0.15)}`,
            }
          : {},
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: diff.color,
          opacity: locked ? 0.3 : 1,
        },
      }}
    >
      <CardContent sx={{ p: "16px 20px !important" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: "0.625rem",
                letterSpacing: "0.15em",
                color: theme.palette.terminal.ghost,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </Typography>
            <Chip
              label={diff.label}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.55rem",
                letterSpacing: "0.12em",
                fontFamily: '"Share Tech Mono", monospace',
                bgcolor: alpha(diff.color, 0.12),
                color: diff.color,
                border: `1px solid ${alpha(diff.color, 0.35)}`,
                borderRadius: "3px",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
            <Chip
              label={level.challengeType === "escape" ? "ESCAPE" : "SPOT"}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.55rem",
                letterSpacing: "0.12em",
                fontFamily: '"Share Tech Mono", monospace',
                bgcolor: alpha(theme.palette.terminal.borderLit, 0.5),
                color: theme.palette.terminal.muted,
                borderRadius: "3px",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Box>

          {/* Status icon */}
          {locked && (
            <LockIcon
              sx={{ fontSize: 16, color: theme.palette.terminal.ghost }}
            />
          )}
          {completed && !locked && (
            <CheckCircleIcon
              sx={{ fontSize: 16, color: theme.palette.terminal.phosphor }}
            />
          )}
          {!locked && !completed && (
            <PlayArrowIcon
              sx={{
                fontSize: 16,
                color: active
                  ? theme.palette.terminal.coral
                  : theme.palette.terminal.ghost,
              }}
            />
          )}
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontSize: "0.9375rem",
            fontWeight: 700,
            color: active
              ? theme.palette.text.primary
              : theme.palette.text.secondary,
            mb: 0.5,
          }}
        >
          {level.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.75rem",
            color: theme.palette.terminal.ghost,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {level.instruction}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Share Tech Mono", monospace',
              fontSize: "0.6rem",
              color: theme.palette.terminal.ghost,
              letterSpacing: "0.1em",
            }}
          >
            ⚡ {level.xpReward} XP
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

//Level complete summary

interface LevelSummaryProps {
  completedCount: number;
  totalLevels: number;
  totalXP: number;
  onHome: () => void;
  onRestart: () => void;
}

function CookiesCompletion({
  completedCount,
  totalLevels,
  totalXP,
  onHome,
  onRestart,
}: LevelSummaryProps) {
  const theme = useTheme();
  return (
    <Box sx={{ textAlign: "center", py: 8 }} className="slide-up">
      <EmojiEventsIcon
        sx={{
          fontSize: 56,
          color: theme.palette.terminal.coral,
          mb: 2,
          filter: `drop-shadow(0 0 16px ${alpha(theme.palette.terminal.coral, 0.5)})`,
        }}
      />
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "2rem", sm: "2.75rem" },
          mb: 0.5,
          color: theme.palette.terminal.coral,
        }}
      >
        MODULE COMPLETE
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{ mb: 4, letterSpacing: "0.2em", fontSize: "0.7rem" }}
      >
        GLASS HOUSE — COOKIE TRAP — CLEARED
      </Typography>

      <Card elevation={2} sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: '"Share Tech Mono", monospace',
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: theme.palette.terminal.coral,
                }}
              >
                {completedCount}/{totalLevels}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.terminal.ghost,
                  letterSpacing: "0.1em",
                }}
              >
                LEVELS DONE
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: '"Share Tech Mono", monospace',
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#d29922",
                }}
              >
                {totalXP}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.terminal.ghost,
                  letterSpacing: "0.1em",
                }}
              >
                XP EARNED
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8125rem",
              color: theme.palette.terminal.muted,
              lineHeight: 1.7,
            }}
          >
            You can now identify dark patterns in real cookie banners — visual
            asymmetry, pre-ticked boxes, fake close buttons, and multi-step
            rejection flows.
          </Typography>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button variant="outlined" onClick={onRestart}>
          Play Again
        </Button>
        <Button
          variant="outlined"
          onClick={onHome}
          sx={{
            borderColor: theme.palette.terminal.coral,
            color: theme.palette.terminal.coral,
            "&:hover": { bgcolor: alpha(theme.palette.terminal.coral, 0.08) },
          }}
        >
          Back to Home
        </Button>
      </Box>
    </Box>
  );
}

// Cookies Page

export default function CookiesPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { data: levels, status, error, refetch } = useAsync(fetchCookieLevels);

  const [currentLevelIdx, setCurrentLevelIdx] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [totalXP, setTotalXP] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const handleLevelComplete = useCallback(
    (levelId: string, xp: number, passed: boolean) => {
      if (passed) {
        setCompleted((prev) => new Set(prev).add(levelId));
        setTotalXP((prev) => prev + xp);
      }
      setCurrentLevelIdx(null);
      // Check if all done
      if (levels && completed.size + (passed ? 1 : 0) >= levels.length) {
        setTimeout(() => setAllDone(true), 400);
      }
    },
    [levels, completed],
  );

  const handleRestart = useCallback(() => {
    setCompleted(new Set());
    setTotalXP(0);
    setCurrentLevelIdx(null);
    setAllDone(false);
  }, []);

  const isLocked = useCallback(
    (index: number): boolean => {
      if (index === 0) return false;
      if (!levels) return true;
      return !completed.has(levels[index - 1].id);
    },
    [levels, completed],
  );

  const progressPct = levels ? (completed.size / levels.length) * 100 : 0;

  //Currently playing a level
  if (currentLevelIdx !== null && levels) {
    const level = levels[currentLevelIdx];
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Top bar */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            bgcolor: theme.palette.terminal.deep,
            borderBottom: `1px solid ${theme.palette.terminal.border}`,
          }}
        >
          <Container maxWidth="md">
            <Box
              sx={{ display: "flex", alignItems: "center", py: 1.5, gap: 2 }}
            >
              <Tooltip title="Back to level select" arrow>
                <IconButton
                  size="small"
                  onClick={() => setCurrentLevelIdx(null)}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: '"Syne", monospace',
                    fontWeight: 800,
                    fontSize: "0.9375rem",
                    color: theme.palette.terminal.coral,
                  }}
                >
                  Cookie Trap
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.terminal.ghost,
                    fontSize: "0.6rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  Level {currentLevelIdx + 1} — {level.title}
                </Typography>
              </Box>
              <Chip
                label={DIFF_STYLES[level.difficulty].label}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  fontFamily: '"Share Tech Mono", monospace',
                  bgcolor: alpha(DIFF_STYLES[level.difficulty].color, 0.12),
                  color: DIFF_STYLES[level.difficulty].color,
                  border: `1px solid ${alpha(DIFF_STYLES[level.difficulty].color, 0.35)}`,
                  borderRadius: "3px",
                }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPct}
              sx={{
                height: 2,
                bgcolor: theme.palette.terminal.border,
                "& .MuiLinearProgress-bar": {
                  bgcolor: theme.palette.terminal.coral,
                  boxShadow: `0 0 8px ${alpha(theme.palette.terminal.coral, 0.4)}`,
                },
              }}
            />
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
          {/* Level header */}
          <Typography
            variant="overline"
            sx={{
              display: "block",
              mb: 1,
              color: theme.palette.terminal.coral,
            }}
          >
            {level.challengeType === "escape"
              ? "Challenge — Escape"
              : "Challenge — Spot"}{" "}
            · Level {currentLevelIdx + 1} of {levels.length}
          </Typography>
          <Typography variant="h3" sx={{ mb: 1 }}>
            {level.title}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, maxWidth: 560 }}>
            {level.instruction}
          </Typography>

          {level.challengeType === "escape" ? (
            <CookieEscapeChallenge
              level={level}
              onComplete={(passed) =>
                handleLevelComplete(level.id, level.xpReward, passed)
              }
            />
          ) : (
            <CookieSpotChallenge
              level={level}
              onComplete={(passed) =>
                handleLevelComplete(level.id, level.xpReward, passed)
              }
            />
          )}
        </Container>
      </Box>
    );
  }

  // All done screen
  if (allDone && levels) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
          <CookiesCompletion
            completedCount={completed.size}
            totalLevels={levels.length}
            totalXP={totalXP}
            onHome={() => navigate("/")}
            onRestart={handleRestart}
          />
        </Container>
      </Box>
    );
  }

  // Level selector
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Top bar */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: theme.palette.terminal.deep,
          borderBottom: `1px solid ${theme.palette.terminal.border}`,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: "flex", alignItems: "center", py: 1.5, gap: 2 }}>
            <Tooltip title="Back to home" arrow>
              <IconButton size="small" onClick={() => navigate("/")}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "baseline",
                gap: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Syne", monospace',
                  fontWeight: 800,
                  fontSize: "0.9375rem",
                  color: theme.palette.terminal.coral,
                }}
              >
                Cookie Trap
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.terminal.ghost,
                  letterSpacing: "0.15em",
                  fontSize: "0.6rem",
                  display: { xs: "none", sm: "block" },
                }}
              >
                GLASS HOUSE — MODULE 02
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: "0.75rem",
                color: theme.palette.terminal.muted,
              }}
            >
              <span style={{ color: theme.palette.terminal.coral }}>
                {completed.size}
              </span>
              {levels ? `/${levels.length}` : ""} done
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{
              height: 2,
              bgcolor: theme.palette.terminal.border,
              "& .MuiLinearProgress-bar": {
                bgcolor: theme.palette.terminal.coral,
                boxShadow: `0 0 8px ${alpha(theme.palette.terminal.coral, 0.4)}`,
              },
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        {/* Header */}
        <Typography
          variant="overline"
          sx={{ display: "block", mb: 1, color: theme.palette.terminal.coral }}
        >
          Module 02 — Cookie Consent
        </Typography>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Escape the Cookie Trap
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, maxWidth: 560 }}>
          Navigate manipulative consent banners, spot dark patterns, and learn
          what's actually illegal under GDPR. Complete levels in order — each
          one gets harder.
        </Typography>

        {/* Loading / error */}
        {(status === "loading" || status === "error") && (
          <LoadingState status={status} error={error} onRetry={refetch} />
        )}

        {/* Level grid */}
        {levels && (
          <>
            {/* Difficulty legend */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              {(["easy", "medium", "hard"] as CookieLevelDifficulty[]).map(
                (d) => (
                  <Box
                    key={d}
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: DIFF_STYLES[d].color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.terminal.muted,
                        fontSize: "0.6875rem",
                      }}
                    >
                      {DIFF_STYLES[d].label}
                    </Typography>
                  </Box>
                ),
              )}
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.terminal.ghost,
                  fontSize: "0.6875rem",
                  ml: "auto",
                }}
              >
                Complete in order to unlock →
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              {levels.map((level, idx) => (
                <LevelCard
                  key={level.id}
                  level={level}
                  index={idx}
                  locked={isLocked(idx)}
                  completed={completed.has(level.id)}
                  active={!isLocked(idx) && !completed.has(level.id)}
                  onSelect={() => setCurrentLevelIdx(idx)}
                />
              ))}
            </Box>

            {/* XP earned so far */}
            {totalXP > 0 && (
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: "0.75rem",
                    color: theme.palette.terminal.muted,
                  }}
                >
                  ⚡ Total XP earned this session:{" "}
                  <span style={{ color: "#d29922", fontWeight: 600 }}>
                    {totalXP}
                  </span>
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
