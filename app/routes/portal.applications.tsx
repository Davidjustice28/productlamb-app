import { useContext, useState } from "react"
import { mockApplications } from "~/backend/mocks/applications"
import { PLIconButton } from "~/components/buttons/icon-button"
import { PLConfirmModal } from "~/components/modals/confirm"



export default function ApplicationsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Manage all of your personal projects being managed by ProductLamb</p>
        <PLIconButton icon="ri-add-line" onClick={() => setModalOpen(true)}/>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-5">
        {mockApplications.map((app, index) => {
          return (
            <div key={index} className="group flex flex-col bg-white rounded-lg shadow-lg dark:bg-neutral-800">
              <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
                <div className="flex items-center">
                  { !app.img_url ? <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex justify-center items-center text-lg"><i className="ri ri-image-line"></i></div> : 
                    <img src={app.img_url} alt="app icon" className="w-10 h-10 rounded-full" />
                  }
                  <h4 className="ml-2 font-semibold text-gray-700 dark:text-neutral-100">{app.name}</h4>
                </div>
                <div className="flex flex-row">
                  <PLIconButton icon="ri-close-line" colorClasses="invisible group-hover:visible text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700" />
                  <PLIconButton icon="ri-equalizer-line" colorClasses="text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-neutral-300">{app.description}</p>
              </div>
            </div>
          )
        })}
      </div>
      <PLConfirmModal onConfirm={() => console.log("confirmed")} open={modalOpen} setOpen={setModalOpen}/>
    </div>
  )
}