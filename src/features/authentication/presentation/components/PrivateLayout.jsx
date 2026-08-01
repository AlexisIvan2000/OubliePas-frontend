import { Outlet } from "react-router-dom";

import { AppShell } from "../../../../core/components/AppShell/AppShell";
import { RequireAuth } from "./RequireAuth";

export function PrivateLayout() {
  return (
    <RequireAuth>
      <AppShell>
        <Outlet />
      </AppShell>
    </RequireAuth>
  );
}
