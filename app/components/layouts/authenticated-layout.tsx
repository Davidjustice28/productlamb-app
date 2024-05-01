import { useLocation, useLoaderData, Form, Outlet } from "@remix-run/react"
import { useRef } from "react"
import { ToggleSwitch } from "../forms/toggle-switch"
import { LoggedInNavbar } from "../navigation/logged-in-navbar"


export function AuthenticatedLayout() {
  const location = useLocation()
  const page = location.pathname.split("/")[2]
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
      <LoggedInNavbar darkMode={!!darkMode} expanded={!!navBarExpanded}/>
      <div className={"h-screen w-full py-3 px-6 overflow-scroll " + contentBg}>
        <div className="flex justify-between items-center w-full mb-2">
          <h1 className="text-gray-700 font-semibold uppercase text-md dark:text-gray-500">Application: <span className="font-bold italic dark:text-white text-gray-950">Talo</span></h1>
          <div className="flex items-center justify-center gap-3 mr-3">
            <label className="inline-flex items-center cursor-pointer">
              <Form method="post" ref={formRef}>
                <input type="hidden" name="_darkMode" value={location.pathname} />
              </Form>
              <ToggleSwitch  onChangeHandler={handleSubmit}/>
            </label> 
            <div className={"w-10 h-10 rounded-full flex items-center justify-center " + (darkMode ? "bg-neutral-900" : "bg-gray-100") }>
              <img src="https://storage.googleapis.com/talo_profile_images/IMG_4465.jpg" alt="profile" className="w-8 h-8 rounded-full object-cover"/>
              {/* <i className="ri-user-fill text-xl"></i> */}
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    </div>      
  );
}