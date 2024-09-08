import { PLBaseModal } from "./base"

export function PLNoticationModal({ open, setOpen, message, isError, location='center' }: { onConfirm?: (...args:any[]) => any, open: boolean, setOpen: (open: boolean) => void, message: string, isError?: boolean, location?: 'center'| 'top' | 'bottom' }) {
  const handleClose = () => {
    setOpen(false)
  }

  const locationClass = location === 'center' ? 'item-center' : location === 'bottom' ? 'item-end' : 'item-start' 
  return (
    <div className={locationClass + " fixed flex justify-center items-center overflow-x-hidden inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-70 " + (!open ? 'hidden' : 'visible') }>
      <div className={"relative my-6 mx-auto w-2/5"}>
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white dark:bg-neutral-900 outline-none focus:outline-none">
          <div className="flex flex-row justify-end p-5 border-b border-solid border-gray-300 dark:border-neutral-700 rounded-t ">
            <button
              className="bg-transparent border-0 text-black dark:text-white float-right"
              onClick={handleClose}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
          <div className="relative flex-auto rounded w-full overflow-y-auto scroll" style={{maxHeight: "600px"}}>
            <div className="relative min-h-20 flex flex-row rounded px-6 w-full">
              <p className={(isError ? "text-red-500 dark:text-red-400" : "text-neutral-700 dark:text-neutral-300") + " mt-6 mb-6 font-semibold text-lg"}>{message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}