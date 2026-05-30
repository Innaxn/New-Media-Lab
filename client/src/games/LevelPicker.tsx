import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import type { Difficulty } from "../api/types";

const DIFF_CONFIG: Record<
  Difficulty,
  { label: string; colorKey: "primary" | "warning" | "danger" }
> = {
  easy: { label: "Easy", colorKey: "primary" },
  medium: { label: "Medium", colorKey: "warning" },
  hard: { label: "Hard", colorKey: "danger" },
};
const ORDER: Difficulty[] = ["easy", "medium", "hard"];

interface LevelInfo {
  difficulty: Difficulty;
  subtitle?: string;
}

interface Props {
  levels: LevelInfo[];
  completed: Set<Difficulty>;
  onSelect: (d: Difficulty) => void;
  /** If true, levels 2 and 3 are locked until previous is done */
  sequential?: boolean;
}

export function LevelPicker({
  levels,
  completed,
  onSelect,
  sequential = true,
}: Props) {
  const theme = useTheme();
  const p = theme.palette.gh;

  const getColor = (d: Difficulty) =>
    d === "easy" ? p.primary : d === "medium" ? p.warning : p.danger;

  const isLocked = (idx: number) => {
    if (!sequential || idx === 0) return false;
    return !completed.has(ORDER[idx - 1]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {levels.map((lvl, idx) => {
        const locked = isLocked(idx);
        const done = completed.has(lvl.difficulty);
        const color = getColor(lvl.difficulty);

        return (
          <Card
            key={lvl.difficulty}
            elevation={1}
            onClick={!locked ? () => onSelect(lvl.difficulty) : undefined}
            sx={{
              cursor: locked ? "not-allowed" : "pointer",
              opacity: locked ? 0.5 : 1,
              border: "1px solid",
              borderColor: done ? alpha(color, 0.5) : p.border,
              borderRadius: "10px",
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden",
              "&:hover": !locked
                ? {
                    borderColor: color,
                    transform: "translateY(-2px)",
                    boxShadow: `0 6px 20px ${alpha(color, 0.15)}`,
                  }
                : {},
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: color,
                opacity: locked ? 0.3 : 1,
              },
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  flexShrink: 0,
                  bgcolor: alpha(color, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {locked ? (
                  <LockIcon sx={{ fontSize: 20, color }} />
                ) : done ? (
                  <CheckCircleIcon sx={{ fontSize: 20, color }} />
                ) : (
                  <PlayArrowIcon sx={{ fontSize: 20, color }} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.25,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontSize: "0.9375rem", fontWeight: 700 }}
                  >
                    Level {idx + 1}
                  </Typography>
                  <Chip
                    label={DIFF_CONFIG[lvl.difficulty].label}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      bgcolor: alpha(color, 0.1),
                      color,
                      border: `1px solid ${alpha(color, 0.28)}`,
                      borderRadius: "5px",
                    }}
                  />
                  {done && (
                    <Chip
                      label="Done"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        bgcolor: alpha(color, 0.1),
                        color,
                      }}
                    />
                  )}
                </Box>
                {lvl.subtitle && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.disabled",
                      lineHeight: 1.4,
                    }}
                  >
                    {lvl.subtitle}
                  </Typography>
                )}
              </Box>
              {!locked && (
                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    color: "text.disabled",
                    flexShrink: 0,
                  }}
                >
                  ›
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
