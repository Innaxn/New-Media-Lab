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

  if (status === 'loading' || status === 'idle') {
    return (
      <Box
        sx={{
          minHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress
          size={32}
          thickness={2}
          sx={{ color: theme.palette.terminal.phosphor }}
        />
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.terminal.muted,
            letterSpacing: '0.2em',
            fontFamily: '"Share Tech Mono", monospace',
          }}
        >
          LOADING LEVEL DATA...
        </Typography>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box
        sx={{
          minHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 4,
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: theme.palette.terminal.coral, letterSpacing: '0.2em' }}
        >
          CONNECTION FAILED
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.terminal.muted, textAlign: 'center', maxWidth: 360 }}
        >
          {error ?? 'Could not load game data. Running with offline content.'}
        </Typography>
        {onRetry && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            size="small"
          >
            Retry
          </Button>
        )}
      </Box>
    );
  }

  return null;
}
