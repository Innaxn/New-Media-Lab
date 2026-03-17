import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";

// ─── Animations ──────────────────────────────────────────────────────────────

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
`;

const blink = keyframes`
  0%, 88%, 100% { transform: scaleY(1); }
  93%            { transform: scaleY(0.05); }
`;

const cloudPop = keyframes`
  0%   { opacity: 0; transform: scale(0.5) translateY(12px); }
  70%  { opacity: 1; transform: scale(1.04) translateY(-2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
`;

const antennaBlink = keyframes`
  0%, 80%, 100% { opacity: 1; }
  90%            { opacity: 0.2; }
`;

const happyWiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20%       { transform: rotate(-5deg); }
  40%       { transform: rotate(5deg); }
  60%       { transform: rotate(-3deg); }
  80%       { transform: rotate(3deg); }
`;

const sadSway = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(4px); }
`;

const tearDrop = keyframes`
  0%   { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(16px); opacity: 0; }
`;

const laptopGlow = keyframes`
  0%, 100% { box-shadow: 0 0 8px rgba(100,180,255,0.3); }
  50%       { box-shadow: 0 0 18px rgba(100,180,255,0.7); }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

export type RobotMood = "happy" | "sad" | "neutral";

export interface RobotCharacterProps {
  mood?: RobotMood;
  speech?: string;
  onClick?: () => void;
  /** Overall size multiplier. Default 1 ≈ 130 px wide robot */
  scale?: number;
}

// ─── Cloud Bubble (rendered outside the scaled box) ──────────────────────────

interface CloudBubbleProps {
  text: string;
  visible: boolean;
}

const CloudBubble: React.FC<CloudBubbleProps> = ({ text, visible }) => {
  const [typed, setTyped] = useState("");
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (visible && text) {
      setMounted(true);
      setTyped("");
      let i = 0;
      const tick = () => {
        i++;
        setTyped(text.slice(0, i));
        if (i < text.length) timerRef.current = setTimeout(tick, 36);
      };
      timerRef.current = setTimeout(tick, 60);
    } else {
      setTyped("");
      timerRef.current = setTimeout(() => setMounted(false), 200);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, text]);

  if (!mounted) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        // sits top-right, well clear of the robot body
        top: -20,
        left: "100%",
        ml: "12px",
        width: 175,
        animation: `${cloudPop} 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards`,
        zIndex: 20,
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))",
        pointerEvents: "none",
      }}
    >
      {/* SVG cloud shape */}
      <svg
        viewBox="0 0 200 135"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", display: "block" }}
      >
        <path
          d="M38,102 Q8,102 8,80 Q8,62 26,58 Q20,45 30,37 Q41,28 56,34 Q59,17 76,13 Q95,7 110,20 Q120,9 136,13 Q154,17 155,36 Q170,31 178,44 Q188,58 180,73 Q178,90 162,92 Q160,102 142,102 Z"
          fill="white"
          stroke="#1a1a2e"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* tail bubbles pointing LEFT (toward robot) */}
        <circle
          cx="30"
          cy="114"
          r="8"
          fill="white"
          stroke="#1a1a2e"
          strokeWidth="3"
        />
        <circle
          cx="16"
          cy="124"
          r="5"
          fill="white"
          stroke="#1a1a2e"
          strokeWidth="2.5"
        />
      </svg>

      {/* Text overlay */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "78%",
          height: "65%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Nunito', 'Comic Sans MS', cursive",
            fontSize: "0.72rem",
            fontWeight: 800,
            color: "#1a1a2e",
            lineHeight: 1.4,
          }}
        >
          {typed}
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: "2px",
              height: "0.8em",
              background: "#3a5bd9",
              ml: "1px",
              verticalAlign: "text-bottom",
              animation: `${blink} 0.9s step-end infinite`,
            }}
          />
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Robot Body ───────────────────────────────────────────────────────────────

