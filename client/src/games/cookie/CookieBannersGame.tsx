import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Fade,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme, alpha } from "@mui/material/styles";
import { GameShell } from "../GameShell";
import { LevelPicker } from "../LevelPicker";
import type { Difficulty } from "../../api/types";
import RobotGreeter from "../../components/RobotGreeter";

const ROBOT_HEADLINE =
  "Hi! I'm Cipher. Cookie banners are designed to trick you. Let's learn to spot the traps together.";

const ROBOT_DETAILS = `When you visit almost any website, a popup appears asking you to agree to "cookies". But what are cookies, and why should you care?
 
What are cookies?
Cookies are tiny files a website saves on your device. Some are useful — they remember you're logged in, or keep items in your shopping cart. But many cookies exist only to track your behaviour across the internet and show you targeted ads.
 
You have the right to say no to tracking cookies. European law (GDPR + ePrivacy Directive) requires websites to make this just as easy as saying yes.
 
But most don't. Instead they use tricks called "dark patterns":
 
• The "Accept All" button is big and brightly coloured. The "Reject" option is a tiny grey link, or hidden behind "Manage options".
• The ✕ button looks like it closes the popup — but it actually accepts all cookies.
• "Legitimate Interest" tabs hide pre-enabled tracking that you never see.
• Multi-step rejection flows: 3 or 4 clicks to say no, 1 click to say yes.
• Cookie walls: "Pay €X/month OR accept tracking" — forcing you to choose between privacy and access.
• Guilt-tripping language: "Continue without supporting us".
 
In these challenges you will practice spotting and avoiding these tricks on banners modelled on real consent management platforms (OneTrust, Cookiebot, Quantcast Choice, IAB TCF) and on infamous real-world examples from Yahoo, Le Monde, and others.`;

// Per-level robot lines — what Cipher says before each level starts
const ROBOT_LEVEL_LINES: Record<string, string> = {
  e1: "Heads up, the reject option is here, but it's disguised as link text. Look closely at every grey word.",
  e2: "Watch out for the ✕ in the corner. On this banner, it doesn't do what you think.",
  e3: "Both buttons are visible this time. But which one is the site quietly nudging you toward?",
  e4: "Three buttons, one of them rejects everything. But even the 'compliant' version has a subtle nudge — can you spot it?",
  m1: "The wording on the checkbox here is intentionally confusing. Read it slowly. Twice if you have to.",
  m2: "Click 'Customise Settings' — but check every toggle's starting position. Defaults matter.",
  m3: "847 partners. Don't be overwhelmed — the reject option is one screen away.",
  m4: "There's a second tab most people never click. The trap is hidden there.",
  h1: "This is the French press playbook. Three dark patterns are hiding in plain sight.",
  h2: "Full-screen, no escape. Four dark patterns to find here.",
  h3: "Accepting is one click. Rejecting is four. Read each button label carefully — the wording flips around.",
  h4: "Pay or be tracked. There's no free reject. Find three patterns to continue.",
};

// ─── Shared types ─────────────────────────────────────────────────────────────

interface CookieLevel {
  id: string;
  difficulty: Difficulty;
  site: string;
  url: string;
  title: string;
  cmpLabel: string; // e.g. "OneTrust-style modal" — shown as a tag
  instruction: string;
  mode: "escape" | "spot";
  layout: "bar" | "modal" | "interstitial"; // how the banner is shown
  debrief: string;
  patterns: PatternDef[];
  BannerComponent: React.ComponentType<BannerProps>;
}

interface PatternDef {
  id: string;
  label: string;
  explanation: string;
}

interface BannerProps {
  onCorrect: () => void;
  onWrong: () => void;
  disabled: boolean;
  onFoundPattern?: (id: string) => void;
  foundPatterns?: Set<string>;
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function BrowserChrome({ url }: { url: string }) {
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

function FakePage({
  lines = [70, 90, 60, 80, 50, 75, 65],
}: {
  lines?: number[];
}) {
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

const btn = (disabled: boolean) =>
  ({
    border: "none",
    borderRadius: "4px",
    cursor: disabled ? "default" : "pointer",
    fontFamily: "Arial, Helvetica, sans-serif",
    transition: "all 0.15s",
    pointerEvents: disabled ? "none" : "auto",
  }) as const;

// "Powered by X" CMP footer
function CmpFooter({ cmp }: { cmp: string }) {
  return (
    <Box
      sx={{
        px: 2.5,
        py: 0.875,
        bgcolor: "#f7fafc",
        borderTop: "1px solid #edf2f7",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Typography sx={{ fontSize: "0.625rem", color: "#a0aec0" }}>
        Powered by
      </Typography>
      <Typography
        sx={{
          fontSize: "0.625rem",
          color: "#718096",
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}
      >
        {cmp}
      </Typography>
    </Box>
  );
}

// Tappable wrapper for spot mode
function TapTarget({
  id,
  label,
  found,
  onFind,
  children,
  inline = false,
}: {
  id: string;
  label: string;
  found: boolean;
  onFind: (id: string) => void;
  children: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <Box
      component={found ? "div" : "button"}
      onClick={!found ? () => onFind(id) : undefined}
      title={found ? `✓ Found: ${label}` : "Click to investigate this element…"}
      sx={{
        display: inline ? "inline-flex" : "flex",
        alignItems: "center",
        position: "relative",
        border: found ? "2px solid #e53e3e" : "2px dashed transparent",
        borderRadius: "4px",
        background: found ? "rgba(229,62,62,0.07)" : "none",
        cursor: found ? "default" : "crosshair",
        transition: "all 0.2s",
        p: 0.25,
        textAlign: "left",
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

// ═════════════════════════════════════════════════════════════════════════════
// EASY BANNERS
// ═════════════════════════════════════════════════════════════════════════════

/** Easy-1: Cookiebot-style minimal bar — single line, ghost reject */
function BannerCookiebotMinimal({ onCorrect, onWrong, disabled }: BannerProps) {
  return (
    <Box>
      <Box
        sx={{
          p: 2,
          bgcolor: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#4a5568",
            flex: "1 1 300px",
            lineHeight: 1.55,
          }}
        >
          This website uses cookies to ensure you get the best experience on our
          website.{" "}
          <Box
            component="span"
            sx={{ color: "#3182ce", textDecoration: "underline" }}
          >
            Read more
          </Box>
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Tiny grey ghost link — the real reject */}
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
            Use necessary cookies only
          </Box>
          <Box
            component="button"
            onClick={onWrong}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              bgcolor: "#0f9d58",
              color: "#fff",
              px: 2.5,
              py: 0.875,
              fontSize: "0.8125rem",
              fontWeight: 700,
            }}
          >
            Allow all cookies
          </Box>
        </Box>
      </Box>
      <CmpFooter cmp="Cookiebot CMP" />
    </Box>
  );
}

/** Easy-2: Generic modal with fake ✕ */
function BannerFakeClose({ onCorrect, onWrong, disabled }: BannerProps) {
  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff", position: "relative" }}>
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
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "#1a202c",
          mb: 0.75,
          pr: 4,
        }}
      >
        🍪 We use cookies
      </Typography>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "#4a5568",
          mb: 2,
          lineHeight: 1.6,
          pr: 4,
        }}
      >
        We use cookies to personalise content and ads, to provide social media
        features and to analyse our traffic. We also share information about
        your use of our site with our social media, advertising and analytics
        partners.
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
            fontSize: "0.8125rem",
            fontWeight: 700,
          }}
        >
          OK, got it
        </Box>
        <Box
          component="button"
          onClick={onCorrect}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#fff",
            color: "#4a5568",
            border: "1px solid #cbd5e0",
            px: 2,
            py: 1,
            fontSize: "0.8125rem",
          }}
        >
          Use necessary cookies only
        </Box>
      </Box>
    </Box>
  );
}

