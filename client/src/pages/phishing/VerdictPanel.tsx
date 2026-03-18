// ─────────────────────────────────────────────────────────────────────────────
// VerdictPanel
//
// Renders the player's verdict controls and — after submission — the full
// debrief with clues and explanation. Stateless about the email; receives
// everything via props so it can be reused across all phishing levels.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTheme, alpha } from "@mui/material/styles";
import type { PhishingEmail } from "../../api/types";

interface Props {
  email: PhishingEmail;
  emailIndex: number;
  totalEmails: number;
  onNext: (correct: boolean) => void;
}

type Verdict = "phishing" | "legitimate";

export function VerdictPanel({
  email,
  emailIndex,
  totalEmails,
  onNext,
}: Props) {
  const theme = useTheme();

  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [confidence, setConfidence] = useState<number>(50);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect =
    verdict !== null &&
    ((verdict === "phishing" && email.isPhishing) ||
      (verdict === "legitimate" && !email.isPhishing));

  const handleSubmit = () => {
    if (!verdict) return;
    setSubmitted(true);
  };

  const isLast = emailIndex === totalEmails - 1;

  return (
    <Box>
      {/* ── Verdict buttons ── */}
      {!submitted && (
        <Box>
          <Typography
            sx={{
              fontFamily: '"Share Tech Mono", monospace',
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              color: theme.palette.terminal.ghost,
              textTransform: "uppercase",
              mb: 1.5,
            }}
          >
            Your verdict
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              mb: 2.5,
            }}
          >
            {/* Legitimate */}
            <Box
              component="button"
              onClick={() => setVerdict("legitimate")}
              sx={{
                border: "1.5px solid",
                borderColor:
                  verdict === "legitimate"
                    ? theme.palette.terminal.phosphor
                    : theme.palette.terminal.border,
                borderRadius: "4px",
                bgcolor:
                  verdict === "legitimate"
                    ? alpha(theme.palette.terminal.phosphor, 0.08)
                    : theme.palette.terminal.deep,
                p: "14px 16px",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  borderColor: theme.palette.terminal.phosphor,
                  bgcolor: alpha(theme.palette.terminal.phosphor, 0.05),
                },
              }}
            >
              <VerifiedUserIcon
                sx={{
                  fontSize: 22,
                  color:
                    verdict === "legitimate"
                      ? theme.palette.terminal.phosphor
                      : theme.palette.terminal.ghost,
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color:
                      verdict === "legitimate"
                        ? theme.palette.terminal.phosphor
                        : theme.palette.text.primary,
                    mb: 0.25,
                  }}
                >
                  Legitimate
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    color: theme.palette.terminal.ghost,
                    lineHeight: 1.4,
                  }}
                >
                  Safe to act on
                </Typography>
              </Box>
            </Box>

            {/* Phishing */}
            <Box
              component="button"
              onClick={() => setVerdict("phishing")}
              sx={{
                border: "1.5px solid",
                borderColor:
                  verdict === "phishing"
                    ? theme.palette.terminal.coral
                    : theme.palette.terminal.border,
                borderRadius: "4px",
                bgcolor:
                  verdict === "phishing"
                    ? alpha(theme.palette.terminal.coral, 0.08)
                    : theme.palette.terminal.deep,
                p: "14px 16px",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  borderColor: theme.palette.terminal.coral,
                  bgcolor: alpha(theme.palette.terminal.coral, 0.05),
                },
              }}
            >
              <SecurityIcon
                sx={{
                  fontSize: 22,
                  color:
                    verdict === "phishing"
                      ? theme.palette.terminal.coral
                      : theme.palette.terminal.ghost,
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color:
                      verdict === "phishing"
                        ? theme.palette.terminal.coral
                        : theme.palette.text.primary,
                    mb: 0.25,
                  }}
                >
                  Phishing
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    color: theme.palette.terminal.ghost,
                    lineHeight: 1.4,
                  }}
                >
                  Suspicious — do not click
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Confidence slider */}
          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.75,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Share Tech Mono", monospace',
                  fontSize: "0.6rem",
                  letterSpacing: "0.15em",
                  color: theme.palette.terminal.ghost,
                  textTransform: "uppercase",
                }}
              >
                Confidence
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Share Tech Mono", monospace',
                  fontSize: "0.6875rem",
                  color: theme.palette.terminal.muted,
                }}
              >
                {confidence}%
              </Typography>
            </Box>
            <Slider
              value={confidence}
              onChange={(_, v) => setConfidence(v as number)}
              min={0}
              max={100}
              step={5}
              sx={{
                color: theme.palette.terminal.phosphor,
                "& .MuiSlider-thumb": {
                  width: 14,
                  height: 14,
                  bgcolor: theme.palette.terminal.phosphor,
                  "&:hover": {
                    boxShadow: `0 0 0 8px ${alpha(theme.palette.terminal.phosphor, 0.16)}`,
                  },
                },
                "& .MuiSlider-rail": { bgcolor: theme.palette.terminal.border },
              }}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={!verdict}
            onClick={handleSubmit}
            sx={{ py: 1.25 }}
          >
            Submit Verdict 
          </Button>
        </Box>
      )}

      {/* ── Debrief ── */}
      <Fade in={submitted}>
        <Box>
          {submitted && (
            <>
              {/* Result banner */}
              <Alert
                severity={isCorrect ? "success" : "error"}
                icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                sx={{ mb: 2, fontSize: "0.875rem" }}
              >
                <strong>
                  {isCorrect
                    ? `Correct — this ${email.isPhishing ? "was phishing" : "was legitimate"}!`
                    : `Missed — this was ${email.isPhishing ? "a phishing email" : "legitimate"}`}
                </strong>
                <br />
                {email.explanation}
              </Alert>

              {/* Clues breakdown */}
              <Box
                sx={{
                  bgcolor: theme.palette.terminal.raised,
                  border: `1px solid ${theme.palette.terminal.border}`,
                  borderRadius: "4px",
                  p: 2,
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    color: theme.palette.terminal.ghost,
                    textTransform: "uppercase",
                    mb: 1.25,
                  }}
                >
                  {email.isPhishing
                    ? "Red flags in this email"
                    : "Trust signals in this email"}
                </Typography>
                <List disablePadding>
                  {email.clues.map((clue, i) => (
                    <ListItem
                      key={i}
                      disablePadding
                      sx={{ mb: 1, alignItems: "flex-start" }}
                    >
                      <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                        {email.isPhishing ? (
                          <CancelIcon
                            sx={{
                              fontSize: 14,
                              color: theme.palette.terminal.coral,
                            }}
                          />
                        ) : (
                          <CheckCircleIcon
                            sx={{
                              fontSize: 14,
                              color: theme.palette.terminal.phosphor,
                            }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={clue.label}
                        secondary={clue.explanation}
                        primaryTypographyProps={{
                          sx: {
                            fontFamily: '"Share Tech Mono", monospace',
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: email.isPhishing
                              ? theme.palette.terminal.coral
                              : theme.palette.terminal.phosphor,
                            mb: 0.25,
                          },
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            fontSize: "0.8125rem",
                            color: theme.palette.text.secondary,
                            lineHeight: 1.55,
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* XP */}
              {isCorrect && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    bgcolor: alpha(theme.palette.terminal.phosphor, 0.08),
                    border: `1px solid ${alpha(theme.palette.terminal.phosphor, 0.25)}`,
                    borderRadius: "4px",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Share Tech Mono", monospace',
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: theme.palette.terminal.phosphor,
                    }}
                  >
                    +{email.xpReward}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      color: theme.palette.terminal.muted,
                    }}
                  >
                    XP earned
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={() => onNext(isCorrect)}
                endIcon={<ArrowForwardIcon />}
                fullWidth
                sx={{ py: 1.25 }}
              >
                {isLast
                  ? "Complete Level "
                  : `Next Email (${emailIndex + 1}/${totalEmails}) →`}
              </Button>
            </>
          )}
        </Box>
      </Fade>
    </Box>
  );
}
