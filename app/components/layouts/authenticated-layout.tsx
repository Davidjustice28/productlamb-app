import { useLocation, useLoaderData, Form, Outlet } from "@remix-run/react"
import { MouseEventHandler, useEffect, useRef, useState } from "react"
import { ToggleSwitch } from "../forms/toggle-switch"
import { PLSpinner } from "../common/spinner"
import { LoggedInNavbar } from "../navigation/logged-in-navbar"
import { useUser } from "@clerk/remix"
import React from "react"


export function AuthenticatedLayout({appName, setupIsComplete}: {setupIsComplete: boolean, appName?: string}) {
  const {user} = useUser()
  const location = useLocation()
  const darkModeFormRef = useRef<HTMLFormElement>(null)
  const navBarStateFormRef = useRef<HTMLFormElement>(null)
  const loadedData = useLoaderData<{darkMode: boolean|undefined, navBarExpanded: boolean|undefined}>()
  const { darkMode, navBarExpanded } = loadedData
  const contentBg = darkMode ? 'bg-neutral-950' : 'bg-neutral-200'
  const [expandedMenu, setExpandedMenu] = useState(!!navBarExpanded)
  const [darkModeState, setDarkModeState] = useState(!!darkMode)

  useEffect(() => {
    if (expandedMenu !== navBarExpanded) {
      navBarStateFormRef.current?.submit()
    } 

    if (darkModeState !== darkMode) {
      darkModeFormRef.current?.submit()
    }
  }, [expandedMenu, darkModeState])

  return (
    <div className="flex">
      <LoggedInNavbar darkMode={!!darkMode} expanded={expandedMenu} setExpandedMenu={setExpandedMenu} setupComplete={setupIsComplete} applicationSelected={!!(appName && appName.length)}/>
      <div className={"h-screen w-full py-3 px-6 overflow-scroll " + contentBg}>
        <div className="flex justify-between items-center w-full mb-2">
          <h1 className="text-gray-700 font-semibold uppercase text-md dark:text-gray-500">
            {setupIsComplete ? 
              <>Application: <span className="font-bold italic dark:text-white text-gray-950">{appName ?? 'None Selected'}</span></> :
              <>Account Status: <span className="font-bold italic dark:text-white text-gray-950">Not Setup</span></>
            }
          </h1>
          <div className="flex items-center justify-center gap-3 mr-3">
            <label className="inline-flex items-center cursor-pointer">
              <Form method="post" ref={darkModeFormRef}>
                <input type="hidden" name="_darkMode" value={location.pathname} />
              </Form>
              <Form method="post" ref={navBarStateFormRef}>
                <input type="hidden" name="_navbarState" value={location.pathname} />
              </Form>
              <PLSpinner />
              <ToggleSwitch onChangeHandler={(e) => setDarkModeState(e.target.checked)} darkMode={darkModeState}/>
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
      </div>
    </div>      
  );
}