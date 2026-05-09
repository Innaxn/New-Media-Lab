import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Fade,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTheme, alpha } from "@mui/material/styles";
import { GameShell } from "../GameShell";
import { LevelPicker } from "../LevelPicker";
import type { Difficulty } from "../../api/types";

// ─── Info text for ? button ───────────────────────────────────────────────────

const INFO_TEXT = `When you visit almost any website, a popup appears asking you to agree to "cookies". But what are cookies, and why should you care?

What are cookies?
Cookies are tiny files a website saves on your device. Some are useful — they remember you're logged in, or keep items in your shopping cart. But many cookies exist only to track your behaviour across the internet and show you targeted ads.

You have the right to say no to tracking cookies. European law (GDPR) requires websites to make this just as easy as saying yes.

But most don't. Instead they use tricks called "dark patterns":

• The "Accept All" button is big and green. The "Reject" option is tiny, grey, or hidden.
• The ✕ button looks like it closes the popup — but it actually accepts all cookies.
• Confusing wording like "Do not uncheck to disable" is designed to make you give up.
• Some sites make you click through 3 or 4 screens just to say no — hoping you'll give up.
• Guilt-tripping buttons: "No thanks, I prefer a worse experience."

In these challenges you will practice spotting and avoiding these tricks on realistic cookie banners — just like the ones you see every day.`;

// ─── Shared types ─────────────────────────────────────────────────────────────

interface CookieLevel {
  id: string;
  difficulty: Difficulty;
  site: string; // fake site name shown in browser chrome
  url: string; // fake URL shown in address bar
  title: string; // level card title
  instruction: string; // shown above the banner
  mode: "escape" | "spot"; // escape = find the reject option; spot = identify dark patterns
  debrief: string; // plain-language explanation shown after
  patterns: PatternDef[]; // for spot mode — which elements to identify
  BannerComponent: React.ComponentType<BannerProps>;
}

interface PatternDef {
  id: string;
  label: string;
  explanation: string;
}

interface BannerProps {
  onCorrect: () => void; // user correctly rejected / found all patterns
  onWrong: () => void; // user clicked accept by mistake
  disabled: boolean;
  // spot mode
  onFoundPattern?: (id: string) => void;
  foundPatterns?: Set<string>;
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function BrowserChrome({ url, site }: { url: string; site: string }) {
  return (
    <Box
      sx={{
        bgcolor: "#2b2b2b",
        borderRadius: "8px 8px 0 0",
        px: 1.5,
        py: 0.875,
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
      <Box
        sx={{
          flex: 1,
          bgcolor: "#1a1a1a",
          borderRadius: "4px",
          px: 1.5,
          py: 0.4,
          fontSize: "0.6875rem",
          fontFamily: "monospace",
          color: "#888",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        🔒 {url}
      </Box>
    </Box>
  );
}

function FakePage({ lines = [70, 90, 60, 80, 50] }: { lines?: number[] }) {
  return (
    <Box
      sx={{
        p: 2.5,
        filter: "blur(2px)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          height: 16,
          bgcolor: "#e2e8f0",
          borderRadius: 1,
          mb: 1.5,
          width: "60%",
        }}
      />
      {lines.map((w, i) => (
        <Box
          key={i}
          sx={{
            height: 9,
            bgcolor: "#edf2f7",
            borderRadius: 1,
            mb: 0.75,
            width: `${w}%`,
          }}
        />
      ))}
    </Box>
  );
}

// Shared button base styles
const btn = (disabled: boolean) =>
  ({
    border: "none",
    borderRadius: "5px",
    cursor: disabled ? "default" : "pointer",
    fontFamily: "Arial, sans-serif",
    transition: "all 0.15s",
    pointerEvents: disabled ? "none" : "auto",
  }) as const;

// Tappable wrapper for spot mode
function TapTarget({
  id,
  label,
  found,
  onFind,
  children,
}: {
  id: string;
  label: string;
  found: boolean;
  onFind: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Box
      component={found ? "div" : "button"}
      onClick={!found ? () => onFind(id) : undefined}
      title={found ? `✓ Found: ${label}` : "Click to investigate this element…"}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        border: found ? "2px solid #e53e3e" : "2px dashed transparent",
        borderRadius: "4px",
        background: found ? "rgba(229,62,62,0.07)" : "none",
        cursor: found ? "default" : "crosshair",
        transition: "all 0.2s",
        p: 0.25,
        "&:hover:not([disabled])": !found
          ? { borderColor: "#f6ad55", background: "rgba(246,173,85,0.06)" }
          : {},
      }}
    >
      {children}
      {found && (
        <Box
          sx={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 17,
            height: 17,
            borderRadius: "50%",
            bgcolor: "#e53e3e",
            color: "#fff",
            fontSize: "0.5rem",
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✓
        </Box>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EASY BANNERS — "escape" mode: find the real reject option
// ─────────────────────────────────────────────────────────────────────────────

/** Easy-1: Ghost reject link — Accept is a big button, Reject is a tiny grey underline */
function BannerNewsEasy({ onCorrect, onWrong, disabled }: BannerProps) {
  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
      <Typography
        sx={{
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#1a202c",
          mb: 0.5,
        }}
      >
        We value your privacy
      </Typography>
      <Typography
        sx={{ fontSize: "0.75rem", color: "#718096", mb: 2, lineHeight: 1.6 }}
      >
        We and our partners use cookies to store and access information on your
        device to personalise ads and content, measure performance, and improve
        our services.
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box
          component="button"
          onClick={onWrong}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#276749",
            color: "#fff",
            px: 2.5,
            py: 1,
            fontSize: "0.875rem",
            fontWeight: 700,
            "&:hover": { bgcolor: "#22543d" },
          }}
        >
          Accept All
        </Box>
        {/* Ghost link — deliberately tiny and invisible */}
        <Box
          component="button"
          onClick={onCorrect}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            background: "none",
            color: "#a0aec0",
            fontSize: "0.6875rem",
            textDecoration: "underline",
            p: 0,
            "&:hover": { color: "#718096" },
          }}
        >
          manage preferences
        </Box>
      </Box>
    </Box>
  );
}

/** Easy-2: Fake ✕ accepts all — real reject is a smaller button */
function BannerShopEasy({ onCorrect, onWrong, disabled }: BannerProps) {
  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff", position: "relative" }}>
      {/* Fake close ✕ — actually accepts */}
      <Box
        component="button"
        onClick={onWrong}
        disabled={disabled}
        sx={{
          ...btn(disabled),
          position: "absolute",
          top: 10,
          right: 12,
          background: "none",
          color: "#a0aec0",
          fontSize: "1.125rem",
          lineHeight: 1,
          "&:hover": { color: "#4a5568" },
        }}
      >
        ✕
      </Box>
      <Typography
        sx={{
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#1a202c",
          mb: 0.5,
          pr: 4,
        }}
      >
        This site uses cookies
      </Typography>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "#718096",
          mb: 2,
          lineHeight: 1.6,
          pr: 4,
        }}
      >
        Click "Accept" to allow cookies for a better browsing experience. You
        can change your mind at any time in our Privacy Centre.
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Box
          component="button"
          onClick={onWrong}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#3182ce",
            color: "#fff",
            px: 2.5,
            py: 1,
            fontSize: "0.875rem",
            fontWeight: 700,
          }}
        >
          Accept
        </Box>
        <Box
          component="button"
          onClick={onCorrect}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#fff",
            color: "#718096",
            border: "1px solid #e2e8f0",
            px: 2,
            py: 1,
            fontSize: "0.8125rem",
          }}
        >
          Reject non-essential
        </Box>
      </Box>
    </Box>
  );
}

