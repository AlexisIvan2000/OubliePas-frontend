import "@fontsource-variable/geist";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { ToastProvider } from "./core/components/Toast/ToastProvider";
import { ThemeProvider } from "./core/theme/ThemeProvider";
import { TranslationProvider } from "./core/translation/TranslationProvider";
import { AuthProvider } from "./features/authentication/presentation/providers/AuthProvider";
import { router } from "./router";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <TranslationProvider>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </TranslationProvider>
    </ThemeProvider>
  </StrictMode>,
);
