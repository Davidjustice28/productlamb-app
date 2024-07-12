import { useRef, useState } from "react"
import { PLBaseModal, PLModalFooter } from "../base"
import { ManualTaskData } from "~/types/component.types"
import { PLBasicButton } from "~/components/buttons/basic-button"

export function PLAddTaskModal({open,onSubmit, setOpen, application_id, authToken}: {open: boolean, setOpen: (open: boolean) => void, onSubmit?: (data: ManualTaskData) => void, application_id: number, authToken: string}) {
  const formRef = useRef<HTMLFormElement>(null)
  const pointsInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)
  const [pointsButtonDisabled, setPointsButtonDisabled] = useState(false)
  const [usedPointGenerator, setUsedPointGenerator] = useState(false)
  const [loading, setLoading] = useState(false)
  const getFormData = () => {
    const form = new FormData(formRef.current!)
    const data = Object.fromEntries(form.entries())

    return data as unknown as ManualTaskData
  }

  const onClose = () => {
    formRef.current?.reset()
    if (open) {
      setOpen(false)
    }
    setPointsButtonDisabled(false)
    setUsedPointGenerator(false)
  }

  async function getPointSuggestionByAi(e: any) {
    e.preventDefault()
    const disabled = pointsSuggestionDisabled()
    if (disabled) {
      setPointsButtonDisabled(true)
      return
    } else {
      setPointsButtonDisabled(false)
      setLoading(true)
      const title = titleInputRef.current!.value
      const description = descriptionInputRef.current!.value
      const url = `/api/points`
      const points: number|null = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({title, description, application_id})
      }).then(async (res) => {
        const data = await res.json()
        return data.points
      }).catch(err => null)
      if (points) {
        pointsInputRef.current!.value = points.toString()
        setUsedPointGenerator(true)
      }
      setLoading(false)
    }
      
  }

  const handleSubmit = () => {
    if (pointsInputRef.current?.value === '' || pointsInputRef.current?.value === '0') return
    if (onSubmit) {
      onSubmit(getFormData())
    } else {
      formRef.current?.submit()
    }
    onClose()
    setPointsButtonDisabled(false)
    setUsedPointGenerator(false)
  }

  function pointsSuggestionDisabled() {
    return (!titleInputRef.current?.value.length || !descriptionInputRef.current?.value.length) ? true : false
  }
  
  return (
    <PLBaseModal open={open} onClose={onClose} title="Add task to sprint" setOpen={setOpen}>
      <form className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full flex flex-col gap-2" method="POST" ref={formRef}>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Title</label>
        <input ref={titleInputRef} type="text" name="title" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700"></input>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Description</label>
        <textarea ref={descriptionInputRef} name="description" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 resize-none"></textarea>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Reason</label>
        <textarea name="reason" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 resize-none"></textarea>
        <div className="flex justify-between gap-5 items-end">
          <div className="w-2/3">
            <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Points</label>
            <input name="points" type="number" ref={pointsInputRef} min={1} max={4} className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700"></input>
          </div>
          <div className="flex flex-col">
            <PLBasicButton 
              disabled={usedPointGenerator}
              icon="ri-sparkling-line" 
              text="Suggest Points" 
              noDefaultDarkModeStyles={true}
              colorClasses={"bg-orange-200 text-orange-600 " + (usedPointGenerator ? ' cursor-not-allowed opacity-50' : ' cursor-pointer hover:bg-orange-500 hover:text-white')}
              useStaticWidth={false} 
              onClick={getPointSuggestionByAi}
              showLoader={loading}
            />
          </div>
        </div>
        { pointsButtonDisabled && <small className="text-red-600">A title and description is required to get point suggests</small> }
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Category</label>
        <select name="category" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700">
          <option value="feature">Feature</option>
          <option value="bug">Bug</option>
          <option value="chore">Chore</option>
          <option value="other">Other</option>
        </select>
        <input type="hidden" name="action" value="add"/>
      </form>
      <PLModalFooter closeText="Cancel" submitText="Add" onClose={onClose} onSubmit={handleSubmit}/>
    </PLBaseModal>
  )
}