/** Easy-3: Bottom bar with strong asymmetry */
function BannerAsymmetricBar({ onCorrect, onWrong, disabled }: BannerProps) {
  return (
    <Box sx={{ p: 2, bgcolor: "#fff" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box component="span" sx={{ fontSize: "1.125rem" }}>
          🍪
        </Box>
        <Typography
          sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a202c" }}
        >
          Hello, cookie lover!
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "#4a5568",
          mb: 1.75,
          lineHeight: 1.6,
        }}
      >
        We use cookies to improve your browsing experience, serve personalised
        ads or content, and analyse our traffic. By clicking "Accept All", you
        consent to our use of cookies.
      </Typography>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Box
          component="button"
          onClick={onWrong}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#d97706",
            color: "#fff",
            px: 3,
            py: 1,
            fontSize: "0.875rem",
            fontWeight: 700,
            flex: "0 0 auto",
            boxShadow: "0 1px 3px rgba(217,119,6,0.4)",
          }}
        >
          Accept All
        </Box>
        <Box
          component="button"
          onClick={onCorrect}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "transparent",
            color: "#a0aec0",
            border: "1px solid #e2e8f0",
            px: 1.5,
            py: 0.5,
            fontSize: "0.6875rem",
          }}
        >
          Reject
        </Box>
      </Box>
    </Box>
  );
}

/** Easy-4: OneTrust-style modal, "Continue" = accept */
function BannerOneTrustContinue({ onCorrect, onWrong, disabled }: BannerProps) {
  return (
    <Box>
      <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#000",
            mb: 1.25,
          }}
        >
          Your Privacy
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#4a5568",
            mb: 1.75,
            lineHeight: 1.65,
          }}
        >
          When you visit any website, it may store or retrieve information on
          your browser, mostly in the form of cookies. This information might be
          about you, your preferences or your device and is mostly used to make
          the site work as you expect it to. The information does not usually
          directly identify you, but it can give you a more personalised web
          experience.
        </Typography>
        <Typography
          sx={{
            fontSize: "0.6875rem",
            color: "#718096",
            mb: 2,
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          Because we respect your right to privacy, you can choose not to allow
          some types of cookies. Click on the different category headings to
          find out more and change our default settings.
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box
            component="button"
            onClick={onWrong}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              bgcolor: "#0066cc",
              color: "#fff",
              py: 1.125,
              fontSize: "0.8125rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Allow All
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              component="button"
              onClick={onCorrect}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#fff",
                color: "#0066cc",
                border: "1px solid #0066cc",
                py: 1,
                fontSize: "0.75rem",
                fontWeight: 700,
                flex: 1,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Reject All
            </Box>
            <Box
              component="button"
              onClick={onWrong}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#fff",
                color: "#0066cc",
                border: "1px solid #0066cc",
                py: 1,
                fontSize: "0.75rem",
                fontWeight: 700,
                flex: 1,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Cookie Settings
            </Box>
          </Box>
        </Box>
      </Box>
      <CmpFooter cmp="OneTrust" />
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MEDIUM BANNERS
// ═════════════════════════════════════════════════════════════════════════════

/** Medium-1: Quantcast-style modal with double negative consent text */
function BannerQuantcastDoubleNeg({
  onCorrect,
  onWrong,
  disabled,
}: BannerProps) {
  const [step, setStep] = useState<"initial" | "manage">("initial");
  const [objected, setObjected] = useState(false);

  if (step === "initial") {
    return (
      <Box>
        <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
          <Typography
            sx={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "#1a202c",
              mb: 1,
            }}
          >
            We value your privacy
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#4a5568",
              mb: 1,
              lineHeight: 1.6,
            }}
          >
            We and our partners store and/or access information on a device,
            such as cookies and process personal data, such as unique
            identifiers and standard information sent by a device for
            personalised advertising and content, advertising and content
            measurement, audience research and services development.
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#4a5568",
              mb: 2,
              lineHeight: 1.6,
            }}
          >
            With your permission we and our partners may use precise geolocation
            data and identification through device scanning.{" "}
            <Box
              component="span"
              sx={{ color: "#3182ce", textDecoration: "underline" }}
            >
              More information
            </Box>
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Box
              component="button"
              onClick={onWrong}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#7c3aed",
                color: "#fff",
                px: 2.5,
                py: 1,
                fontSize: "0.8125rem",
                fontWeight: 700,
                flex: "1 1 auto",
              }}
            >
              AGREE
            </Box>
            <Box
              component="button"
              onClick={() => setStep("manage")}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#fff",
                color: "#7c3aed",
                border: "1px solid #7c3aed",
                px: 2.5,
                py: 1,
                fontSize: "0.8125rem",
                fontWeight: 700,
                flex: "1 1 auto",
              }}
            >
              MANAGE OPTIONS
            </Box>
          </Box>
        </Box>
        <CmpFooter cmp="Quantcast Choice" />
      </Box>
    );
  }

  // Manage step — has double negative
  return (
    <Box>
      <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
        <Typography
          sx={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#1a202c",
            mb: 1,
          }}
        >
          Object to processing
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#4a5568",
            mb: 1.5,
            lineHeight: 1.65,
          }}
        >
          Some of our partners process your personal data on the basis of
          legitimate interest. You can object to such processing at any time.
        </Typography>
        <Box
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 1,
            p: 1.5,
            mb: 1.5,
            bgcolor: "#fafafa",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: "0.75rem",
              color: "#2d3748",
              cursor: "pointer",
              lineHeight: 1.5,
            }}
          >
            <input
              type="checkbox"
              checked={objected}
              onChange={(e) => setObjected(e.target.checked)}
              disabled={disabled}
              style={{
                accentColor: "#7c3aed",
                width: 14,
                height: 14,
                marginTop: 2,
              }}
            />
            <span>
              Do not opt out of allowing our partners' non-essential
              data-processing activities
            </span>
          </label>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box
            component="button"
            onClick={() => (objected ? onCorrect() : onWrong())}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              bgcolor: "#7c3aed",
              color: "#fff",
              px: 2.5,
              py: 1,
              fontSize: "0.8125rem",
              fontWeight: 700,
              flex: 1,
            }}
          >
            SAVE &amp; EXIT
          </Box>
        </Box>
      </Box>
      <CmpFooter cmp="Quantcast Choice" />
    </Box>
  );
}

