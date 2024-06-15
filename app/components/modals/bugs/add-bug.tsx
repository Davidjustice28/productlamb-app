import { PLBaseModal, PLModalFooter } from "../base"
import { Form } from "@remix-run/react"
import { useRef } from "react"
import { PLAddBugModalProps } from "~/types/component.types"


export function PLAddBugModal({open, onClose, setOpen}: PLAddBugModalProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    formRef.current?.submit()
    setOpen(false)
  }
  return (
    <PLBaseModal open={open} onClose={onClose} title="Add Bug" setOpen={setOpen}>
      <form className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full" method="post" ref={formRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Title</label>
        <input placeholder="e.g., User authentication not working" type="text" name="title" className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" />
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Description</label>
        <textarea name="description" className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 border-gray-300 dark:bg-transparent dark:border-neutral-700 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm resize-none" placeholder="Enter a description about the bug..."/>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Priority</label>
        <select name="priority" className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Source</label>
        <select name="source" className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm">
          <option value="repository">Repository Issue</option>
          <option value="self-identified">Self Identified</option>
          <option value="productLamb">ProductLamb</option>
          <option value="pm-tool">PM Tool</option>
          <option value="integration">Notion</option>
          <option value="other">Other</option>
        </select>
        <input type="hidden" name="action" value="add"/>
      </form>
      <PLModalFooter closeText="Cancel" submitText="Add" onClose={onClose} onSubmit={onSubmit}/>
    </PLBaseModal>
  )
}