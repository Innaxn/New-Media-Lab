import { useState, useCallback } from 'react';
import { Box, Typography, ButtonBase, Card, CardContent, Alert, Fade, Button, Collapse } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useTheme, alpha } from '@mui/material/styles';
import { GameShell } from './GameShell';
import { LevelPicker } from './LevelPicker';
import type { MultipleChoiceQuestion, Difficulty } from '../api/types';

const INFO_TEXT = `This quiz covers how your personal data is collected, used, and protected online — and what rights you have.

A few key ideas:
• Personal data is any information that can identify you: your name, email, location, or even your browsing history.
• Companies that collect your data are required by law (in the EU: GDPR) to tell you what they do with it and ask for your permission.
• You have the right to ask a company to delete your data, correct it, or hand it over to you.
• A "data breach" is when private data is accidentally exposed — companies must report this to authorities within 72 hours.

You don't need to be an expert. These questions are designed to help everyday people understand their rights online.`;

interface Props { questions: MultipleChoiceQuestion[]; date: string; onBack: () => void; }

function MCLevel({ q, onComplete }: { q: MultipleChoiceQuestion; onComplete: () => void }) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const [selected, setSelected]   = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint]   = useState(false);

  const correct = selected === q.correct_index;

  return (
    <Box className="slide-up">
      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5, lineHeight: 1.45, fontSize: '1rem' }}>
            {q.question}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {q.options.map((opt, idx) => {
              const isSelected  = selected === idx;
              const isCorrect   = idx === q.correct_index;
              const showCorrect = submitted && isCorrect;
              const showWrong   = submitted && isSelected && !isCorrect;

              const borderColor = showCorrect ? p.primary : showWrong ? p.danger : isSelected ? p.borderLit : p.border;
              const bgcolor     = showCorrect ? alpha(p.primary, 0.08) : showWrong ? alpha(p.danger, 0.07) : isSelected ? alpha(p.borderLit, 0.3) : 'transparent';

              return (
                <ButtonBase
                  key={idx}
                  onClick={() => { if (!submitted) setSelected(idx); }}
                  disabled={submitted}
                  sx={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1.5,
                    p: '12px 16px', border: '1.5px solid', borderColor, borderRadius: '8px',
                    bgcolor, transition: 'all 0.2s',
                    '&:hover:not(:disabled)': { borderColor: p.primary, bgcolor: alpha(p.primary, 0.04) },
                  }}
                >
                  <Box sx={{
                    width: 28, height: 28, borderRadius: '7px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid', borderColor: showCorrect ? p.primary : showWrong ? p.danger : isSelected ? p.borderLit : p.border,
                    bgcolor: showCorrect ? p.primary : showWrong ? p.danger : 'transparent',
                  }}>
                    {showCorrect ? <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />
                      : showWrong ? <CancelIcon sx={{ fontSize: 16, color: '#fff' }} />
                      : <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>{String.fromCharCode(65 + idx)}</Typography>
                    }
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', flex: 1, lineHeight: 1.4 }}>
                    {opt}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Hint */}
      {!submitted && (
        <Box sx={{ mb: 2 }}>
          <Button
            size="small" variant="text"
            startIcon={<LightbulbIcon sx={{ fontSize: 16 }} />}
            onClick={() => setShowHint(h => !h)}
            sx={{ color: p.warning, fontSize: '0.8125rem' }}
          >
            {showHint ? 'Hide hint' : 'Need a hint?'}
          </Button>
          <Collapse in={showHint}>
            <Alert severity="warning" sx={{ mt: 1, fontSize: '0.8125rem' }}>{q.hint}</Alert>
          </Collapse>
        </Box>
      )}

      {/* Submit */}
      {!submitted && (
        <Button variant="contained" color="primary" disabled={selected === null} onClick={() => setSubmitted(true)} sx={{ minWidth: 160 }}>
          Submit answer →
        </Button>
      )}

      {/* Result — stays until user continues */}
      <Fade in={submitted}>
        <Box>
          <Alert severity={correct ? 'success' : 'error'} sx={{ mb: 2, mt: submitted ? 2 : 0 }}>
            {correct
              ? <><strong>Correct! ✓</strong> {q.options[q.correct_index]}</>
              : <><strong>Not quite.</strong> The right answer was: <em>{q.options[q.correct_index]}</em></>
            }
          </Alert>
          <Button variant="contained" color="primary" endIcon={<ArrowForwardIcon />} onClick={() => onComplete()} sx={{ minWidth: 160 }}>
            Continue →
          </Button>
        </Box>
      </Fade>
    </Box>
  );
}

