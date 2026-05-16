import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Button,
  Alert,
  Fade,
  LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useTheme, alpha } from "@mui/material/styles";
import { GameShell } from "./GameShell";
import { LevelPicker } from "./LevelPicker";
import RobotGreeter from "../components/RobotGreeter";
import { evaluatePassphrase } from "../utils/passwordUtils";
import type { BuildPassphraseQuestion, Difficulty } from "../api/types";

const ROBOT_HEADLINE =
  "Hey, I'm Cipher! Forget cryptic symbols, a few random words make a much stronger password. Let me show you why.";

const ROBOT_DETAILS = `A passphrase is a password made of several random words joined together — like "correct-horse-battery-staple" or "ocean lamp purple fence".

Why are they better than a normal password?
• They're long. Four random words is already 20–30 characters, which is extremely hard to crack.
• They're memorable. You can picture the words, unlike a string of symbols.
• They're unpredictable — as long as the words are truly random and not a famous phrase.

Tip: avoid song lyrics, movie quotes, or sayings. Use a random mix of unrelated words instead.`;

// Per-difficulty robot lines — what Cipher whispers before each level
const ROBOT_LEVEL_LINES: Record<Difficulty, string> = {
  easy: "Start simple — pick any words that feel unrelated to each other. The more random the better!",
  medium:
    "Bigger word bank now. Resist the urge to pick words that 'go together' — random beats memorable-but-guessable.",
  hard: "This one's tricky — avoid common phrases or anything that reads like a sentence. Think 'turtle keyboard mountain whisper', not 'the quick brown fox'.",
};

interface Props {
  questions: BuildPassphraseQuestion[];
  date: string;
  onBack: () => void;
}

function PassphraseLevel({
  q,
  onComplete,
}: {
  q: BuildPassphraseQuestion;
  onComplete: () => void;
}) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const isDark = theme.palette.mode === "dark";

  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [phrase, setPhrase] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const strength = evaluatePassphrase(phrase, q.min_words, isDark);

  const addWord = useCallback(
    (word: string) => {
      if (usedWords.has(word)) return;
      setUsedWords((prev) => new Set(prev).add(word));
      setPhrase((prev) => [...prev, word]);
    },
    [usedWords],
  );

  const removeWord = useCallback(
    (i: number) => {
      const word = phrase[i];
      setUsedWords((prev) => {
        const n = new Set(prev);
        n.delete(word);
        return n;
      });
      setPhrase((prev) => prev.filter((_, idx) => idx !== i));
    },
    [phrase],
  );

  const clear = useCallback(() => {
    setUsedWords(new Set());
    setPhrase([]);
  }, []);

  const progress = Math.min((phrase.length / (q.min_words + 1)) * 100, 100);

  return (
    <Box className="slide-up">
      {/* Word bank */}
      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "text.disabled",
              fontWeight: 700,
              mb: 1.25,
            }}
          >
            Available words ({q.word_bank.length} total)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.875 }}>
            {q.word_bank.map((word) => (
              <Chip
                key={word}
                label={word}
                onClick={() => addWord(word)}
                disabled={usedWords.has(word)}
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.8125rem",
                  height: 30,
                  bgcolor: usedWords.has(word)
                    ? "background.default"
                    : alpha(p.primary, 0.08),
                  color: usedWords.has(word) ? "text.disabled" : "text.primary",
                  border: `1px solid ${usedWords.has(word) ? p.border : alpha(p.primary, 0.3)}`,
                  borderRadius: "6px",
                  opacity: usedWords.has(word) ? 0.4 : 1,
                  cursor: usedWords.has(word) ? "default" : "pointer",
                  transition: "all 0.2s",
                  "&:hover:not(.Mui-disabled)": {
                    borderColor: p.primary,
                    color: p.primary,
                  },
                  "& .MuiChip-label": { px: 1.25 },
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Phrase builder */}
      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "text.disabled",
              fontWeight: 700,
              mb: 1.25,
            }}
          >
            Your passphrase (words joined with "{q.separator}")
          </Typography>
          <Box
            sx={{
              minHeight: 52,
              border: `1px solid ${p.borderLit}`,
              borderRadius: "8px",
              p: "12px 16px",
              mb: 1.5,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 0.75,
              bgcolor: "background.default",
            }}
          >
            {phrase.length === 0 ? (
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", fontStyle: "italic" }}
              >
                Tap words above to add them here…
              </Typography>
            ) : (
              phrase.map((word, i) => (
                <React.Fragment key={`${word}-${i}`}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontFamily: "monospace",
                      fontSize: "1rem",
                      color: p.primary,
                    }}
                  >
                    {word}
                    <Box
                      component="button"
                      onClick={() => removeWord(i)}
                      sx={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        p: 0,
                        lineHeight: 1,
                        color: "text.disabled",
                        "&:hover": { color: p.danger },
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </Box>
                  </Box>
                  {i < phrase.length - 1 && (
                    <Typography
                      component="span"
                      sx={{ color: "text.disabled", fontFamily: "monospace" }}
                    >
                      {q.separator}
                    </Typography>
                  )}
                </React.Fragment>
              ))
            )}
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mb: 1,
              "& .MuiLinearProgress-bar": { bgcolor: strength.color },
            }}
          />

          {phrase.length > 0 && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
            >
              <Typography
                variant="caption"
                sx={{ color: strength.color, fontWeight: 600 }}
              >
                {/* ~{strength.bits} bits strength  */}
                {strength.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", fontFamily: "monospace" }}
              >
                crack time: {strength.crackTime}
              </Typography>
            </Box>
          )}
          {phrase.length > 0 && phrase.length < q.min_words && (
            <Typography
              variant="caption"
              sx={{ display: "block", color: p.warning, mb: 1.5 }}
            >
              Add {q.min_words - phrase.length} more word
              {q.min_words - phrase.length !== 1 ? "s" : ""} to finish
            </Typography>
          )}

          {!submitted && (
            <Box sx={{ display: "flex", gap: 1.5 }}>
              {phrase.length > 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!strength.ready}
                  onClick={() => setSubmitted(true)}
                  sx={{ minWidth: 140 }}
                >
                  Lock it in
                </Button>
              )}
              {phrase.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={clear}
                  startIcon={<RefreshIcon />}
                >
                  Clear
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Result — user-controlled */}
      <Fade in={submitted}>
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>Passphrase saved! ✓</strong>{" "}
            <code>{phrase.join(q.separator)}</code>
            <br />
            <br />
            {q.success_message}
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