/** Easy-3: Accept/Decline but Decline is grey and placed last (visual asymmetry) */
function BannerBlogEasy({ onCorrect, onWrong, disabled }: BannerProps) {
  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box component="span" sx={{ fontSize: "1.25rem" }}>
          🍪
        </Box>
        <Typography
          sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a202c" }}
        >
          Cookie Notice
        </Typography>
      </Box>
      <Typography
        sx={{ fontSize: "0.75rem", color: "#718096", mb: 2, lineHeight: 1.65 }}
      >
        We'd like to set optional cookies to help us improve our website. We
        won't set optional cookies unless you enable them. Using this tool will
        set a cookie on your device to remember your choice.
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box
          component="button"
          onClick={onWrong}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#2b6cb0",
            color: "#fff",
            px: 2.5,
            py: 1,
            fontSize: "0.875rem",
            fontWeight: 700,
            flex: 1,
          }}
        >
          I accept
        </Box>
        {/* Visually much weaker — same action, very different weight */}
        <Box
          component="button"
          onClick={onCorrect}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#f7fafc",
            color: "#a0aec0",
            border: "1px solid #e2e8f0",
            px: 2,
            py: 1,
            fontSize: "0.75rem",
          }}
        >
          No thanks
        </Box>
      </Box>
    </Box>
  );
}

/** Easy-4: "Continue browsing" = accept; real reject is a link at the bottom */
function BannerTravelEasy({ onCorrect, onWrong, disabled }: BannerProps) {
  return (
    <Box sx={{ bgcolor: "#fff" }}>
      <Box
        sx={{
          bgcolor: "#ebf8ff",
          borderBottom: "1px solid #bee3f8",
          px: 2.5,
          py: 1.5,
        }}
      >
        <Typography
          sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#2c5282" }}
        >
          Before you continue
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#4a5568",
            mb: 2,
            lineHeight: 1.65,
          }}
        >
          We and our 127 partners process your personal data, including browsing
          and usage data, to personalise content and advertising. Click
          "Continue" to consent, or see your options below.
        </Typography>
        <Box
          component="button"
          onClick={onWrong}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            width: "100%",
            bgcolor: "#2b6cb0",
            color: "#fff",
            py: 1.25,
            fontSize: "0.875rem",
            fontWeight: 700,
            mb: 1.5,
          }}
        >
          Continue
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Box
            component="button"
            onClick={onCorrect}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              background: "none",
              color: "#a0aec0",
              fontSize: "0.6875rem",
              textDecoration: "underline",
              p: 0,
            }}
          >
            Manage my choices
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIUM BANNERS — escape mode but trickier wording / layout
// ─────────────────────────────────────────────────────────────────────────────

/** Medium-1: Double negative checkbox — pre-ticked, confusing label */
function BannerDoubleNegative({ onCorrect, onWrong, disabled }: BannerProps) {
  const [checked, setChecked] = useState(true);
  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
      <Typography
        sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1a202c", mb: 1 }}
      >
        Privacy Settings
      </Typography>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "#718096",
          mb: 1.5,
          lineHeight: 1.65,
        }}
      >
        By not objecting to our partners' use of data you consent to its
        processing for personalised content. Deselect below to object.
      </Typography>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.75rem",
          color: "#2d3748",
          marginBottom: 16,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          disabled={disabled}
          style={{ accentColor: "#3182ce", width: 14, height: 14 }}
        />
        Do not uncheck to disable non-essential cookie processing
      </label>
      <Box
        component="button"
        onClick={() => (checked ? onWrong() : onCorrect())}
        disabled={disabled}
        sx={{
          ...btn(disabled),
          bgcolor: "#3182ce",
          color: "#fff",
          px: 2.5,
          py: 1,
          fontSize: "0.875rem",
          fontWeight: 700,
        }}
      >
        Save my preferences
      </Box>
    </Box>
  );
}