/** Medium-2: OneTrust with Customise → purpose toggles pre-enabled */
function BannerOneTrustCustomise({
  onCorrect,
  onWrong,
  disabled,
}: BannerProps) {
  const [step, setStep] = useState<"initial" | "customise">("initial");
  const [performance, setPerformance] = useState(true);
  const [functional, setFunctional] = useState(true);
  const [targeting, setTargeting] = useState(true);

  if (step === "initial") {
    return (
      <Box>
        <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
          <Typography
            sx={{ fontSize: "1rem", fontWeight: 700, color: "#000", mb: 1 }}
          >
            About Cookies on This Site
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#4a5568",
              mb: 2,
              lineHeight: 1.6,
            }}
          >
            We use cookies to collect and analyse information on site
            performance and usage, to provide social media features and to
            enhance and customise content and advertisements.{" "}
            <Box
              component="span"
              sx={{
                color: "#0066cc",
                textDecoration: "underline",
                fontSize: "0.6875rem",
              }}
            >
              Learn more
            </Box>
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              component="button"
              onClick={onWrong}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#0066cc",
                color: "#fff",
                py: 1.125,
                fontSize: "0.8125rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Accept All Cookies
            </Box>
            <Box
              component="button"
              onClick={() => setStep("customise")}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#fff",
                color: "#0066cc",
                border: "1px solid #0066cc",
                py: 1,
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Customise Settings
            </Box>
          </Box>
        </Box>
        <CmpFooter cmp="OneTrust" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
        <Typography
          sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "#000", mb: 1 }}
        >
          Privacy Preference Centre
        </Typography>
        <Typography
          sx={{
            fontSize: "0.6875rem",
            color: "#718096",
            mb: 1.5,
            lineHeight: 1.55,
          }}
        >
          When you visit our website, we may store cookies on your browser.
          Because we respect your right to privacy, you can choose not to allow
          some types of cookies.
        </Typography>
        <Box
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 1,
            overflow: "hidden",
            mb: 1.5,
          }}
        >
          {[
            {
              label: "Strictly Necessary Cookies",
              note: "Always Active",
              alwaysOn: true,
              checked: true,
            },
            {
              label: "Performance Cookies",
              note: "Allow us to count visits and traffic sources",
              checked: performance,
              onChange: setPerformance,
            },
            {
              label: "Functional Cookies",
              note: "Enable enhanced functionality and personalisation",
              checked: functional,
              onChange: setFunctional,
            },
            {
              label: "Targeting Cookies",
              note: "May be set by our advertising partners",
              checked: targeting,
              onChange: setTargeting,
            },
          ].map((c, i) => (
            <Box
              key={i}
              sx={{
                px: 1.5,
                py: 1.25,
                borderBottom: i < 3 ? "1px solid #edf2f7" : "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#1a202c",
                  }}
                >
                  {c.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.625rem",
                    color: "#a0aec0",
                    mt: 0.25,
                  }}
                >
                  {c.note}
                </Typography>
              </Box>
              {c.alwaysOn ? (
                <Typography
                  sx={{
                    fontSize: "0.625rem",
                    color: "#0066cc",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Always Active
                </Typography>
              ) : (
                /* iOS-style toggle */
                <Box
                  component="button"
                  onClick={() => c.onChange!(!c.checked)}
                  disabled={disabled}
                  sx={{
                    ...btn(disabled),
                    width: 36,
                    height: 20,
                    borderRadius: "10px",
                    bgcolor: c.checked ? "#0066cc" : "#cbd5e0",
                    position: "relative",
                    p: 0,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 2,
                      left: c.checked ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: "#fff",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                </Box>
              )}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box
            component="button"
            onClick={() => {
              if (!performance && !functional && !targeting) onCorrect();
              else onWrong();
            }}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              bgcolor: "#0066cc",
              color: "#fff",
              py: 1,
              px: 2,
              fontSize: "0.75rem",
              fontWeight: 700,
              flex: 1,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Confirm My Choices
          </Box>
          <Box
            component="button"
            onClick={onWrong}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              bgcolor: "#fff",
              color: "#0066cc",
              border: "1px solid #0066cc",
              py: 1,
              px: 2,
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Allow All
          </Box>
        </Box>
      </Box>
      <CmpFooter cmp="OneTrust" />
    </Box>
  );
}

/** Medium-3: IAB TCF publisher-style with 847 partners and purposes accordion */
function BannerIABTCF({ onCorrect, onWrong, disabled }: BannerProps) {
  const [step, setStep] = useState<"initial" | "purposes">("initial");
  const [purposeOpen, setPurposeOpen] = useState<number | null>(null);

  const purposes = [
    {
      id: 1,
      label: "Store and/or access information on a device",
      body: "Cookies, device or similar online identifiers (e.g. login-based identifiers, randomly assigned identifiers, network based identifiers) together with other information (e.g. browser type and information, language, screen size, supported technologies etc.) can be stored or read on your device to recognise it each time it connects to an app or to a website.",
    },
    {
      id: 2,
      label:
        "Personalised advertising and content, advertising and content measurement, audience research and services development",
      body: "Advertising and content can be personalised based on your profile. Your activity on this service can be used to build or improve a profile about you for personalised advertising and content. Advertising and content performance can be measured. Reports can be generated based on your activity and those of others.",
    },
    {
      id: 3,
      label: "Use precise geolocation data",
      body: "With your acceptance, your precise location (within a radius of less than 500 metres) may be used in support of the purposes explained in this notice.",
    },
    {
      id: 4,
      label: "Actively scan device characteristics for identification",
      body: "With your acceptance, certain characteristics specific to your device might be requested and used to distinguish it from other devices (such as the installed fonts or plugins, the resolution of your screen) in support of the purposes explained in this notice.",
    },
  ];

  if (step === "initial") {
    return (
      <Box>
        <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
          <Typography
            sx={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "#1a202c",
              mb: 1,
            }}
          >
            We care about your privacy
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#4a5568",
              mb: 1.5,
              lineHeight: 1.65,
            }}
          >
            We and our{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#1a202c" }}>
              847 partners
            </Box>{" "}
            store and access personal data, like browsing data or unique
            identifiers, on your device. Selecting "I Accept" enables tracking
            technologies to support the purposes shown under "we and our
            partners process data to provide".
          </Typography>
          <Box
            sx={{
              bgcolor: "#f7fafc",
              border: "1px solid #edf2f7",
              borderRadius: 1,
              p: 1.25,
              mb: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.625rem",
                fontWeight: 700,
                color: "#4a5568",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              We and our partners process data to provide:
            </Typography>
            <Typography
              sx={{
                fontSize: "0.6875rem",
                color: "#718096",
                lineHeight: 1.55,
              }}
            >
              Use precise geolocation data. Actively scan device characteristics
              for identification. Store and/or access information on a device.
              Personalised advertising and content, advertising and content
              measurement, audience research and services development.{" "}
              <Box
                component="span"
                sx={{ color: "#3182ce", textDecoration: "underline" }}
              >
                List of Partners (vendors)
              </Box>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              component="button"
              onClick={onWrong}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#2b6cb0",
                color: "#fff",
                py: 1.125,
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              I Accept
            </Box>
            <Box
              component="button"
              onClick={() => setStep("purposes")}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#fff",
                color: "#2b6cb0",
                border: "1px solid #cbd5e0",
                py: 1,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              Show Purposes
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
      <Typography
        sx={{
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "#1a202c",
          mb: 1.5,
        }}
      >
        Purposes
      </Typography>
      <Box
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 1,
          overflow: "hidden",
          mb: 1.5,
        }}
      >
        {purposes.map((p, i) => (
          <Box
            key={p.id}
            sx={{
              borderBottom:
                i < purposes.length - 1 ? "1px solid #edf2f7" : "none",
            }}
          >
            <Box
              component="button"
              onClick={() => setPurposeOpen(purposeOpen === p.id ? null : p.id)}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                width: "100%",
                bgcolor: "transparent",
                border: "none",
                px: 1.5,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                textAlign: "left",
              }}
            >
              <ExpandMoreIcon
                sx={{
                  fontSize: 16,
                  color: "#718096",
                  transform:
                    purposeOpen === p.id ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.15s",
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#1a202c",
                  flex: 1,
                }}
              >
                {p.label}
              </Typography>
            </Box>
            {purposeOpen === p.id && (
              <Box
                sx={{
                  px: 1.5,
                  pb: 1.25,
                  pt: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    color: "#718096",
                    lineHeight: 1.6,
                  }}
                >
                  {p.body}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box
          component="button"
          onClick={onCorrect}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#fff",
            color: "#2b6cb0",
            border: "1px solid #2b6cb0",
            py: 1,
            fontSize: "0.75rem",
            fontWeight: 600,
            flex: 1,
          }}
        >
          Reject All
        </Box>
        <Box
          component="button"
          onClick={onWrong}
          disabled={disabled}
          sx={{
            ...btn(disabled),
            bgcolor: "#2b6cb0",
            color: "#fff",
            py: 1,
            fontSize: "0.75rem",
            fontWeight: 700,
            flex: 1,
          }}
        >
          Accept All
        </Box>
      </Box>
    </Box>
  );
}

/** Medium-4: OneTrust with hidden Legitimate Interest tab — all enabled */
function BannerLegitInterestTab({ onCorrect, onWrong, disabled }: BannerProps) {
  const [step, setStep] = useState<"initial" | "customise">("initial");
  const [tab, setTab] = useState(0); // 0 = Consent, 1 = Legitimate Interest
  // Consent tab toggles
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  // Legitimate Interest tab toggles — all on by default (the trap)
  const [li1, setLi1] = useState(true);
  const [li2, setLi2] = useState(true);
  const [li3, setLi3] = useState(true);

  if (step === "initial") {
    return (
      <Box>
        <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
          <Typography
            sx={{ fontSize: "1rem", fontWeight: 700, color: "#1a202c", mb: 1 }}
          >
            Privacy Notice
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#4a5568",
              mb: 1.75,
              lineHeight: 1.6,
            }}
          >
            We and our partners use cookies and similar technologies to
            understand how you use our site and to improve your experience. By
            clicking "Accept All", you consent to the use of cookies. Some of
            our partners also process data under legitimate interest — you can
            object in the settings.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              component="button"
              onClick={onWrong}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#0066cc",
                color: "#fff",
                py: 1.125,
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              Accept All
            </Box>
            <Box
              component="button"
              onClick={() => setStep("customise")}
              disabled={disabled}
              sx={{
                ...btn(disabled),
                bgcolor: "#fff",
                color: "#0066cc",
                border: "1px solid #0066cc",
                py: 1,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              Cookie Settings
            </Box>
          </Box>
        </Box>
        <CmpFooter cmp="OneTrust" />
      </Box>
    );
  }

  // Customise — with the LegInt tab trap
  const allOff = !c1 && !c2 && !li1 && !li2 && !li3;

  return (
    <Box>
      <Box sx={{ bgcolor: "#fff" }}>
        <Box sx={{ px: 2.5, pt: 2 }}>
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#1a202c",
              mb: 1.25,
            }}
          >
            Manage your preferences
          </Typography>
        </Box>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2.5,
            borderBottom: "1px solid #e2e8f0",
            minHeight: 32,
            "& .MuiTab-root": {
              minHeight: 32,
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#a0aec0",
              p: 0,
              mr: 2.5,
            },
            "& .Mui-selected": { color: "#0066cc !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#0066cc" },
          }}
        >
          <Tab label="Consent" />
          <Tab label="Legitimate Interest" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 ? (
            <Box>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  color: "#718096",
                  mb: 1.5,
                  lineHeight: 1.6,
                }}
              >
                These purposes require your active consent. Toggle on what you'd
                like to consent to.
              </Typography>
              {[
                {
                  label: "Personalised advertising",
                  checked: c1,
                  onChange: setC1,
                },
                {
                  label: "Audience measurement",
                  checked: c2,
                  onChange: setC2,
                },
              ].map((c, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    borderBottom: i === 0 ? "1px solid #edf2f7" : "none",
                  }}
                >
                  <Typography sx={{ fontSize: "0.75rem", color: "#2d3748" }}>
                    {c.label}
                  </Typography>
                  <Box
                    component="button"
                    onClick={() => c.onChange(!c.checked)}
                    disabled={disabled}
                    sx={{
                      ...btn(disabled),
                      width: 36,
                      height: 20,
                      borderRadius: "10px",
                      bgcolor: c.checked ? "#0066cc" : "#cbd5e0",
                      position: "relative",
                      p: 0,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 2,
                        left: c.checked ? 18 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: "#fff",
                        transition: "left 0.2s",
                      }}
                    />
                  </Box>
                </Box>
              ))}
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
                Our partners process the data below under legitimate interest.
                You may object at any time.
              </Typography>
              {[
                {
                  label: "Personalised advertising profiles",
                  checked: li1,
                  onChange: setLi1,
                },
                {
                  label: "Content performance measurement",
                  checked: li2,
                  onChange: setLi2,
                },
                {
                  label: "Develop and improve services",
                  checked: li3,
                  onChange: setLi3,
                },
              ].map((c, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    borderBottom: i < 2 ? "1px solid #edf2f7" : "none",
                  }}
                >
                  <Typography sx={{ fontSize: "0.75rem", color: "#2d3748" }}>
                    {c.label}
                  </Typography>
                  <Box
                    component="button"
                    onClick={() => c.onChange(!c.checked)}
                    disabled={disabled}
                    sx={{
                      ...btn(disabled),
                      width: 36,
                      height: 20,
                      borderRadius: "10px",
                      bgcolor: c.checked ? "#0066cc" : "#cbd5e0",
                      position: "relative",
                      p: 0,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 2,
                        left: c.checked ? 18 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: "#fff",
                        transition: "left 0.2s",
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box sx={{ px: 2, pb: 2 }}>
          <Box
            component="button"
            onClick={() => (allOff ? onCorrect() : onWrong())}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              bgcolor: "#0066cc",
              color: "#fff",
              py: 1,
              fontSize: "0.75rem",
              fontWeight: 700,
              width: "100%",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Confirm My Choices
          </Box>
        </Box>
      </Box>
      <CmpFooter cmp="OneTrust" />
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HARD BANNERS
// ═════════════════════════════════════════════════════════════════════════════

/** Hard-1: Le Monde / French press style — "Continue without accepting" + premium upsell
 *  Spot mode — 3 patterns */
function BannerLeMondeFrench({
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
      {/* Continue without accepting — small top-right link */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 12,
        }}
      >
        <TapTarget
          id="dp-tiny-reject"
          label="Tiny 'Continue without accepting' link"
          found={fp.has("dp-tiny-reject")}
          onFind={find}
          inline
        >
          <Box
            component="span"
            sx={{
              fontSize: "0.625rem",
              color: "#a0aec0",
              textDecoration: "underline",
              cursor: "inherit",
            }}
          >
            Continue without accepting →
          </Box>
        </TapTarget>
      </Box>

      <Typography
        sx={{
          fontSize: "0.9375rem",
          fontWeight: 700,
          color: "#1a202c",
          mb: 1,
          pr: 12,
        }}
      >
        Why are we asking you this?
      </Typography>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "#4a5568",
          mb: 1.75,
          lineHeight: 1.6,
        }}
      >
        Our website and our partners use cookies and other trackers to measure
        the audience of our advertising and editorial content, to offer you
        targeted advertising tailored to your interests, and to allow you to
        share content on social networks.
      </Typography>

      {/* Premium upsell box — the dark pattern: pay or accept */}
      <TapTarget
        id="dp-premium-upsell"
        label="Premium upsell as 'alternative' to tracking"
        found={fp.has("dp-premium-upsell")}
        onFind={find}
      >
        <Box
          sx={{
            bgcolor: "#fef5e7",
            border: "1px solid #f6e05e",
            borderRadius: 1,
            p: 1.25,
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box component="span" sx={{ fontSize: "1rem" }}>
            ⭐
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#744210",
              }}
            >
              Subscribe to access without ads — €9.99/month
            </Typography>
            <Typography
              sx={{ fontSize: "0.625rem", color: "#744210", mt: 0.25 }}
            >
              Refuse cookies and continue with a paid subscription
            </Typography>
          </Box>
        </Box>
      </TapTarget>

      {/* Big "Accept" button — sole prominent CTA */}
      <TapTarget
        id="dp-only-accept-cta"
        label="Only prominent CTA is 'Accept' — no equal-weight reject"
        found={fp.has("dp-only-accept-cta")}
        onFind={find}
      >
        <Box
          component="span"
          sx={{
            display: "inline-block",
            bgcolor: "#1a202c",
            color: "#fff",
            px: 4,
            py: 1.25,
            fontSize: "0.8125rem",
            fontWeight: 700,
            borderRadius: "4px",
            cursor: "inherit",
          }}
        >
          Accept &amp; continue
        </Box>
      </TapTarget>

      <Box sx={{ mt: 1.5 }}>
        <Box
          component="span"
          sx={{
            fontSize: "0.625rem",
            color: "#3182ce",
            textDecoration: "underline",
          }}
        >
          Customise your choices
        </Box>
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

/** Hard-2: Yahoo/TechCrunch full-screen interstitial
 *  Spot mode — 4 patterns */
function BannerYahooInterstitial({
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
      <Typography
        sx={{
          fontSize: "1.0625rem",
          fontWeight: 700,
          color: "#1a202c",
          mb: 1,
        }}
      >
        Welcome to the PriceHunter family of brands
      </Typography>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "#4a5568",
          mb: 1,
          lineHeight: 1.6,
        }}
      >
        We, PriceHunter, and our{" "}
        <TapTarget
          id="dp-partner-count"
          label="Massive partner count (1247 vendors)"
          found={fp.has("dp-partner-count")}
          onFind={find}
          inline
        >
          <Box
            component="span"
            sx={{ fontWeight: 700, color: "#1a202c", cursor: "inherit" }}
          >
            1,247 partners
          </Box>
        </TapTarget>
        , including those that use the IAB Transparency &amp; Consent Framework,
        store and/or access information on your device through the use of
        cookies, device identifiers and other similar technologies for the
        processing of personal data.
      </Typography>

      <Typography
        sx={{
          fontSize: "0.6875rem",
          color: "#718096",
          mb: 1.5,
          lineHeight: 1.55,
        }}
      >
        We process your data for: storing and accessing information on a device,
        personalised advertising and content, advertising and content
        measurement, audience research and services development.
      </Typography>

      {/* Blocking notice — the whole site is unusable until you choose */}
      <TapTarget
        id="dp-forced-action"
        label="Forced action — site is unusable until you choose"
        found={fp.has("dp-forced-action")}
        onFind={find}
      >
        <Box
          sx={{
            bgcolor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 1,
            p: 1,
            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.6875rem",
              color: "#991b1b",
              fontWeight: 600,
              lineHeight: 1.5,
              cursor: "inherit",
            }}
          >
            ⚠ You must make a selection before accessing the site.
          </Typography>
        </Box>
      </TapTarget>

      {/* Asymmetric CTAs */}
      <TapTarget
        id="dp-asymm-yahoo"
        label="Visual asymmetry — Accept is purple/bold, Reject is grey border"
        found={fp.has("dp-asymm-yahoo")}
        onFind={find}
      >
        <Box sx={{ display: "flex", gap: 1, mb: 1.25, width: "100%" }}>
          <Box
            component="span"
            sx={{
              display: "inline-block",
              flex: 1,
              bgcolor: "#7c3aed",
              color: "#fff",
              py: 1,
              fontSize: "0.8125rem",
              fontWeight: 700,
              borderRadius: "4px",
              textAlign: "center",
              cursor: "inherit",
            }}
          >
            Accept all
          </Box>
          <Box
            component="span"
            sx={{
              display: "inline-block",
              flex: 1,
              bgcolor: "#fff",
              color: "#a0aec0",
              border: "1px solid #e2e8f0",
              py: 1,
              fontSize: "0.75rem",
              borderRadius: "4px",
              textAlign: "center",
              cursor: "inherit",
            }}
          >
            Reject all
          </Box>
        </Box>
      </TapTarget>

      {/* Guilt-shaming text below */}
      <TapTarget
        id="dp-shame-yahoo"
        label="Guilt-shaming language about 'free service'"
        found={fp.has("dp-shame-yahoo")}
        onFind={find}
      >
        <Typography
          sx={{
            fontSize: "0.625rem",
            color: "#a0aec0",
            fontStyle: "italic",
            lineHeight: 1.5,
            cursor: "inherit",
          }}
        >
          By rejecting, you'll see less relevant ads — but our service remains
          free thanks to the partners who do support us.
        </Typography>
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

/** Hard-3: Roach motel — multi-step rejection (real CMP version) */
function BannerRoachMotel({ onCorrect, onWrong, disabled }: BannerProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Your Privacy Choices",
      body: "We use cookies for analytics, personalisation, and advertising. By continuing you agree to our cookie use.",
      accept: { label: "Accept All", fn: onWrong },
      reject: { label: "More options", fn: () => setStep(1) },
    },
    {
      title: "Manage your preferences",
      body: "Choose how we may use your data. We recommend keeping personalisation on for the best experience.",
      accept: { label: "Keep personalisation", fn: onWrong },
      reject: { label: "Opt out of personalisation", fn: () => setStep(2) },
    },
    {
      title: "Confirm your choice",
      body: "Are you sure? Without personalisation you may see less relevant content and advertising.",
      accept: { label: "Cancel — keep personalisation", fn: onWrong },
      reject: {
        label: "Yes, opt out of all non-essential",
        fn: () => setStep(3),
      },
    },
    {
      title: "Almost there",
      body: "To finalise your choice, please confirm that you understand this may affect site features.",
      accept: { label: "I changed my mind", fn: onWrong },
      reject: { label: "Confirm rejection of all", fn: onCorrect },
    },
  ] as const;

  const s = steps[step];

  return (
    <Box>
      <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
        <Typography
          sx={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#1a202c",
            mb: 1,
          }}
        >
          {s.title}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#4a5568",
            mb: 1.75,
            lineHeight: 1.65,
          }}
        >
          {s.body}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1 }}>
          <Box
            component="button"
            onClick={s.accept.fn}
            disabled={disabled}
            sx={{
              ...btn(disabled),
              bgcolor: "#2563eb",
              color: "#fff",
              py: 1,
              fontSize: "0.8125rem",
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
              border: "1px solid #cbd5e0",
              py: 0.875,
              fontSize: "0.75rem",
            }}
          >
            {s.reject.label}
          </Box>
        </Box>
        {/* Progress dots */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 0.5,
            mt: 1,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: i <= step ? "#2563eb" : "#e2e8f0",
              }}
            />
          ))}
        </Box>
        <Typography
          sx={{
            fontSize: "0.625rem",
            color: "#a0aec0",
            textAlign: "center",
            mt: 0.5,
            fontFamily: "monospace",
          }}
        >
          Step {step + 1} of 4
        </Typography>
      </Box>
      <CmpFooter cmp="ConsentCore CMP" />
    </Box>
  );
}

