import { useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, IconButton, Alert, Button, Tooltip, Fade } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTheme, alpha } from '@mui/material/styles';
import { evaluateCriteria, getStrengthInfo } from '../utils/passwordUtils';
import type { PasswordBuildConfig } from '../api/types';

interface Props {
  config: PasswordBuildConfig;
  onComplete: (passed: boolean) => void;
}

export function Stage1Builder({ config, onComplete }: Props) {
  const theme = useTheme();
  const [password, setPassword] = useState('');
  const [visible, setVisible]   = useState(false);
  const [analysed, setAnalysed] = useState(false);

  const criteria = evaluateCriteria(password, config);
  const strength = getStrengthInfo(password, config);
  const metCount = Object.values(criteria).filter(Boolean).length;
  const canAnalyse = strength.level >= config.minStrengthToPass && password.length > 0;

  const handleAnalyse = useCallback(() => {
    setAnalysed(true);
    setTimeout(() => onComplete(true), 1600);
  }, [onComplete]);

  return (
    <Box className="slide-up">
      <Typography variant="overline" sx={{ display: 'block', mb: 1, color: theme.palette.terminal.phosphor }}>
        Stage 1 of 4 — Build
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>Build a Strong Password</Typography>
      <Typography variant="body2" sx={{ mb: 3, maxWidth: 560 }}>
        Type a password below and watch its strength change in real time.
        Hit <strong style={{ color: theme.palette.terminal.phosphor }}>STRONG</strong> to continue.
      </Typography>

      <Card elevation={2} sx={{ mb: 2, position: 'relative', overflow: 'visible' }}>
        <Box sx={{ position: 'absolute', top: -10, left: 16, background: theme.palette.terminal.surface, px: 1, fontFamily: '"Share Tech Mono", monospace', fontSize: '0.625rem', letterSpacing: '0.25em', color: theme.palette.terminal.muted, textTransform: 'uppercase' }}>
          Password Input
        </Box>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              type={visible ? 'text' : 'password'}
              placeholder="type your password..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              inputProps={{ spellCheck: false }}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={() => setVisible(v => !v)} edge="end" sx={{ mr: 0.5 }}>
                    {visible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                ),
              }}
            />
          </Box>

          {/* Strength bar */}
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
            {[0,1,2,3,4].map(i => (
              <Box key={i} sx={{
                flex: 1, height: 4, borderRadius: 1,
                bgcolor: (password.length > 0 && i < strength.level) ? strength.color : theme.palette.terminal.border,
                boxShadow: (password.length > 0 && i < strength.level) ? `0 0 6px ${alpha(strength.color, 0.6)}` : 'none',
                transition: 'background-color 0.3s, box-shadow 0.3s',
              }} />
            ))}
          </Box>

          <Typography variant="caption" sx={{ display: 'block', mb: 2, color: password.length === 0 ? theme.palette.terminal.ghost : strength.color, fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600, transition: 'color 0.3s' }}>
            {password.length === 0 ? 'Awaiting input...' : strength.label}
          </Typography>

          {/* Dynamic criteria from backend */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            {config.rules.map(rule => (
              <Box key={rule.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: criteria[rule.id] ? theme.palette.terminal.phosphor : theme.palette.terminal.ghost, transition: 'color 0.2s' }}>
                {criteria[rule.id]
                  ? <CheckCircleIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                  : <RadioButtonUncheckedIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                }
                <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'inherit' }}>
                  {rule.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Crack time */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '10px 14px', bgcolor: theme.palette.terminal.deep, border: `1px solid ${theme.palette.terminal.border}`, borderRadius: '3px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon sx={{ fontSize: 14, color: theme.palette.terminal.muted }} />
              <Typography variant="caption" sx={{ letterSpacing: '0.1em', color: theme.palette.terminal.muted }}>Estimated crack time</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.875rem', fontWeight: 600, color: strength.level >= 3 ? theme.palette.terminal.phosphor : theme.palette.terminal.coral, transition: 'color 0.3s' }}>
              {strength.crackTime}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Fade in={analysed}>
        <Box>
          <Alert severity="success" sx={{ mb: 2, fontSize: '0.8125rem' }}>
            {config.successMessage}
          </Alert>
        </Box>
      </Fade>

      <Tooltip title={canAnalyse ? '' : `Reach strength level ${config.minStrengthToPass}/5 first (${metCount}/${config.rules.length} rules met)`} arrow placement="top">
        <span>
          <Button variant="contained" color="primary" size="large" disabled={!canAnalyse} onClick={handleAnalyse} endIcon={<ArrowForwardIcon />} sx={{ minWidth: 160 }}>
            Analyse →
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}
