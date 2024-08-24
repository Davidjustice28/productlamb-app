import { AccountApplication, ApplicationGoal } from "@prisma/client"
import { ActionFunction, LoaderFunction, MetaFunction, json, redirect, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node"
import { useActionData, useLoaderData } from "@remix-run/react"
import { useState, useRef, useEffect } from "react"
import { ApplicationsClient } from "~/backend/database/applications/client"
import { ApplicationGoalsClient } from "~/backend/database/goals/client"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { PLPhotoUploader } from "~/components/forms/photo-uploader"
import { NewApplicationData, SprintInterval } from "~/types/database.types"
import { uploadToPhotoToCloudStorage } from "~/services/gcp/upload-file"
import { PLIconButton } from "~/components/buttons/icon-button"
import { deleteFileFromCloudStorage } from "~/services/gcp/delete-file"
import { PLApplicationContextModel } from "~/components/modals/applications/upload-context"
import { ToggleSwitch } from "~/components/forms/toggle-switch"
import { DB_CLIENT } from "~/services/prismaClient"


export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params
  if (!id) {
    return redirect('/portal/applications')
  }
  const appDbClient = ApplicationsClient(DB_CLIENT.accountApplication)
  const goalDbClient = ApplicationGoalsClient(DB_CLIENT.applicationGoal)
  const appId = parseInt(id)
  const {data:goals} = await goalDbClient.getGoals(appId)
  const {data: application} = await appDbClient.getApplicationById(appId)
  const backlogItems = await DB_CLIENT.generatedTask.count({where: {applicationId: appId, backlog: true}})
  const feedbackItems = await DB_CLIENT.applicationFeedback.count({where: {applicationId: appId}})
  const bugs = await DB_CLIENT.applicationBug.count({where: {applicationId: appId}})
  const hasInitialContext = !!bugs || !!feedbackItems || !!backlogItems
  if (!application) {
    return redirect('/portal/applications')
  }

  if (!goals) {
    return redirect('/portal/applications')
  }

  return json({application, goals, hasInitialContext} as const)
}

interface NewGoalData {
  goal: string
  isLongTerm: boolean
}
export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: 'ProductLamb | App Settings' },
    {
      property: "og:title",
      content: 'ProductLamb | App Settings',
    },
  ];
};

export const action: ActionFunction = async ({ request, params }) => {
  const ifMultipartForm = request.headers.get('content-type')?.includes('multipart')
  const appDbClient = ApplicationsClient(DB_CLIENT.accountApplication)
  if (ifMultipartForm) {
    const uploadHandler = unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
        maxPartSize: 5_000_000,
        file: ({ filename }) => filename,
      }),
      // parse everything else into memory
      unstable_createMemoryUploadHandler()
    );
    const { id } = params
    const form = await unstable_parseMultipartFormData(request, uploadHandler)
    const data = Object.fromEntries(form)
    if ( 'logoFile' in data) {
      const photoFile = form.get("logoFile") as File
      const result = await uploadToPhotoToCloudStorage(photoFile)
      if (result.errors.length || !result.data) {
        return json({ errors: [2] })
      }
      const {data: updatedApplication} = await appDbClient.updateApplication(parseInt(id!), {logo_url: result.data})
      if (!updatedApplication) {
        // TODO: In the future create a custom error boundary to handle this
        return json({ errors: [1] })
      }
      return json({
        updatedApplication,
      })
    }
  } else {
    const { id } = params
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    if ('fileToDelete' in data) {
      const {data: appAfterImageDeletion} = await appDbClient.updateApplication(parseInt(id!), {logo_url: null})
      if (!appAfterImageDeletion) {
        await deleteFileFromCloudStorage(data.fileToDelete as string)
        return json({ errors: [4] })
      } else {
        return json({ updatedApplication: appAfterImageDeletion })
      }
    } else {
      const goalDbClient = ApplicationGoalsClient(DB_CLIENT.applicationGoal)
      const updateData = data  as unknown as NewApplicationData
      if ("sprint_generation_enabled" in updateData) {
        const isEnabled = (updateData.sprint_generation_enabled as any) === 'true'
        updateData.sprint_generation_enabled = isEnabled
      }
    
      const goals = updateData.goals.length ? JSON.parse(updateData.goals) as NewGoalData[] : []
      const {data: updatedApplication} = await appDbClient.updateApplication(parseInt(id!), updateData)
      const {data: updatedGoals} = await goalDbClient.updateApplicationGoals(parseInt(id!), goals)
      if (!updatedApplication || !updatedGoals) {
        return json({ errors: [1] })
      }
      return json({
        updatedApplication,
        updatedGoals
      })
    }

  }

  return redirect('/portal/applications')
}

