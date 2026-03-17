import { useState } from 'react';
import { Box, Card, CardContent, Typography, ButtonBase, Alert, Fade, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTheme, alpha } from '@mui/material/styles';
import type { SpotWeakConfig } from '../api/types';
import type { SelectionState } from '../types';

interface Props {
  config: SpotWeakConfig;
  onComplete: (passed: boolean) => void;
}

export function Stage2Spot({ config, onComplete }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState]       = useState<SelectionState>('idle');
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (id: string, isWeakest: boolean) => {
    if (state !== 'idle') return;
    setSelected(id);
    if (isWeakest) {
      setState('correct');
      setTimeout(() => setRevealed(true), 400);
    } else {
      setState('wrong');
      setTimeout(() => { setState('idle'); setSelected(null); }, 1300);
    }
  };

  return (
    <Box className="slide-up">
      <Typography variant="overline" sx={{ display: 'block', mb: 1, color: theme.palette.terminal.amber }}>
        Stage 2 of 4 — Identify
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>Spot the Weak Password</Typography>
      <Typography variant="body2" sx={{ mb: 1.5, maxWidth: 560 }}>{config.scenario}</Typography>

      <Card elevation={2} sx={{ mb: 2, position: 'relative', overflow: 'visible' }}>
        <Box sx={{ position: 'absolute', top: -10, left: 16, background: theme.palette.terminal.surface, px: 1, fontFamily: '"Share Tech Mono", monospace', fontSize: '0.625rem', letterSpacing: '0.25em', color: theme.palette.terminal.muted, textTransform: 'uppercase' }}>
          Leaked credential dump
        </Box>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {config.candidates.map(c => {
            const isSelected = selected === c.id;
            const borderColor = isSelected && state === 'correct' ? theme.palette.terminal.phosphor
              : isSelected && state === 'wrong' ? theme.palette.terminal.coral
              : theme.palette.terminal.border;
            const bgColor = isSelected && state === 'correct' ? alpha(theme.palette.terminal.phosphor, 0.07)
              : isSelected && state === 'wrong' ? alpha(theme.palette.terminal.coral, 0.07)
              : theme.palette.terminal.deep;

            return (
              <ButtonBase
                key={c.id}
                onClick={() => handleSelect(c.id, c.isWeakest)}
                disabled={state === 'correct'}
                sx={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  p: '13px 18px', border: '1.5px solid', borderRadius: '3px',
                  borderColor, background: bgColor,
                  transition: 'all 0.2s',
                  '&:hover:not(:disabled)': { borderColor: theme.palette.terminal.borderLit, transform: 'translateX(3px)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Typography sx={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.9375rem', letterSpacing: '0.04em' }}>
                    {c.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.terminal.ghost, fontFamily: '"Share Tech Mono", monospace', fontSize: '0.6rem' }}>
                    {c.entropyLabel}
                  </Typography>
                </Box>
                {isSelected && state === 'correct' && c.isWeakest && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, border: `1px solid ${theme.palette.terminal.phosphor}`, color: theme.palette.terminal.phosphor, px: 1, py: 0.25, borderRadius: '2px', fontSize: '0.625rem', letterSpacing: '0.15em', fontFamily: '"Share Tech Mono", monospace', flexShrink: 0, ml: 1 }}>
                    <CheckIcon sx={{ fontSize: 10 }} /> WEAKEST
                  </Box>
                )}
                {isSelected && state === 'wrong' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, border: `1px solid ${theme.palette.terminal.coral}`, color: theme.palette.terminal.coral, px: 1, py: 0.25, borderRadius: '2px', fontSize: '0.625rem', letterSpacing: '0.15em', fontFamily: '"Share Tech Mono", monospace', flexShrink: 0, ml: 1 }}>
                    <CloseIcon sx={{ fontSize: 10 }} /> NOT WEAKEST
                  </Box>
                )}
              </ButtonBase>
            );
          })}
        </CardContent>
      </Card>

      <Fade in={state === 'wrong'}>
        <Box>
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.8125rem' }}>{config.hint}</Alert>
        </Box>
      </Fade>

      <Fade in={revealed}>
        <Box>
          <Alert severity="success" sx={{ mb: 2, fontSize: '0.8125rem' }}>
            <strong>Correct!</strong> {config.candidates.find(c => c.isWeakest)?.explanation}
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {config.candidates.map(c => (
                <Box key={c.id}>
                  <span style={{ color: c.isWeakest ? theme.palette.terminal.coral : theme.palette.terminal.phosphor, fontWeight: 700 }}>{c.value}</span>
                  {' — '}{c.explanation}
                </Box>
              ))}
            </Box>
          </Alert>
          <Button variant="contained" color="primary" endIcon={<ArrowForwardIcon />} onClick={() => onComplete(true)} sx={{ minWidth: 160 }}>
            Next Stage →
          </Button>
        </Box>
      </Fade>
    </Box>
  );
}