export default function MultipleChoiceGame({ questions, date, onBack }: Props) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const [activeLevel, setActiveLevel] = useState<Difficulty | null>(null);
  const [completed, setCompleted]     = useState<Set<Difficulty>>(new Set());
  const [allDone, setAllDone]         = useState(false);

  const sortedQ = [...questions].sort((a, b) => ({ easy:0, medium:1, hard:2 }[a.difficulty]??0) - ({ easy:0, medium:1, hard:2 }[b.difficulty]??0));

  const handleComplete = useCallback((d: Difficulty) => {
    setCompleted(prev => {
      const next = new Set(prev).add(d);
      if (next.size === sortedQ.length) setAllDone(true);
      return next;
    });
    setActiveLevel(null);
  }, [sortedQ.length]);

  if (activeLevel) {
    const q = sortedQ.find(q => q.difficulty === activeLevel)!;
    return (
      <GameShell title="Privacy Quiz" difficulty={activeLevel} date={date} onBack={() => setActiveLevel(null)}
        infoTitle="What is this quiz about?" infoContent={INFO_TEXT}>
        <Typography variant="overline" sx={{ display: 'block', mb: 1, color: p.primary }}>Level — {activeLevel}</Typography>
        <Typography variant="h3" sx={{ mb: 1 }}>Privacy Quiz</Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>Read the question carefully and pick the best answer. No prior knowledge needed!</Typography>
        <MCLevel q={q} onComplete={() => handleComplete(activeLevel)} />
      </GameShell>
    );
  }

  if (allDone) {
    return (
      <GameShell title="Privacy Quiz" difficulty="hard" date={date} progress={100} onBack={onBack}
        infoTitle="What is this quiz about?" infoContent={INFO_TEXT}>
        <Box sx={{ textAlign: 'center', py: 8 }} className="slide-up">
          <EmojiEventsIcon sx={{ fontSize: 56, color: p.primary, mb: 2 }} />
          <Typography variant="h2" sx={{ mb: 1 }}>All levels done! 🎉</Typography>
          <Alert severity="success" sx={{ maxWidth: 420, mx: 'auto', mt: 2, textAlign: 'left' }}>
            Knowing your rights online is the first step to protecting yourself. Come back tomorrow for new questions.
          </Alert>
        </Box>
      </GameShell>
    );
  }

  return (
    <GameShell title="Privacy Quiz" difficulty="easy" date={date} onBack={onBack}
      infoTitle="What is this quiz about?" infoContent={INFO_TEXT}>
      <Typography variant="overline" sx={{ display: 'block', mb: 1, color: p.primary }}>Today's Challenge</Typography>
      <Typography variant="h2" sx={{ mb: 1 }}>Privacy Quiz</Typography>
      <Typography variant="body2" sx={{ mb: 4, maxWidth: 520 }}>
        Three questions about how your personal data is used and protected online. No jargon — just everyday situations.
      </Typography>
      <LevelPicker
        levels={sortedQ.map(q => ({ difficulty: q.difficulty, subtitle: `${q.options.length} possible answers` }))}
        completed={completed}
        onSelect={setActiveLevel}
      />
    </GameShell>
  );
}
