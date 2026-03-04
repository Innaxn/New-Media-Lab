import React from "react";
import { Box, Typography } from "@mui/material";

const App: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Typography>Glass House</Typography>
    </Box>
  );
};

export default App;
