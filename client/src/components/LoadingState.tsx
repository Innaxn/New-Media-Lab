import { Box, CircularProgress, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme } from '@mui/material/styles';

interface Props {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string | null;
  onRetry?: () => void;
  minHeight?: number | string;
}

export function LoadingState({ status, error, onRetry, minHeight = 300 }: Props) {
  const theme = useTheme();
  const p = theme.palette.gh;

  if (status === 'loading' || status === 'idle') {
    return (
      <Box sx={{ minHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress size={32} thickness={2} sx={{ color: p.primary }} />
        <Typography variant="caption" sx={{ color: p.inkSoft, letterSpacing: '0.2em' }}>
          Loading today's challenge…
        </Typography>
      </Box>
    );
  }
  if (status === 'error') {
    return (
      <Box sx={{ minHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 4 }}>
        <Typography variant="overline" sx={{ color: p.danger }}>Connection failed</Typography>
        <Typography variant="body2" sx={{ color: p.inkSoft, textAlign: 'center', maxWidth: 360 }}>
          {error ?? 'Could not load game data. Running with offline content.'}
        </Typography>
        {onRetry && (
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry} size="small">Retry</Button>
        )}
      </Box>
    );
  }
  return null;
}