/** Hard-4: Cookie wall / paywall — "Pay or Consent"
 *  Spot mode — 3 patterns */
function BannerCookieWall({
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
    <Box sx={{ bgcolor: "#fff" }}>
      <Box
        sx={{
          bgcolor: "#1a202c",
          color: "#fff",
          px: 2.5,
          py: 1.25,
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.625rem",
            color: "#a0aec0",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            mb: 0.25,
          }}
        >
          Access required
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 700 }}>
          To continue reading, choose an option
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        {/* The pay-or-consent choice itself is a dark pattern */}
        <TapTarget
          id="dp-pay-or-consent"
          label="Pay-or-Consent (forced choice, no free reject)"
          found={fp.has("dp-pay-or-consent")}
          onFind={find}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: 1.25,
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1,
                p: 1.25,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#1a202c",
                }}
              >
                Subscribe — €4.99/month
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.625rem",
                  color: "#718096",
                  mt: 0.25,
                  lineHeight: 1.5,
                }}
              >
                No tracking. No personalised ads. Cancel anytime.
              </Typography>
            </Box>
            <Box
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1,
                p: 1.25,
                bgcolor: "#f7fafc",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#1a202c",
                }}
              >
                Continue with personalised ads — Free
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.625rem",
                  color: "#718096",
                  mt: 0.25,
                  lineHeight: 1.5,
                }}
              >
                Allows us and our 384 partners to use your data for personalised
                advertising.
              </Typography>
            </Box>
          </Box>
        </TapTarget>

        {/* Confusing legal-sounding fine print with double negative */}
        <TapTarget
          id="dp-wall-doubleneg"
          label="Double-negative / unclear fine print"
          found={fp.has("dp-wall-doubleneg")}
          onFind={find}
        >
          <Typography
            sx={{
              fontSize: "0.625rem",
              color: "#718096",
              mb: 1.25,
              lineHeight: 1.5,
              fontStyle: "italic",
              cursor: "inherit",
            }}
          >
            By not refusing to consent to data processing under legitimate
            interest, you accept that withdrawal will not affect lawfulness of
            processing prior to such withdrawal.
          </Typography>
        </TapTarget>

        {/* Shame text */}
        <TapTarget
          id="dp-wall-shame"
          label="Guilt-shaming (independent journalism)"
          found={fp.has("dp-wall-shame")}
          onFind={find}
        >
          <Typography
            sx={{
              fontSize: "0.625rem",
              color: "#a0aec0",
              lineHeight: 1.5,
              cursor: "inherit",
            }}
          >
            Independent journalism takes resources. Help us continue by
            supporting our advertisers — or subscribe today.
          </Typography>
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
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// LEVEL DEFINITIONS
// ═════════════════════════════════════════════════════════════════════════════

