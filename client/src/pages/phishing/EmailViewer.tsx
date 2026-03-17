// ─────────────────────────────────────────────────────────────────────────────
// EmailViewer
//
// Renders a fake email client view driven entirely by the PhishingEmail
// payload from the backend. Supports three focus modes:
//   'headers' — only the header panel is shown
//   'body'    — only the body panel is shown
//   'full'    — both panels, mirroring a real email client layout
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Box, Typography, Tooltip, Chip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTheme, alpha } from "@mui/material/styles";
import type {
  PhishingEmail,
  EmailHeaders,
  EmailBodyBlock,
} from "../../api/types";

// ─── Fake email client chrome ─────────────────────────────────────────────────

function ClientChrome({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.terminal.border}`,
        borderRadius: "6px",
        overflow: "hidden",
        bgcolor: "#1a1f2e",
        fontFamily: '"Share Tech Mono", monospace',
      }}
    >
      {/* Title bar */}
      <Box
        sx={{
          bgcolor: "#141824",
          borderBottom: `1px solid ${theme.palette.terminal.border}`,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
            <Box
              key={i}
              sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: c }}
            />
          ))}
        </Box>
        <Typography
          sx={{
            flex: 1,
            textAlign: "center",
            fontSize: "0.625rem",
            letterSpacing: "0.15em",
            color: theme.palette.terminal.ghost,
            ml: -3,
          }}
        >
          INBOX — GLASS HOUSE MAIL
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

// ─── Header row ───────────────────────────────────────────────────────────────

interface HeaderRowProps {
  label: string;
  value: string;
  /** If true, renders in warning colour to draw attention */
  highlight?: "warn" | "danger";
  /** Tooltip explaining why this field is interesting */
  hint?: string;
}

function HeaderRow({ label, value, highlight, hint }: HeaderRowProps) {
  const theme = useTheme();

  const valueColor =
    highlight === "danger"
      ? theme.palette.terminal.coral
      : highlight === "warn"
        ? theme.palette.terminal.amber
        : theme.palette.text.secondary;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        py: 0.75,
        borderBottom: `1px solid ${theme.palette.terminal.border}`,
        alignItems: "baseline",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: theme.palette.terminal.ghost,
          width: 68,
          flexShrink: 0,
          pt: 0.1,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: "0.75rem",
          color: valueColor,
          flex: 1,
          wordBreak: "break-all",
          lineHeight: 1.5,
          transition: "color 0.2s",
        }}
      >
        {value}
      </Typography>
      {hint && (
        <Tooltip title={hint} arrow placement="left">
          <InfoOutlinedIcon
            sx={{
              fontSize: 13,
              color: theme.palette.terminal.ghost,
              flexShrink: 0,
              cursor: "help",
              "&:hover": { color: theme.palette.terminal.amber },
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
}

// ─── Headers panel ────────────────────────────────────────────────────────────

function HeadersPanel({ headers }: { headers: EmailHeaders }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Determine if the reply-to is suspicious (different domain from fromAddress)
  const fromDomain = headers.fromAddress.split("@")[1] ?? "";
  const replyDomain = headers.replyTo?.split("@")[1] ?? "";
  const replyMismatch = headers.replyTo && replyDomain !== fromDomain;

  return (
    <Box
      sx={{
        bgcolor: "#141824",
        borderBottom: `1px solid ${theme.palette.terminal.border}`,
        px: 2.5,
        py: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: "0.5625rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: theme.palette.terminal.ghost,
          }}
        >
          Message Headers
        </Typography>
        <Box
          component="button"
          onClick={() => setExpanded((e) => !e)}
          sx={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: "0.5625rem",
            letterSpacing: "0.1em",
            color: theme.palette.terminal.muted,
            "&:hover": { color: theme.palette.text.primary },
          }}
        >
          {expanded ? "▲ collapse" : "▼ expand all"}
        </Box>
      </Box>

      {/* Always visible: from + subject */}
      <HeaderRow
        label="From"
        value={`${headers.fromName} <${headers.fromAddress}>`}
        highlight={
          headers.fromAddress.includes("secure") ||
          headers.fromAddress.split("@")[1]?.split(".").length > 2
            ? "warn"
            : undefined
        }
        hint="Check the domain after @ — not just the display name before the address."
      />
      <HeaderRow label="Subject" value={headers.subject} />

      {/* Expanded: all fields */}
      {expanded && (
        <>
          <HeaderRow label="To" value={headers.to} />
          <HeaderRow label="Date" value={headers.date} />
          {headers.replyTo && (
            <HeaderRow
              label="Reply-To"
              value={headers.replyTo}
              highlight={replyMismatch ? "danger" : undefined}
              hint={
                replyMismatch
                  ? `⚠ Reply-To domain (${replyDomain}) differs from sender domain (${fromDomain}). Your replies go somewhere else.`
                  : "Reply-To matches the sender domain — expected."
              }
            />
          )}
        </>
      )}

      {/* Always show a subtle prompt to expand if not expanded yet */}
      {!expanded && (
        <Typography
          sx={{
            fontSize: "0.625rem",
            color: theme.palette.terminal.ghost,
            fontFamily: '"Share Tech Mono", monospace',
            mt: 0.75,
            fontStyle: "italic",
          }}
        >
          ▼ Expand to see To, Date{headers.replyTo ? ", Reply-To" : ""} fields
        </Typography>
      )}
    </Box>
  );
}

// ─── Body block renderers ─────────────────────────────────────────────────────

interface LinkBlockProps {
  block: EmailBodyBlock;
  isButton?: boolean;
}

function LinkBlock({ block, isButton }: LinkBlockProps) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  if (!block.content || !block.href) return null;

  // Check if the displayed text and real href look inconsistent
  const isHttpLink = block.href.startsWith("http://");

  return (
    <Box sx={{ my: isButton ? 1.5 : 0.5 }}>
      <Tooltip
        title={
          <Box>
            <Typography
              sx={{
                fontSize: "0.6rem",
                color: theme.palette.terminal.ghost,
                letterSpacing: "0.1em",
                mb: 0.25,
              }}
            >
              ACTUAL URL
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: "0.75rem",
                color: isHttpLink
                  ? theme.palette.terminal.coral
                  : theme.palette.terminal.phosphor,
                wordBreak: "break-all",
              }}
            >
              {block.href}
            </Typography>
            {isHttpLink && (
              <Typography
                sx={{
                  fontSize: "0.625rem",
                  color: theme.palette.terminal.coral,
                  mt: 0.5,
                }}
              >
                ⚠ HTTP — unencrypted connection
              </Typography>
            )}
          </Box>
        }
        arrow
        placement="top"
      >
        {isButton ? (
          <Box
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 2.5,
              py: 1,
              borderRadius: "4px",
              bgcolor: hovered ? alpha("#1565c0", 0.85) : "#1565c0",
              color: "#fff",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "default",
              transition: "background 0.15s",
              border: isHttpLink
                ? `1.5px solid ${theme.palette.terminal.coral}`
                : "none",
            }}
          >
            {block.content}
            <OpenInNewIcon sx={{ fontSize: 13 }} />
          </Box>
        ) : (
          <Box
            component="span"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
              color: isHttpLink ? theme.palette.terminal.coral : "#2563eb",
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

function BodyBlock({ block }: { block: EmailBodyBlock }) {
  const theme = useTheme();

  switch (block.type) {
    case "text":
      return (
        <Typography
          sx={{
            fontSize: "0.875rem",
            lineHeight: 1.75,
            color: block.urgent ? theme.palette.terminal.amber : "#2d3748",
            fontWeight: block.urgent ? 700 : 400,
            mb: 1,
            fontFamily: "Georgia, serif",
          }}
        >
          {block.content}
        </Typography>
      );

    case "link":
      return <LinkBlock block={block} isButton={false} />;

    case "button":
      return <LinkBlock block={block} isButton />;

    case "divider":
      return <Box sx={{ height: 1, bgcolor: "#e2e8f0", my: 1.5 }} />;

    default:
      return null;
  }
}

// ─── Body panel ───────────────────────────────────────────────────────────────

function BodyPanel({ blocks }: { blocks: EmailBodyBlock[] }) {
  return (
    <Box sx={{ bgcolor: "#ffffff", px: 3, py: 2.5 }}>
      {blocks.map((block, i) => (
        <BodyBlock key={i} block={block} />
      ))}
    </Box>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface EmailViewerProps {
  email: PhishingEmail;
}

export function EmailViewer({ email }: EmailViewerProps) {
  const theme = useTheme();
  const showHeaders =
    email.focusArea === "headers" || email.focusArea === "full";
  const showBody = email.focusArea === "body" || email.focusArea === "full";

  return (
    <Box>
      {/* Focus area badge */}
      <Box sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "center" }}>
        <Typography
          sx={{
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            color: theme.palette.terminal.ghost,
            textTransform: "uppercase",
          }}
        >
          Analyse:
        </Typography>
        {showHeaders && (
          <Chip
            label="Headers"
            size="small"
            sx={{
              height: 18,
              fontSize: "0.55rem",
              letterSpacing: "0.1em",
              fontFamily: '"Share Tech Mono", monospace',
              bgcolor: alpha(theme.palette.terminal.amber, 0.12),
              color: theme.palette.terminal.amber,
              border: `1px solid ${alpha(theme.palette.terminal.amber, 0.35)}`,
              borderRadius: "3px",
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        )}
        {showBody && (
          <Chip
            label="Body"
            size="small"
            sx={{
              height: 18,
              fontSize: "0.55rem",
              letterSpacing: "0.1em",
              fontFamily: '"Share Tech Mono", monospace',
              bgcolor: alpha(theme.palette.terminal.phosphor, 0.08),
              color: theme.palette.terminal.phosphor,
              border: `1px solid ${alpha(theme.palette.terminal.phosphor, 0.3)}`,
              borderRadius: "3px",
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        )}
        {showBody && (
          <Typography
            sx={{
              fontFamily: '"Share Tech Mono", monospace',
              fontSize: "0.6rem",
              color: theme.palette.terminal.ghost,
              ml: "auto",
              fontStyle: "italic",
            }}
          >
            Hover links to reveal real URL
          </Typography>
        )}
      </Box>

      <ClientChrome>
        {showHeaders && <HeadersPanel headers={email.headers} />}
        {showBody && email.body && <BodyPanel blocks={email.body} />}
      </ClientChrome>
    </Box>
  );
}
