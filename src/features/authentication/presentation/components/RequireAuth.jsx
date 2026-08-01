import { Navigate, useLocation } from "react-router-dom";

import { AppSkeleton } from "../../../../core/components/Skeleton/Skeleton";
import { useAuth } from "../providers/useAuth";

export function RequireAuth({ children }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AppSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  return children;
}
