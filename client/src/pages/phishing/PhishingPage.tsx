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
  Alert,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useAsync } from "../../hooks/useAsync";
import { fetchPhishingLevels } from "../../api/gameApi";
import { LoadingState } from "../../components/LoadingState";
import { EmailViewer } from "./EmailViewer";
import { VerdictPanel } from "./VerdictPanel";
import type { PhishingLevel, PhishingLevelDifficulty } from "../../api/types";

// ─── Difficulty config ────────────────────────────────────────────────────────

const DIFF: Record<PhishingLevelDifficulty, { label: string; color: string }> =
  {
    easy: { label: "Easy", color: "#00ff9d" },
    medium: { label: "Medium", color: "#d29922" },
    hard: { label: "Hard", color: "#f85149" },
  };

// ─── Level selector card ──────────────────────────────────────────────────────

interface LevelCardProps {
  level: PhishingLevel;
  index: number;
  locked: boolean;
  completed: boolean;
  onSelect: () => void;
}

function LevelCard({
  level,
  index,
  locked,
  completed,
  onSelect,
}: LevelCardProps) {
  const theme = useTheme();
  const diff = DIFF[level.difficulty];

  return (
    <Card
      elevation={1}
      onClick={!locked ? onSelect : undefined}
      sx={{
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.5 : 1,
        border: "1px solid",
        borderColor: completed
          ? alpha(theme.palette.terminal.phosphor, 0.4)
          : theme.palette.terminal.border,
        borderRadius: "6px",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
        "&:hover": !locked
          ? {
              borderColor: diff.color,
              transform: "translateY(-2px)",
              boxShadow: `0 6px 24px ${alpha(diff.color, 0.15)}`,
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
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: "0.6rem",
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
              label={`${level.emails.length} email${level.emails.length > 1 ? "s" : ""}`}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                fontFamily: '"Share Tech Mono", monospace',
                bgcolor: alpha(theme.palette.terminal.borderLit, 0.5),
                color: theme.palette.terminal.muted,
                borderRadius: "3px",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Box>
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
              sx={{ fontSize: 16, color: theme.palette.terminal.ghost }}
            />
          )}
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontSize: "0.9375rem",
            fontWeight: 700,
            color: theme.palette.text.secondary,
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
            mb: 1,
          }}
        >
          {level.instruction}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: "0.6rem",
            color: theme.palette.terminal.ghost,
            letterSpacing: "0.1em",
          }}
        >
          ⚡ {level.emails.reduce((s, e) => s + e.xpReward, 0)} XP
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── Level runner ─────────────────────────────────────────────────────────────

interface LevelRunnerProps {
  level: PhishingLevel;
  onFinish: (correctCount: number, xpEarned: number) => void;
  onBack: () => void;
}

function LevelRunner({ level, onFinish, onBack }: LevelRunnerProps) {
  const theme = useTheme();
  const diff = DIFF[level.difficulty];

  const [emailIdx, setEmailIdx] = useState(0);
  const [correctCount, setCorrect] = useState(0);
  const [xpEarned, setXP] = useState(0);

  const currentEmail = level.emails[emailIdx];
  const progressPct = (emailIdx / level.emails.length) * 100;

  const handleNext = useCallback(
    (correct: boolean) => {
      if (correct) {
        setCorrect((c) => c + 1);
        setXP((x) => x + currentEmail.xpReward);
      }
      if (emailIdx < level.emails.length - 1) {
        setEmailIdx((i) => i + 1);
      } else {
        onFinish(
          correct ? correctCount + 1 : correctCount,
          correct ? xpEarned + currentEmail.xpReward : xpEarned,
        );
      }
    },
    [
      emailIdx,
      level.emails.length,
      correctCount,
      xpEarned,
      currentEmail,
      onFinish,
    ],
  );

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
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", py: 1.5, gap: 2 }}>
            <Tooltip title="Back to level select" arrow>
              <IconButton size="small" onClick={onBack}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: '"Syne", monospace',
                  fontWeight: 800,
                  fontSize: "0.9375rem",
                  color: diff.color,
                }}
              >
                {level.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.terminal.ghost,
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                }}
              >
                Email {emailIdx + 1} of {level.emails.length}
              </Typography>
            </Box>
            <Chip
              label={diff.label}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                fontFamily: '"Share Tech Mono", monospace',
                bgcolor: alpha(diff.color, 0.12),
                color: diff.color,
                border: `1px solid ${alpha(diff.color, 0.35)}`,
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
              "& .MuiLinearProgress-bar": { bgcolor: diff.color },
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
        {/* Teaching point */}
        <Alert
          severity="info"
          icon={false}
          sx={{
            mb: 3,
            fontSize: "0.8125rem",
            bgcolor: alpha(theme.palette.terminal.amber, 0.06),
            border: `1px solid ${alpha(theme.palette.terminal.amber, 0.25)}`,
            color: theme.palette.text.primary,
          }}
        >
          <strong
            style={{
              color: theme.palette.terminal.amber,
              fontFamily: '"Share Tech Mono", monospace',
              fontSize: "0.625rem",
              letterSpacing: "0.15em",
            }}
          >
            WHAT TO LOOK FOR
          </strong>
          <br />
          {level.teachingPoint}
        </Alert>

        {/* Split layout: email viewer + verdict panel */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 360px" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* Left: email */}
          <Box>
            <Typography
              sx={{
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: theme.palette.terminal.ghost,
                textTransform: "uppercase",
                mb: 1.5,
              }}
            >
              Email {emailIdx + 1} of {level.emails.length}
            </Typography>
            <EmailViewer email={currentEmail} />
          </Box>

          {/* Right: verdict */}
          <Box sx={{ position: { md: "sticky" }, top: { md: 80 } }}>
            <Typography
              sx={{
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: theme.palette.terminal.ghost,
                textTransform: "uppercase",
                mb: 1.5,
              }}
            >
              Your Analysis
            </Typography>
            <Box
              sx={{
                bgcolor: theme.palette.terminal.surface,
                border: `1px solid ${theme.palette.terminal.border}`,
                borderRadius: "6px",
                p: 2.5,
              }}
            >
              <VerdictPanel
                key={currentEmail.id}
                email={currentEmail}
                emailIndex={emailIdx}
                totalEmails={level.emails.length}
                onNext={handleNext}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

// ─── Level completion summary ─────────────────────────────────────────────────

interface LevelSummaryProps {
  level: PhishingLevel;
  correctCount: number;
  xpEarned: number;
  onContinue: () => void;
}

function LevelSummary({
  level,
  correctCount,
  xpEarned,
  onContinue,
}: LevelSummaryProps) {
  const theme = useTheme();
  const total = level.emails.length;
  const perfect = correctCount === total;

  return (
    <Box sx={{ textAlign: "center", py: 6 }} className="slide-up">
      <EmojiEventsIcon
        sx={{
          fontSize: 52,
          color: perfect
            ? theme.palette.terminal.phosphor
            : theme.palette.terminal.amber,
          mb: 2,
          filter: `drop-shadow(0 0 14px ${alpha(perfect ? theme.palette.terminal.phosphor : theme.palette.terminal.amber, 0.5)})`,
        }}
      />
      <Typography
        variant="h2"
        sx={{ fontSize: "2rem", mb: 0.5, color: theme.palette.text.primary }}
      >
        {perfect ? "Perfect Score!" : "Level Complete"}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{ mb: 4, letterSpacing: "0.15em", fontSize: "0.7rem" }}
      >
        {level.title.toUpperCase()} — CLEARED
      </Typography>

      <Card elevation={2} sx={{ maxWidth: 380, mx: "auto", mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: '"Share Tech Mono", monospace',
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: theme.palette.terminal.phosphor,
                }}
              >
                {correctCount}/{total}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.terminal.ghost,
                  letterSpacing: "0.1em",
                }}
              >
                CORRECT
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
                {xpEarned}
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
        </CardContent>
      </Card>

      <Button
        variant="contained"
        color="primary"
        onClick={onContinue}
        endIcon={<PlayArrowIcon />}
        sx={{ minWidth: 180 }}
      >
        Back to Levels
      </Button>
    </Box>
  );
}

