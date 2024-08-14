import { Outlet } from "@remix-run/react"
import { useEffect, useState } from "react"
import { ToggleSwitch } from "../forms/toggle-switch"
import { PLSpinner } from "../common/spinner"
import { LoggedInNavbar } from "../navigation/logged-in-navbar"
import { useUser } from "@clerk/remix"
import { useAdmin } from "~/backend/providers/admin"
import { PLStatusBadge } from "../common/status-badge"
import { Colors } from "~/types/base.types"
import { PLIconButton } from "../buttons/icon-button"
import { PLManagerRequestModal } from "../modals/manager/make-request"

export function AuthenticatedLayout({appData, setupIsComplete, toggleDarkMode, darkMode, isInternal}: {setupIsComplete: boolean, appData: {selectedApplicationName?: string, selectedApplicationId?: number }, toggleDarkMode: () => void, darkMode: boolean, isInternal: boolean}) {
  const {user} = useUser()
  const [darkModeState, setDarkModeState] = useState(darkMode)
  const [managerModalOpen, setManagerModalOpen] = useState<boolean>(false)

  const contentBg = darkMode ? 'bg-neutral-950' : 'bg-neutral-200'
  const switchDarkModeSetting = () => {
    setDarkModeState(!darkModeState)
    toggleDarkMode()
  }

  useEffect(() => {
    setDarkModeState(darkMode)
  }, [darkMode])

  const { setIsAdmin, isAdmin } = useAdmin()

  useEffect(() => {
    const isAdmin = user?.organizationMemberships[0]?.role.split(':')[1] === 'admin' || false
    setIsAdmin(isAdmin)
  }, [user])

  return (
    <div className="flex">
      <LoggedInNavbar darkMode={darkModeState} setupComplete={setupIsComplete} applicationSelected={!!(appData?.selectedApplicationName && appData?.selectedApplicationName.length)} isAdmin={isAdmin} internalPageAccess={isInternal}/>
      <div className={"h-screen w-full py-3 px-6 overflow-scroll " + contentBg}>
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex gap-2">
            <h1 className="text-gray-700 font-semibold uppercase text-md dark:text-gray-500">
              { setupIsComplete ? 
                <>Application: <span className="font-bold italic dark:text-white text-gray-950">{appData?.selectedApplicationName ?? 'None Selected'}</span></> :
                <>Account Status: <span className="font-bold italic dark:text-white text-gray-950">Not Setup</span></>
              }
            </h1>
            {isAdmin && <PLStatusBadge text="ADMIN PORTAL" color={Colors.ORANGE}/>}
          </div>
          <div className="flex items-center justify-center gap-3 mr-3">
            <label className="inline-flex items-center cursor-pointer">
              <div className={setupIsComplete ? ' mr-7' : ''}>
                <PLSpinner />
              </div>
              {setupIsComplete ? <PLIconButton icon="ri-speak-fill" onClick={() => setManagerModalOpen(true)}/> : null}
              <ToggleSwitch onChangeHandler={switchDarkModeSetting} darkMode={darkModeState}/>
            </label>
            <div className="flex items-center gap-3">
              {
                user ? <img src={user.imageUrl} alt="profile" className="w-8 h-8 rounded-full"/> : 
                <div>
                  <i className="ri-user-fill text-3xl text-gray-700 dark:text-gray-500"></i>
                </div>
              }
            </div>
          </div>
        </div>
        <Outlet />
        <PLManagerRequestModal open={managerModalOpen} setOpen={setManagerModalOpen} />
      </div>
    </div>      
  );
}