const ALL_LEVELS: CookieLevel[] = [
  // ── EASY ──────────────────────────────────────────────────────────────────
  {
    id: "e1",
    difficulty: "easy",
    site: "The Daily Herald",
    url: "www.dailyherald.nl",
    title: "The Cookiebot Minimal Bar",
    cmpLabel: "Cookiebot CMP",
    instruction:
      "Find a way to use only necessary cookies. The reject option exists — it just doesn't look like a button.",
    mode: "escape",
    layout: "bar",
    debrief:
      'This is a typical Cookiebot-style minimal bar — clean, professional, and quietly violating GDPR. The green "Allow all" was a prominent button. The reject option was styled as small grey underlined link text, indistinguishable from the surrounding body copy.\n\nEDPB guidance and the Dutch DPA (Autoriteit Persoonsgegevens) have both confirmed: refusal must be as easy as acceptance. A button-vs-link is not "equal weight".',
    patterns: [],
    BannerComponent: BannerCookiebotMinimal,
  },
  {
    id: "e2",
    difficulty: "easy",
    site: "ShopNL",
    url: "www.shopnl.com",
    title: "The Fake Close Button",
    cmpLabel: "Generic modal",
    instruction:
      "Try to close or reject this cookie banner. But be careful — not everything is what it seems.",
    mode: "escape",
    layout: "modal",
    debrief:
      'The ✕ in the corner looked like a "close" button — but it secretly fired Accept All. The CNIL fined Google €150M and Facebook €60M in 2022 partly for this exact pattern: missing or misleading reject controls at the top level.\n\nAlways look for an explicit "Reject" or "Only necessary" button. If the only easy out is a ✕ or "Got it!", the banner is almost certainly non-compliant.',
    patterns: [],
    BannerComponent: BannerFakeClose,
  },
  {
    id: "e3",
    difficulty: "easy",
    site: "RecipeBlog",
    url: "www.recipe-world.nl",
    title: "The Asymmetric Buttons",
    cmpLabel: "Bottom bar",
    instruction:
      "Both options are visible this time, but one is made to look much less important. Reject all non-essential cookies.",
    mode: "escape",
    layout: "bar",
    debrief:
      '"Accept All" was orange, full-sized, and shadowed. "Reject" was a thin grey-outlined button half the size and weight — a textbook GDPR violation.\n\nThe EDPB Cookie Banner Taskforce report (2023) explicitly lists "Accept All" and "Reject All" buttons with different visual weight as non-compliant. Both must be equally prominent.',
    patterns: [],
    BannerComponent: BannerAsymmetricBar,
  },
  {
    id: "e4",
    difficulty: "easy",
    site: "FlyAway Travel",
    url: "www.flyaway-travel.eu",
    title: "The OneTrust Three-Button",
    cmpLabel: "OneTrust modal",
    instruction:
      'This is a real OneTrust layout. Three buttons — "Allow All", "Reject All", and "Cookie Settings". Pick the one that rejects all non-essential cookies.',
    mode: "escape",
    layout: "modal",
    debrief:
      'This is what a compliant OneTrust banner looks like (mostly) — "Allow All" and "Reject All" both visible on the first layer.\n\nNote that "Allow All" is still the only filled button — the others are outlined. This is still a subtle visual asymmetry that pushes users toward Accept. Many real OneTrust deployments do this. The fully-compliant version would have both Allow and Reject as equally weighted buttons.',
    patterns: [],
    BannerComponent: BannerOneTrustContinue,
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────
  {
    id: "m1",
    difficulty: "medium",
    site: "FinanceTrack",
    url: "app.financetrack.io",
    title: "The Quantcast Double Negative",
    cmpLabel: "Quantcast Choice",
    instruction:
      'Click "Manage Options" — then read the checkbox very carefully before saving.',
    mode: "escape",
    layout: "modal",
    debrief:
      '"Do not opt out of allowing our partners\' non-essential data-processing activities." Read it twice.\n\nIt is a double negative wrapped in three more negatives. To opt OUT, you have to TICK a box labelled "do not opt out". This is intentionally confusing language designed to make you give up.\n\nGDPR Article 7(2) requires consent requests to be "in an intelligible and easily accessible form, using clear and plain language". This fails that test, and noyb has filed hundreds of complaints against Quantcast-powered banners using this exact pattern.',
    patterns: [],
    BannerComponent: BannerQuantcastDoubleNeg,
  },
  {
    id: "m2",
    difficulty: "medium",
    site: "LearnOnline",
    url: "www.learnonline.eu",
    title: "The OneTrust Pre-Enabled Toggles",
    cmpLabel: "OneTrust w/ Customise",
    instruction:
      'Open "Customise Settings" and reject all non-essential cookies. Watch the default state of each toggle.',
    mode: "escape",
    layout: "modal",
    debrief:
      'When you opened "Customise Settings", every toggle except "Strictly Necessary" was already ON. To actually reject, you had to manually turn off three toggles.\n\nGDPR is explicit: consent must be a "freely given, specific, informed and unambiguous indication... by a statement or by a clear affirmative action". Pre-enabled toggles are not affirmative action — they are the absence of action being treated as consent.\n\nThe Planet49 ruling (CJEU C-673/17, 2019) confirmed this: pre-ticked boxes do not constitute valid consent. Pre-enabled toggles are the same thing in a more modern UI.',
    patterns: [],
    BannerComponent: BannerOneTrustCustomise,
  },
  {
    id: "m3",
    difficulty: "medium",
    site: "GlobalNews",
    url: "www.globalnews247.com",
    title: "The IAB TCF Publisher",
    cmpLabel: "IAB TCF v2.2",
    instruction:
      '847 "partners". This is a real IAB TCF banner. Click "Show Purposes" — the Reject All option is on the next screen.',
    mode: "escape",
    layout: "modal",
    debrief:
      'The IAB Transparency &amp; Consent Framework is used by most major European news publishers. The Belgian DPA ruled it illegal in 2022 (later partially overturned), and noyb has filed complaints against virtually every TCF deployment.\n\nProblems here: (1) on the first layer, only "I Accept" is a button — "Reject All" is hidden behind "Show Purposes". (2) The 847 partner count is normal for TCF banners — and almost no one actually reads the partner list. (3) The "purposes" use deliberately broad language ("personalised advertising and content...") that bundles many distinct activities into one consent.',
    patterns: [],
    BannerComponent: BannerIABTCF,
  },
  {
    id: "m4",
    difficulty: "medium",
    site: "ShopSmart",
    url: "www.shopsmart.nl",
    title: "The Legitimate Interest Tab",
    cmpLabel: "OneTrust + LegInt",
    instruction:
      'Click "Cookie Settings". The Consent tab looks empty — but there\'s another tab. Reject everything on both.',
    mode: "escape",
    layout: "modal",
    debrief:
      'This is one of the most consequential dark patterns in modern banners. The "Consent" tab had toggles all OFF — looks clean! But the "Legitimate Interest" tab (which most users never click) had toggles all ON.\n\n"Legitimate interest" is a real GDPR legal basis, but the EDPB has ruled (2023) that it cannot be used for online advertising or profiling — those require consent. Yet CMPs continue to ship UIs where legitimate-interest tabs default to enabled. noyb calls this "consent washing".\n\nTo actually opt out, you must check both tabs. Almost no one does.',
    patterns: [],
    BannerComponent: BannerLegitInterestTab,
  },

  // ── HARD ──────────────────────────────────────────────────────────────────
  {
    id: "h1",
    difficulty: "hard",
    site: "StreamMax",
    url: "www.streammax.tv",
    title: "The French Press Style",
    cmpLabel: "Le Monde-style",
    instruction:
      "This banner is modelled on Le Monde, Le Figaro, and other French press sites — the layout the CNIL spent years fighting. Find 3 dark patterns.",
    mode: "spot",
    layout: "modal",
    debrief:
      'You found all three:\n\n1. Tiny "Continue without accepting" link — in the top-right corner, in grey 10px text. The CNIL fined Google €150M and Facebook €60M in January 2022 specifically because their banners had no "Reject All" button at the same level as "Accept All". French publishers responded by adding this tiny link instead of a proper button.\n\n2. Premium upsell — €9.99/month as the "alternative" to accepting tracking. This frames privacy as a premium feature you pay for. The EDPB issued guidance in April 2024 that "pay or consent" walls are generally not compliant for large platforms.\n\n3. Only prominent CTA is "Accept" — the visual hierarchy gives users only one obvious option. The CNIL\'s own design guidelines require an equally prominent reject button on the first layer.',
    patterns: [
      {
        id: "dp-tiny-reject",
        label: 'Tiny "Continue without accepting" link',
        explanation:
          "Hidden in the top-right corner in tiny grey text. The French press invented this pattern after CNIL forced them to add a reject option — but they made it as small as possible.",
      },
      {
        id: "dp-premium-upsell",
        label: "Premium upsell as reject alternative",
        explanation:
          "Reframes privacy as a paid feature. The EDPB ruled in April 2024 that 'pay or consent' walls are generally non-compliant on large platforms.",
      },
      {
        id: "dp-only-accept-cta",
        label: "Single prominent CTA (Accept only)",
        explanation:
          "The only large, filled, dark button is Accept. The reject option must be discovered. EDPB and CNIL both require equal-weight buttons.",
      },
    ],
    BannerComponent: BannerLeMondeFrench,
  },
  {
    id: "h2",
    difficulty: "hard",
    site: "PriceHunter",
    url: "www.pricehunter.nl",
    title: "The Yahoo Interstitial",
    cmpLabel: "Yahoo-style interstitial",
    instruction:
      "This is modelled on the infamous Yahoo/TechCrunch/Verizon Media full-screen consent prompt. The whole site is blocked until you choose. Find 4 dark patterns.",
    mode: "spot",
    layout: "interstitial",
    debrief:
      'You found all four:\n\n1. Massive partner count (1,247) — Yahoo\'s real banner cites 800+ partners. This serves two purposes: it overwhelms users into clicking Accept, and it lets Yahoo claim "transparency" by technically listing everyone.\n\n2. Forced action — the entire site is blocked until you choose. The EDPB calls this "forced action" and the Italian DPA fined a publisher €60K in 2023 for exactly this layout.\n\n3. Visual asymmetry — purple filled "Accept all" vs grey outlined "Reject all". Equal-text labels but unequal visual weight is still a violation per the EDPB Cookie Banner Taskforce report.\n\n4. Guilt-shaming — "our service remains free thanks to partners who do support us" frames rejection as freeloading.',
    patterns: [
      {
        id: "dp-partner-count",
        label: "Massive partner count (1,247)",
        explanation:
          "Cognitive overload. No user can meaningfully consent to processing by 1,247 separate companies. The number itself is the dark pattern.",
      },
      {
        id: "dp-forced-action",
        label: "Forced action (site blocked until choice)",
        explanation:
          "Full-screen interstitial means you cannot use or even preview the site without consenting. EDPB calls this 'forced action' and it removes the freely-given quality of consent.",
      },
      {
        id: "dp-asymm-yahoo",
        label: "Visual asymmetry of CTAs",
        explanation:
          "Accept is purple, filled, prominent. Reject is grey, outlined, faded. Same labels, very different visual pull.",
      },
      {
        id: "dp-shame-yahoo",
        label: "Guilt-shaming (free service)",
        explanation:
          "Frames rejection as freeloading. Confirmshaming is named as a deceptive design pattern by both the FTC and the EDPB.",
      },
    ],
    BannerComponent: BannerYahooInterstitial,
  },
  {
    id: "h3",
    difficulty: "hard",
    site: "SocialHub",
    url: "app.socialhub.io",
    title: "The Four-Step Roach Motel",
    cmpLabel: "Multi-step rejection",
    instruction:
      "Accepting takes one click. Rejecting takes four. Navigate the full sequence — and don't let the wording confuse you about which button rejects.",
    mode: "escape",
    layout: "modal",
    debrief:
      'You navigated the "roach motel" — easy to enter, hard to leave.\n\nGDPR Article 7(3) is explicit: "It shall be as easy to withdraw as to give consent." A one-click Accept vs a four-click Reject is a clear violation, and the EDPB has highlighted this as one of the most egregious dark patterns in its 2023 guidance.\n\nThe trick on each step is that the colored button always sounds like the "easy" choice — "Keep personalisation", "Cancel — keep personalisation", "I changed my mind" — and the grey button is the one that actually progresses toward rejection.',
    patterns: [],
    BannerComponent: BannerRoachMotel,
  },
  {
    id: "h4",
    difficulty: "hard",
    site: "TechReview",
    url: "www.techreview-daily.com",
    title: "The Cookie Wall",
    cmpLabel: "Pay-or-Consent wall",
    instruction:
      "This is a 'pay or consent' wall — the model used by many German and Austrian publishers. Find 3 dark patterns.",
    mode: "spot",
    layout: "interstitial",
    debrief:
      'You found all three:\n\n1. Pay-or-Consent — you can subscribe (€4.99/month) or accept tracking. There is no free reject option. Meta tried this exact model in 2023 and the EDPB issued binding guidance in April 2024 that "pay or consent" is generally not a valid form of consent for large online platforms, because consent must be "freely given" — paying to refuse is not free.\n\n2. Double negative fine print — "By not refusing to consent to data processing under legitimate interest..." is deliberately unreadable legalese. GDPR requires clear, plain language.\n\n3. Guilt-shaming about journalism — "Independent journalism takes resources" reframes privacy choice as harming the publisher. The publisher\'s business model is not the user\'s ethical concern.',
    patterns: [
      {
        id: "dp-pay-or-consent",
        label: "Pay-or-Consent (no free reject)",
        explanation:
          'Forces a binary choice between paying and being tracked. EDPB Opinion 08/2024 ruled this is generally non-compliant on large online platforms — consent paid for is not "freely given".',
      },
      {
        id: "dp-wall-doubleneg",
        label: "Double negative fine print",
        explanation:
          "Deliberately unreadable legalese. 'By not refusing to consent...' contains multiple negations. GDPR Art 7(2) requires clear plain language.",
      },
      {
        id: "dp-wall-shame",
        label: "Guilt-shaming about journalism",
        explanation:
          "Reframes a legal privacy right as a moral failing toward the publisher. Classic confirmshaming.",
      },
    ],
    BannerComponent: BannerCookieWall,
  },
];

function pickLevelForDate(date: string, difficulty: Difficulty): CookieLevel {
  const pool = ALL_LEVELS.filter((l) => l.difficulty === difficulty);
  const seed =
    date.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) +
    difficulty.length;
  return pool[seed % pool.length];
}

