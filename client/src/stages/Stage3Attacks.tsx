import { useState } from 'react';
import { Box, Card, CardContent, Typography, ButtonBase, Alert, Fade, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTheme, alpha } from '@mui/material/styles';
import type { SelectionState } from '../types';

// Stage 3 — Attack Types knowledge check.
// Content is static (these are fixed educational facts, not game rules),
// so no backend config is needed for this stage.

interface Props {
  onComplete: (passed: boolean) => void;
}

interface AttackType {
  id: string;
  name: string;
  icon: string;
  description: string;
  isCorrect: boolean;
}

const ATTACKS: AttackType[] = [
  { id: 'brute',      name: 'Brute Force',        icon: '🔢', description: 'Systematically try every possible character combination until one works.',                          isCorrect: false },
  { id: 'dictionary', name: 'Dictionary Attack',   icon: '📖', description: 'Use wordlists of common passwords, names, and known mutations like appending years.',                isCorrect: true  },
  { id: 'stuffing',   name: 'Credential Stuffing', icon: '🌊', description: 'Replay username/password pairs stolen from previous data breaches on new services.',               isCorrect: false },
  { id: 'social',     name: 'Social Engineering',  icon: '🕵️', description: 'Psychologically manipulate a person into revealing their credentials directly.',                   isCorrect: false },
];

export function Stage3Attacks({ onComplete }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState]       = useState<SelectionState>('idle');
  const [revealed, setRevealed] = useState(false);

  const handlePick = (attack: AttackType) => {
    if (state !== 'idle') return;
    setSelected(attack.id);
    if (attack.isCorrect) {
      setState('correct');
      setTimeout(() => setRevealed(true), 400);
    } else {
      setState('wrong');
      setTimeout(() => { setState('idle'); setSelected(null); }, 1400);
    }
  };

  const getCardStyle = (attack: AttackType) => {
    const base = { background: theme.palette.terminal.deep, borderColor: theme.palette.terminal.border };
    if (selected !== attack.id) return base;
    if (state === 'correct') return { background: alpha(theme.palette.terminal.phosphor, 0.07), borderColor: theme.palette.terminal.phosphor };
    if (state === 'wrong')   return { background: alpha(theme.palette.terminal.coral, 0.07),    borderColor: theme.palette.terminal.coral };
    return base;
  };

  return (
    <Box className="slide-up">
      <Typography variant="overline" sx={{ display: 'block', mb: 1, color: theme.palette.terminal.amber }}>
        Stage 3 of 4 — Attack Vectors
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>Know Your Attacks</Typography>

      {/* Scenario card */}
      <Card elevation={0} sx={{ mb: 3, borderLeft: `3px solid ${theme.palette.terminal.amber}`, bgcolor: theme.palette.terminal.deep, borderRadius: '0 3px 3px 0' }}>
        <CardContent sx={{ py: '14px !important' }}>
          <Typography variant="caption" sx={{ display: 'block', color: theme.palette.terminal.amber, mb: 0.5 }}>
            SCENARIO
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>
            Your colleague used the password{' '}
            <Box
              component="span"
              sx={{
                fontFamily: '"Share Tech Mono", monospace',
                color: theme.palette.terminal.amber,
                bgcolor: alpha(theme.palette.terminal.amber, 0.1),
                px: 0.75, borderRadius: 1,
              }}
            >
              sunshine2023
            </Box>
            . It was cracked in under 1 second. Which attack type was used?
          </Typography>
        </CardContent>
      </Card>

      {/* 2×2 flex grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        {ATTACKS.map(attack => (
          <ButtonBase
            key={attack.id}
            onClick={() => handlePick(attack)}
            disabled={state === 'correct'}
            sx={{
              width: 'calc(50% - 6px)',
              display: 'block',
              textAlign: 'left',
              border: '1.5px solid',
              borderRadius: '4px',
              p: '16px',
              transition: 'all 0.2s ease',
              '&:hover:not(:disabled)': {
                borderColor: theme.palette.terminal.borderLit,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              },
              ...getCardStyle(attack),
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', mb: 1, display: 'block', lineHeight: 1 }}>
              {attack.icon}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Syne", monospace',
                fontWeight: 700,
                fontSize: '0.875rem',
                color:
                  selected === attack.id && state === 'correct' ? theme.palette.terminal.phosphor :
                  selected === attack.id && state === 'wrong'   ? theme.palette.terminal.coral :
                  theme.palette.text.primary,
                mb: 0.75,
                display: 'block',
              }}
            >
              {attack.name}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.5, color: theme.palette.terminal.muted }}>
              {attack.description}
            </Typography>
          </ButtonBase>
        ))}
      </Box>

      <Fade in={state === 'wrong'}>
        <Box>
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.8125rem' }}>
            Not quite — "sunshine2023" is a real dictionary word with a year appended. Which attack type exploits word patterns and common mutations?
          </Alert>
        </Box>
      </Fade>

      <Fade in={revealed}>
        <Box>
          <Alert severity="success" sx={{ mb: 2, fontSize: '0.8125rem' }}>
            <strong>Correct — Dictionary Attack!</strong>
            <br />
            Dictionary attacks use wordlists with thousands of common words and year/number mutations.
            "sunshine" + "2023" is exactly the pattern these tools test first — within milliseconds.
            <br /><br />
            <strong>Tip:</strong> Appending the current year to a word is one of the most predictable patterns attackers exploit. A passphrase like "purple-bicycle-echo-3" is dramatically more resistant.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            onClick={() => onComplete(true)}
            sx={{ minWidth: 160 }}
          >
            Next Stage →
          </Button>
        </Box>
      </Fade>
    </Box>
  );
}
