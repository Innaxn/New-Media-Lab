import React, { useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, Alert, Fade, LinearProgress, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme, alpha } from '@mui/material/styles';
import { evaluatePassphrase } from '../utils/passwordUtils';
import type { PassphraseConfig } from '../api/types';

interface Props {
  config: PassphraseConfig;
  onComplete: (passed: boolean) => void;
}

export function Stage4Passphrase({ config, onComplete }: Props) {
  const theme = useTheme();
  const [usedWords, setUsedWords]   = useState<Set<string>>(new Set());
  const [phrase, setPhrase]         = useState<string[]>([]);
  const [finalised, setFinalised]   = useState(false);

  const strength = evaluatePassphrase(phrase, config.minWords);

  const addWord = useCallback((word: string) => {
    if (usedWords.has(word)) return;
    setUsedWords(prev => new Set(prev).add(word));
    setPhrase(prev => [...prev, word]);
  }, [usedWords]);

  const removeWord = useCallback((index: number) => {
    const word = phrase[index];
    setUsedWords(prev => { const n = new Set(prev); n.delete(word); return n; });
    setPhrase(prev => prev.filter((_, i) => i !== index));
  }, [phrase]);

  const clearAll = useCallback(() => { setUsedWords(new Set()); setPhrase([]); }, []);

  const handleFinalise = () => { setFinalised(true); setTimeout(() => onComplete(true), 1600); };

  const progressValue = Math.min((phrase.length / (config.minWords + 1)) * 100, 100);
  const builtPhrase = phrase.join(config.separator);

  return (
    <Box className="slide-up">
      <Typography variant="overline" sx={{ display: 'block', mb: 1, color: theme.palette.terminal.phosphor }}>
        Stage 4 of 4 — Passphrase
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>Build a Passphrase</Typography>
      <Typography variant="body2" sx={{ mb: 3, maxWidth: 560 }}>
        Passphrases beat complex passwords because they're long <em>and</em> memorable.
        Assemble <strong style={{ color: theme.palette.terminal.phosphor }}>{config.minWords}+ words</strong> that you'd actually remember.
        Words are joined with <code style={{ color: theme.palette.terminal.amber }}>"{config.separator}"</code>.
      </Typography>

      {/* Word bank — populated from backend */}
      <Card elevation={2} sx={{ mb: 2, position: 'relative', overflow: 'visible' }}>
        <Box sx={{ position: 'absolute', top: -10, left: 16, background: theme.palette.terminal.surface, px: 1, fontFamily: '"Share Tech Mono", monospace', fontSize: '0.625rem', letterSpacing: '0.25em', color: theme.palette.terminal.muted, textTransform: 'uppercase' }}>
          Word Bank ({config.wordBank.length} words)
        </Box>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {config.wordBank.map(word => (
              <Chip
                key={word}
                label={word}
                onClick={() => addWord(word)}
                disabled={usedWords.has(word)}
                sx={{
                  fontFamily: '"Share Tech Mono", monospace', fontSize: '0.8125rem', letterSpacing: '0.04em',
                  bgcolor: usedWords.has(word) ? theme.palette.terminal.border : theme.palette.terminal.raised,
                  color: usedWords.has(word) ? theme.palette.terminal.ghost : theme.palette.text.primary,
                  border: `1px solid ${usedWords.has(word) ? theme.palette.terminal.border : theme.palette.terminal.borderLit}`,
                  borderRadius: '3px', height: 32,
                  opacity: usedWords.has(word) ? 0.4 : 1,
                  transition: 'all 0.2s', cursor: usedWords.has(word) ? 'default' : 'pointer',
                  '&:hover:not(.Mui-disabled)': { borderColor: theme.palette.terminal.phosphor, color: theme.palette.terminal.phosphor },
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Passphrase builder */}
      <Card elevation={2} sx={{ mb: 2, position: 'relative', overflow: 'visible' }}>
        <Box sx={{ position: 'absolute', top: -10, left: 16, background: theme.palette.terminal.surface, px: 1, fontFamily: '"Share Tech Mono", monospace', fontSize: '0.625rem', letterSpacing: '0.25em', color: theme.palette.terminal.muted, textTransform: 'uppercase' }}>
          Your Passphrase
        </Box>
        <CardContent>
          {/* Display */}
          <Box sx={{ minHeight: 54, border: `1px solid ${theme.palette.terminal.borderLit}`, borderRadius: '3px', p: '12px 16px', mb: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, bgcolor: theme.palette.terminal.deep }}>
            {phrase.length === 0 ? (
              <Typography variant="caption" sx={{ color: theme.palette.terminal.ghost, fontStyle: 'italic' }}>
                Click words above to build your passphrase...
              </Typography>
            ) : (
              phrase.map((word, i) => (
                <React.Fragment key={`${word}-${i}`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: '"Share Tech Mono", monospace', fontSize: '1rem', color: theme.palette.terminal.phosphor }}>
                    {word}
                    <Box component="button" onClick={() => removeWord(i)} sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0, lineHeight: 1, color: theme.palette.terminal.ghost, '&:hover': { color: theme.palette.terminal.coral }, transition: 'color 0.15s', display: 'flex', alignItems: 'center' }}>
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </Box>
                  </Box>
                  {i < phrase.length - 1 && (
                    <Typography component="span" sx={{ color: theme.palette.terminal.ghost, fontSize: '0.875rem', fontFamily: '"Share Tech Mono", monospace' }}>
                      {config.separator}
                    </Typography>
                  )}
                </React.Fragment>
              ))
            )}
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{ mb: 1, '& .MuiLinearProgress-bar': { background: strength.color, boxShadow: `0 0 8px ${alpha(strength.color, 0.5)}` } }}
          />

          {phrase.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600, letterSpacing: '0.08em' }}>
                ~{strength.bits} bits entropy · {strength.label}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.terminal.muted, fontFamily: '"Share Tech Mono", monospace' }}>
                crack: {strength.crackTime}
              </Typography>
            </Box>
          )}

          {phrase.length > 0 && phrase.length < config.minWords && (
            <Typography variant="caption" sx={{ display: 'block', color: theme.palette.terminal.amber, mb: 1.5 }}>
              Add {config.minWords - phrase.length} more word{config.minWords - phrase.length !== 1 ? 's' : ''} for a valid passphrase
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="contained" color="primary" disabled={!strength.ready} onClick={handleFinalise} endIcon={<EmojiEventsIcon />} sx={{ minWidth: 140 }}>
              Finalise →
            </Button>
            <Tooltip title="Clear all words" arrow>
              <Button variant="outlined" onClick={clearAll} startIcon={<RefreshIcon />} sx={{ minWidth: 100 }}>Clear</Button>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <Fade in={finalised}>
        <Box>
          <Alert severity="success" sx={{ mb: 2, fontSize: '0.8125rem' }}>
            <strong>Passphrase built:</strong> <code style={{ color: theme.palette.terminal.phosphor }}>{builtPhrase}</code>
            <br /><br />
            {config.successMessage}
          </Alert>
        </Box>
      </Fade>
    </Box>
  );
}
