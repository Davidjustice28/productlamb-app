import { AccountApplication, ApplicationGoal, PrismaClient } from "@prisma/client"
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { useState, useRef } from "react"
import { ApplicationsClient } from "~/backend/database/applications/client"
import { ApplicationGoalsClient } from "~/backend/database/goals/client"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { NewApplicationData } from "~/types/database.types"

interface NewGoalData {
  goal: string
  isLongTerm: boolean
}
export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as NewApplicationData
  const dbClient = new PrismaClient()
  const appDbClient = ApplicationsClient(dbClient.accountApplication)
  const goalDbClient = ApplicationGoalsClient(dbClient.applicationGoal)
  const goals = data.goals.length ? JSON.parse(data.goals) as NewGoalData[] : []
  const {data: updatedApplication} = await appDbClient.updateApplication(parseInt(id!), data)
  const {data: updatedGoals} = await goalDbClient.updateApplicationGoals(parseInt(id!), goals)
  if (!updatedApplication || !updatedGoals) {
    // TODO: In the future create a custom error boundary to handle this
    return json({ errors: [1] })
  }

  // return json({
  //   updatedApplication,
  //   updatedGoals
  // })
  return redirect('/portal/applications')
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params
  if (!id) {
    return redirect('/portal/applications')
  }
  const dbClient = new PrismaClient()
  const appDbClient = ApplicationsClient(dbClient.accountApplication)
  const goalDbClient = ApplicationGoalsClient(dbClient.applicationGoal)
  const {data:goals} = await goalDbClient.getGoals(parseInt(id))
  const {data: application} = await appDbClient.getApplicationById(parseInt(id))
  if (!application) {
    return redirect('/portal/applications')
  }

  if (!goals) {
    return redirect('/portal/applications')
  }

  return json({application, goals})
}

export default function IndividualApplicationsPage() {
  const {goals: currentGoals, application: currentApplicationData} = useLoaderData<{goals: Array<ApplicationGoal>, application: AccountApplication}>()
  const { updatedApplication, updatedGoals } = useActionData<typeof action>() || {updateApplication: null, updatedGoals: null}
  const [goals, setGoals] = useState<NewGoalData[]>(updatedGoals ?? currentGoals)
  const [name, setName] = useState(updatedApplication ? updatedApplication.name :currentApplicationData.name)
  const [summary, setSummary] = useState(updatedApplication ? updatedApplication.summary : currentApplicationData.summary)
  const [siteUrl, setSiteUrl] = useState(updatedApplication ? updatedApplication.siteUrl : currentApplicationData.siteUrl)
  const [type, setType] = useState(updatedApplication ? updatedApplication.type : currentApplicationData.type)
  const [changesDetected, setChangesDetected] = useState(false)
  const shortTermGoalInputRef = useRef<HTMLInputElement>(null)
  const longTermGoalInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const addGoal = (e: React.FormEvent<HTMLButtonElement>, isLongTerm: boolean) => {
    e.preventDefault()
    let goal: NewGoalData
    if (isLongTerm) {
      goal = {goal: (longTermGoalInputRef.current?.value || ""), isLongTerm}
    } else {
      goal = {goal: (shortTermGoalInputRef.current?.value || ""), isLongTerm}
    }
    setGoals([...goals, goal])
    checkForChanges()
    if (isLongTerm) {
      longTermGoalInputRef.current!.value = ""
    } else {
      shortTermGoalInputRef.current!.value = ""
    }
  }

  function checkForChanges() {
    if (name !== currentApplicationData.name) {
      setChangesDetected(true)
      return
    }
    
    if (summary !== currentApplicationData.summary) {
      setChangesDetected(true)
      return
    }
    if (siteUrl !== currentApplicationData.siteUrl) {
      setChangesDetected(true)
      return
    }
    if (type !== currentApplicationData.type) {
      setChangesDetected(true)
      return
    }
    if (goals.length !== currentGoals.length) {
      setChangesDetected(true)
      return
    }
    for (let i = 0; i < goals.length; i++) {
      if (goals[i].goal !== currentGoals[i].goal) {
        setChangesDetected(true)
        return
      }
      if (goals[i].isLongTerm !== currentGoals[i].isLongTerm) {
        setChangesDetected(true)
        return
      }
    }
    setChangesDetected(false)
  }

  function updateApplication() {
    formRef.current?.requestSubmit()
  }

  return (
    <div>
      <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full">
        <Form method="post" ref={formRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Application Name</label>
          <input value={name} 
            onChange={(v) => {
              setName(v.target.value)
              checkForChanges()
            }} 
            placeholder="e.g., Instagram clone and todo list" 
            type="text" name="name" 
            className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" 
          />
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Summary</label>
          <textarea 
            value={summary} 
            onChange={(v) => {
              setSummary(v.target.value)
              checkForChanges()
            }} 
            maxLength={175} 
            name="summary" 
            className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 border-gray-300 dark:bg-transparent dark:border-neutral-700 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm resize-none" 
            placeholder="Enter a description about your project..."
          />
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Site URL</label>
          <input 
            value={siteUrl || ""} 
            onChange={(v) => {
              setSiteUrl(v.target.value)
              checkForChanges()
            }} 
            placeholder="Website or app store url" 
            type="text" 
            name="siteUrl" 
            className="p-2 text-black dark:text-neutral-400 mt-1 block border-2 w-full dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" 
          />
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Type</label>
          <select 
            name="type" 
            onChange={(v) => {
              setType(v.target.value)
              checkForChanges()
            }} 
            className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm"
          >
            <option value="web" selected={type.toLowerCase() === 'web'}>Web</option>
            <option value="mobile" selected={type.toLowerCase() === 'mobile'}>Mobile</option>
            <option value="desktop" selected={type.toLowerCase() === 'desktop'}>Desktop</option>
            <option value="api" selected={type.toLowerCase() === 'api'}>API</option>
            <option value="game" selected={type.toLowerCase() === 'game'}>Game</option>
            <option value="library" selected={type.toLowerCase() === 'library'}>Library</option>
            <option value="cli-tool" selected={type.toLowerCase() === 'cli-tool'}>CLI Tool</option>
            <option value="other" selected={type.toLowerCase() === 'other'}>Other</option>
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
                <p className="text-black dark:text-neutral-400">{goal} - {isLongTerm ? 'Long' : 'Short'} Term</p>
              </div>
            )
          })}
          
          <PLBasicButton text="Save Changes" colorClasses={"bg-primary-300 dark:bg-primary-300 dark:text-black px-3 py-0 text-md mt-4" + (!changesDetected ? ' hover:bg-primary-300 dark:hover:bg-primary-300 dark:hover:text-black' : '')} disabled={!changesDetected}/>
        </Form>
      </div>
    </div>
  )
}