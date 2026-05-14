import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  ButtonBase,
  Alert,
  Fade,
  Button,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useTheme, alpha } from "@mui/material/styles";
import { GameShell } from "./GameShell";
import { InfoPanel } from "./InfoPanel";
import { LevelPicker } from "./LevelPicker";
import type { SpotWeakestQuestion, Difficulty } from "../api/types";

const INFO_TEXT = `Not all passwords are equally safe — even if they look complicated at first glance.

What makes a password easy to crack?
• Dictionary words: Hackers try every word in the dictionary first.
• Predictable substitutions: Swapping "a" for "@" or "o" for "0" is well known to attackers — it barely helps.
• Common patterns: Passwords like "Company2024!" follow patterns that attackers test automatically.
• Short length: A 6-character password can be cracked in seconds on modern hardware.

In this challenge you'll look at a group of passwords and pick the one a hacker would crack first. Think about which one follows the most predictable pattern.`;

interface Props {
  questions: SpotWeakestQuestion[];
  date: string;
  onBack: () => void;
}

function SpotLevel({
  q,
  onComplete,
}: {
  q: SpotWeakestQuestion;
  onComplete: () => void;
}) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "correct" | "wrong">("idle");
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (id: string, isWeakest: boolean) => {
    if (state !== "idle") return;
    setSelected(id);
    if (isWeakest) {
      setState("correct");
      setRevealed(true);
    } else {
      setState("wrong");
    }
  };

  return (
    <Box className="slide-up">
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
        {q.scenario}
      </Alert>

      <Card elevation={2} sx={{ mb: 2 }}>
        <Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "text.disabled",
              fontWeight: 700,
            }}
          >
            Pick the weakest one
          </Typography>
        </Box>
        <CardContent
          sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}
        >
          {q.candidates.map((c) => {
            const isSelected = selected === c.id;
            const borderColor =
              isSelected && state === "correct"
                ? p.primary
                : isSelected && state === "wrong"
                  ? p.danger
                  : p.border;
            const bg =
              isSelected && state === "correct"
                ? alpha(p.primary, 0.07)
                : isSelected && state === "wrong"
                  ? alpha(p.danger, 0.07)
                  : "transparent";

            return (
              <ButtonBase
                key={c.id}
                onClick={() => handleSelect(c.id, c.is_weakest)}
                disabled={state === "correct"}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: "13px 16px",
                  border: "1.5px solid",
                  borderColor,
                  borderRadius: "8px",
                  bgcolor: bg,
                  transition: "all 0.2s",
                  "&:hover:not(:disabled)": {
                    borderColor: p.primary,
                    transform: "translateX(3px)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.9375rem",
                      letterSpacing: "0.04em",
                      color: "text.primary",
                    }}
                  >
                    {c.value}
                  </Typography>
                  {/* Removing the bit part */}
                  {/* <Chip
                    label={c.entropy_label}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.5625rem",
                      bgcolor: alpha(p.border, 0.5),
                      color: "text.disabled",
                      borderRadius: "4px",
                    }}
                  /> */}
                </Box>
                {isSelected && state === "correct" && c.is_weakest && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      border: `1px solid ${p.primary}`,
                      color: p.primary,
                      px: 1,
                      py: 0.25,
                      borderRadius: "4px",
                      fontSize: "0.5625rem",
                      letterSpacing: "0.15em",
                      fontFamily: "monospace",
                      flexShrink: 0,
                      ml: 1,
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 10 }} /> WEAKEST
                  </Box>
                )}
                {isSelected && state === "wrong" && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      border: `1px solid ${p.danger}`,
                      color: p.danger,
                      px: 1,
                      py: 0.25,
                      borderRadius: "4px",
                      fontSize: "0.5625rem",
                      letterSpacing: "0.15em",
                      fontFamily: "monospace",
                      flexShrink: 0,
                      ml: 1,
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 10 }} /> NOT THE WEAKEST
                  </Box>
                )}
              </ButtonBase>
            );
          })}
        </CardContent>
      </Card>

      {/* Wrong answer — stays until user clicks Try again */}
      <Fade in={state === "wrong"}>
        <Box>
          <Alert severity="error" sx={{ mb: 1.5 }}>
            Not quite — try another one. <br />
            <em>Hint: {q.hint}</em>
          </Alert>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => {
              setState("idle");
              setSelected(null);
            }}
            sx={{ mb: 2 }}
          >
            Try again
          </Button>
        </Box>
      </Fade>

      {/* Correct — full explanation shown, user controls next step */}
      <Fade in={revealed}>
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>Correct! ✓</strong>{" "}
            {q.candidates.find((c) => c.is_weakest)?.explanation}
            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
              }}
            >
              {q.candidates.map((c) => (
                <Box
                  key={c.id}
                  sx={{ display: "flex", gap: 1, alignItems: "baseline" }}
                >
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: c.is_weakest ? p.danger : p.primary,
                      flexShrink: 0,
                    }}
                  >
                    {c.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                  >
                    — {c.explanation}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Alert>
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            onClick={onComplete}
            sx={{ minWidth: 160 }}
          >
            Continue
          </Button>
        </Box>
      </Fade>
    </Box>
  );
}

export default function SpotWeakestGame({ questions, date, onBack }: Props) {
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
        title="Spot the Weakest"
        difficulty={activeLevel}
        date={date}
        onBack={() => setActiveLevel(null)}
      >
        <Typography
          variant="overline"
          sx={{ display: "block", mb: 1, color: p.warning }}
        >
          Level — {activeLevel.charAt(0).toUpperCase() + activeLevel.slice(1)}
        </Typography>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Which password is easiest to crack?
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Look at the passwords below and pick the one a hacker would go for
          first.
        </Typography>
        <SpotLevel q={q} onComplete={() => handleComplete(activeLevel)} />
      </GameShell>
    );
  }

  if (allDone) {
    return (
      <GameShell
        title="Spot the Weakest"
        difficulty="hard"
        date={date}
        progress={100}
        onBack={onBack}
      >
        <Box sx={{ textAlign: "center", py: 8 }} className="slide-up">
          <EmojiEventsIcon sx={{ fontSize: 56, color: p.primary, mb: 2 }} />
          <Typography variant="h2" sx={{ mb: 1 }}>
            All levels done! 🎉
          </Typography>
          <Alert
            severity="success"
            sx={{ maxWidth: 420, mx: "auto", mt: 2, textAlign: "left" }}
          >
            Swapping letters for symbols (like "@" for "a") tricks people but
            not computers — hackers already know all these tricks. Random length
            wins every time.
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
      title="Spot the Weakest"
      difficulty="easy"
      date={date}
      onBack={onBack}
    >
      <Typography
        variant="overline"
        sx={{ display: "block", mb: 1, color: p.warning }}
      >
        Today's Challenge
      </Typography>
      <Typography variant="h2" sx={{ mb: 3 }}>
        Spot the Weakest Password
      </Typography>
      <InfoPanel title="What makes a password weak?" content={INFO_TEXT} />
      <LevelPicker
        levels={sortedQ.map((q) => ({
          difficulty: q.difficulty,
          subtitle: `${q.candidates.length} passwords to compare`,
        }))}
        completed={completed}
        onSelect={setActiveLevel}
      />
    </GameShell>
  );
}
