import { createTheme, alpha } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    terminal: {
      void: string;
      deep: string;
      surface: string;
      raised: string;
      border: string;
      borderLit: string;
      phosphor: string;
      phosphorDim: string;
      coral: string;
      coralDim: string;
      amber: string;
      amberDim: string;
      muted: string;
      ghost: string;
    };
  }
  interface PaletteOptions {
    terminal?: {
      void?: string;
      deep?: string;
      surface?: string;
      raised?: string;
      border?: string;
      borderLit?: string;
      phosphor?: string;
      phosphorDim?: string;
      coral?: string;
      coralDim?: string;
      amber?: string;
      amberDim?: string;
      muted?: string;
      ghost?: string;
    };
  }
  interface TypeText {
    muted: string;
    ghost: string;
  }
}

const VOID = "#080b10";
const DEEP = "#0d1117";
const SURFACE = "#161b22";
const RAISED = "#1c2330";
const BORDER = "#21293a";
const BORDER_LIT = "#2d3d55";
const PHOSPHOR = "#00ff9d";
const PHOSPHOR_DIM = "rgba(0,255,157,0.12)";
const CORAL = "#f85149";
const CORAL_DIM = "rgba(248,81,73,0.12)";
const AMBER = "#d29922";
const AMBER_DIM = "rgba(210,153,34,0.12)";
const TEXT = "#cdd9e5";
const MUTED = "#768390";
const GHOST = "#444e5c";