const RobotBody: React.FC<{ mood: RobotMood }> = ({ mood }) => {
  const bodyAnim =
    mood === "happy"
      ? `${happyWiggle} 0.7s ease-in-out infinite`
      : mood === "sad"
        ? `${sadSway} 2.2s ease-in-out infinite`
        : `${float} 3s ease-in-out infinite`;

  const eyeColor = mood === "sad" ? "#7ab8f5" : "#5ce8ff";

  return (
    <Box
      sx={{
        animation: bodyAnim,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Antenna */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: "-2px",
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: mood === "happy" ? "#ffdd44" : "#4488ff",
            boxShadow: `0 0 10px 3px ${mood === "happy" ? "#ffdd44" : "#4488ff"}`,
            animation: `${antennaBlink} 2s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            width: 3,
            height: 20,
            background: "#3a5bd9",
            borderRadius: "2px",
          }}
        />
      </Box>

      {/* Helmet */}
      <Box
        sx={{
          width: 108,
          height: 108,
          borderRadius: "50%",
          background:
            "linear-gradient(145deg,#e8ecff 0%,#c8d4f8 40%,#a8baee 100%)",
          boxShadow:
            "0 6px 22px rgba(60,80,200,0.22), inset 0 -4px 10px rgba(0,0,0,0.09), inset 0 4px 10px rgba(255,255,255,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Visor */}
        <Box
          sx={{
            width: 76,
            height: 72,
            borderRadius: "40%",
            background: "linear-gradient(145deg,#0d1a4a,#1a2e7a 60%,#0a1235)",
            boxShadow:
              "0 2px 14px rgba(0,0,0,0.5), inset 0 0 18px rgba(100,150,255,0.18)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "8%",
              left: "10%",
              right: "50%",
              height: "28%",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "50%",
              transform: "rotate(-15deg)",
            },
          }}
        >
          {/* Eyes */}
          <Box sx={{ display: "flex", gap: "14px", alignItems: "center" }}>
            {[0, 0.15].map((delay, i) => (
              <Box
                key={i}
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius:
                    mood === "happy"
                      ? "50% 50% 50% 50% / 80% 80% 20% 20%"
                      : "50%",
                  background: `radial-gradient(circle at 35% 35%, white 15%, ${eyeColor} 45%, #0088bb 100%)`,
                  boxShadow: `0 0 9px ${eyeColor}`,
                  animation: `${blink} ${3.5 + i * 0.8}s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                  transform: mood === "sad" ? "translateY(2px)" : "none",
                  transition: "all 0.4s ease",
                }}
              />
            ))}
          </Box>

          {/* Mouth */}
          <Box
            sx={{
              width: mood === "neutral" ? 22 : 26,
              height: mood === "neutral" ? 3 : 12,
              borderRadius:
                mood === "happy"
                  ? "0 0 14px 14px"
                  : mood === "sad"
                    ? "14px 14px 0 0"
                    : "3px",
              background:
                mood === "happy"
                  ? "linear-gradient(to bottom,#ff8844,#ff5522)"
                  : mood === "sad"
                    ? "rgba(100,150,255,0.45)"
                    : "#4488ff",
              border:
                mood === "neutral"
                  ? "none"
                  : "1.5px solid rgba(255,255,255,0.25)",
              transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
              mt: mood === "neutral" ? "3px" : 0,
            }}
          />

          {/* Tears */}
          {mood === "sad" &&
            [{ left: "26%" }, { right: "26%" }].map((pos, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  top: "52%",
                  ...pos,
                  width: 4,
                  height: 12,
                  borderRadius: "0 0 50% 50%",
                  background:
                    "linear-gradient(to bottom,rgba(150,200,255,0.9),rgba(100,180,255,0))",
                  animation: `${tearDrop} 1.4s ease-in infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}

          {/* Blush */}
          {mood === "happy" && (
            <>
              <Box
                sx={{
                  position: "absolute",
                  left: "8%",
                  bottom: "20%",
                  width: 14,
                  height: 9,
                  borderRadius: "50%",
                  background: "rgba(255,120,120,0.32)",
                  filter: "blur(2px)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  right: "8%",
                  bottom: "20%",
                  width: 14,
                  height: 9,
                  borderRadius: "50%",
                  background: "rgba(255,120,120,0.32)",
                  filter: "blur(2px)",
                }}
              />
            </>
          )}
        </Box>

        {/* Helmet shine */}
        <Box
          sx={{
            position: "absolute",
            top: "8%",
            left: "12%",
            width: "28%",
            height: "20%",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.32)",
            transform: "rotate(-20deg)",
            filter: "blur(3px)",
          }}
        />
      </Box>

      {/* Body */}
      <Box
        sx={{
          width: 100,
          height: 78,
          mt: "-7px",
          borderRadius: "18px 18px 14px 14px",
          background:
            "linear-gradient(160deg,#dde4ff 0%,#b8c6f0 40%,#8faae0 100%)",
          boxShadow:
            "0 8px 22px rgba(60,80,200,0.18), inset 0 2px 8px rgba(255,255,255,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 0,
        }}
      >
        {/* Laptop */}
        <Box
          sx={{
            width: 65,
            height: 46,
            borderRadius: "5px 5px 2px 2px",
            background: "linear-gradient(145deg,#c8d0e8,#a8b4d0)",
            border: "2px solid rgba(255,255,255,0.55)",
            animation: `${laptopGlow} 2.5s ease-in-out infinite`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            pt: "3px",
            gap: "3px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: "80%",
              height: "52%",
              borderRadius: "3px",
              background:
                mood === "happy"
                  ? "linear-gradient(135deg,#1a3a6a,#2a5aaa)"
                  : mood === "sad"
                    ? "linear-gradient(135deg,#2a1a4a,#3a2a6a)"
                    : "linear-gradient(135deg,#0d1a4a,#1a2e7a)",
            }}
          />
          <Box
            sx={{
              width: "84%",
              height: "16%",
              borderRadius: "2px",
              background: "rgba(0,0,0,0.14)",
            }}
          />
          <Box
            sx={{
              width: "87%",
              height: "2px",
              background: "rgba(255,255,255,0.38)",
              borderRadius: "2px",
              position: "absolute",
              bottom: "18%",
            }}
          />
        </Box>

        {/* Arms */}
        {(["left", "right"] as const).map((side) => (
          <Box
            key={side}
            sx={{
              position: "absolute",
              top: "7px",
              [side]: "-25px",
              width: 22,
              height: 58,
              borderRadius: "12px",
              background: "linear-gradient(160deg,#dde4ff,#9ab0e0)",
              border: "2px solid rgba(255,255,255,0.45)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              pb: "3px",
              transform:
                mood === "happy"
                  ? side === "left"
                    ? "rotate(-20deg)"
                    : "rotate(20deg)"
                  : mood === "sad"
                    ? side === "left"
                      ? "rotate(22deg)"
                      : "rotate(-22deg)"
                    : side === "left"
                      ? "rotate(-5deg)"
                      : "rotate(5deg)",
              transformOrigin: "top center",
              transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "linear-gradient(145deg,#dde4ff,#9ab0e0)",
                border: "2px solid rgba(255,255,255,0.45)",
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Legs */}
      <Box sx={{ display: "flex", gap: "10px", mt: "-3px" }}>
        {["l", "r"].map((s) => (
          <Box
            key={s}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "0 0 7px 7px",
                background: "linear-gradient(160deg,#c8d0f0,#8faae0)",
                border: "2px solid rgba(255,255,255,0.38)",
                borderTop: "none",
              }}
            />
            <Box
              sx={{
                width: 32,
                height: 12,
                borderRadius: "5px",
                background: "linear-gradient(145deg,#3a5bd9,#1a3aaa)",
                boxShadow: "0 4px 10px rgba(30,60,180,0.3)",
                border: "2px solid rgba(100,140,255,0.38)",
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Shadow */}
      <Box
        sx={{
          width: 80,
          height: 9,
          borderRadius: "50%",
          background: "rgba(60,80,180,0.16)",
          filter: "blur(5px)",
          mt: "3px",
        }}
      />
    </Box>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────

export const CipherAvatar: React.FC<RobotCharacterProps> = ({
  mood = "neutral",
  speech = "",
  onClick,
  scale = 1,
}) => {
  return (
    /*
     * Key layout trick:
     * - Outer Box: position relative, overflow visible, sized to robot * scale
     *   with extra right space for the cloud
     * - Inner scaled Box: position relative (so cloud's absolute coords are
     *   relative to the UNSCALED robot, then the parent scale carries them)
     * - CloudBubble: absolute, left = 100% of the scaled robot → always visible
     */
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "flex-start",
        position: "relative",
      }}
    >
      {/* Scaled robot */}
      <Box
        onClick={onClick}
        sx={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: onClick ? "pointer" : "default",
          userSelect: "none",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
        }}
      >
        <RobotBody mood={mood} />
        {/* Cloud lives INSIDE the scaled box so it scales with the robot */}
        <CloudBubble text={speech} visible={!!speech} />
      </Box>
    </Box>
  );
};

// ─── Demo ─────────────────────────────────────────────────────────────────────

const SPEECHES: Record<RobotMood, string[]> = {
  happy: [
    "Yay! You're doing great! 🎉",
    "This is so fun! ⚡",
    "Achievement unlocked! ⭐",
    "I love playing with you! 😊",
  ],
  sad: [
    "Oh no... I made an error 😢",
    "Game over... Try again?",
    "My circuits feel glitchy...",
    "I really messed that up 💔",
  ],
  neutral: [
    "Hello! I'm Cipher 🤖",
    "Ready when you are!",
    "Awaiting your command...",
    "What shall we do today?",
  ],
};

export default function RobotDemo() {
  const [mood, setMood] = useState<RobotMood>("neutral");
  const [speech, setSpeech] = useState(
    "Hi! I'm Cipher, your game guide! Click me! 🤖",
  );

  const pick = (m: RobotMood) => {
    setMood(m);
    const lines = SPEECHES[m];
    setSpeech(lines[Math.floor(Math.random() * lines.length)]);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#e8f0ff 0%,#d0e4ff 50%,#c8d8f8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 20%,rgba(255,255,255,0.5),transparent 50%),radial-gradient(circle at 80% 80%,rgba(180,200,255,0.3),transparent 50%)",
        },
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Nunito',cursive",
          fontSize: "1.5rem",
          color: "#3a5bd9",
          fontWeight: 800,
          zIndex: 1,
        }}
      >
        Meet Cipher 🤖
      </Typography>

      {/* Robot area — extra right padding so cloud is always visible */}
      <Box sx={{ position: "relative", zIndex: 1, p: 3, pr: "220px" }}>
        <CipherAvatar
          mood={mood}
          speech={speech}
          onClick={() =>
            pick(
              mood === "neutral"
                ? "happy"
                : mood === "happy"
                  ? "sad"
                  : "neutral",
            )
          }
          scale={1}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, zIndex: 1 }}>
        {(["happy", "neutral", "sad"] as RobotMood[]).map((m) => (
          <Box
            key={m}
            onClick={() => pick(m)}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: "50px",
              border: `2.5px solid ${mood === m ? "#3a5bd9" : "rgba(60,90,200,0.25)"}`,
              background:
                mood === m ? "rgba(60,90,200,0.12)" : "rgba(255,255,255,0.5)",
              color: mood === m ? "#3a5bd9" : "#7a8ab8",
              fontFamily: "'Nunito',cursive",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              backdropFilter: "blur(6px)",
              boxShadow: mood === m ? "0 4px 14px rgba(60,90,200,0.2)" : "none",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "rgba(60,90,200,0.1)",
                borderColor: "#3a5bd9",
                color: "#3a5bd9",
              },
            }}
          >
            {m === "happy" ? "😊 Happy" : m === "sad" ? "😢 Sad" : "🤖 Neutral"}
          </Box>
        ))}
      </Box>

      <Typography
        sx={{
          color: "#9aaad0",
          fontFamily: "'Nunito',cursive",
          fontSize: "0.8rem",
          zIndex: 1,
        }}
      >
        Click Cipher or the buttons to change mood
      </Typography>
    </Box>
  );
}
