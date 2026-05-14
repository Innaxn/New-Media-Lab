import { Box, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

interface Props {
  title: string;
  content: string; // pre-line formatted — blank lines = paragraph breaks, • = bullets
}

/**
 * InfoPanel — shown on the level picker screen so users read the topic
 * introduction before choosing a difficulty. Replaces the floating ? button.
 */
export function InfoPanel({ title, content }: Props) {
  const theme = useTheme();
  const p = theme.palette.gh;

  // Split content into paragraphs on blank lines
  const paragraphs = content.split(/\n\n+/).filter(Boolean);

  return (
    <Box
      sx={{
        mb: 4,
        border: `1px solid ${p.borderLit}`,
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: alpha(p.primary, 0.07),
          borderBottom: `1px solid ${p.borderLit}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: "1rem",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ px: 2.5, py: 2.25, bgcolor: "background.paper" }}>
        {paragraphs.map((para, i) => {
          const lines = para.split("\n").filter(Boolean);
          const isBulletGroup = lines.every((l) => l.startsWith("•"));

          if (isBulletGroup) {
            return (
              <Box
                key={i}
                component="ul"
                sx={{ pl: 2, m: 0, mb: i < paragraphs.length - 1 ? 1.75 : 0 }}
              >
                {lines.map((line, j) => (
                  <Box
                    key={j}
                    component="li"
                    sx={{
                      fontSize: "0.875rem",
                      lineHeight: 1.7,
                      color: "text.primary",
                      mb: 0.5,
                      "&::marker": { color: p.primary },
                    }}
                  >
                    {line.replace(/^•\s*/, "")}
                  </Box>
                ))}
              </Box>
            );
          }

          // Mixed paragraph — render line by line, highlighting subheadings (ending with ?)
          return (
            <Box key={i} sx={{ mb: i < paragraphs.length - 1 ? 1.75 : 0 }}>
              {lines.map((line, j) => {
                const isSubheading =
                  /^[A-Z][^.!]*\?$/.test(line.trim()) ||
                  /^[A-Z][a-zA-Z ]+:$/.test(line.trim());
                return (
                  <Typography
                    key={j}
                    sx={{
                      fontSize: isSubheading ? "0.8125rem" : "0.875rem",
                      fontWeight: isSubheading ? 700 : 400,
                      color: isSubheading ? p.primary : "text.primary",
                      lineHeight: 1.7,
                      mb: isSubheading ? 0.25 : 0,
                    }}
                  >
                    {line}
                  </Typography>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