// ─── Phishing Page ────────────────────────────────────────────────────────────

type PageState =
  | { view: "select" }
  | { view: "playing"; levelIdx: number }
  | {
      view: "summary";
      level: PhishingLevel;
      correctCount: number;
      xpEarned: number;
    };

export default function PhishingPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    data: levels,
    status,
    error,
    refetch,
  } = useAsync(fetchPhishingLevels);

  const [pageState, setPageState] = useState<PageState>({ view: "select" });
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [totalXP, setTotalXP] = useState(0);

  const isLocked = useCallback(
    (index: number): boolean => {
      if (index === 0 || !levels) return false;
      return !completed.has(levels[index - 1].id);
    },
    [levels, completed],
  );

  const handleLevelFinish = useCallback(
    (level: PhishingLevel, correctCount: number, xpEarned: number) => {
      setCompleted((prev) => new Set(prev).add(level.id));
      setTotalXP((prev) => prev + xpEarned);
      setPageState({ view: "summary", level, correctCount, xpEarned });
    },
    [],
  );

  const progressPct = levels ? (completed.size / levels.length) * 100 : 0;

  // ── Playing ──────────────────────────────────────────────────────────────
  if (pageState.view === "playing" && levels) {
    const level = levels[pageState.levelIdx];
    return (
      <LevelRunner
        level={level}
        onFinish={(c, xp) => handleLevelFinish(level, c, xp)}
        onBack={() => setPageState({ view: "select" })}
      />
    );
  }

  // ── Level summary ─────────────────────────────────────────────────────────
  if (pageState.view === "summary") {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
          <LevelSummary
            level={pageState.level}
            correctCount={pageState.correctCount}
            xpEarned={pageState.xpEarned}
            onContinue={() => setPageState({ view: "select" })}
          />
        </Container>
      </Box>
    );
  }

  // ── Level selector ────────────────────────────────────────────────────────
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
                  color: "#d29922",
                }}
              >
                Phish or Legit
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
                GLASS HOUSE — MODULE 03
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: "0.75rem",
                color: theme.palette.terminal.muted,
              }}
            >
              <span style={{ color: "#d29922" }}>{completed.size}</span>
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
                bgcolor: "#d29922",
                boxShadow: `0 0 8px ${alpha("#d29922", 0.4)}`,
              },
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Typography
          variant="overline"
          sx={{ display: "block", mb: 1, color: "#d29922" }}
        >
          Module 03 — Email Threat Analysis
        </Typography>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Phish or Legit
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, maxWidth: 560 }}>
          Analyse real-world email patterns — sender headers, suspicious links,
          and social engineering tactics. Each level focuses on a specific
          technique. Complete in order to unlock harder levels.
        </Typography>

        {(status === "loading" || status === "error") && (
          <LoadingState status={status} error={error} onRetry={refetch} />
        )}

        {levels && (
          <>
            {/* Difficulty legend */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {(["easy", "medium", "hard"] as PhishingLevelDifficulty[]).map(
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
                        bgcolor: DIFF[d].color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.terminal.muted,
                        fontSize: "0.6875rem",
                      }}
                    >
                      {DIFF[d].label}
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
                Unlock levels by completing the previous one →
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
                  onSelect={() =>
                    setPageState({ view: "playing", levelIdx: idx })
                  }
                />
              ))}
            </Box>

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
