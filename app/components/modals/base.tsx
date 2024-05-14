export function PLBaseModal({onClose, titleCenter, title="Title", children, open, setOpen, size= 'sm'}: {onClose?: any, titleCenter?: boolean, children?: React.ReactNode, title?: string, open: boolean, setOpen: (...args: Array<any>) => void, size?: 'xsm'| 'sm' | 'md' | 'lg'}) {
  const sizeClass = size === 'xsm' ? 'md:w-1/3' : size === 'sm' ? 'md:w-1/2' : size === 'md' ? 'md:w-4/5' : 'w-5/6'
  function closeModal() {
    setOpen(false)
    onClose()
  }
  
  return (
    <div className={"fixed flex justify-center items-center overflow-x-hidden overflow-y-auto inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-70 " + (!open ? 'hidden' : 'visible') }>
      <div className={"relative w-3/5 my-6 mx-auto " + sizeClass}>
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white dark:bg-neutral-900 outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 dark:border-neutral-700 rounded-t ">
            <h3 className="text-2xl font=semibold text-neutral-700 dark:text-neutral-300">{ title }</h3>
            <button
              className="bg-transparent border-0 text-black dark:text-white float-right"
              onClick={closeModal}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
          <div className="relative flex-auto rounded w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}


export function PLModalFooter({closeText = 'Close', submitText = 'Submit', onSubmit, onClose}: {closeText?: string, submitText?: string, onSubmit?: (...args:Array<any>) => any, onClose?: (...args:Array<any>) => any}) {
  return (
    <div className="flex items-center justify-end p-6">
      <button
        className="text-red-500 dark:text-red-400 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
        onClick={onClose}
      >
        {closeText}
      </button>
      <button
        className="text-white bg-[#F28C28] active:bg-[#F28C28] font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
        onClick={onSubmit}
      >
        {submitText}
      </button>
    </div>
  )
}