// ═════════════════════════════════════════════════════════════════════════════
// LEVEL RUNNER
// ═════════════════════════════════════════════════════════════════════════════

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
      setFoundPatterns((prev) => new Set(prev).add(id));
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

  // ── Layout: interstitial (full-screen dark backdrop) ──
  const isInterstitial = level.layout === "interstitial";
  const isModal = level.layout === "modal";

  const robotLine = ROBOT_LEVEL_LINES[level.id];
  return (
    <Box>
      {robotLine && (
        <RobotGreeter
          headline={robotLine}
          robotSize={56}
          robotColor={p.primary}
        />
      )}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon />}
        sx={{ mb: 2.5, fontSize: "0.875rem" }}
      >
        {level.instruction}
      </Alert>

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
        <BrowserChrome url={level.url} />

        {/* Layout 1: BAR — banner at the bottom of the page */}
        {level.layout === "bar" && (
          <Box sx={{ bgcolor: "#f8fafc" }}>
            <FakePage />
            <Box
              sx={{
                bgcolor: "#fff",
                borderTop: "2px solid #e2e8f0",
                boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
              }}
            >
              <BannerComponent
                onCorrect={handleCorrect}
                onWrong={handleWrong}
                disabled={result !== "idle"}
                onFoundPattern={handleFound}
                foundPatterns={foundPatterns}
              />
            </Box>
          </Box>
        )}

        {/* Layout 2: MODAL — banner centered with dark backdrop on a blurred page */}
        {isModal && (
          <Box
            sx={{
              position: "relative",
              bgcolor: "#f8fafc",
              minHeight: 360,
            }}
          >
            <FakePage lines={[70, 90, 60, 80, 50, 75, 65, 85, 55, 70]} />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 1.5,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 460,
                  bgcolor: "#fff",
                  borderRadius: "6px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  overflow: "hidden",
                  maxHeight: "92%",
                  overflowY: "auto",
                }}
              >
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
        )}

        {/* Layout 3: INTERSTITIAL — full-screen, no page visible behind */}
        {isInterstitial && (
          <Box
            sx={{
              bgcolor: "#1a202c",
              minHeight: 420,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 1.5,
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 480,
                bgcolor: "#fff",
                borderRadius: "6px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                overflow: "hidden",
              }}
            >
              <BannerComponent
                onCorrect={handleCorrect}
                onWrong={handleWrong}
                disabled={result !== "idle"}
                onFoundPattern={handleFound}
                foundPatterns={foundPatterns}
              />
            </Box>
          </Box>
        )}
      </Box>

      {level.mode === "spot" && lastFound && result === "idle" && (
        <Fade in>
          <Alert severity="warning" sx={{ mb: 2, fontSize: "0.8125rem" }}>
            <strong>Found: {lastFound.label}</strong>
            <br />
            {lastFound.explanation}
          </Alert>
        </Fade>
      )}

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
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setDebriefOpen(true)}
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
              </Box>
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
              {/* <Button variant="text" onClick={onComplete} sx={{ mb: 2 }}>
                Skip this level
              </Button> */}
            </>
          )}
        </Box>
      </Fade>

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

