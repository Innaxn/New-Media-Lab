import { Box, Card, CardContent, Typography, Button, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useTheme, alpha } from '@mui/material/styles';

interface Props {
  score: number;
  total: number;
  onRestart: () => void;
  onHome?: () => void;
}

const SKILLS = [
  'Evaluating password strength in real time using backend rules',
  'Identifying weak vs strong password patterns from a live lineup',
  'Understanding dictionary attacks & credential substitution mutations',
  'Building memorable high-entropy passphrases',
];

const TIPS = [
  { label: 'TIP',  text: 'Use a password manager — you only need to memorise one strong passphrase.' },
  { label: 'NEXT', text: 'Level 02: Escape the Cookie Trap →' },
  { label: 'LAW',  text: 'NIST SP 800-63B recommends passphrase length over arbitrary complexity rules.' },
];


export function CompletionScreen({ score, total, onRestart, onHome }: Props) {
  const theme = useTheme();

  return (
    <Box className="slide-up" sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 6 }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 2, color: theme.palette.terminal.ghost, letterSpacing: '0.15em' }}>
        // level_complete.exe ──────────────────────────────────
      </Typography>

      <EmojiEventsIcon sx={{ fontSize: 56, color: theme.palette.terminal.phosphor, mb: 2, filter: `drop-shadow(0 0 16px ${alpha(theme.palette.terminal.phosphor, 0.6)})` }} />

      <Typography variant="h1" sx={{ fontSize: { xs: '2rem', sm: '2.75rem' }, mb: 0.5, color: theme.palette.terminal.phosphor, animation: 'glow 2.5s ease-in-out infinite', letterSpacing: '0.05em' }}>
        ACCESS GRANTED
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, letterSpacing: '0.2em', fontSize: '0.7rem' }}>
        MODULE 01 — PASSWORD VAULT — CLEARED
      </Typography>

      <Card elevation={2} sx={{ width: '100%', maxWidth: 520, mb: 3, borderColor: theme.palette.terminal.borderLit }}>
        <Box sx={{ background: theme.palette.terminal.deep, borderBottom: `1px solid ${theme.palette.terminal.border}`, px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ letterSpacing: '0.2em', color: theme.palette.terminal.muted }}>SESSION RESULTS</Typography>
          <Box sx={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '1.25rem', fontWeight: 600, color: score === total ? theme.palette.terminal.phosphor : theme.palette.terminal.amber }}>
            {score}/{total}
          </Box>
        </Box>
        <CardContent>
          <Typography variant="caption" sx={{ display: 'block', color: theme.palette.terminal.muted, letterSpacing: '0.2em', mb: 1.5 }}>SKILLS UNLOCKED</Typography>
          <List disablePadding>
            {SKILLS.map((skill, i) => (
              <ListItem key={i} disablePadding sx={{ mb: 0.75 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: theme.palette.terminal.phosphor }} />
                </ListItemIcon>
                <ListItemText primary={skill} primaryTypographyProps={{ variant: 'body2', fontSize: '0.8125rem' }} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          {TIPS.map((tip, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1, alignItems: 'flex-start' }}>
              <Box sx={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.5rem', letterSpacing: '0.15em', border: `1px solid`, borderColor: i === 0 ? theme.palette.terminal.amber : i === 1 ? theme.palette.terminal.phosphor : theme.palette.terminal.borderLit, color: i === 0 ? theme.palette.terminal.amber : i === 1 ? theme.palette.terminal.phosphor : theme.palette.terminal.muted, px: 0.75, py: 0.25, borderRadius: '2px', whiteSpace: 'nowrap', mt: 0.25, flexShrink: 0 }}>
                {tip.label}
              </Box>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: theme.palette.terminal.muted, lineHeight: 1.6 }}>
                {tip.text}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="outlined" startIcon={<ReplayIcon />} onClick={onRestart}>Play Again</Button>
        {onHome && (
          <Button variant="outlined" startIcon={<HomeIcon />} onClick={onHome} sx={{ borderColor: theme.palette.terminal.phosphor, color: theme.palette.terminal.phosphor, '&:hover': { bgcolor: alpha(theme.palette.terminal.phosphor, 0.08) } }}>
            Back to Home
          </Button>
        )}
      </Box>
    </Box>
  );
}
