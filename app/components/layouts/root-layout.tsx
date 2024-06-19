import { SignedIn, SignedOut } from "@clerk/remix";
import { AuthenticatedLayout } from "./authenticated-layout";
import { Outlet } from "@remix-run/react";
import { SidebarProvider } from "~/backend/providers/siderbar";


export function RootLayout({appName, setupIsComplete, toggleDarkMode, darkMode}: {setupIsComplete: boolean, appName?: string, toggleDarkMode: () => void, darkMode: boolean}) {
  return (
    <SidebarProvider>
      <div>
        <SignedIn>
          <AuthenticatedLayout appName={appName} setupIsComplete={setupIsComplete} toggleDarkMode={toggleDarkMode} darkMode={darkMode}/>
        </SignedIn>
        <SignedOut>
          <div>
            <Outlet />
          </div>
        </SignedOut>
      </div>
    </SidebarProvider>
  )
}