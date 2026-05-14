import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Alert,
  Button,
  Fade,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useTheme, alpha } from "@mui/material/styles";
import { GameShell } from "./GameShell";
import { InfoPanel } from "./InfoPanel";
import { LevelPicker } from "./LevelPicker";
import { evaluateRule, getStrengthInfo } from "../utils/passwordUtils";
import type { BuildPasswordQuestion, Difficulty } from "../api/types";

const INFO_TEXT = `A password is like the key to your front door — except online, someone might try millions of keys per second.

What makes a password strong?
• Length matters most. A 16-character password is vastly harder to crack than an 8-character one, even if the short one has symbols.
• Randomness helps. Avoid names, birthdays, or words from the dictionary.
• Don't reuse passwords. If one website gets hacked, your other accounts stay safe.

The "crack time" shown here is a rough estimate of how long it would take an attacker to guess your password using a fast computer. Aim for something that would take years, not seconds!`;

interface Props {
  questions: BuildPasswordQuestion[];
  date: string;
  onBack: () => void;
}

function PasswordLevel({
  q,
  onComplete,
}: {
  q: BuildPasswordQuestion;
  onComplete: () => void;
}) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const isDark = theme.palette.mode === "dark";

  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ruleResults = q.rules.map((r) => ({
    rule: r,
    passed: evaluateRule(password, r),
  }));
  const allPassed = ruleResults.every((r) => r.passed) && password.length > 0;
  const strength = getStrengthInfo(password, q.rules, isDark);

  const handleSubmit = useCallback(() => {
    if (!allPassed) return;
    setSubmitted(true);
  }, [allPassed]);

  return (
    <Box className="slide-up">
      {q.question && (
        <Alert
          severity="info"
          icon={false}
          sx={{
            mb: 2.5,
            bgcolor: alpha(p.primary, 0.07),
            borderColor: alpha(p.primary, 0.2),
            color: "text.primary",
            fontSize: "0.875rem",
          }}
        >
          {q.question}
        </Alert>
      )}

      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          {/* Input */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              type={visible ? "text" : "password"}
              placeholder="Type your password here…"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              slotProps={{
                htmlInput: { spellCheck: false },
                input: {
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setVisible((v) => !v)}
                      edge="end"
                      sx={{ mr: 0.5 }}
                    >
                      {visible ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  ),
                },
              }}
            />
          </Box>

          {/* Strength bar */}
          <Box sx={{ display: "flex", gap: 0.5, mb: 0.75 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: 5,
                  borderRadius: 1,
                  bgcolor:
                    password.length > 0 && i < strength.level
                      ? strength.color
                      : p.border,
                  boxShadow:
                    password.length > 0 && i < strength.level
                      ? `0 0 5px ${alpha(strength.color, 0.5)}`
                      : "none",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 2,
              color: password.length === 0 ? "text.disabled" : strength.color,
              fontWeight: 600,
            }}
          >
            {strength.label}
          </Typography>

          {/* Checklist — rules from backend */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 0.875,
              mb: 2,
            }}
          >
            {ruleResults.map(({ rule, passed }) => (
              <Box
                key={rule.description}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  color: passed ? p.primary : p.inkGhost,
                  transition: "color 0.2s",
                }}
              >
                {passed ? (
                  <CheckCircleIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                ) : (
                  <RadioButtonUncheckedIcon
                    sx={{ fontSize: 14, flexShrink: 0 }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.6875rem", color: "inherit" }}
                >
                  {rule.description}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Estimated crack time — plain label */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: "10px 14px",
              bgcolor: "background.default",
              border: `1px solid ${p.border}`,
              borderRadius: "8px",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              How long to crack?
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: strength.level >= 3 ? p.primary : p.danger,
                transition: "color 0.3s",
              }}
            >
              {strength.crackTime}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Result — stays until user clicks Continue */}
      <Fade in={submitted}>
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>Great password! ✓</strong>
            <br />
            <br />
            Longer passwords are almost always stronger. A 16-character password
            takes billions of times longer to crack than an 8-character one —
            even without special symbols.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={onComplete}
            endIcon={<ArrowForwardIcon />}
            sx={{ minWidth: 160 }}
          >
            Continue
          </Button>
        </Box>
      </Fade>

      {!submitted && (
        <Tooltip
          title={allPassed ? "" : "Fill in all the requirements above first"}
          arrow
          placement="top"
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={!allPassed}
              onClick={handleSubmit}
              endIcon={<ArrowForwardIcon />}
              sx={{ minWidth: 160 }}
            >
              Check password
            </Button>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}

export default function BuildPasswordGame({ questions, date, onBack }: Props) {
  const theme = useTheme();
  const p = theme.palette.gh;

  const [activeLevel, setActiveLevel] = useState<Difficulty | null>(null);
  const [completed, setCompleted] = useState<Set<Difficulty>>(new Set());
  const [allDone, setAllDone] = useState(false);

  const sortedQ = [...questions].sort(
    (a, b) =>
      (({ easy: 0, medium: 1, hard: 2 })[a.difficulty] ?? 0) -
      ({ easy: 0, medium: 1, hard: 2 }[b.difficulty] ?? 0),
  );

  const handleComplete = useCallback(
    (d: Difficulty) => {
      setCompleted((prev) => {
        const next = new Set(prev).add(d);
        if (next.size === sortedQ.length) setAllDone(true);
        return next;
      });
      setActiveLevel(null);
    },
    [sortedQ.length],
  );

  if (activeLevel) {
    const q = sortedQ.find((q) => q.difficulty === activeLevel)!;
    return (
      <GameShell
        title="Build a Password"
        difficulty={activeLevel}
        date={date}
        progress={completed.has(activeLevel) ? 100 : undefined}
        onBack={() => setActiveLevel(null)}
      >
        <Typography
          variant="overline"
          sx={{ display: "block", mb: 1, color: p.primary }}
        >
          Level — {activeLevel.charAt(0).toUpperCase() + activeLevel.slice(1)}
        </Typography>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Build a Strong Password
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Make a password that passes all the checks below. A new set of checks
          appears every day.
        </Typography>
        <PasswordLevel q={q} onComplete={() => handleComplete(activeLevel)} />
      </GameShell>
    );
  }

  if (allDone) {
    return (
      <GameShell
        title="Build a Password"
        difficulty="hard"
        date={date}
        progress={100}
        onBack={onBack}
      >
        <Box sx={{ textAlign: "center", py: 8 }} className="slide-up">
          <EmojiEventsIcon
            sx={{
              fontSize: 56,
              color: p.primary,
              mb: 2,
              filter: `drop-shadow(0 0 12px ${alpha(p.primary, 0.5)})`,
            }}
          />
          <Typography variant="h2" sx={{ mb: 1 }}>
            All levels done! 🎉
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            Come back tomorrow for a new password challenge.
          </Typography>
          <Alert
            severity="success"
            sx={{ maxWidth: 420, mx: "auto", textAlign: "left" }}
          >
            Remember: longer passwords win. A random 16-character password is
            almost impossible to crack — even for the fastest computers.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={onBack}
            sx={{ mt: 3 }}
          >
            Back to home
          </Button>
        </Box>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Build a Password"
      difficulty="easy"
      date={date}
      onBack={onBack}
    >
      <Typography
        variant="overline"
        sx={{ display: "block", mb: 1, color: p.primary }}
      >
        Today's Challenge
      </Typography>
      <Typography variant="h2" sx={{ mb: 3 }}>
        Build a Password
      </Typography>
      <InfoPanel title="Why do passwords matter?" content={INFO_TEXT} />
      <LevelPicker
        levels={sortedQ.map((q) => ({
          difficulty: q.difficulty,
          subtitle: `${q.rules.length} requirements to meet`,
        }))}
        completed={completed}
        onSelect={setActiveLevel}
      />
    </GameShell>
  );
}
