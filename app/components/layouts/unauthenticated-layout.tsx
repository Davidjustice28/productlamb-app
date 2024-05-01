import { Outlet } from "@remix-run/react";
import { PublicNavBar } from "../navigation/public-navbar";

export function UnAuthenticatedLayout() {
  return (
    <>
      <PublicNavBar />
      <Outlet />
    </>
  );
}