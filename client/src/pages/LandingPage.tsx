import { Box, Typography, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import CookieIcon from '@mui/icons-material/Cookie';
import EmailIcon from '@mui/icons-material/Email';
import QuizIcon from '@mui/icons-material/Quiz';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useColorMode } from '../context/ThemeContext';

interface Props { onPlay: () => void; }

const TOPICS = [
  { icon: <LockIcon sx={{ fontSize: 14 }} />,   label: 'Passwords', color: '#0d7a55' },
  { icon: <CookieIcon sx={{ fontSize: 14 }} />, label: 'Cookies',   color: '#d94f3d' },
  { icon: <EmailIcon sx={{ fontSize: 14 }} />,  label: 'Phishing',  color: '#b06a00' },
  { icon: <QuizIcon sx={{ fontSize: 14 }} />,   label: 'Privacy Law', color: '#7c3aed' },
];

const TODAY = new Date().toLocaleDateString('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

export default function LandingPage({ onPlay }: Props) {
  const theme = useTheme();
  const { mode, toggleMode } = useColorMode();
  const p = theme.palette.gh;

  return (
    <Box
      sx={{
        minHeight: '100vh', bgcolor: 'background.default', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', px: { xs: 2.5, sm: 4 }, py: 8, overflow: 'hidden',
      }}
    >
      {/* Mode toggle */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} arrow>
          <IconButton onClick={toggleMode} sx={{ bgcolor: alpha(p.border, 0.6), border: `1px solid ${p.border}` }}>
            {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Soft decorative blobs */}
      <Box aria-hidden sx={{ position: 'absolute', top: -120, right: -120, width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(p.primary, 0.08)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', bottom: -80, left: -80, width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(p.danger, 0.06)} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 520, width: '100%', textAlign: 'center' }} className="slide-up">
        {/* Date badge */}
        <Chip
          icon={<CalendarTodayIcon sx={{ fontSize: '13px !important' }} />}
          label={TODAY}
          size="small"
          sx={{
            mb: 4, height: 28, fontSize: '0.6875rem', fontWeight: 600,
            bgcolor: alpha(p.primary, 0.10), color: p.primary,
            border: `1px solid ${alpha(p.primary, 0.25)}`, borderRadius: '20px',
            '& .MuiChip-label': { px: 1 },
            '& .MuiChip-icon': { color: `${p.primary} !important` },
          }}
        />

        {/* Wordmark */}
        <Typography component="h1" sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: { xs: '3.25rem', sm: '4.5rem' }, lineHeight: 0.95, letterSpacing: '-0.04em', color: 'text.primary', mb: 0.5 }}>
          Glass
        </Typography>
        <Typography component="span" sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: { xs: '3.25rem', sm: '4.5rem' }, lineHeight: 0.95, letterSpacing: '-0.04em', color: p.primary, display: 'block', mb: 3 }}>
          House
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto', mb: 1.5, fontSize: '1rem', lineHeight: 1.65 }}>
          A new data privacy challenge every day. Learn to protect yourself — one game at a time.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.disabled', mb: 4, fontSize: '0.8125rem' }}>
          Like Wordle, but for cybersecurity. One challenge per day.
        </Typography>

        <Button
          variant="contained" color="primary" size="large" onClick={onPlay}
          endIcon={<PlayArrowIcon />}
          sx={{
            px: 5, py: 1.75, fontSize: '1rem', fontWeight: 800, borderRadius: '50px', mb: 4,
            boxShadow: `0 6px 24px ${alpha(p.primary, 0.28)}`,
            '&:hover': { boxShadow: `0 8px 32px ${alpha(p.primary, 0.40)}` },
          }}
        >
          Play Today's Challenge
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          {TOPICS.map(t => (
            <Chip key={t.label} icon={t.icon} label={t.label} size="small"
              sx={{ height: 28, fontSize: '0.6875rem', fontWeight: 700, bgcolor: alpha(t.color, 0.09), color: t.color, border: `1px solid ${alpha(t.color, 0.22)}`, borderRadius: '20px', '& .MuiChip-icon': { color: `${t.color} !important` }, '& .MuiChip-label': { px: 0.75 } }}
            />
          ))}
        </Box>

        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem', lineHeight: 1.8, display: 'block' }}>
          No account needed · Free · Content updated daily
        </Typography>
      </Box>
    </Box>
  );
}