const theme = createTheme({
  // ── Palette ────────────────────────────────────────────────────────────────
  palette: {
    mode: "dark",
    primary: {
      main: PHOSPHOR,
      light: "#4dffbb",
      dark: "#00cc7a",
      contrastText: VOID,
    },
    secondary: {
      main: CORAL,
      light: "#ff7b73",
      dark: "#c0302a",
      contrastText: "#ffffff",
    },
    warning: {
      main: AMBER,
      light: "#e8b84b",
      dark: "#a07010",
      contrastText: VOID,
    },
    error: {
      main: CORAL,
      contrastText: "#ffffff",
    },
    success: {
      main: PHOSPHOR,
      contrastText: VOID,
    },
    background: {
      default: VOID,
      paper: SURFACE,
    },
    text: {
      primary: TEXT,
      secondary: MUTED,
      muted: MUTED,
      ghost: GHOST,
      disabled: GHOST,
    },
    divider: BORDER,
    terminal: {
      void: VOID,
      deep: DEEP,
      surface: SURFACE,
      raised: RAISED,
      border: BORDER,
      borderLit: BORDER_LIT,
      phosphor: PHOSPHOR,
      phosphorDim: PHOSPHOR_DIM,
      coral: CORAL,
      coralDim: CORAL_DIM,
      amber: AMBER,
      amberDim: AMBER_DIM,
      muted: MUTED,
      ghost: GHOST,
    },
  },

  // ── Typography ─────────────────────────────────────────────────────────────
  typography: {
    fontFamily: '"Share Tech Mono", "JetBrains Mono", "Fira Code", monospace',
    h1: {
      fontFamily: '"Syne", "Share Tech Mono", monospace',
      fontWeight: 800,
      fontSize: "2.25rem",
      letterSpacing: "-0.02em",
      color: "#ffffff",
    },
    h2: {
      fontFamily: '"Syne", "Share Tech Mono", monospace',
      fontWeight: 800,
      fontSize: "1.75rem",
      letterSpacing: "-0.02em",
      color: "#ffffff",
    },
    h3: {
      fontFamily: '"Syne", "Share Tech Mono", monospace',
      fontWeight: 700,
      fontSize: "1.375rem",
      letterSpacing: "-0.01em",
      color: "#ffffff",
    },
    h4: {
      fontFamily: '"Syne", "Share Tech Mono", monospace',
      fontWeight: 700,
      fontSize: "1.125rem",
      color: TEXT,
    },
    h5: {
      fontWeight: 600,
      fontSize: "0.9375rem",
      color: TEXT,
    },
    h6: {
      fontWeight: 600,
      fontSize: "0.875rem",
      color: TEXT,
    },
    subtitle1: {
      fontSize: "0.8125rem",
      fontWeight: 500,
      color: MUTED,
      letterSpacing: "0.08em",
    },
    subtitle2: {
      fontSize: "0.6875rem",
      fontWeight: 500,
      letterSpacing: "0.2em",
      textTransform: "uppercase" as const,
      color: MUTED,
    },
    body1: {
      fontSize: "0.875rem",
      lineHeight: 1.75,
      color: TEXT,
    },
    body2: {
      fontSize: "0.8125rem",
      lineHeight: 1.65,
      color: MUTED,
    },
    caption: {
      fontSize: "0.6875rem",
      letterSpacing: "0.12em",
      color: GHOST,
    },
    overline: {
      fontSize: "0.625rem",
      fontWeight: 600,
      letterSpacing: "0.3em",
      textTransform: "uppercase" as const,
      color: PHOSPHOR,
    },
    button: {
      fontFamily: '"Share Tech Mono", monospace',
      fontWeight: 500,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
    },
  },

  // Shape
  shape: {
    borderRadius: 4,
  },

  // Component overrides
  components: {
    // CssBaseline: scanline body
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@400;700;800&display=swap');

        body {
          background: ${VOID};
          color: ${TEXT};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Subtle scanline overlay */
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.06) 2px,
            rgba(0,0,0,0.06) 4px
          );
          pointer-events: none;
          z-index: 9999;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: ${BORDER_LIT}; }

        /* Blinking cursor utility */
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes glow  {
          0%,100% { text-shadow: 0 0 8px ${alpha(PHOSPHOR, 0.4)}; }
          50%      { text-shadow: 0 0 20px ${alpha(PHOSPHOR, 0.9)}, 0 0 40px ${alpha(PHOSPHOR, 0.4)}; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .cursor::after {
          content: '▋';
          animation: blink 1s step-end infinite;
          color: ${PHOSPHOR};
        }
        .glow-text { animation: glow 2.5s ease-in-out infinite; }
        .slide-up  { animation: slideUp 0.4s cubic-bezier(.4,0,.2,1) both; }
      `,
    },

    // Paper
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: SURFACE,
          border: `1px solid ${BORDER}`,
        },
        elevation1: {
          boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
        },
        elevation2: {
          boxShadow: `0 4px 16px rgba(0,0,0,0.5)`,
        },
        elevation3: {
          boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
        },
      },
    },

    // Card
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
          backgroundImage: "none",
          transition: "border-color 0.2s ease",
          "&:hover": {
            borderColor: BORDER_LIT,
          },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "20px 24px",
          "&:last-child": { paddingBottom: "20px" },
        },
      },
    },

    // Button
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          padding: "10px 24px",
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          fontWeight: 500,
          transition: "all 0.2s ease",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: `0 0 20px ${alpha(PHOSPHOR, 0.3)}`,
          },
        },
        containedPrimary: {
          background: "transparent",
          border: `1px solid ${PHOSPHOR}`,
          color: PHOSPHOR,
          "&:hover": {
            background: PHOSPHOR,
            color: VOID,
            boxShadow: `0 0 24px ${alpha(PHOSPHOR, 0.4)}`,
          },
        },
        containedSecondary: {
          background: "transparent",
          border: `1px solid ${CORAL}`,
          color: CORAL,
          "&:hover": {
            background: CORAL,
            color: "#fff",
          },
        },
        outlined: {
          borderColor: BORDER_LIT,
          color: MUTED,
          "&:hover": {
            borderColor: PHOSPHOR,
            color: PHOSPHOR,
            backgroundColor: PHOSPHOR_DIM,
          },
        },
        text: {
          color: MUTED,
          "&:hover": {
            color: TEXT,
            backgroundColor: alpha(TEXT, 0.05),
          },
        },
      },
    },

    // TextField / Input
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: "1rem",
          letterSpacing: "0.05em",
          color: PHOSPHOR,
          backgroundColor: DEEP,
          borderRadius: 3,
          caretColor: PHOSPHOR,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: BORDER_LIT,
            transition: "border-color 0.2s",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: MUTED,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: PHOSPHOR,
            boxShadow: `0 0 0 1px ${alpha(PHOSPHOR, 0.2)}`,
          },
          "& input::placeholder": {
            color: GHOST,
            opacity: 1,
          },
          "& input": {
            padding: "14px 16px",
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: MUTED,
          "&.Mui-focused": {
            color: PHOSPHOR,
          },
        },
      },
    },

    // LinearProgress
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 4,
          borderRadius: 2,
          backgroundColor: BORDER,
        },
        bar: {
          borderRadius: 2,
          transition: "transform 0.5s cubic-bezier(.4,0,.2,1)",
        },
      },
    },

    // Chip
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: "0.625rem",
          letterSpacing: "0.15em",
          fontWeight: 500,
          height: 22,
        },
      },
    },

    // Tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: RAISED,
          border: `1px solid ${BORDER_LIT}`,
          color: TEXT,
          fontSize: "0.75rem",
          fontFamily: '"Share Tech Mono", monospace',
          letterSpacing: "0.05em",
          borderRadius: 3,
          padding: "8px 12px",
        },
        arrow: {
          color: RAISED,
        },
      },
    },

    // Stepper
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: "0.6875rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: MUTED,
          "&.Mui-active": { color: PHOSPHOR },
          "&.Mui-completed": { color: PHOSPHOR },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: BORDER_LIT,
          "&.Mui-active": { color: PHOSPHOR },
          "&.Mui-completed": { color: PHOSPHOR },
        },
        text: {
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: "0.625rem",
          fill: VOID,
        },
      },
    },
    MuiStepConnector: {
      styleOverrides: {
        line: {
          borderColor: BORDER_LIT,
        },
      },
    },

    // Alert
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: "0.8125rem",
          border: "1px solid",
        },
        standardSuccess: {
          backgroundColor: alpha(PHOSPHOR, 0.08),
          borderColor: alpha(PHOSPHOR, 0.3),
          color: PHOSPHOR,
        },
        standardError: {
          backgroundColor: CORAL_DIM,
          borderColor: alpha(CORAL, 0.3),
          color: CORAL,
        },
        standardWarning: {
          backgroundColor: AMBER_DIM,
          borderColor: alpha(AMBER, 0.3),
          color: AMBER,
        },
        standardInfo: {
          backgroundColor: alpha(BORDER_LIT, 0.4),
          borderColor: BORDER_LIT,
          color: TEXT,
        },
      },
    },

    //Dialog
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: SURFACE,
          border: `1px solid ${BORDER_LIT}`,
          borderRadius: 6,
          backgroundImage: "none",
        },
        root: {
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(8,11,16,0.85)",
            backdropFilter: "blur(6px)",
          },
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Syne", monospace',
          fontSize: "1.125rem",
          fontWeight: 700,
          color: "#ffffff",
          padding: "20px 24px 12px",
        },
      },
    },

    //Divider
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: BORDER,
        },
      },
    },

    //IconButton
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: MUTED,
          borderRadius: 3,
          transition: "color 0.2s, background 0.2s",
          "&:hover": {
            color: TEXT,
            backgroundColor: alpha(TEXT, 0.06),
          },
        },
      },
    },
  },
});

export default theme;
