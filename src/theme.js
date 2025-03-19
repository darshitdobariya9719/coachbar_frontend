import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f4f4f4",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

export default theme;
