import { Form } from "@remix-run/react";
import { PLBaseModal, PLModalFooter } from "../base";
import { useEffect, useRef, useState } from "react";
import { PLProjectManagementToolLink } from "./link-pm-tool";
import { SprintInterval } from "~/types/database.types";

interface NewGoalData {
  goal: string
  isLongTerm: boolean
}

export const PLAddApplicationModal = ({ open, setOpen, onSubmit}: { onSubmit?: (data: any) => void, open: boolean, setOpen: (open: boolean) => void }) => {
  const [goals, setGoals] = useState<NewGoalData[]>([])
  const [isValid, setIsValid] = useState(false)
  const shortTermGoalInputRef = useRef<HTMLInputElement>(null)
  const longTermGoalInputRef = useRef<HTMLInputElement>(null)
  // initials values
  const repositoryJsonInputRef = useRef<HTMLInputElement>(null)
  const pmToolRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const summaryInputRef = useRef<HTMLTextAreaElement>(null)
  const siteUrlInputRef = useRef<HTMLInputElement>(null)
  const typeInputRef = useRef<HTMLSelectElement>(null)
  const goalInputRef = useRef<HTMLInputElement>(null)
  const sprintIntervalInputRef = useRef<HTMLSelectElement>(null)

  const formPmToolRef = useRef<HTMLInputElement>(null)
  const formNameInputRef = useRef<HTMLInputElement>(null)
  const formSummaryInputRef = useRef<HTMLInputElement>(null)
  const formSiteUrlInputRef = useRef<HTMLInputElement>(null)
  const formTypeInputRef = useRef<HTMLInputElement>(null)
  const formGoalInputRef = useRef<HTMLInputElement>(null)
  const formSprintIntervalRef = useRef<HTMLInputElement>(null)

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
    formNameInputRef.current!.value = nameInputRef.current!.value
    formSummaryInputRef.current!.value = summaryInputRef.current!.value
    formSiteUrlInputRef.current!.value = siteUrlInputRef.current!.value
    formTypeInputRef.current!.value = typeInputRef.current!.value
    formGoalInputRef.current!.value = JSON.stringify(goals)
    formPmToolRef.current!.value = pmToolRef.current!.value
    formSprintIntervalRef.current!.value = sprintIntervalInputRef.current!.value
    const form = new FormData(formRef.current!)
    const data = Object.fromEntries(form.entries())
    console.log('submitting form: ', data)
    if(onSubmit) {
      onSubmit(data)
    } else {
      formRef.current?.submit()
    }
    setOpen(false)
  }

  const validateApplication = () => {
    const name = nameInputRef.current?.value || ''
    const summary = summaryInputRef.current?.value || ''
    const siteUrl = siteUrlInputRef.current?.value || ''
    const type = typeInputRef.current?.value || ''
    const pmToolConfigured = !!pmToolRef.current?.value?.length
    const sprintInterval = sprintIntervalInputRef.current?.value || ''
    const valid = (name.length && summary.length && siteUrl.length && type.length && pmToolConfigured && sprintInterval.length) ? true : false
    return valid
  
  }

  const checkValidity = () => {
    const isValid1= validateApplication()
    setIsValid(isValid1)
  }

  const onToolConfirmation = (data: any) => {
    pmToolRef.current!.value = JSON.stringify(data)
    checkValidity()
  }

  useEffect(() => {
    if (!open) {
      setGoals([])
    }
  }, [open])

  return (
    <PLBaseModal title="New Application" open={open} setOpen={setOpen} titleCenter={true} size="md">
      <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full overflow-y-scroll">
        <Form method="post" ref={formRef}>
          <input type="hidden" name="name" ref={formNameInputRef}/>
          <input type="hidden" name="summary" ref={formSummaryInputRef}/>
          <input type="hidden" name="siteUrl" ref={formSiteUrlInputRef}/>
          <input type="hidden" name="type" ref={formTypeInputRef}/>
          <input type="hidden" name="goals" ref={formGoalInputRef}/>
          <input type="hidden" name="projectManagementTool" ref={formPmToolRef}/>
          <input type="hidden" name="sprint_interval"ref={formSprintIntervalRef}/>
        </Form>
        <div>
          <div className="p-5 border-2 rounded dark:border-neutral-400 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-black dark:text-white">Application Details</h2>  
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Application Name</label>
              <input 
                required 
                placeholder="e.g., Instagram clone and todo list" 
                type="text" 
                ref={nameInputRef}
                onChange={checkValidity}
                className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" 
              />
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Summary</label>
              <textarea 
                required 
                maxLength={122} 
                ref={summaryInputRef}
                className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 border-gray-300 dark:bg-transparent dark:border-neutral-700 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm resize-none" 
                placeholder="Enter a description about your project..."
                onChange={checkValidity}
              />
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Site URL</label>
              <input 
                required 
                placeholder="Website or app store url" 
                type="text" 
                ref={siteUrlInputRef}
                onChange={checkValidity}
                className="p-2 text-black dark:text-neutral-400 mt-1 block border-2 w-full dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" 
              />
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Type</label>
              <select 
                ref={typeInputRef}
                required name="type"
                onChange={checkValidity}
                className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm"
              >
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
                <option value="other">Other</option>
              </select>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Sprint Cadence</label>
              <select 
                ref={sprintIntervalInputRef}
                required name="sprint_interval"
                onChange={checkValidity}
                className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm"
              >
                <option value={SprintInterval.MONTHLY}>Monthly</option>
                <option value={SprintInterval.BIWEEKLY}>Bi-Weekly</option>
                <option value={SprintInterval.WEEKLY}>Weekly</option>
                <option value={SprintInterval.DAILY}>Daily</option>
              </select>      
            </div>          
          </div>
          <PLProjectManagementToolLink onToolConfirmation={onToolConfirmation}/>
          <div className="mt-4 flex flex-col gap-5 text-black dark:text-neutral-400 " >
            <input type="hidden" name="goals" value={JSON.stringify(goals)} ref={goalInputRef}/>
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
          <input type="hidden" ref={pmToolRef} required/>

        </div>
        {goals.map(({goal, isLongTerm}, index) => {
          return (
            <div key={index} className="flex items-center gap-2 mt-2 text-black dark:text-neutral-400">
              <i className="ri-crosshair-2-fill text-red-500"></i>
              <small>{goal} - {isLongTerm ? 'Long' : 'Short'} Term</small>
            </div>
          )
        })}
      </div>
      <PLModalFooter submitText="Add" closeText="Cancel" onClose={handleClose} onSubmit={submitApplication} submitDisabled={!isValid}/>
    </PLBaseModal>
  )
}