export default function BuildPassphraseGame({
  questions,
  date,
  onBack,
}: Props) {
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
        title="Build a Passphrase"
        difficulty={activeLevel}
        date={date}
        onBack={() => setActiveLevel(null)}
      >
        <Typography
          variant="overline"
          sx={{ display: "block", mb: 1, color: p.primary }}
        >
          Level — {activeLevel}
        </Typography>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Build a Passphrase
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Click {q.min_words}+ words from the list below to build a long,
          memorable passphrase.
        </Typography>

        <RobotGreeter
          headline={ROBOT_LEVEL_LINES[activeLevel]}
          robotSize={56}
          robotColor={p.primary}
        />

        <PassphraseLevel q={q} onComplete={() => handleComplete(activeLevel)} />
      </GameShell>
    );
  }

  if (allDone) {
    return (
      <GameShell
        title="Build a Passphrase"
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
          <Box sx={{ maxWidth: 420, mx: "auto", mt: 2, textAlign: "left" }}>
            <RobotGreeter
              headline={
                "Four or more random words beats almost any short complex password. And the best part — you can actually remember it. See you tomorrow for a new challenge!"
              }
              robotSize={56}
              robotColor={p.primary}
            />
          </Box>
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
      title="Build a Passphrase"
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
        Build a Passphrase
      </Typography>
      <RobotGreeter
        headline={ROBOT_HEADLINE}
        details={ROBOT_DETAILS}
        robotColor={p.primary}
        robotSize={88}
      />
      <LevelPicker
        levels={sortedQ.map((q) => ({
          difficulty: q.difficulty,
          subtitle: `${q.word_bank.length} words · use at least ${q.min_words}`,
        }))}
        completed={completed}
        onSelect={setActiveLevel}
      />
    </GameShell>
  );
}
