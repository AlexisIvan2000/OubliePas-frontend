import { createBrowserRouter } from "react-router-dom";

import { HomeRoute } from "./core/pages/HomeRoute";
import { PrivacyPage } from "./core/pages/legal/PrivacyPage";
import { TermsPage } from "./core/pages/legal/TermsPage";
import { NotFoundPage } from "./core/pages/NotFoundPage";
import { RootLayout } from "./core/pages/RootLayout";
import { RemindersPage } from "./features/notifications/presentation/pages/RemindersPage";
import { BreakdownPage } from "./features/commitments/presentation/pages/BreakdownPage";
import { CalendarPage } from "./features/commitments/presentation/pages/CalendarPage";
import { ImportPage } from "./features/commitments/presentation/pages/ImportPage";
import { InvoicesPage } from "./features/commitments/presentation/pages/InvoicesPage";
import { SubscriptionsPage } from "./features/commitments/presentation/pages/SubscriptionsPage";
import { GuestLayout } from "./features/authentication/presentation/components/GuestLayout";
import { PrivateLayout } from "./features/authentication/presentation/components/PrivateLayout";
import { ForgotPasswordPage } from "./features/authentication/presentation/pages/ForgotPasswordPage";
import { GoogleCallbackPage } from "./features/authentication/presentation/pages/GoogleCallbackPage";
import { LoginPage } from "./features/authentication/presentation/pages/LoginPage";
import { ProfilePage } from "./features/authentication/presentation/pages/ProfilePage";
import { RegisterPage } from "./features/authentication/presentation/pages/RegisterPage";
import { ResetPasswordPage } from "./features/authentication/presentation/pages/ResetPasswordPage";
import { VerifyEmailPage } from "./features/authentication/presentation/pages/VerifyEmailPage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomeRoute /> },
      { path: "/conditions", element: <TermsPage /> },
      { path: "/confidentialite", element: <PrivacyPage /> },
      {
        element: <GuestLayout />,
        children: [
          { path: "/connexion", element: <LoginPage /> },
          { path: "/inscription", element: <RegisterPage /> },
          { path: "/verification", element: <VerifyEmailPage /> },
          { path: "/mot-de-passe-oublie", element: <ForgotPasswordPage /> },
          { path: "/reinitialisation", element: <ResetPasswordPage /> },
          { path: "/auth/google/callback", element: <GoogleCallbackPage /> },
        ],
      },
      {
        element: <PrivateLayout />,
        children: [
          { path: "/reglages", element: <ProfilePage /> },
          { path: "/abonnements", element: <SubscriptionsPage /> },
          { path: "/calendrier", element: <CalendarPage /> },
          { path: "/repartition", element: <BreakdownPage /> },
          { path: "/demarrage", element: <ImportPage /> },
          { path: "/factures", element: <InvoicesPage /> },
          { path: "/rappels", element: <RemindersPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
