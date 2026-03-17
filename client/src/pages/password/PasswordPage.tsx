import { useCallback, useState } from 'react';
import { Box, Container, Typography, Stepper, Step, StepLabel, LinearProgress, IconButton, Tooltip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAsync } from '../../hooks/useAsync';
import { fetchPasswordBuildConfig, fetchSpotWeakConfig, fetchPassphraseConfig } from '../../api/gameApi';
import { LoadingState } from '../../components/LoadingState';
import { Stage1Builder } from '../../stages/Stage1Builder';
import { Stage2Spot } from '../../stages/Stage2Spot';
import { Stage3Attacks } from '../../stages/Stage3Attacks';
import { Stage4Passphrase } from '../../stages/Stage4Passphrase';
import { CompletionScreen } from '../../stages/CompletionScreen';

const STAGE_LABELS = ['Build', 'Identify', 'Attacks', 'Passphrase'];

export default function PasswordPage() {
  const theme    = useTheme();
  const navigate = useNavigate();

  // Fetch all three backend configs in parallel
  const buildCfg  = useAsync(fetchPasswordBuildConfig);
  const spotCfg   = useAsync(fetchSpotWeakConfig);
  const phraseCfg = useAsync(fetchPassphraseConfig);

  const [currentStage, setCurrentStage]         = useState(0);
  const [stagesCompleted, setStagesCompleted]   = useState([false, false, false, false]);
  const [score, setScore]                       = useState(0);
  const [finished, setFinished]                 = useState(false);

  const isLoading = buildCfg.status === 'loading' || spotCfg.status === 'loading' || phraseCfg.status === 'loading';
  const hasError  = buildCfg.status === 'error'   || spotCfg.status === 'error'   || phraseCfg.status === 'error';
  const allReady  = buildCfg.data   && spotCfg.data   && phraseCfg.data;

  const handleStageComplete = useCallback((stageIdx: number, passed: boolean) => {
    setStagesCompleted(prev => {
      const next = [...prev];
      next[stageIdx] = true;
      return next;
    });
    if (passed) setScore(s => s + 1);
    if (stageIdx < 3) {
      setCurrentStage(stageIdx + 1);
    } else {
      setTimeout(() => setFinished(true), 600);
    }
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentStage(0);
    setStagesCompleted([false, false, false, false]);
    setScore(0);
    setFinished(false);
  }, []);

  const progressPct = (stagesCompleted.filter(Boolean).length / 4) * 100;

  const renderStage = () => {
    if (!allReady) return null;
    if (finished)  return <CompletionScreen score={score} total={4} onRestart={handleRestart} onHome={() => navigate('/')} />;
    switch (currentStage) {
      case 0: return <Stage1Builder    config={buildCfg.data!}  onComplete={p => handleStageComplete(0, p)} />;
      case 1: return <Stage2Spot       config={spotCfg.data!}   onComplete={p => handleStageComplete(1, p)} />;
      case 2: return <Stage3Attacks                              onComplete={p => handleStageComplete(2, p)} />;
      case 3: return <Stage4Passphrase config={phraseCfg.data!} onComplete={p => handleStageComplete(3, p)} />;
      default: return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Top bar ── */}
      <Box
        sx={{
          position: 'sticky', top: 0, zIndex: 100,
          bgcolor: theme.palette.terminal.deep,
          borderBottom: `1px solid ${theme.palette.terminal.border}`,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5, gap: 2 }}>
            <Tooltip title="Back to home" arrow>
              <IconButton size="small" onClick={() => navigate('/')} sx={{ flexShrink: 0 }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Syne", monospace', fontWeight: 800, fontSize: '0.9375rem',
                  color: theme.palette.terminal.phosphor,
                  textShadow: `0 0 12px ${alpha(theme.palette.terminal.phosphor, 0.4)}`,
                }}
              >
                Password Vault
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.terminal.ghost, letterSpacing: '0.15em', fontSize: '0.6rem', display: { xs: 'none', sm: 'block' } }}
              >
                GLASS HOUSE — MODULE 01
              </Typography>
            </Box>

            {/* Stage pips */}
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
              {stagesCompleted.map((done, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 24, height: 3, borderRadius: 1,
                    bgcolor: done ? theme.palette.terminal.phosphor : theme.palette.terminal.border,
                    boxShadow: done ? `0 0 5px ${alpha(theme.palette.terminal.phosphor, 0.6)}` : 'none',
                    transition: 'all 0.4s',
                  }}
                />
              ))}
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{
              height: 2, bgcolor: theme.palette.terminal.border,
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${theme.palette.terminal.phosphor}, ${alpha(theme.palette.terminal.phosphor, 0.5)})`,
                boxShadow: `0 0 8px ${alpha(theme.palette.terminal.phosphor, 0.4)}`,
              },
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        {/* Stepper */}
        {!finished && (
          <Stepper activeStep={currentStage} alternativeLabel sx={{ mb: 5 }}>
            {STAGE_LABELS.map((label, index) => (
              <Step key={label} completed={stagesCompleted[index]}>
                <StepLabel>
                  <Typography
                    variant="caption"
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      color: index === currentStage
                        ? theme.palette.terminal.phosphor
                        : stagesCompleted[index]
                        ? theme.palette.terminal.phosphor
                        : theme.palette.terminal.ghost,
                      fontSize: '0.6rem', letterSpacing: '0.15em',
                    }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* Content */}
        {(isLoading || hasError) && (
          <LoadingState
            status={isLoading ? 'loading' : 'error'}
            error={buildCfg.error ?? spotCfg.error ?? phraseCfg.error}
            onRetry={() => { buildCfg.refetch(); spotCfg.refetch(); phraseCfg.refetch(); }}
          />
        )}
        {allReady && renderStage()}
      </Container>
    </Box>
  );
}
