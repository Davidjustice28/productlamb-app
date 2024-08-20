import { PLBaseModal, PLModalFooter } from "../base"
import { useRef } from "react"

// Customer Email, Survey, Phone Call, SMS, In Person, Support Ticket, Google Review, App Store, Social media, Youtube, Other
export function PLAddFeedbackModal({open, onClose, setOpen}: {open: boolean, onClose?: () => void, setOpen: (open: boolean) => void}) {
  const formRef = useRef<HTMLFormElement>(null)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    formRef.current?.submit()
    setOpen(false)
  }

  return (
    <PLBaseModal open={open} onClose={onClose} title="Add Feedback" setOpen={setOpen}>
      <form className="relative p-6 flex flex-col rounded px-8 pt-6 pb-2 w-full gap-5" method="post" ref={formRef}>
        <div>
          <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200" htmlFor="feedback">Comment</label>
          <textarea name="feedback" className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 " id="feedback"/>
        </div>
        <div className="-mt-2">
          <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200" htmlFor="source">Source</label>
          <select name="source" className="mt-2 shadow border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700">
            <option value="Customer Email">Customer Email</option>
            <option value="Survey">Survey</option>
            <option value="Phone Call">Phone Call</option>
            <option value="SMS">SMS</option>
            <option value="In Person">In Person</option>
            <option value="Support Ticket">Support Ticket</option>
            <option value="Google Review">Google Review</option>
            <option value="App Store">App Store</option>
            <option value="Social Media">Social Media</option>
            <option value="Youtube">Youtube</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200" htmlFor="date">Date</label>
          <input type="date" name="date" className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700"/>
        </div>
        <input type="hidden" name="action" value="add"/>
      </form>
      <PLModalFooter closeText="Cancel" submitText="Add" onClose={onClose} onSubmit={onSubmit}/>
    </PLBaseModal>
  )
}