/** Medium-2: Legitimate-sounding categories but "Analytics" is sneakily pre-ticked */
function BannerCategoryTrick({ onCorrect, onWrong, disabled }: BannerProps) {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
      <Typography
        sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1a202c", mb: 1 }}
      >
        Manage Cookie Preferences
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
        {[
          {
            label: "Strictly Necessary",
            checked: true,
            locked: true,
            note: "Required for the site to work",
          },
          {
            label: "Analytics cookies",
            checked: analytics,
            locked: false,
            note: "Help us understand how you use the site",
            onChange: setAnalytics,
          },
          {
            label: "Marketing cookies",
            checked: marketing,
            locked: false,
            note: "Used to show you personalised ads",
            onChange: setMarketing,
          },
        ].map((c, i) => (
          <label
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: c.locked ? "default" : "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={c.checked}
              disabled={c.locked || disabled}
              onChange={
                c.onChange ? (e) => c.onChange!(e.target.checked) : undefined
              }
              style={{ accentColor: "#3182ce", marginTop: 2 }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: "#2d3748",
                  fontWeight: c.locked ? 700 : 400,
                }}
              >
                {c.label}
              </Typography>
              <Typography sx={{ fontSize: "0.6875rem", color: "#a0aec0" }}>
                {c.note}
              </Typography>
            </Box>
          </label>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Box
          component="button"
          onClick={() => {
            if (!analytics && !marketing) onCorrect();
            else onWrong();
          }}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#2b6cb0",
            color: "#fff",
            px: 2.5,
            py: 1,
            fontSize: "0.875rem",
            fontWeight: 700,
          }}
        >
          Save choices
        </Box>
        <Box
          component="button"
          onClick={onWrong}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#276749",
            color: "#fff",
            px: 2,
            py: 1,
            fontSize: "0.8125rem",
          }}
        >
          Accept all
        </Box>
      </Box>
    </Box>
  );
}

/** Medium-3: "Accept" full-width, reject requires scrolling to find */
function BannerScrollTrick({ onCorrect, onWrong, disabled }: BannerProps) {
  return (
    <Box sx={{ bgcolor: "#fff" }}>
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography
          sx={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            color: "#1a202c",
            mb: 1,
          }}
        >
          Your Privacy Choices
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#718096",
            mb: 1.5,
            lineHeight: 1.65,
          }}
        >
          We use cookies and similar technologies to provide, protect, and
          improve our products and services, and to offer you personalised
          content. For more details, see our Cookie Policy and Privacy Notice.
        </Typography>
        <Box
          sx={{
            maxHeight: 60,
            overflowY: "auto",
            border: "1px solid #e2e8f0",
            borderRadius: 1,
            p: 1,
            mb: 1.5,
            bgcolor: "#f7fafc",
          }}
        >
          <Typography
            sx={{ fontSize: "0.6875rem", color: "#a0aec0", lineHeight: 1.5 }}
          >
            Third-party partners include: Google Analytics, Meta Pixel, LinkedIn
            Insight, Twitter Ads, Hotjar, Segment, HubSpot, Intercom, Marketo,
            Salesforce, Adobe Analytics, Criteo, TradeDesk, DoubleClick,
            AppNexus, Rubicon Project... (scroll to see all 47 partners)
          </Typography>
        </Box>
        <Box
          component="button"
          onClick={onWrong}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            width: "100%",
            bgcolor: "#3182ce",
            color: "#fff",
            py: 1.25,
            fontSize: "0.875rem",
            fontWeight: 700,
            mb: 1,
          }}
        >
          Accept All Cookies
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Box
            component="button"
            onClick={onCorrect}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              background: "none",
              color: "#a0aec0",
              fontSize: "0.6875rem",
              textDecoration: "underline",
              p: 0,
            }}
          >
            Reject non-essential cookies
          </Box>
          <Box
            component="button"
            disabled
            sx={{
              ...btn(true),
              background: "none",
              color: "#a0aec0",
              fontSize: "0.6875rem",
              textDecoration: "underline",
              p: 0,
            }}
          >
            Cookie settings
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/** Medium-4: "Legitimate interest" trick — opt-out buried in small text */
function BannerLegitimateInterest({
  onCorrect,
  onWrong,
  disabled,
}: BannerProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
      <Typography
        sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1a202c", mb: 1 }}
      >
        We process your data
      </Typography>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "#4a5568",
          mb: 1.5,
          lineHeight: 1.65,
        }}
      >
        We and our 32 partners process personal data under "legitimate
        interests" for advertising and analytics purposes. You can object at any
        time.
      </Typography>
      {!expanded ? (
        <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
          <Box
            component="button"
            onClick={onWrong}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              bgcolor: "#276749",
              color: "#fff",
              px: 2.5,
              py: 1,
              fontSize: "0.875rem",
              fontWeight: 700,
            }}
          >
            Agree &amp; Continue
          </Box>
          <Box
            component="button"
            onClick={() => setExpanded(true)}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              background: "none",
              color: "#a0aec0",
              fontSize: "0.6875rem",
              textDecoration: "underline",
              p: 0,
              alignSelf: "center",
            }}
          >
            More options
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography
            sx={{
              fontSize: "0.6875rem",
              color: "#718096",
              mb: 1.5,
              lineHeight: 1.6,
            }}
          >
            To object to processing under legitimate interests, click "Object to
            all" below. Note: this may affect site functionality.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box
              component="button"
              onClick={onWrong}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#276749",
                color: "#fff",
                px: 2,
                py: 0.875,
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              Agree &amp; Continue
            </Box>
            <Box
              component="button"
              onClick={onCorrect}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#fff",
                color: "#718096",
                border: "1px solid #e2e8f0",
                px: 2,
                py: 0.875,
                fontSize: "0.75rem",
              }}
            >
              Object to all
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HARD BANNERS — "spot" mode: identify all dark patterns by clicking them
// ─────────────────────────────────────────────────────────────────────────────

