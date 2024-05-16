import { SignedIn, SignedOut } from "@clerk/remix";
import { AuthenticatedLayout } from "./authenticated-layout";
import { Outlet } from "@remix-run/react";


export function RootLayout({appName, setupIsComplete}: {setupIsComplete: boolean, appName?: string}) {
  return (
    <div>
      <SignedIn>
        <AuthenticatedLayout appName={appName} setupIsComplete={setupIsComplete}/>
      </SignedIn>
      <SignedOut>
        <div>
          <Outlet />
        </div>
      </SignedOut>
    </div>
  )
}