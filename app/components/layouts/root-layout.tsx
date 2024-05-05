import { SignedIn, SignedOut } from "@clerk/remix";
import { AuthenticatedLayout } from "./authenticated-layout";
import { Outlet } from "@remix-run/react";


export function RootLayout() {
  return (
    <div>
      <SignedIn>
        <AuthenticatedLayout />
      </SignedIn>
      <SignedOut>
        <div>
          <Outlet />
        </div>
      </SignedOut>
    </div>
  )
}