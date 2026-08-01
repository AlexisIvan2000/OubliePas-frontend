import { Outlet } from "react-router-dom";

import { RedirectIfAuthenticated } from "./RedirectIfAuthenticated";

export function GuestLayout() {
  return (
    <RedirectIfAuthenticated>
      <Outlet />
    </RedirectIfAuthenticated>
  );
}
