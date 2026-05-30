import { Box, SxProps, Theme } from "@mui/material";
import { keyframes } from "@mui/system";

// Animations
const blink = keyframes`
  0%, 92%, 100% { transform: scaleY(1); }
  94%, 98%     { transform: scaleY(0.1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
`;

const antennaPulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.4); }
`;

// Props
export interface CipherProps {
  size?: number;
  color?: string;
  accent?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

// Component
export default function Cipher({
  size = 96,
  color = "#7DD3FC",
  accent = "#FBBF24",
  sx,
  onClick,
}: CipherProps) {
  const shadow = "rgba(15, 23, 42, 0.25)";

  return (
    <Box
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        animation: `${float} 3.2s ease-in-out infinite`,
        transition: "transform 0.2s ease",
        "&:hover": onClick ? { transform: "scale(1.05)" } : undefined,
        ...sx,
      }}
      aria-label="Smiley robot avatar"
      role="img"
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        sx={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <ellipse cx="50" cy="92" rx="22" ry="3" fill={shadow} />

        <line
          x1="50"
          y1="18"
          x2="50"
          y2="10"
          stroke="#475569"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <Box
          component="circle"
          cx="50"
          cy="8"
          r="3"
          fill={accent}
          sx={{
            transformOrigin: "50px 8px",
            animation: `${antennaPulse} 1.6s ease-in-out infinite`,
            filter: `drop-shadow(0 0 3px ${accent})`,
          }}
        />

        <rect
          x="20"
          y="20"
          width="60"
          height="58"
          rx="14"
          ry="14"
          fill={color}
          stroke="#334155"
          strokeWidth="1.5"
        />

        <rect
          x="28"
          y="32"
          width="44"
          height="34"
          rx="8"
          ry="8"
          fill="#0F172A"
        />

        <rect
          x="30"
          y="34"
          width="18"
          height="6"
          rx="3"
          fill="rgba(255,255,255,0.08)"
        />

        <Box
          component="circle"
          cx="40"
          cy="46"
          r="4"
          fill={accent}
          sx={{
            transformOrigin: "40px 46px",
            animation: `${blink} 4.5s ease-in-out infinite`,
          }}
        />

        <Box
          component="circle"
          cx="60"
          cy="46"
          r="4"
          fill={accent}
          sx={{
            transformOrigin: "60px 46px",
            animation: `${blink} 4.5s ease-in-out infinite`,
          }}
        />

        <path
          d="M 38 55 Q 50 64 62 55"
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <circle cx="28" cy="58" r="3" fill="#FB7185" opacity="0.55" />
        <circle cx="72" cy="58" r="3" fill="#FB7185" opacity="0.55" />

        <circle
          cx="20"
          cy="48"
          r="3"
          fill="#94A3B8"
          stroke="#334155"
          strokeWidth="1"
        />
        <circle
          cx="80"
          cy="48"
          r="3"
          fill="#94A3B8"
          stroke="#334155"
          strokeWidth="1"
        />

        <rect x="44" y="78" width="12" height="4" fill="#94A3B8" />
      </Box>
    </Box>
  );
}
