import { PLBaseModal, PLModalFooter } from "../base"
import { Form } from "@remix-run/react"
import { useRef } from "react"

export function PLAddFeedbackModal({open, onClose, setOpen}: {open: boolean, onClose?: () => void, setOpen: (open: boolean) => void}) {
  const formRef = useRef<HTMLFormElement>(null)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    formRef.current?.submit()
    setOpen(false)
  }

  return (
    <PLBaseModal open={open} onClose={onClose} title="Add Bug" setOpen={setOpen}>
      <Form className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full" method="POST" ref={formRef}>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2" htmlFor="feedback">Comment</label>
        <textarea name="feedback" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline" id="feedback"/>
        <select name="source" className="shadow  border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline mt-5">
          <option value="Notion">Notion</option>
          <option value="Google Review">Google Review</option>
          <option value="SurveyMonkey">SurveyMonkey</option>
          <option value="YouTube">YouTube</option>
          <option value="Other">Other</option>
          <option value="Jira">Jira</option>
          <option value="Email">Email</option>
        </select>
        <input type="date" name="date" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline mt-5"/>
        <input type="hidden" name="action" value="add"/>
      </Form>
      <PLModalFooter closeText="Cancel" submitText="Add" onClose={onClose} onSubmit={onSubmit}/>
    </PLBaseModal>
  )
}