/** Hard-1: 3 patterns — pre-ticked, visual asymmetry, fake close */
function BannerSpot3({
  onCorrect,
  disabled,
  onFoundPattern,
  foundPatterns,
}: BannerProps) {
  const fp = foundPatterns ?? new Set<string>();
  const find = onFoundPattern ?? (() => {});
  const total = 3;
  const allFound = fp.size >= total;

  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff", position: "relative" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1a202c" }}
        >
          Cookie Consent
        </Typography>
        <TapTarget
          id="dp-fake-close"
          label="Fake close button"
          found={fp.has("dp-fake-close")}
          onFind={find}
        >
          <Box
            component="span"
            sx={{
              fontSize: "1rem",
              color: "#a0aec0",
              px: 0.5,
              cursor: "inherit",
              lineHeight: 1,
            }}
          >
            ✕
          </Box>
        </TapTarget>
      </Box>
      <Typography
        sx={{ fontSize: "0.75rem", color: "#718096", mb: 1.5, lineHeight: 1.6 }}
      >
        We use cookies to improve your experience and show you relevant ads.
      </Typography>
      <Box sx={{ mb: 1.5 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.75rem",
            color: "#2d3748",
            marginBottom: 6,
          }}
        >
          <input type="checkbox" checked disabled /> Strictly necessary
        </label>
        <TapTarget
          id="dp-pretick"
          label="Pre-ticked analytics checkbox"
          found={fp.has("dp-pretick")}
          onFind={find}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.75rem",
              color: "#2d3748",
              cursor: "inherit",
            }}
          >
            <input type="checkbox" checked readOnly /> Analytics &amp;
            advertising
          </label>
        </TapTarget>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <TapTarget
          id="dp-asymm"
          label="Visual asymmetry (Accept is bold, Reject is invisible)"
          found={fp.has("dp-asymm")}
          onFind={find}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="button"
              disabled
              sx={{
                ...btn(true),
                bgcolor: "#2b6cb0",
                color: "#fff",
                px: 2.5,
                py: 1,
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              Accept All
            </Box>
            <Box
              component="span"
              sx={{
                fontSize: "0.65rem",
                color: "#cbd5e0",
                textDecoration: "underline",
              }}
            >
              save preferences
            </Box>
          </Box>
        </TapTarget>
      </Box>
      {allFound && (
        <Button
          variant="contained"
          color="primary"
          onClick={onCorrect}
          sx={{ mt: 2, minWidth: 160 }}
          endIcon={<ArrowForwardIcon />}
        >
          All found — Continue
        </Button>
      )}
    </Box>
  );
}

/** Hard-2: 4 patterns — pre-ticked, guilt-shaming, asymmetry, wall of text */
function BannerSpot4({
  onCorrect,
  disabled,
  onFoundPattern,
  foundPatterns,
}: BannerProps) {
  const fp = foundPatterns ?? new Set<string>();
  const find = onFoundPattern ?? (() => {});
  const total = 4;
  const allFound = fp.size >= total;

  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1a202c" }}
        >
          Privacy Preferences
        </Typography>
        <TapTarget
          id="dp-wall"
          label="Wall of text / information overload"
          found={fp.has("dp-wall")}
          onFind={find}
        >
          <Box
            component="span"
            sx={{
              fontSize: "0.65rem",
              color: "#3182ce",
              textDecoration: "underline",
              cursor: "inherit",
            }}
          >
            See all 47 partners ›
          </Box>
        </TapTarget>
      </Box>
      <Typography
        sx={{
          fontSize: "0.6875rem",
          color: "#a0aec0",
          mb: 1.5,
          lineHeight: 1.5,
        }}
      >
        We and our partners store and access information on a device and process
        personal data for personalised ads, content measurement, audience
        insights, and product development.
      </Typography>
      <Box sx={{ mb: 1.5 }}>
        <TapTarget
          id="dp-pretick2"
          label="Pre-ticked marketing checkbox"
          found={fp.has("dp-pretick2")}
          onFind={find}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.75rem",
              color: "#2d3748",
              cursor: "inherit",
            }}
          >
            <input type="checkbox" checked readOnly /> Marketing &amp;
            personalisation
          </label>
        </TapTarget>
      </Box>
      <TapTarget
        id="dp-asymm2"
        label="Visual asymmetry (Accept big, Reject tiny)"
        found={fp.has("dp-asymm2")}
        onFind={find}
      >
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 1 }}>
          <Box
            component="button"
            disabled
            sx={{
              ...btn(true),
              bgcolor: "#276749",
              color: "#fff",
              px: 2.5,
              py: 1,
              fontSize: "0.875rem",
              fontWeight: 700,
            }}
          >
            Accept All
          </Box>
          <Box component="span" sx={{ fontSize: "0.6rem", color: "#cbd5e0" }}>
            reject
          </Box>
        </Box>
      </TapTarget>
      <TapTarget
        id="dp-shame"
        label="Guilt-shaming reject button"
        found={fp.has("dp-shame")}
        onFind={find}
      >
        <Box
          component="button"
          disabled
          sx={{
            ...btn(true),
            background: "none",
            border: "1px solid #e2e8f0",
            px: 2,
            py: 0.75,
            borderRadius: "4px",
            fontSize: "0.6875rem",
            color: "#a0aec0",
            cursor: "inherit",
            fontStyle: "italic",
          }}
        >
          No thanks, I prefer a worse experience
        </Box>
      </TapTarget>
      {allFound && (
        <Button
          variant="contained"
          color="primary"
          onClick={onCorrect}
          sx={{ mt: 2, minWidth: 160 }}
          endIcon={<ArrowForwardIcon />}
        >
          All found — Continue
        </Button>
      )}
    </Box>
  );
}

/** Hard-3: Multi-step roach motel (3 steps to reject) */
function BannerRoachMotel({ onCorrect, onWrong, disabled }: BannerProps) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      text: "We use cookies for analytics, personalisation, and advertising to improve your experience.",
      accept: { label: "Accept All", fn: onWrong },
      reject: { label: "Manage preferences", fn: () => setStep(1) },
    },
    {
      text: "Choose your experience. Personalised content is recommended for the best experience.",
      accept: { label: "Keep personalised", fn: onWrong },
      reject: { label: "No personalisation", fn: () => setStep(2) },
    },
    {
      text: "Are you sure? Without personalisation you may see less relevant content and ads.",
      accept: { label: "Go back — keep personalisation", fn: onWrong },
      reject: { label: "Confirm: reject all", fn: onCorrect },
    },
  ] as const;
  const s = steps[step];
  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
      <Typography
        sx={{
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#1a202c",
          mb: 0.75,
        }}
      >
        Cookie Settings
      </Typography>
      <Typography
        sx={{ fontSize: "0.75rem", color: "#718096", mb: 2, lineHeight: 1.65 }}
      >
        {s.text}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1 }}>
        <Box
          component="button"
          onClick={s.accept.fn}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#276749",
            color: "#fff",
            py: 1,
            fontSize: "0.875rem",
            fontWeight: 700,
          }}
        >
          {s.accept.label}
        </Box>
        <Box
          component="button"
          onClick={s.reject.fn}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#fff",
            color: "#718096",
            border: "1px solid #e2e8f0",
            py: 0.875,
            fontSize: "0.8125rem",
          }}
        >
          {s.reject.label}
        </Box>
      </Box>
      <Typography
        sx={{ fontSize: "0.6rem", color: "#a0aec0", fontFamily: "monospace" }}
      >
        Step {step + 1} of 3
      </Typography>
    </Box>
  );
}

