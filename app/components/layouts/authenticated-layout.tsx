import { useLocation, useLoaderData, Form, Outlet, useNavigate } from "@remix-run/react"
import { useRef } from "react"
import { ToggleSwitch } from "../forms/toggle-switch"
import { LoggedInNavbar } from "../navigation/logged-in-navbar"
import { useClerk, useUser } from "@clerk/remix"
import React from "react"


export function AuthenticatedLayout({appName, hasApplication}: {hasApplication: boolean, appName?: string}) {
  const {user} = useUser()
  const { signOut } = useClerk()
  const location = useLocation()
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const loadedData = useLoaderData<{darkMode: boolean|undefined, navBarExpanded: boolean|undefined}>()
  const { darkMode, navBarExpanded } = loadedData
  const [ profileImageModalOpen, setProfileImageModalOpen ] = React.useState(false)
  const contentBg = darkMode ? 'bg-neutral-950' : 'bg-neutral-200'

  const handleSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    formRef.current?.submit()
  }

  const handleSignout = async () => {
    setProfileImageModalOpen(false)
    await signOut (() => navigate("/"))
  }

  const openProfileImageModal = () => {
    if(!profileImageModalOpen) {
      setProfileImageModalOpen(true)
    }
  }
  
  return (
    <div className="flex">
      <LoggedInNavbar darkMode={!!darkMode} expanded={!!navBarExpanded} setupComplete={hasApplication}/>
      <div className={"h-screen w-full py-3 px-6 overflow-scroll " + contentBg}>
        <div className="flex justify-between items-center w-full mb-2">
          <h1 className="text-gray-700 font-semibold uppercase text-md dark:text-gray-500">
            {hasApplication ? 
              <>Application: <span className="font-bold italic dark:text-white text-gray-950">{appName}</span></> :
              <>Account Status: <span className="font-bold italic dark:text-white text-gray-950">Not Setup</span></>
            }
          </h1>
          <div className="flex items-center justify-center gap-3 mr-3">
            <label className="inline-flex items-center cursor-pointer">
              <Form method="post" ref={formRef}>
                <input type="hidden" name="_darkMode" value={location.pathname} />
              </Form>
              <ToggleSwitch  onChangeHandler={handleSubmit}/>
            </label>
            <button className="flex items-center gap-3" onClick={openProfileImageModal}>
              {
                user ? <img src={user.imageUrl} alt="profile" className="w-8 h-8 rounded-full"/> : 
                <div>
                  <i className="ri-user-fill text-3xl text-gray-700 dark:text-gray-500"></i>
                </div>
              }
            </button>
            <div className={"w-52 bg-neutral-50 rounded absolute top-14 right-10 z-10 divide-y-2 text-black shadow-lg " + (profileImageModalOpen ? 'visible ' : 'invisible ' )} >
              <button className="w-full h-10 hov" onClick={handleSignout}>Sign out</button>
              <button className="w-full h-10">Close</button>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    </div>      
  );
}