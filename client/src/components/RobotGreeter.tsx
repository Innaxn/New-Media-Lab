import { useState } from "react";
import { Box, Typography, Button, Collapse, Fade } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Cipher from "./Cipher";

interface Props {
  headline?: string;
  details?: string | React.ReactNode;
  robotColor?: string;
  robotAccent?: string;
  robotSize?: number;
  defaultExpanded?: boolean;
  expandLabel?: string;
  collapseLabel?: string;
}

export default function RobotGreeter({
  headline,
  details,
  robotColor,
  robotAccent,
  robotSize = 72,
  defaultExpanded = false,
  expandLabel = "Tell me more",
  collapseLabel = "Got it, hide this",
}: Props) {
  const theme = useTheme();
  const p = theme.palette.gh;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const color = robotColor ?? p.primary;
  const accent = robotAccent ?? "#FBBF24";

  const renderedDetails =
    typeof details === "string"
      ? details.split("\n\n").map((para, i) => (
          <Typography
            key={i}
            variant="body2"
            sx={{
              fontSize: "0.8125rem",
              lineHeight: 1.7,
              color: "text.secondary",
              mb: i === details.split("\n\n").length - 1 ? 0 : 1.25,
              whiteSpace: "pre-line",
            }}
          >
            {para}
          </Typography>
        ))
      : details;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: { xs: 1.25, sm: 2 },
        mb: 3,
        maxWidth: 640,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          transform: "rotate(-6deg)",
          mt: 0.25,
        }}
      >
        <Cipher size={robotSize} color={color} accent={accent} />
      </Box>

      <Box
        sx={{
          position: "relative",
          flex: 1,
          bgcolor: alpha(color, 0.08),
          border: `1px solid ${alpha(color, 0.25)}`,
          borderRadius: "18px",
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.75, sm: 2 },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 20,
            left: -8,
            width: 14,
            height: 14,
            bgcolor: alpha(color, 0.08),
            borderLeft: `1px solid ${alpha(color, 0.25)}`,
            borderBottom: `1px solid ${alpha(color, 0.25)}`,
            transform: "rotate(45deg)",
          },
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: "text.primary",
            fontSize: { xs: "0.9375rem", sm: "1rem" },
            lineHeight: 1.55,
            fontWeight: 600,
            mb: details ? 1.25 : 0,
          }}
        >
          {headline}
        </Typography>

        {details && (
          <>
            <Button
              size="small"
              onClick={() => setExpanded((v) => !v)}
              endIcon={
                expanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )
              }
              sx={{
                p: 0,
                minWidth: 0,
                fontSize: "0.75rem",
                fontWeight: 700,
                color,
                textTransform: "none",
                "&:hover": { bgcolor: "transparent", opacity: 0.8 },
              }}
            >
              {expanded ? collapseLabel : expandLabel}
            </Button>

            <Collapse in={expanded} timeout={300}>
              <Fade in={expanded} timeout={400}>
                <Box
                  sx={{
                    mt: 1.5,
                    pt: 1.5,
                    borderTop: `1px solid ${alpha(color, 0.18)}`,
                  }}
                >
                  {renderedDetails}
                </Box>
              </Fade>
            </Collapse>
          </>
        )}
      </Box>
    </Box>
  );
}
