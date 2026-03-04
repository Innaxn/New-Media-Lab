import { createTheme } from "@mui/material/styles";
// TODO CHANGE LATER
const theme = createTheme({
  palette: {
    primary: {
      main: "#0e2d44",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f4f0f0",
      paper: "#dbd9d9",
    },
    text: {
      primary: "#0e2d44",
      secondary: "#777",
    },
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "2.25rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h3: {
      fontWeight: 500,
      fontSize: "1.25rem",
    },
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
    },
    button: {
      fontWeight: 600,
    },
  },
  components: {
    // Customize MUI components like Button, TextField, etc.
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Rounded button corners
          padding: "8px 16px", // Padding for buttons
          textTransform: "none", // Remove uppercase transformation
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: "8px 0", // Add margin between fields
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: "24px", // Add padding to dialog content
        },
      },
    },
  },
});

export default theme;
