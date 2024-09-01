import { PLBaseModal, PLModalFooter } from "../base"
import { useEffect, useRef } from "react"
import { EditBugData, PLEditBugModalProps } from "~/types/component.types"


export function PLEditBugModal({open, onClose, setOpen, bug, onSubmit}: PLEditBugModalProps) {
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async () => {
    const form = new FormData(formRef.current!)
    const data = Object.fromEntries(form.entries()) as EditBugData
    await fetch('/api/bugs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).then(async res => {
      const data = await res.json()
      console.log(data)
      if (res.ok && onSubmit) onSubmit(data.bugs)
    })
    onClose()
  }

  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const sourceRef = useRef<HTMLSelectElement>(null)
  const priorityRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if(bug) {
      formRef.current?.querySelector('input[name="title"]')?.setAttribute('value', bug.title)
      descriptionRef.current!.value = bug.description
      sourceRef.current!.value = bug.source
      priorityRef.current!.value = bug.priority
    }
  }, [bug])
  return (
    <PLBaseModal open={open} onClose={onClose} title="Edit Bug" setOpen={setOpen}>
      <form className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full" method="post" ref={formRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Title</label>
        <input placeholder="e.g., User authentication not working" type="text" name="title" className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" />
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Description</label>
        <textarea ref={descriptionRef} name="description" className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 border-gray-300 dark:bg-transparent dark:border-neutral-700 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm resize-none" placeholder="Enter a description about the bug..."/>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Priority</label>
        <select ref={priorityRef} name="priority" className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Source</label>
        <select ref={sourceRef} name="source" className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm">
          <option value="self-identified">Self Identified</option>
          <option value="repository">Repository Issue</option>
          <option value="user">User Feedback</option>
          <option value="other">Other</option>
        </select>
        <input type="hidden" name="action" value="update"/>
        <input type="hidden" name="id" value={bug?.id}/>
      </form>
      <PLModalFooter closeText="Cancel" submitText="Update" onClose={onClose} onSubmit={handleSubmit}/>
    </PLBaseModal>
  )
}