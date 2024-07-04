import { PLBaseModal, PLModalFooter } from "./base";

const defaultMessage = "An error occurred. Please try again later."

export const PLErrorModal = ({ open, setOpen, message=defaultMessage}: {open: boolean, setOpen: (open: boolean) => void, message?: string}) => {
  return (
    <PLBaseModal title="Application Error" open={open} setOpen={setOpen} size="sm">
      <>
        <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full">
          <p className="text-neutral-700 dark:text-neutral-300">{message}</p>
        </div>
      </>
    </PLBaseModal>
  )
}