import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#1976d2", dark: "rgba(1, 87, 155, 1)" },
    background: { default: "#f9f9fb", paper: "#ffffff" },
    text: { primary: "rgba(0,0,0,0.87)", secondary: "rgba(0,0,0,0.6)" },
    divider: "rgba(0,0,0,0.12)",
    action: { disabled: "rgba(0,0,0,0.38)", disabledBackground: "rgba(0,0,0,0.12)" },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 500, fontSize: 18, lineHeight: 1.6, letterSpacing: "0.15px" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          letterSpacing: "normal",
        },
        containedPrimary: {
          borderRadius: "50px",
        },
        outlinedPrimary: {
          borderRadius: "50px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow:
            "0px 1px 3px 0px rgba(0,0,0,0.12), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px 0px rgba(0,0,0,0.2)",
        },
      },
    },
  },
});
