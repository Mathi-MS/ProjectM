import React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import routes from "./Routes/Routes";

// Create a custom theme with Vietnamese font support
const theme = createTheme({
  typography: {
    fontFamily: "'Be Vietnam Pro', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  palette: {
    primary: {
      main: "#667eea",
      light: "#9bb5ff",
      dark: "#3f51b5",
    },
    secondary: {
      main: "#764ba2",
      light: "#a478d4",
      dark: "#4a2c73",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "#667eea",
            },
          },
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={routes} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
            },
            success: {
              style: {
                background: "#457860",
              },
            },
            error: {
              style: {
                background: "#d32f2f",
              },
            },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
