import { SignedIn, SignedOut } from "@clerk/remix";
import { AuthenticatedLayout } from "./authenticated-layout";
import { Outlet } from "@remix-run/react";


export function RootLayout({appName, hasApplication}: {hasApplication: boolean, appName?: string}) {
  return (
    <div>
      <SignedIn>
        <AuthenticatedLayout appName={appName} hasApplication={hasApplication}/>
      </SignedIn>
      <SignedOut>
        <div>
          <Outlet />
        </div>
      </SignedOut>
    </div>
  )
}