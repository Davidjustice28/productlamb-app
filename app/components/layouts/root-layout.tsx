import { SignedIn, SignedOut } from "@clerk/remix";
import { AuthenticatedLayout } from "./authenticated-layout";
import { Outlet } from "@remix-run/react";
import { SidebarProvider } from "~/backend/providers/siderbar";
import { AdminProvider } from "~/backend/providers/admin";


export function RootLayout({appData, setupIsComplete, toggleDarkMode, darkMode, isInternal}: {setupIsComplete: boolean, appData: {selectedApplicationName?: string, selectedApplicationId?: number }, toggleDarkMode: () => void, darkMode: boolean, isInternal: boolean}) {
  
  return (
    <SidebarProvider>
      <AdminProvider>
        <div>
          <SignedIn>
            <AuthenticatedLayout appData={appData} setupIsComplete={setupIsComplete} toggleDarkMode={toggleDarkMode} darkMode={darkMode} isInternal={isInternal}/>
          </SignedIn>
          <SignedOut>
            <div>
              <Outlet />
            </div>
          </SignedOut>
        </div>
      </AdminProvider>
    </SidebarProvider>
  )
}