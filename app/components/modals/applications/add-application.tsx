import { Form } from "@remix-run/react";
import { PLBaseModal, PLModalFooter } from "../base";
import { useEffect, useRef, useState } from "react";

interface NewGoalData {
  goal: string
  isLongTerm: boolean
}

export const PLAddApplicationModal = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
  const [goals, setGoals] = useState<NewGoalData[]>([])

  const shortTermGoalInputRef = useRef<HTMLInputElement>(null)
  const longTermGoalInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const handleClose = () => {
    setOpen(false)
  }

  const addGoal = (e: React.FormEvent<HTMLButtonElement>, isLongTerm: boolean) => {
    e.preventDefault()
    let goal: NewGoalData
    if (isLongTerm) {
      goal = {goal: (longTermGoalInputRef.current?.value || ""), isLongTerm}
    } else {
      goal = {goal: (shortTermGoalInputRef.current?.value || ""), isLongTerm}
    }
    setGoals([...goals, goal])
    if (isLongTerm) {
      longTermGoalInputRef.current!.value = ""
    } else {
      shortTermGoalInputRef.current!.value = ""
    }
  }

  const submitApplication = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    formRef.current?.submit()  
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      setGoals([])
    }
  }, [open])

  return (
    <PLBaseModal title="New Application" open={open} setOpen={setOpen} titleCenter={true}>
      <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full">
        <Form method="post" ref={formRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Application Name</label>
          <input placeholder="e.g., Instagram clone and todo list" type="text" name="name" className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" />
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Summary</label>
          <textarea  maxLength={122} name="summary" className="text-black dark:text-neutral-400 mt-1 block w-full border-2 border-gray-300 dark:bg-transparent dark:border-neutral-700 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm resize-none" placeholder="Enter a description about your project..."/>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Site URL</label>
          <input placeholder="Website or app store url" type="text" name="siteUrl" className="p-2  text-black dark:text-neutral-400 mt-1 block border-2 w-full dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" />
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Type</label>
          <select name="type" className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm">
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="other">Other</option>
          </select>
          <div className="mt-4 flex flex-col gap-5 text-black dark:text-neutral-400 " >
            <input type="hidden" name="goals" value={JSON.stringify(goals)} />
            <div className="flex flex-col gap-2">
              <label>Short-Term Goals</label>
              <div className="flex gap-2 w-full">
                <input 
                  ref={shortTermGoalInputRef}
                  type="text" 
                  disabled={goals.filter(g => !g.isLongTerm).length >= 3}
                  placeholder="Add up to 3 short term goals..."
                  className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm flex-1"
                />
                <button 
                  className="p-2 border-2 rounded-lg dark:border-neutral-700 border-gray-300"
                  onClick={(e) => addGoal(e, false)}
                  type="button"
                  disabled={goals.filter(g => !g.isLongTerm).length >= 3}
                >
                  <i className="ri-add-line"></i> Add Goal
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label>Long-Term Goals</label>
              <div className="flex gap-2 w-full">
                <input 
                  ref={longTermGoalInputRef}
                  type="text" 
                  disabled={goals.filter(g => g.isLongTerm).length >= 3}
                  placeholder="Add up to 3 long term goals..."
                  className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm flex-1"
                />
                <button 
                  className="p-2 border-2 rounded-lg dark:border-neutral-700 border-gray-300"
                  onClick={(e) => addGoal(e, true)}
                  type="button"
                  disabled={goals.filter(g => g.isLongTerm).length >= 3}
                >
                  <i className="ri-add-line"></i> Add Goal
                </button>
              </div>
            </div>
          </div>
          {goals.map(({goal, isLongTerm}, index) => {
            return (
              <div key={index} className="flex items-center gap-2 mt-2">
                <i className="ri-crosshair-2-fill text-red-500"></i>
                <p>{goal} - {isLongTerm ? 'Long' : 'Short'} Term</p>
              </div>
            )
          })}
        </Form>
      </div>
      <PLModalFooter submitText="Add" closeText="Cancel" onClose={handleClose} onSubmit={submitApplication}/>
    </PLBaseModal>
  )
}