import "@fontsource-variable/geist";

import { Analytics } from "@vercel/analytics/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { ErrorBoundary } from "./core/components/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "./core/components/Toast/ToastProvider";
import { ThemeProvider } from "./core/theme/ThemeProvider";
import { TranslationProvider } from "./core/translation/TranslationProvider";
import { AuthProvider } from "./features/authentication/presentation/providers/AuthProvider";
import { router } from "./router";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <TranslationProvider>
          <ToastProvider>
            <AuthProvider>
              <RouterProvider router={router} />
              {/* Hors de Vercel le composant ne charge rien : en local il se
                  contente d'un journal, et le rendu ne depend pas de lui. */}
              <Analytics />
            </AuthProvider>
          </ToastProvider>
        </TranslationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
