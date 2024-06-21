import { SignedIn, SignedOut } from "@clerk/remix";
import { AuthenticatedLayout } from "./authenticated-layout";
import { Outlet } from "@remix-run/react";
import { SidebarProvider } from "~/backend/providers/siderbar";
import { NotesModalProvider } from "~/backend/providers/notes";


export function RootLayout({appData, setupIsComplete, toggleDarkMode, darkMode}: {setupIsComplete: boolean, appData: {selectedApplicationName?: string, selectedApplicationId?: number }, toggleDarkMode: () => void, darkMode: boolean}) {
  return (
    <SidebarProvider>
      <NotesModalProvider>
        <div>
          <SignedIn>
            <AuthenticatedLayout appData={appData} setupIsComplete={setupIsComplete} toggleDarkMode={toggleDarkMode} darkMode={darkMode}/>
          </SignedIn>
          <SignedOut>
            <div>
              <Outlet />
            </div>
          </SignedOut>
        </div>
      </NotesModalProvider>
    </SidebarProvider>
  )
}