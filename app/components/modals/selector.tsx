import { PLSelectorModalOption } from "~/types/component.types";
import { PLBaseModal, PLModalFooter } from "./base";

const defaultMessage = "Choose an option below"

export const PLSelectorModal = ({ options, title, open, setOpen, message=defaultMessage, size="sm",onClick }: { onClick: (item: any) => void, open: boolean, setOpen: (open: boolean) => void, message?: string, options: Array<PLSelectorModalOption>, size?: "xsm"|"sm"|"md"|"lg" , title: string}) => {
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <PLBaseModal title={title} open={open} setOpen={setOpen} size={size}>
      <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-10 w-full">
        <p className="text-neutral-700 dark:text-neutral-300 mb-6">{message}</p>
        <div className="flex gap-5 items-center justify-center">
          {options.map(o => {
            return (
              <button className="border-black border-2 rounded-md dark:border-neutral-400 font-2 flex flex-col items-center w-40 gap-3 h-40 justify-center" onClick={() => onClick(o)}>
                {
                  o.logo_url ? 
                  <img src={o.logo_url} className="h-10"/> : 
                  <i className={(o.iconClass ?? 'ri-file-line') + ' text-5xl text-black dark:text-neutral-400'}></i>
                }
                <span className="text-black dark:text-white">{o.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </PLBaseModal>
  )
}