import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
  Fade,
  Slider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useTheme, alpha } from "@mui/material/styles";
import { GameShell } from "./GameShell";
import { LevelPicker } from "./LevelPicker";
import type {
  PhishOrLegitQuestion,
  PhishingEmail,
  EmailBodyBlock,
  Difficulty,
} from "../api/types";

const INFO_TEXT = `Phishing is when someone sends a fake email pretending to be a trustworthy company — like your bank, Netflix, or a government office — to steal your password or personal details.

How to spot a phishing email:
• Check the sender's email address, not just the display name. "PayPal Support" could be sent from random@shady.ru.
• Hover over links before clicking. The real address often looks nothing like the label.
• Be suspicious of urgency: "Your account will be closed in 24 hours!" is a classic trick.
• Watch for spelling mistakes or awkward phrasing — real companies proofread.
• Check if the Reply-To address is different from the From address — a common trick.

If in doubt, go directly to the website by typing the address yourself, rather than clicking a link.`;

interface Props {
  questions: PhishOrLegitQuestion[];
  date: string;
  onBack: () => void;
}

function EmailClient({ email }: { email: PhishingEmail }) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const isDark = theme.palette.mode === "dark";
  const [expanded, setExpanded] = useState(false);

  const showHeaders =
    email.focus_area === "headers" || email.focus_area === "full";
  const showBody = email.focus_area === "body" || email.focus_area === "full";
  const fromDomain = email.headers.from_address.split("@")[1] ?? "";
  const replyDomain = email.headers.reply_to?.split("@")[1] ?? "";
  const replyMismatch: boolean = !!(
    email.headers.reply_to && replyDomain !== fromDomain
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 1.5,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.6875rem",
            color: "text.disabled",
            fontWeight: 700,
          }}
        >
          Focus on:
        </Typography>
        {showHeaders && (
          <Chip
            label="Sender info"
            size="small"
            sx={{
              height: 20,
              fontSize: "0.55rem",
              fontWeight: 700,
              bgcolor: alpha(p.warning, 0.1),
              color: p.warning,
              border: `1px solid ${alpha(p.warning, 0.28)}`,
              borderRadius: "5px",
            }}
          />
        )}
        {showBody && (
          <Chip
            label="Email content"
            size="small"
            sx={{
              height: 20,
              fontSize: "0.55rem",
              fontWeight: 700,
              bgcolor: alpha(p.primary, 0.1),
              color: p.primary,
              border: `1px solid ${alpha(p.primary, 0.28)}`,
              borderRadius: "5px",
            }}
          />
        )}
        {showBody && (
          <Typography
            sx={{
              fontSize: "0.6rem",
              color: "text.disabled",
              ml: "auto",
              fontStyle: "italic",
            }}
          >
            Hover over links to see the real address
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          border: `1px solid ${p.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          bgcolor: "background.paper",
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            bgcolor: isDark ? "#21293a" : "#f0eeeb",
            borderBottom: `1px solid ${p.border}`,
            px: 2,
            py: 0.875,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
            <Box
              key={i}
              sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: c }}
            />
          ))}
          <Typography
            sx={{
              flex: 1,
              textAlign: "center",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              color: "text.disabled",
              ml: -3,
            }}
          >
            INBOX
          </Typography>
        </Box>

        {showHeaders && (
          <Box
            sx={{
              bgcolor: isDark ? "#1c2330" : "#faf9f7",
              borderBottom: showBody ? `1px solid ${p.border}` : "none",
              px: 2.5,
              py: 1.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.75,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.5625rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "text.disabled",
                  fontWeight: 700,
                }}
              >
                Email details
              </Typography>
              <Box
                component="button"
                onClick={() => setExpanded((e) => !e)}
                sx={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.5625rem",
                  color: "text.disabled",
                  "&:hover": { color: "text.primary" },
                }}
              >
                {expanded ? "▲ show less" : "▼ show more"}
              </Box>
            </Box>
            <HeaderRow
              label="From"
              value={`${email.headers.from_name} <${email.headers.from_address}>`}
              mono
            />
            <HeaderRow label="Subject" value={email.headers.subject} />
            {expanded && (
              <>
                <HeaderRow label="To" value={email.headers.to} mono />
                <HeaderRow label="Date" value={email.headers.date} />
                {email.headers.reply_to && (
                  <HeaderRow
                    label="Reply-To"
                    value={email.headers.reply_to}
                    mono
                    warn={replyMismatch}
                    hint={
                      replyMismatch
                        ? `⚠ Replies go to a different address (${replyDomain}) than the sender (${fromDomain}) — this is suspicious`
                        : "Reply address matches sender — looks normal"
                    }
                  />
                )}
              </>
            )}
            {!expanded && (
              <Typography
                sx={{
                  fontSize: "0.5625rem",
                  color: "text.disabled",
                  mt: 0.75,
                  fontStyle: "italic",
                }}
              >
                ▼ Expand to see full details
                {email.headers.reply_to ? " including Reply-To" : ""}
              </Typography>
            )}
          </Box>
        )}

        {showBody && email.body && (
          <Box sx={{ bgcolor: isDark ? p.cardBg : "#ffffff", px: 3, py: 2.5 }}>
            {email.body.map((block, i) => (
              <BodyBlock key={i} block={block} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function HeaderRow({
  label,
  value,
  mono,
  warn,
  hint,
}: {
  label: string;
  value: string;
  mono?: boolean;
  warn?: boolean;
  hint?: string;
}) {
  const theme = useTheme();
  const p = theme.palette.gh;
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        py: 0.625,
        borderBottom: `1px solid ${p.border}`,
        alignItems: "baseline",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography
        sx={{
          fontSize: "0.5625rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "text.disabled",
          width: 60,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.8125rem",
          flex: 1,
          wordBreak: "break-all",
          fontFamily: mono ? "monospace" : "inherit",
          color: warn ? p.danger : "text.primary",
        }}
      >
        {value}
      </Typography>
      {hint && (
        <Tooltip title={hint} arrow>
          <InfoOutlinedIcon
            sx={{
              fontSize: 13,
              color: warn ? p.danger : "text.disabled",
              flexShrink: 0,
              cursor: "help",
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
}

function BodyBlock({ block }: { block: EmailBodyBlock }) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const [hovered, setHovered] = useState(false);
  const isHttp = block.href?.startsWith("http://");

  if (block.type === "divider")
    return <Box sx={{ height: 1, bgcolor: "#e2e8f0", my: 1.5 }} />;
  if (block.type === "text") {
    return (
      <Typography
        sx={{
          fontSize: "0.875rem",
          lineHeight: 1.75,
          mb: 1,
          fontFamily: "Georgia, serif",
          color: block.urgent ? p.warning : "#2d3748",
          fontWeight: block.urgent ? 700 : 400,
        }}
      >
        {block.content}
      </Typography>
    );
  }
  if (block.type === "button" || block.type === "link") {
    const isBtn = block.type === "button";
    return (
      <Box sx={{ my: isBtn ? 1.5 : 0.5 }}>
        <Tooltip
          title={
            <Box>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  color: "rgba(255,255,255,0.6)",
                  mb: 0.25,
                }}
              >
                REAL LINK GOES TO
              </Typography>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  color: isHttp ? "#f87171" : "#86efac",
                  wordBreak: "break-all",
                }}
              >
                {block.href}
              </Typography>
              {isHttp && (
                <Typography
                  sx={{ fontSize: "0.6rem", color: "#f87171", mt: 0.5 }}
                >
                  ⚠ HTTP — not encrypted (no padlock)
                </Typography>
              )}
            </Box>
          }
          arrow
          placement="top"
        >
          {isBtn ? (
            <Box
              component="span"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 2.5,
                py: 1,
                borderRadius: "6px",
                bgcolor: hovered ? "#1251a0" : "#1565c0",
                color: "#fff",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "default",
                transition: "background 0.15s",
                border: isHttp ? "2px solid #d94f3d" : "none",
              }}
            >
              {block.content}
              <OpenInNewIcon sx={{ fontSize: 13 }} />
            </Box>
          ) : (
            <Box
              component="span"
              sx={{
                color: isHttp ? "#d94f3d" : "#2563eb",
                textDecoration: "underline",
                cursor: "default",
                fontSize: "0.8125rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {block.content}
              <OpenInNewIcon sx={{ fontSize: 11 }} />
            </Box>
          )}
        </Tooltip>
      </Box>
    );
  }
  return null;
}

function VerdictPanel({
  email,
  emailIdx,
  total,
  onNext,
}: {
  email: PhishingEmail;
  emailIdx: number;
  total: number;
  onNext: (correct: boolean) => void;
}) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const [verdict, setVerdict] = useState<"phishing" | "legitimate" | null>(
    null,
  );
  const [confidence, setConfidence] = useState(50);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect =
    verdict !== null &&
    ((verdict === "phishing" && email.is_phishing) ||
      (verdict === "legitimate" && !email.is_phishing));

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: `1px solid ${p.border}`,
        borderRadius: "10px",
        p: 2.5,
        boxShadow: 1,
      }}
    >
      {!submitted ? (
        <>
          <Typography
            sx={{
              fontSize: "0.625rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "text.disabled",
              fontWeight: 700,
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
            {(
              [
                {
                  v: "legitimate" as const,
                  label: "Looks real",
                  sub: "Safe to act on",
                  icon: <VerifiedUserIcon sx={{ fontSize: 20 }} />,
                  color: p.primary,
                },
                {
                  v: "phishing" as const,
                  label: "Suspicious",
                  sub: "Don't click anything",
                  icon: <SecurityIcon sx={{ fontSize: 20 }} />,
                  color: p.danger,
                },
              ] as const
            ).map((opt) => (
              <Box
                key={opt.v}
                component="button"
                onClick={() => setVerdict(opt.v)}
                sx={{
                  border: "1.5px solid",
                  borderRadius: "8px",
                  p: "12px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  transition: "all 0.18s",
                  background: "none",
                  borderColor: verdict === opt.v ? opt.color : p.border,
                  bgcolor:
                    verdict === opt.v ? alpha(opt.color, 0.07) : "transparent",
                  "&:hover": {
                    borderColor: opt.color,
                    bgcolor: alpha(opt.color, 0.04),
                  },
                }}
              >
                <Box
                  sx={{
                    color: verdict === opt.v ? opt.color : "text.disabled",
                    flexShrink: 0,
                  }}
                >
                  {opt.icon}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: verdict === opt.v ? opt.color : "text.primary",
                      mb: 0.1,
                    }}
                  >
                    {opt.label}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.625rem", color: "text.disabled" }}
                  >
                    {opt.sub}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.625,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "text.disabled",
                  fontWeight: 700,
                }}
              >
                How confident are you?
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                {confidence}%
              </Typography>
            </Box>
            <Slider
              value={confidence}
              onChange={(_, v) => setConfidence(v as number)}
              min={0}
              max={100}
              step={5}
              size="small"
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={!verdict}
            onClick={() => setSubmitted(true)}
            sx={{ py: 1.25 }}
          >
            Submit verdict
          </Button>
        </>
      ) : (
        <Fade in>
          <Box>
            <Alert
              severity={isCorrect ? "success" : "error"}
              icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
              sx={{ mb: 2 }}
            >
              <strong>
                {isCorrect
                  ? `Correct! This ${email.is_phishing ? "was a phishing email" : "was a real email"}.`
                  : `Missed — this was ${email.is_phishing ? "a phishing email" : "actually a real email"}.`}
              </strong>
              <br />
              {email.explanation}
            </Alert>

            {/* Clues from backend */}
            <Box
              sx={{
                bgcolor: "background.default",
                border: `1px solid ${p.border}`,
                borderRadius: "8px",
                p: 1.75,
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.5625rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "text.disabled",
                  fontWeight: 700,
                  mb: 1.25,
                }}
              >
                {email.is_phishing ? "Warning signs" : "Signs it was real"}
              </Typography>
              <List disablePadding>
                {email.clues.map((clue, i) => (
                  <ListItem
                    key={i}
                    disablePadding
                    sx={{ mb: 0.875, alignItems: "flex-start" }}
                  >
                    <ListItemIcon sx={{ minWidth: 26, mt: 0.25 }}>
                      {email.is_phishing ? (
                        <CancelIcon sx={{ fontSize: 14, color: p.danger }} />
                      ) : (
                        <CheckCircleIcon
                          sx={{ fontSize: 14, color: p.primary }}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={clue.label}
                      secondary={clue.explanation}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: email.is_phishing ? p.danger : p.primary,
                            mb: 0.2,
                          },
                        },
                        secondary: {
                          sx: {
                            fontSize: "0.8125rem",
                            color: "text.secondary",
                            lineHeight: 1.5,
                          },
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {isCorrect && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: alpha(p.primary, 0.08),
                  border: `1px solid ${alpha(p.primary, 0.25)}`,
                  borderRadius: "8px",
                  px: 2,
                  py: 1,
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.375rem",
                    color: p.primary,
                  }}
                >
                  +{email.xp_reward}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.8125rem", color: "text.secondary" }}
                >
                  XP earned
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              onClick={() => onNext(isCorrect)}
              sx={{ py: 1.25 }}
            >
              {emailIdx < total - 1
                ? `Next email (${emailIdx + 2} of ${total})`
                : "Finish level"}
            </Button>
          </Box>
        </Fade>
      )}
    </Box>
  );
}

function PhishLevel({
  q,
  onComplete,
}: {
  q: PhishOrLegitQuestion;
  onComplete: () => void;
}) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const [emailIdx, setEmailIdx] = useState(0);
  const [xp, setXP] = useState(0);
  const [done, setDone] = useState(false);

  const handleNext = useCallback(
    (correct: boolean) => {
      if (correct) setXP((x) => x + q.emails[emailIdx].xp_reward);
      if (emailIdx < q.emails.length - 1) setEmailIdx((i) => i + 1);
      else setDone(true);
    },
    [emailIdx, q.emails],
  );

  if (done) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }} className="slide-up">
        <EmojiEventsIcon sx={{ fontSize: 48, color: p.primary, mb: 1.5 }} />
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          Level complete!
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          XP earned this level: {xp}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onComplete}
          endIcon={<ArrowForwardIcon />}
        >
          Continue
        </Button>
      </Box>
    );
  }

  const current = q.emails[emailIdx];
  return (
    <Box>
      <Alert
        severity="info"
        icon={false}
        sx={{
          mb: 2.5,
          bgcolor: alpha(p.warning, 0.07),
          borderColor: alpha(p.warning, 0.22),
          color: "text.primary",
          fontSize: "0.875rem",
        }}
      >
        <strong
          style={{
            fontSize: "0.625rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: p.warning,
          }}
        >
          What to look for
        </strong>
        <br />
        {q.teaching_point}
      </Alert>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.625rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "text.disabled",
              fontWeight: 700,
              mb: 1.5,
            }}
          >
            Email {emailIdx + 1} of {q.emails.length}
          </Typography>
          <EmailClient email={current} />
        </Box>
        <Box sx={{ position: { md: "sticky" }, top: { md: 72 } }}>
          <Typography
            sx={{
              fontSize: "0.625rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "text.disabled",
              fontWeight: 700,
              mb: 1.5,
            }}
          >
            Your verdict
          </Typography>
          <VerdictPanel
            key={current.id}
            email={current}
            emailIdx={emailIdx}
            total={q.emails.length}
            onNext={handleNext}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default function PhishingGame({ questions, date, onBack }: Props) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const [activeLevel, setActiveLevel] = useState<Difficulty | null>(null);
  const [completed, setCompleted] = useState<Set<Difficulty>>(new Set());
  const [allDone, setAllDone] = useState(false);

  const sortedQ = [...questions].sort(
    (a, b) =>
      (({ easy: 0, medium: 1, hard: 2 })[a.difficulty] ?? 0) -
      ({ easy: 0, medium: 1, hard: 2 }[b.difficulty] ?? 0),
  );

  const handleComplete = useCallback(
    (d: Difficulty) => {
      setCompleted((prev) => {
        const next = new Set(prev).add(d);
        if (next.size === sortedQ.length) setAllDone(true);
        return next;
      });
      setActiveLevel(null);
    },
    [sortedQ.length],
  );

  if (activeLevel) {
    const q = sortedQ.find((q) => q.difficulty === activeLevel)!;
    return (
      <GameShell
        title="Phish or Real?"
        difficulty={activeLevel}
        date={date}
        onBack={() => setActiveLevel(null)}
        maxWidth="lg"
        infoTitle="What is phishing?"
        infoContent={INFO_TEXT}
      >
        <Typography
          variant="overline"
          sx={{ display: "block", mb: 1, color: p.warning }}
        >
          Level — {activeLevel}
        </Typography>
        <Typography variant="h3" sx={{ mb: 3 }}>
          {q.instruction}
        </Typography>
        <PhishLevel q={q} onComplete={() => handleComplete(activeLevel)} />
      </GameShell>
    );
  }

  if (allDone) {
    return (
      <GameShell
        title="Phish or Real?"
        difficulty="hard"
        date={date}
        progress={100}
        onBack={onBack}
        maxWidth="lg"
        infoTitle="What is phishing?"
        infoContent={INFO_TEXT}
      >
        <Box sx={{ textAlign: "center", py: 8 }} className="slide-up">
          <EmojiEventsIcon sx={{ fontSize: 56, color: p.primary, mb: 2 }} />
          <Typography variant="h2" sx={{ mb: 1 }}>
            All levels done! 🎉
          </Typography>
          <Alert
            severity="success"
            sx={{ maxWidth: 420, mx: "auto", mt: 2, textAlign: "left" }}
          >
            Always check the sender's email address — not just the name. And
            never click links in suspicious emails; type the address yourself
            instead.
          </Alert>
        </Box>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Phish or Real?"
      difficulty="easy"
      date={date}
      onBack={onBack}
      maxWidth="lg"
      infoTitle="What is phishing?"
      infoContent={INFO_TEXT}
    >
      <Typography
        variant="overline"
        sx={{ display: "block", mb: 1, color: p.warning }}
      >
        Today's Challenge
      </Typography>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Phish or Real?
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, maxWidth: 520 }}>
        You'll see emails that may or may not be scams. Study the sender, links,
        and wording — then decide: real or fake?
      </Typography>
      <LevelPicker
        levels={sortedQ.map((q) => ({
          difficulty: q.difficulty,
          subtitle: `${q.emails.length} email${q.emails.length > 1 ? "s" : ""} to check`,
        }))}
        completed={completed}
        onSelect={setActiveLevel}
      />
    </GameShell>
  );
}
