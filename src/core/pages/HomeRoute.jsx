import { useAuth } from "../../features/authentication/presentation/providers/useAuth";
import { AppShell } from "../components/AppShell/AppShell";
import { AppSkeleton } from "../components/Skeleton/Skeleton";
import { HomePage } from "./HomePage";
import { LandingPage } from "./LandingPage";

export function HomeRoute() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <AppSkeleton />;
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <AppShell>
      <HomePage />
    </AppShell>
  );
}
