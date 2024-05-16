import { useLocation, useLoaderData, Form, Outlet } from "@remix-run/react"
import { useRef } from "react"
import { ToggleSwitch } from "../forms/toggle-switch"
import { PLSpinner } from "../common/spinner"
import { LoggedInNavbar } from "../navigation/logged-in-navbar"
import { useUser } from "@clerk/remix"
import React from "react"


export function AuthenticatedLayout({appName, setupIsComplete}: {setupIsComplete: boolean, appName?: string}) {
  const {user} = useUser()
  const location = useLocation()
  const formRef = useRef<HTMLFormElement>(null)
  const loadedData = useLoaderData<{darkMode: boolean|undefined, navBarExpanded: boolean|undefined}>()
  const { darkMode, navBarExpanded } = loadedData
  const contentBg = darkMode ? 'bg-neutral-950' : 'bg-neutral-200'

  const handleSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    formRef.current?.submit()
  }

  return (
    <div className="flex">
      <LoggedInNavbar darkMode={!!darkMode} expanded={!!navBarExpanded} setupComplete={setupIsComplete}/>
      <div className={"h-screen w-full py-3 px-6 overflow-scroll " + contentBg}>
        <div className="flex justify-between items-center w-full mb-2">
          <h1 className="text-gray-700 font-semibold uppercase text-md dark:text-gray-500">
            {setupIsComplete ? 
              <>Application: <span className="font-bold italic dark:text-white text-gray-950">{appName}</span></> :
              <>Account Status: <span className="font-bold italic dark:text-white text-gray-950">Not Setup</span></>
            }
          </h1>
          <div className="flex items-center justify-center gap-3 mr-3">
            <label className="inline-flex items-center cursor-pointer">
              <Form method="post" ref={formRef}>
                <input type="hidden" name="_darkMode" value={location.pathname} />
              </Form>
              <PLSpinner />
              <ToggleSwitch  onChangeHandler={handleSubmit}/>
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