import { useState } from "react";
import { PLIconButton } from "../buttons/icon-button";
import { PLConfirmModal } from "../modals/confirm";

export function PLIntegrationOption({ integration, addMode=false, onAddButtonClick = () => null, onEditButtonClick = () => null}: { integration: any, addMode?: boolean, onAddButtonClick?: (...args: any[]) => void, onEditButtonClick?: (...args: any[]) => void}) {
  const [modalOpen, setModalOpen] = useState(false)

  const openDisconnectModal = () => {
    setModalOpen(true)
  }

  if (!integration) return null
  return (
    <div className="group flex flex-col bg-white rounded-lg shadow-lg dark:bg-neutral-800">
      <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
        <div className="flex items-center">
          <img src={integration.img_url} alt="app icon" className="w-10 h-10 rounded-full" />
          <h4 className="ml-2 font-semibold text-gray-700 dark:text-neutral-100">{integration.name}</h4>
        </div>
        <div className="flex items-center gap-2 group">
          {
            addMode ?
            <>
              <div className="flex flex-row">
                <button className="p-2 text-gray-600 rounded-full dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700" aria-label="Options" onClick={onAddButtonClick}>
                  <i className="ri ri-add-line"></i>
                </button>
        
              </div>
            </> :
            <div className="flex flex-row">
              <PLIconButton icon="ri-close-line" colorClasses="invisible group-hover:visible text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700" onClick={openDisconnectModal}/>
              <PLIconButton icon="ri-equalizer-line" colorClasses="text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700" onClick={onEditButtonClick}/>
            </div>
          }
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-700 dark:text-neutral-300">{integration.description}</p>
      </div>
      <PLConfirmModal open={modalOpen} setOpen={setModalOpen} message="Are you sure you would like to disconnect this integration?"/>
    </div>
  )
}