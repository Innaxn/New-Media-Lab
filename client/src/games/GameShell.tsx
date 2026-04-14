import { useState } from 'react';
import {
  Box, Container, Typography, IconButton, Tooltip, Chip, LinearProgress,
  Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme, alpha } from '@mui/material/styles';
import { useColorMode } from '../context/ThemeContext';
import type { Difficulty } from '../api/types';

const DIFF_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

interface Props {
  title:       string;
  difficulty:  Difficulty;
  date:        string;
  progress?:   number;
  onBack:      () => void;
  children:    React.ReactNode;
  maxWidth?:   'sm' | 'md' | 'lg';
  /** Plain-language topic explanation shown in the ? dialog */
  infoTitle?:  string;
  infoContent?: string;
}

export function GameShell({ title, difficulty, date, progress, onBack, children, maxWidth = 'md', infoTitle, infoContent }: Props) {
  const theme = useTheme();
  const { mode, toggleMode } = useColorMode();
  const p = theme.palette.gh;
  const [helpOpen, setHelpOpen] = useState(false);

  const diffColor = difficulty === 'easy' ? p.primary : difficulty === 'medium' ? p.warning : p.danger;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Top bar ── */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 100, bgcolor: 'background.paper', borderBottom: `1px solid ${p.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Container maxWidth={maxWidth}>
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1.25, gap: 1.5 }}>
            <Tooltip title="Back to home" arrow>
              <IconButton size="small" onClick={onBack}><ArrowBackIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.9375rem', color: 'text.primary', lineHeight: 1.2 }}>
                {title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem', letterSpacing: '0.08em' }}>
                Glass House · {date}
              </Typography>
            </Box>
            <Chip
              label={DIFF_LABEL[difficulty]}
              size="small"
              sx={{ height: 22, fontSize: '0.625rem', fontWeight: 700, bgcolor: alpha(diffColor, 0.12), color: diffColor, border: `1px solid ${alpha(diffColor, 0.3)}`, borderRadius: '6px' }}
            />
            <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} arrow>
              <IconButton size="small" onClick={toggleMode} sx={{ ml: 0.5 }}>
                {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
          {progress !== undefined && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 3, bgcolor: p.border, borderRadius: 0, '& .MuiLinearProgress-bar': { bgcolor: diffColor } }}
            />
          )}
        </Container>
      </Box>

      {/* ── Content ── */}
      <Container maxWidth={maxWidth} sx={{ py: { xs: 3, sm: 5 } }}>
        {children}
      </Container>

      {/* ── Floating ? button ── */}
      {(infoTitle || infoContent) && (
        <Fab
          size="medium"
          onClick={() => setHelpOpen(true)}
          sx={{
            position: 'fixed', bottom: 28, right: 28,
            bgcolor: p.raisedBg, color: p.inkSoft,
            border: `1px solid ${p.borderLit}`,
            boxShadow: `0 4px 16px rgba(0,0,0,0.25)`,
            '&:hover': { bgcolor: p.border, color: p.primary, borderColor: p.primary, boxShadow: `0 4px 20px ${alpha(p.primary, 0.2)}` },
            zIndex: 200,
          }}
        >
          <HelpIcon />
        </Fab>
      )}

      {/* ── Info dialog ── */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pr: 1.5 }}>
          <span>💡 {infoTitle ?? 'About this challenge'}</span>
          <IconButton size="small" onClick={() => setHelpOpen(false)} sx={{ mt: -0.5 }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
            {infoContent}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="contained" color="primary" onClick={() => setHelpOpen(false)}>Got it</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
