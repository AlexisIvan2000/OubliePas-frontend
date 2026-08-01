import { Navigate } from "react-router-dom";

import { AuthSkeleton } from "../../../../core/components/Skeleton/Skeleton";
import { useAuth } from "../providers/useAuth";

export function RedirectIfAuthenticated({ children }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