export default function IndividualApplicationsPage() {
  const {goals: currentGoals, application: currentApplicationData, hasInitialContext} = useLoaderData<{goals: Array<ApplicationGoal>, application: AccountApplication, hasInitialContext: boolean}>()
  const { updatedApplication, updatedGoals } = useActionData<typeof action>() || {updateApplication: null, updatedGoals: null}
  const [application, setApplication] = useState<AccountApplication>(updatedApplication ?? currentApplicationData)
  const [goals, setGoals] = useState<NewGoalData[]>(updatedGoals ?? currentGoals)
  const [name, setName] = useState(updatedApplication ? updatedApplication.name :currentApplicationData.name)
  const [summary, setSummary] = useState(updatedApplication ? updatedApplication.summary : currentApplicationData.summary)
  const [siteUrl, setSiteUrl] = useState(updatedApplication ? updatedApplication.siteUrl : currentApplicationData.siteUrl)
  const [type, setType] = useState(updatedApplication ? updatedApplication.type : currentApplicationData.type)
  const [logoUrl, setLogoUrl] = useState(updatedApplication ? updatedApplication.logo_url : currentApplicationData.logo_url)
  const [generationEnabled, setGenerationEnabled] = useState(updatedApplication ? updatedApplication.sprint_generation_enabled : currentApplicationData.sprint_generation_enabled)
  const [appContextModalOpen, setAppContextModalOpen] = useState(false)
  const [sprintInterval, setSprintInterval] = useState(updatedApplication ?updatedApplication.sprint_interval : currentApplicationData.sprint_interval)
  const [changesDetected, setChangesDetected] = useState(false)
  const shortTermGoalInputRef = useRef<HTMLInputElement>(null)
  const longTermGoalInputRef = useRef<HTMLInputElement>(null)
  const deleteFormRef = useRef<HTMLFormElement>(null)

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

    if (sprintInterval !== currentApplicationData.sprint_interval) {
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
    if (generationEnabled !== currentApplicationData.sprint_generation_enabled) {
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

  function deleteAppImg() {
    deleteFormRef.current?.requestSubmit()
  }

  function handleGenerationToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const isEnabled = e.target.checked
    setGenerationEnabled(isEnabled)
  }

  useEffect(() => {
    checkForChanges()
  }, [siteUrl, name, summary, type, sprintInterval, generationEnabled])

  return (
    <div>
      <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full">
        <div className="mb-2 flex gap-2 items-end">
          <PLPhotoUploader shape="square" size="small" currentImageUrl={logoUrl}/>
          {logoUrl && (
            <form method="post" ref={deleteFormRef}>
              <input type="hidden" name="fileToDelete" value={logoUrl} />
              <PLIconButton icon="ri-delete-bin-6-line" onClick={deleteAppImg} />
            </form>
          )}
          { !hasInitialContext ? <PLBasicButton text={'Upload Initial Context'} colorClasses={"ml-7 bg-orange-200 text-orange-600 hover:bg-orange-200 hover:text-orange-600 dark:bg-orange-200 dark:text-orange-600 dark:hover:bg-orange-200 dark:hover:text-orange-600"} onClick={() => setAppContextModalOpen(true)}/> : null}
        </div>
        <form method="post">
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Application Name</label>
          <input value={name} 
            onChange={(v) => {
              setName(v.target.value)
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
            }}
            value={type.toLowerCase()}
            className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm"
          >
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="api">API</option>
            <option value="game">Game</option>
            <option value="library">Library</option>
            <option value="cli-tool">CLI Tool</option>
            <option value="other">Other</option>
          </select>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mt-4">Sprint Cadence</label>
          <select 
            name="sprint_interval"
            onChange={(v) => {
              setSprintInterval(v.target.value)
            }}
            value={sprintInterval.toLowerCase()}
            className="p-2 text-black dark:text-neutral-400 mt-1 block w-full border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm"
          >
            <option value={SprintInterval.MONTHLY}>Monthly</option>
            <option value={SprintInterval.BIWEEKLY}>Bi-Weekly</option>
            <option value={SprintInterval.WEEKLY}>Weekly</option>
            <option value={SprintInterval.DAILY}>Daily</option>
          </select>  

          <div className="flex flew-row items-center mt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-neutral-300 -mr-2">Sprint Generation Enabled</label>
            <ToggleSwitch darkMode={generationEnabled} onChangeHandler={handleGenerationToggle}/>
            <input type="hidden" name="sprint_generation_enabled" value={generationEnabled} />
          </div>
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
          <PLBasicButton text="Update Details" colorClasses={"bg-primary-300 dark:bg-primary-300 dark:text-black px-3 py-0 text-md mt-4" + (!changesDetected ? ' hover:bg-primary-300 dark:hover:bg-primary-300 dark:hover:text-black' : '')} disabled={!changesDetected}/>

        </form>
      </div>
      <PLApplicationContextModel open={appContextModalOpen} setOpen={setAppContextModalOpen} applicationId={currentApplicationData.id}/>
    </div>
  )
}