/** Hard-4: 3 patterns to spot — double negative, asymmetry, guilt-shaming */
function BannerSpot3v2({
  onCorrect,
  disabled,
  onFoundPattern,
  foundPatterns,
}: BannerProps) {
  const fp = foundPatterns ?? new Set<string>();
  const find = onFoundPattern ?? (() => {});
  const total = 3;
  const allFound = fp.size >= total;

  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
      <Typography
        sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1a202c", mb: 1 }}
      >
        Your Privacy
      </Typography>
      <Box sx={{ mb: 1.5 }}>
        <TapTarget
          id="dp-doublenegative"
          label="Double negative / confusing wording"
          found={fp.has("dp-doublenegative")}
          onFind={find}
        >
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#4a5568",
              lineHeight: 1.6,
              cursor: "inherit",
            }}
          >
            By not disabling the non-objection to cookie processing you are
            consenting to our use of analytics data.
          </Typography>
        </TapTarget>
      </Box>
      <Box sx={{ mb: 1 }}>
        <TapTarget
          id="dp-asymm3"
          label="Visual asymmetry"
          found={fp.has("dp-asymm3")}
          onFind={find}
        >
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Box
              component="button"
              disabled
              sx={{
                ...btn(true),
                bgcolor: "#2b6cb0",
                color: "#fff",
                px: 2.5,
                py: 1,
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              Accept &amp; Continue
            </Box>
            <Box
              component="span"
              sx={{ fontSize: "0.6rem", color: "#e2e8f0", cursor: "inherit" }}
            >
              reject
            </Box>
          </Box>
        </TapTarget>
      </Box>
      <TapTarget
        id="dp-shame2"
        label="Guilt-shaming language"
        found={fp.has("dp-shame2")}
        onFind={find}
      >
        <Box
          component="button"
          disabled
          sx={{
            ...btn(true),
            background: "none",
            border: "none",
            fontSize: "0.6875rem",
            color: "#a0aec0",
            fontStyle: "italic",
            p: 0,
            cursor: "inherit",
          }}
        >
          Continue without supporting us
        </Box>
      </TapTarget>
      {allFound && (
        <Button
          variant="contained"
          color="primary"
          onClick={onCorrect}
          sx={{ mt: 2, minWidth: 160 }}
          endIcon={<ArrowForwardIcon />}
        >
          All found — Continue
        </Button>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const ALL_LEVELS: CookieLevel[] = [
  // ── EASY ──────────────────────────────────────────────────────────────────
  {
    id: "e1",
    difficulty: "easy",
    site: "The Daily Herald",
    url: "www.dailyherald.nl",
    title: "The Ghost Button",
    instruction:
      "Find a way to reject non-essential cookies. Look carefully — the reject option is hidden.",
    mode: "escape",
    debrief:
      'Did you spot it? The green "Accept All" button was large and obvious. The reject option was a tiny grey link that blended into the background — easy to miss. Websites do this on purpose to nudge you into accepting.\n\nThis is called a "ghost button" or "visual asymmetry" dark pattern. In Europe it is illegal under GDPR, but still very common.',
    patterns: [],
    BannerComponent: BannerNewsEasy,
  },
  {
    id: "e2",
    difficulty: "easy",
    site: "ShopNL",
    url: "www.shopnl.com",
    title: "The Fake Close Button",
    instruction:
      "Try to close or reject this cookie banner. But be careful — not everything is what it seems.",
    mode: "escape",
    debrief:
      'The ✕ button looked like it would close the banner — but it actually accepted all cookies. This is one of the most common tricks websites use.\n\nAlways look for an explicit "Reject" or "No thanks" button rather than the ✕. If you can\'t find one, try scrolling down — or open the site\'s Privacy Settings from the footer.',
    patterns: [],
    BannerComponent: BannerShopEasy,
  },
  {
    id: "e3",
    difficulty: "easy",
    site: "RecipeBlog",
    url: "www.recipe-world.nl",
    title: "The Weak Reject",
    instruction:
      "Both options are visible this time, but one is made to look much less important. Reject all non-essential cookies.",
    mode: "escape",
    debrief:
      '"I accept" was a bold, full-width blue button. "No thanks" was a small grey button that looked inactive.\n\nThis is visual asymmetry — using size, colour, and weight to steer your choice. The law says both options should be equally easy to use. This one clearly isn\'t.',
    patterns: [],
    BannerComponent: BannerBlogEasy,
  },
  {
    id: "e4",
    difficulty: "easy",
    site: "FlyAway Travel",
    url: "www.flyaway-travel.eu",
    title: "The Buried Option",
    instruction:
      'A full-width "Continue" button dominates the banner. Your real choice is somewhere else — find it.',
    mode: "escape",
    debrief:
      '"Continue" sounds neutral — like just closing the banner. But pressing it gave the site consent to share your data with 127 advertising partners.\n\nThe actual reject option was a tiny underlined link at the very bottom. This layout is designed so your eyes go straight to "Continue" and never find the alternative.',
    patterns: [],
    BannerComponent: BannerTravelEasy,
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────
  {
    id: "m1",
    difficulty: "medium",
    site: "FinanceTrack",
    url: "app.financetrack.io",
    title: "The Double Negative",
    instruction:
      "Read the checkbox label very carefully before clicking anything. The wording is designed to confuse.",
    mode: "escape",
    debrief:
      '"Do not uncheck to disable non-essential cookie processing." Read that again.\n\nIt is a double negative — two negations in one sentence. To opt OUT, you need to UNCHECK a box that is labelled "do not uncheck". This is intentionally confusing language to make you give up and leave the box ticked.\n\nEuropean law requires cookie consent to use "clear and plain language". This fails that test.',
    patterns: [],
    BannerComponent: BannerDoubleNegative,
  },
  {
    id: "m2",
    difficulty: "medium",
    site: "LearnOnline",
    url: "www.learnonline.eu",
    title: "The Pre-Ticked Category",
    instruction:
      "A preference panel lets you choose which cookies to allow. But something is already ticked that shouldn't be. Untick everything that isn't strictly necessary, then save.",
    mode: "escape",
    debrief:
      'The "Analytics cookies" checkbox was pre-ticked. The law says tracking cookies must start unticked — you must actively opt in, not be opted in automatically.\n\nPre-ticking optional cookies is explicitly illegal under GDPR. Always check the state of every checkbox in a cookie preferences panel before saving.',
    patterns: [],
    BannerComponent: BannerCategoryTrick,
  },
  {
    id: "m3",
    difficulty: "medium",
    site: "GlobalNews",
    url: "www.globalnews247.com",
    title: "The Wall of Partners",
    instruction:
      "A long list of partners and a huge Accept button. The real reject option is there — find it without clicking Accept.",
    mode: "escape",
    debrief:
      'The "Accept All" button was front and centre, full width. The reject option was hidden as a small underlined link below the wall of partner names — designed so most people give up scrolling and click Accept.\n\nWhenever you see a list of dozens of "partners" in a cookie banner, that is a sign that your data will be shared with many advertising companies. You always have the right to say no.',
    patterns: [],
    BannerComponent: BannerScrollTrick,
  },
  {
    id: "m4",
    difficulty: "medium",
    site: "ShopSmart",
    url: "www.shopsmart.nl",
    title: "The Legitimate Interest Trap",
    instruction:
      'The site claims it doesn\'t need your consent for some cookies — "legitimate interest". Find the option to object to all processing.',
    mode: "escape",
    debrief:
      '"Legitimate interest" is a real legal concept, but websites often abuse it to claim they can track you without asking. They still have to provide an easy way to object.\n\nHere the "Object to all" option was hidden behind a "More options" link. Many people never find it. If a site claims legitimate interest for advertising, you can always object.',
    patterns: [],
    BannerComponent: BannerLegitimateInterest,
  },

  // ── HARD ──────────────────────────────────────────────────────────────────
  {
    id: "h1",
    difficulty: "hard",
    site: "StreamMax",
    url: "www.streammax.tv",
    title: "Spot 3 Tricks",
    instruction:
      "This banner has 3 hidden dark patterns. Click on each suspicious element to identify it. Find all three.",
    mode: "spot",
    debrief:
      'You found all three:\n\n1. Pre-ticked checkbox — "Analytics & advertising" was already ticked. You have to actively untick it to reject. The law requires the opposite.\n\n2. Visual asymmetry — "Accept All" was a large bold blue button. The reject option was a tiny grey underline that was almost invisible.\n\n3. Fake close button — the ✕ looked like it closed the banner, but it was actually an Accept button in disguise.',
    patterns: [
      {
        id: "dp-fake-close",
        label: "Fake close button",
        explanation:
          "This ✕ does not close the banner — it secretly accepts all cookies. A real close button should reject or do nothing.",
      },
      {
        id: "dp-pretick",
        label: "Pre-ticked checkbox",
        explanation:
          '"Analytics & advertising" was ticked by default. GDPR says tracking cookies must start unticked — you must choose to opt in.',
      },
      {
        id: "dp-asymm",
        label: "Visual asymmetry",
        explanation:
          "Accept is a big bold button. Reject is almost invisible. The law says both choices must be equally prominent.",
      },
    ],
    BannerComponent: BannerSpot3,
  },
  {
    id: "h2",
    difficulty: "hard",
    site: "PriceHunter",
    url: "www.pricehunter.nl",
    title: "Spot 4 Tricks",
    instruction:
      "This banner has 4 dark patterns. Click on each suspicious element to identify it. Find all four.",
    mode: "spot",
    debrief:
      'You found all four:\n\n1. Pre-ticked marketing checkbox — ticked by default, should be unticked.\n\n2. Visual asymmetry — "Accept All" is a big green button. "Reject" is nearly invisible text.\n\n3. Guilt-shaming — "No thanks, I prefer a worse experience" is designed to make you feel bad about protecting your privacy. This is called "confirmshaming".\n\n4. Wall of text / information overload — "47 partners" listed to overwhelm you into giving up.',
    patterns: [
      {
        id: "dp-pretick2",
        label: "Pre-ticked marketing checkbox",
        explanation:
          "Marketing cookies should never be pre-ticked. You must actively choose to enable them.",
      },
      {
        id: "dp-asymm2",
        label: "Visual asymmetry",
        explanation:
          'Accept is a large, colourful button. Reject is barely visible text. This makes accepting feel like the "normal" choice.',
      },
      {
        id: "dp-shame",
        label: "Guilt-shaming (confirmshaming)",
        explanation:
          '"I prefer a worse experience" is emotional manipulation designed to make you feel guilty for protecting your privacy.',
      },
      {
        id: "dp-wall",
        label: "Information overload",
        explanation:
          "Listing 47 partners is meant to overwhelm you so you give up reading and just click Accept.",
      },
    ],
    BannerComponent: BannerSpot4,
  },
  {
    id: "h3",
    difficulty: "hard",
    site: "SocialHub",
    url: "app.socialhub.io",
    title: "The Roach Motel",
    instruction:
      "Getting in (accepting) takes one click. Getting out (rejecting) takes three. Navigate through all three steps to successfully reject all cookies.",
    mode: "escape",
    debrief:
      'You navigated the "roach motel" — easy to get in, hard to get out.\n\nThis multi-step rejection flow is a deliberate design choice. The site hopes you\'ll give up after step 1 or 2 and click Accept just to get to the content.\n\nGDPR Article 7(3) says withdrawing consent must be as easy as giving it. A three-step rejection vs a one-click acceptance is a clear violation.',
    patterns: [],
    BannerComponent: BannerRoachMotel,
  },
  {
    id: "h4",
    difficulty: "hard",
    site: "TechReview",
    url: "www.techreview-daily.com",
    title: "Spot 3 Language Tricks",
    instruction:
      "This banner uses 3 language-based dark patterns. Click each suspicious element to identify it.",
    mode: "spot",
    debrief:
      'You found all three:\n\n1. Double negative — "By not disabling the non-objection" is intentionally unreadable. Confusing language is a dark pattern.\n\n2. Visual asymmetry — Accept is a large button. Reject is nearly invisible white text.\n\n3. Guilt-shaming — "Continue without supporting us" frames your privacy choice as a moral failing.',
    patterns: [
      {
        id: "dp-doublenegative",
        label: "Double negative wording",
        explanation:
          '"By not disabling the non-objection" is deliberately confusing. GDPR requires consent language to be clear and simple.',
      },
      {
        id: "dp-asymm3",
        label: "Visual asymmetry",
        explanation:
          "Accept is large and blue. Reject is white text, almost invisible against the background.",
      },
      {
        id: "dp-shame2",
        label: "Guilt-shaming (confirmshaming)",
        explanation:
          '"Continue without supporting us" implies that protecting your privacy is selfish or harmful.',
      },
    ],
    BannerComponent: BannerSpot3v2,
  },
];

// Randomly pick one level per difficulty, seeded by date string
function pickLevelForDate(date: string, difficulty: Difficulty): CookieLevel {
  const pool = ALL_LEVELS.filter((l) => l.difficulty === difficulty);
  // Simple deterministic seed from date + difficulty
  const seed =
    date.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) +
    difficulty.length;
  return pool[seed % pool.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL RUNNER — handles escape vs spot mode
// ─────────────────────────────────────────────────────────────────────────────

function LevelRunner({
  level,
  onComplete,
}: {
  level: CookieLevel;
  onComplete: () => void;
}) {
  const theme = useTheme();
  const p = theme.palette.gh;

  const [result, setResult] = useState<"idle" | "won" | "lost">("idle");
  const [foundPatterns, setFoundPatterns] = useState<Set<string>>(new Set());
  const [lastFound, setLastFound] = useState<PatternDef | null>(null);
  const [debriefOpen, setDebriefOpen] = useState(false);

  const handleFound = useCallback(
    (id: string) => {
      const def = level.patterns.find((p) => p.id === id);
      if (!def) return;
      setFoundPatterns((prev) => {
        const next = new Set(prev).add(id);
        return next;
      });
      setLastFound(def);
    },
    [level.patterns],
  );

  const handleCorrect = useCallback(() => setResult("won"), []);
  const handleWrong = useCallback(() => setResult("lost"), []);
  const handleRetry = useCallback(() => {
    setResult("idle");
    setFoundPatterns(new Set());
    setLastFound(null);
  }, []);

  const { BannerComponent } = level;

  return (
    <Box>
      {/* Instruction box */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon />}
        sx={{ mb: 2.5, fontSize: "0.875rem" }}
      >
        {level.instruction}
      </Alert>

      {/* Spot mode counter */}
      {level.mode === "spot" && result === "idle" && (
        <Box sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "center" }}>
          <Typography sx={{ fontSize: "0.75rem", color: "text.disabled" }}>
            Found:{" "}
            <strong style={{ color: p.primary }}>{foundPatterns.size}</strong> /{" "}
            {level.patterns.length} patterns
          </Typography>
          <Typography
            sx={{
              fontSize: "0.6875rem",
              color: "text.disabled",
              fontStyle: "italic",
              ml: 1,
            }}
          >
            — hover over elements to investigate, click to identify
          </Typography>
        </Box>
      )}

      {/* Fake browser */}
      <Box
        sx={{
          border: `1px solid ${p.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          mb: 2,
          boxShadow: 2,
        }}
      >
        <BrowserChrome url={level.url} site={level.site} />
        <Box sx={{ bgcolor: "#f8fafc" }}>
          <FakePage />
          <Box
            sx={{
              bgcolor: "#fff",
              borderTop: "2px solid #e2e8f0",
              boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                px: 2,
                pt: 1.25,
                pb: 0.5,
                borderBottom: "1px solid #f0f4f8",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#a0aec0",
                  fontWeight: 700,
                }}
              >
                {level.site} — Cookie Settings
              </Typography>
            </Box>
            <BannerComponent
              onCorrect={handleCorrect}
              onWrong={handleWrong}
              disabled={result !== "idle"}
              onFoundPattern={handleFound}
              foundPatterns={foundPatterns}
            />
          </Box>
        </Box>
      </Box>

      {/* Spot mode: show last found pattern inline */}
      {level.mode === "spot" && lastFound && result === "idle" && (
        <Fade in>
          <Alert severity="warning" sx={{ mb: 2, fontSize: "0.8125rem" }}>
            <strong>Found: {lastFound.label}</strong>
            <br />
            {lastFound.explanation}
          </Alert>
        </Fade>
      )}

      {/* Result */}
      <Fade in={result !== "idle"}>
        <Box>
          {result === "won" && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>
                  {level.mode === "spot"
                    ? "All patterns identified! ✓"
                    : "Cookies rejected! ✓"}
                </strong>
              </Alert>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDebriefOpen(true)}
                sx={{ mb: 2, mr: 1.5 }}
              >
                Read explanation
              </Button>
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={onComplete}
              >
                Continue
              </Button>
            </>
          )}
          {result === "lost" && (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>You clicked Accept by mistake.</strong> In the real
                world, tracking cookies would now be set on your device.
              </Alert>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDebriefOpen(true)}
                sx={{ mb: 2, mr: 1.5 }}
              >
                See what happened
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleRetry}
                sx={{ mb: 2, mr: 1.5 }}
              >
                Try again
              </Button>
              <Button variant="text" onClick={onComplete} sx={{ mb: 2 }}>
                Skip this level
              </Button>
            </>
          )}
        </Box>
      </Fade>

      {/* Debrief dialog */}
      <Dialog
        open={debriefOpen}
        onClose={() => setDebriefOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pr: 1.5,
          }}
        >
          <span>💡 What just happened?</span>
          <IconButton size="small" onClick={() => setDebriefOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-line",
              lineHeight: 1.85,
              fontSize: "0.9375rem",
            }}
          >
            {level.debrief}
          </Typography>
          {level.mode === "spot" &&
            level.patterns.length > 0 &&
            result === "won" && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="overline" sx={{ display: "block", mb: 1 }}>
                  Dark patterns in this banner
                </Typography>
                <List disablePadding>
                  {level.patterns.map((pat) => (
                    <ListItem
                      key={pat.id}
                      disablePadding
                      sx={{ mb: 1, alignItems: "flex-start" }}
                    >
                      <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                        <CheckCircleIcon
                          sx={{ fontSize: 16, color: "success.main" }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={pat.label}
                        secondary={pat.explanation}
                        slotProps={{
                          primary: {
                            sx: { fontWeight: 700, fontSize: "0.875rem" },
                          },
                          secondary: { sx: { fontSize: "0.8125rem" } },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setDebriefOpen(false);
              if (result === "won") onComplete();
            }}
          >
            {result === "won" ? "Continue" : "Got it"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GAME COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  date: string;
  onBack: () => void;
}

export default function CookieBannersGame({ date, onBack }: Props) {
  const theme = useTheme();
  const p = theme.palette.gh;

  const [activeLevel, setActiveLevel] = useState<Difficulty | null>(null);
  const [completed, setCompleted] = useState<Set<Difficulty>>(new Set());
  const [allDone, setAllDone] = useState(false);

  // Pick one level per difficulty deterministically from the date
  const levels: Record<Difficulty, CookieLevel> = {
    easy: pickLevelForDate(date, "easy"),
    medium: pickLevelForDate(date, "medium"),
    hard: pickLevelForDate(date, "hard"),
  };

  const handleComplete = useCallback((d: Difficulty) => {
    setCompleted((prev) => {
      const next = new Set(prev).add(d);
      if (next.size === 3) setAllDone(true);
      return next;
    });
    setActiveLevel(null);
  }, []);

  if (activeLevel) {
    const level = levels[activeLevel];
    return (
      <GameShell
        title={`Cookie Trap — ${level.title}`}
        difficulty={activeLevel}
        date={date}
        onBack={() => setActiveLevel(null)}
        infoTitle="What are cookie banners?"
        infoContent={INFO_TEXT}
      >
        <Typography
          variant="overline"
          sx={{ display: "block", mb: 1, color: p.danger }}
        >
          Level — {activeLevel.charAt(0).toUpperCase() + activeLevel.slice(1)} ·{" "}
          {level.site}
        </Typography>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          {level.title}
        </Typography>
        <Chip
          label={
            level.mode === "spot" ? "Spot the tricks" : "Find the reject option"
          }
          size="small"
          sx={{
            mb: 2.5,
            height: 22,
            fontSize: "0.625rem",
            fontWeight: 700,
            bgcolor: alpha(level.mode === "spot" ? p.warning : p.primary, 0.12),
            color: level.mode === "spot" ? p.warning : p.primary,
            border: `1px solid ${alpha(level.mode === "spot" ? p.warning : p.primary, 0.3)}`,
            borderRadius: "5px",
          }}
        />
        <LevelRunner
          level={level}
          onComplete={() => handleComplete(activeLevel)}
        />
      </GameShell>
    );
  }

  if (allDone) {
    return (
      <GameShell
        title="Cookie Trap"
        difficulty="hard"
        date={date}
        progress={100}
        onBack={onBack}
        infoTitle="What are cookie banners?"
        infoContent={INFO_TEXT}
      >
        <Box sx={{ textAlign: "center", py: 8 }} className="slide-up">
          <EmojiEventsIcon sx={{ fontSize: 56, color: p.primary, mb: 2 }} />
          <Typography variant="h2" sx={{ mb: 1 }}>
            All levels done! 🎉
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            You can now spot and avoid the most common cookie consent tricks.
            Come back tomorrow for new banners.
          </Typography>
          <Alert
            severity="success"
            sx={{ maxWidth: 460, mx: "auto", textAlign: "left" }}
          >
            <strong>The golden rule:</strong> rejecting cookies should always be
            as easy as accepting them — one click, clearly labelled. If it
            isn't, the site is probably breaking the law.
          </Alert>
        </Box>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Cookie Trap"
      difficulty="easy"
      date={date}
      onBack={onBack}
      infoTitle="What are cookie banners?"
      infoContent={INFO_TEXT}
    >
      <Typography
        variant="overline"
        sx={{ display: "block", mb: 1, color: p.danger }}
      >
        Today's Challenge
      </Typography>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Cookie Trap
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, maxWidth: 540 }}>
        Every day, three realistic cookie banners — one easy, one medium, one
        hard. Learn to spot the tricks websites use to make you accept tracking
        cookies.
      </Typography>
      <LevelPicker
        levels={[
          {
            difficulty: "easy",
            subtitle: `${levels.easy.title} — ${levels.easy.mode === "spot" ? "spot the tricks" : "find the reject option"}`,
          },
          {
            difficulty: "medium",
            subtitle: `${levels.medium.title} — ${levels.medium.mode === "spot" ? "spot the tricks" : "find the reject option"}`,
          },
          {
            difficulty: "hard",
            subtitle: `${levels.hard.title} — ${levels.hard.mode === "spot" ? "spot the tricks" : "find the reject option"}`,
          },
        ]}
        completed={completed}
        onSelect={setActiveLevel}
      />
    </GameShell>
  );
}