// ═════════════════════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

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
        <Box sx={{ display: "flex", gap: 0.75, mb: 2.5, flexWrap: "wrap" }}>
          <Chip
            label={
              level.mode === "spot"
                ? "Spot the tricks"
                : "Find the reject option"
            }
            size="small"
            sx={{
              height: 22,
              fontSize: "0.625rem",
              fontWeight: 700,
              bgcolor: alpha(
                level.mode === "spot" ? p.warning : p.primary,
                0.12,
              ),
              color: level.mode === "spot" ? p.warning : p.primary,
              border: `1px solid ${alpha(level.mode === "spot" ? p.warning : p.primary, 0.3)}`,
              borderRadius: "5px",
            }}
          />
          <Chip
            label={level.cmpLabel}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.625rem",
              fontWeight: 700,
              bgcolor: alpha(p.border, 0.3),
              color: "text.secondary",
              border: `1px solid ${alpha(p.border, 0.5)}`,
              borderRadius: "5px",
            }}
          />
        </Box>
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
      >
        <Box sx={{ textAlign: "center", py: 8 }} className="slide-up">
          <EmojiEventsIcon sx={{ fontSize: 56, color: p.primary, mb: 2 }} />
          <Typography variant="h2" sx={{ mb: 1 }}>
            All levels done! 🎉
          </Typography>
          <Box sx={{ maxWidth: 420, mx: "auto", mt: 2, textAlign: "left" }}>
            <RobotGreeter
              headline={
                "You can now spot and avoid the most common cookie consent tricks, including the ones used by major publishers across the EU. Come back tomorrow for new challenges!"
              }
              robotSize={56}
              robotColor={p.primary}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={onBack}
            sx={{ mt: 3 }}
          >
            Back to home
          </Button>
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
    >
      <Typography
        variant="overline"
        sx={{ display: "block", mb: 1, color: p.danger }}
      >
        Today's Challenge
      </Typography>
      <Typography variant="h2" sx={{ mb: 3 }}>
        Cookie Trap
      </Typography>
      <RobotGreeter
        headline={ROBOT_HEADLINE}
        details={ROBOT_DETAILS}
        robotColor={p.primary}
        robotSize={88}
      />
      <LevelPicker
        levels={[
          {
            difficulty: "easy",
            subtitle: `${levels.easy.title} — ${levels.easy.cmpLabel}`,
          },
          {
            difficulty: "medium",
            subtitle: `${levels.medium.title} — ${levels.medium.cmpLabel}`,
          },
          {
            difficulty: "hard",
            subtitle: `${levels.hard.title} — ${levels.hard.cmpLabel}`,
          },
        ]}
        completed={completed}
        onSelect={setActiveLevel}
      />
    </GameShell>
  );
}
