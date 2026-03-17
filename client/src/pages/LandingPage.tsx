import { Box, Typography, Button, Chip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import CookieIcon from "@mui/icons-material/Cookie";
import SecurityIcon from "@mui/icons-material/Security";
import EmailIcon from "@mui/icons-material/Email";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { CipherAvatar } from "../components/CipherAvatar";

// Animated grid background

function GridBackground() {
  const theme = useTheme();
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Radial gradient focal point */}
      <Box
        sx={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.terminal.phosphor, 0.06)} 0%, transparent 70%)`,
        }}
      />
      {/* Dot grid */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${alpha(theme.palette.terminal.border, 0.8)} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }}
      />
      {/* Top glow line */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.terminal.phosphor, 0.4)}, transparent)`,
        }}
      />
    </Box>
  );
}

// Module card

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  accentColor: string;
  onClick: () => void;
  disabled?: boolean;
}

function ModuleCard({
  icon,
  title,
  description,
  badge,
  accentColor,
  onClick,
  disabled,
}: ModuleCardProps) {
  const theme = useTheme();
  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={(e) => !disabled && e.key === "Enter" && onClick()}
      sx={{
        position: "relative",
        border: `1px solid ${theme.palette.terminal.border}`,
        borderRadius: "6px",
        p: { xs: 2.5, sm: 3 },
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        bgcolor: theme.palette.terminal.surface,
        transition: "border-color 0.25s, transform 0.2s, box-shadow 0.25s",
        overflow: "hidden",
        "&:hover:not([disabled])": {
          borderColor: accentColor,
          transform: "translateY(-3px)",
          boxShadow: `0 8px 32px ${alpha(accentColor, 0.18)}`,
        },
        "&:focus-visible": {
          outline: `2px solid ${accentColor}`,
          outlineOffset: 2,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accentColor,
          opacity: disabled ? 0.3 : 1,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "10px",
            bgcolor: alpha(accentColor, 0.12),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: accentColor,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: "1rem",
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              {title}
            </Typography>
            <Chip
              label={badge}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.55rem",
                letterSpacing: "0.12em",
                fontFamily: '"Share Tech Mono", monospace',
                bgcolor: alpha(accentColor, 0.12),
                color: accentColor,
                border: `1px solid ${alpha(accentColor, 0.35)}`,
                borderRadius: "3px",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.terminal.muted,
              lineHeight: 1.55,
              fontSize: "0.8125rem",
            }}
          >
            {description}
          </Typography>
        </Box>
        {!disabled && (
          <ArrowForwardIcon
            sx={{
              fontSize: 18,
              color: theme.palette.terminal.ghost,
              flexShrink: 0,
              mt: 0.5,
            }}
          />
        )}
      </Box>
    </Box>
  );
}

//Landing Page

export default function LandingPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <GridBackground />

      {/* ── Content ── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4 },
          py: { xs: 6, sm: 8 },
          maxWidth: 680,
          mx: "auto",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            border: `1px solid ${alpha(theme.palette.terminal.phosphor, 0.3)}`,
            borderRadius: "20px",
            px: 2,
            py: 0.75,
            mb: 4,
            bgcolor: alpha(theme.palette.terminal.phosphor, 0.05),
          }}
        >
          <SecurityIcon
            sx={{ fontSize: 14, color: theme.palette.terminal.phosphor }}
          />
          <Typography
            variant="overline"
            sx={{
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              color: theme.palette.terminal.phosphor,
            }}
          >
            Interactive Privacy Education
          </Typography>
        </Box>

        {/* Logo / Wordmark */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Syne", monospace',
              fontWeight: 900,
              fontSize: { xs: "3.5rem", sm: "5rem" },
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              color: "#ffffff",
              mb: 0,
            }}
          >
            Glass
          </Typography>
          <Typography
            component="span"
            sx={{
              fontFamily: '"Syne", monospace',
              fontWeight: 900,
              fontSize: { xs: "3.5rem", sm: "5rem" },
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              color: theme.palette.terminal.phosphor,
              display: "block",
            }}
          >
            House
          </Typography>
        </Box>

        {/* Tagline */}
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.terminal.void,
            maxWidth: 440,
            mb: 5,
            fontSize: { xs: "0.9375rem", sm: "1rem" },
            lineHeight: 1.7,
          }}
        >
          Everything about your digital life is visible unless you protect it.
          Learn to defend yourself — one level at a time.
        </Typography>

        {/* Start CTA */}
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/password")}
          endIcon={<ArrowForwardIcon />}
          sx={{
            mb: 3,
            px: 5,
            py: 1.75,
            fontSize: "0.875rem",
            letterSpacing: "0.15em",
            fontWeight: 600,
            background: "transparent",
            border: `1.5px solid ${theme.palette.terminal.phosphor}`,
            color: theme.palette.terminal.phosphor,
            borderRadius: "4px",
            transition: "all 0.25s",
            "&:hover": {
              background: theme.palette.terminal.phosphor,
              color: theme.palette.terminal.void,
              boxShadow: `0 0 32px ${alpha(theme.palette.terminal.phosphor, 0.4)}`,
              transform: "translateY(-1px)",
            },
          }}
        >
          Begin Your Journey
        </Button>

        <Typography
          variant="caption"
          sx={{ color: theme.palette.terminal.void, letterSpacing: "0.1em" }}
        >
          No account needed · 100% free · GDPR-aware by design
        </Typography>

        {/* ── Module overview ── */}
        <Box
          sx={{
            mt: 6,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            textAlign: "left",
          }}
        >
          <Typography
            variant="overline"
            sx={{
              display: "block",
              color: theme.palette.terminal.void,
              letterSpacing: "0.2em",
              mb: 0.5,
              textAlign: "center",
            }}
          >
            What's inside
          </Typography>

          <ModuleCard
            icon={<LockIcon />}
            title="Password Vault"
            description="Build strong passwords, spot the weakest in a lineup, learn attack types, and master passphrases."
            badge="4 STAGES"
            accentColor={theme.palette.terminal.phosphor}
            onClick={() => navigate("/password")}
          />

          <ModuleCard
            icon={<CookieIcon />}
            title="Escape the Cookie Trap"
            description="Navigate manipulative consent banners, spot dark patterns, and learn what's actually illegal under GDPR."
            badge="6 LEVELS"
            accentColor={theme.palette.terminal.coral}
            onClick={() => navigate("/cookies")}
          />

          <ModuleCard
            icon={<EmailIcon />}
            title="Phish or Legit"
            description="Analyse real email headers, hover suspicious links, and spot social engineering before it's too late."
            badge="5 LEVELS"
            accentColor="#d29922"
            onClick={() => navigate("/phishing")}
          />
        </Box>

        {/* Footer note */}
        <Typography
          variant="caption"
          sx={{
            mt: 5,
            color: theme.palette.terminal.void,
            lineHeight: 1.7,
            maxWidth: 420,
            fontSize: "0.6875rem",
          }}
        >
          Glass House is an educational privacy awareness tool. Game content is
          served dynamically and may be updated to reflect new threats and
          regulations.
        </Typography>
      </Box>
    </Box>
  );
}
