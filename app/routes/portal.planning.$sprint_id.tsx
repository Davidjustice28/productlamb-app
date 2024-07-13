import { GeneratedInitiative, GeneratedTask, PrismaClient } from "@prisma/client"
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { useEffect, useRef, useState } from "react"
import { account } from "~/backend/cookies/account"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { PLTable } from "~/components/common/table"
import { PLConfirmModal } from "~/components/modals/confirm"
import { PLLoadingModal } from "~/components/modals/loading"
import { PLAddTaskModal } from "~/components/modals/tasks/add-task-modal"
import { TableColumn } from "~/types/base.types"
import { ManualTaskData } from "~/types/component.types"
import { encrypt } from "~/utils/encryption"

interface SprintPlanningResult {
  sprint_id: number, 
  task_ids: Array<number>,
  initiative_id: number,
  new_tasks: Array<ManualTaskData>,
  task_backlogged_ids: Array<number>,
  deleted_task_ids: Array<number>
  backlog_ids_used: Array<number>
}

export const loader: LoaderFunction = async ({request, params}) => {
  const dbClient = new PrismaClient()
  const taskMap: Record<number, Array<GeneratedTask>> = {}
  const sprintId = parseInt(params.sprint_id || "-1")
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId
  const iv = process.env.ENCRYPTION_IV as string
  const key = process.env.ENCRYPTION_KEY as string
  
  const authToken = encrypt(process.env.SPRINT_GENERATION_SECRET as string, key, iv)
  if(sprintId === -1) {
    return json({
      initiatives: [],
      taskMap: {},
      authToken,
      applicationId,
    })
  }
  const initiatives = await dbClient.generatedInitiative.findMany({where: {sprintId}})
  if(initiatives.length === 0) {
    return json({
      initiatives: [],
      taskMap: {},
      authToken,
      applicationId,
    })
  }
  const responses = await Promise.all(initiatives.map(async initiative => {
    const tasks = await dbClient.generatedTask.findMany({where: {initiativeId: initiative.id}})
    return {initiative_id: initiative.id, tasks}
  }))

  const backlog = await dbClient.generatedTask.findMany({where: {applicationId, backlog: true}})

  responses.forEach(response => {
    taskMap[response.initiative_id] = response.tasks
  })

  return json({
    initiatives,
    taskMap,
    backlog,
    applicationId,
    authToken,
  }) 
}

export const action: ActionFunction  = async ({request, params}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const form = await request.formData()
  const sprintData = JSON.parse(form.get('sprint_data') as string) as SprintPlanningResult
  const sprint_id = sprintData.sprint_id
  const dbClient = new PrismaClient()
  
  const selected_ids = sprintData.task_ids.concat(sprintData.backlog_ids_used)

  if (selected_ids.length) {
    await dbClient.generatedTask.updateMany({where: {id: {in: selected_ids}}, data: {sprintId: sprint_id, backlog: false, initiativeId: sprintData.initiative_id}})
  }

  if (sprintData.new_tasks.length) {
    await dbClient.generatedTask.createMany({data: sprintData.new_tasks.map((task: ManualTaskData) => {
      return {
        title: task.title,
        description: task.description,
        points: parseInt(task.points),
        category: task.category,
        sprintId: sprint_id,
        applicationId: accountCookie.selectedApplicationId,
        initiativeId: sprintData.initiative_id,
        status: 'To Do',
        reason: task.reason
      }
    })})
  }
    
  if (sprintData.task_backlogged_ids.length) {
    await dbClient.generatedTask.updateMany({where: {id: {in: sprintData.task_backlogged_ids}}, data: {sprintId: null, backlog: true}})
  }

  if (sprintData.deleted_task_ids.length) {
    await dbClient.generatedTask.deleteMany({where: {id: {in: sprintData.deleted_task_ids}}})
  }

  await dbClient.applicationSprint.update({where: {id: sprint_id}, data: {selectedInitiative: sprintData.initiative_id, is_generating: true}})
  const url = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
  fetch(`${url}/sprints/${sprint_id}/generate`, { method: 'POST', headers: { 'Authorization': `${process.env.SPRINT_GENERATION_SECRET}` } })
  return redirect(`/portal/sprints`)
}

export default function SprintGenerationPage() {
  const {taskMap: data, initiatives: loadedInitiatives, backlog: loadedBacklog, applicationId, authToken} = useLoaderData() as {taskMap: Record<number, Array<GeneratedTask>>, initiatives: Array<GeneratedInitiative>, backlog: Array<GeneratedTask>, applicationId: number, authToken: string}
  const [step, setStep] = useState<number>(0)
  const [backlog, setBacklog] = useState<Array<GeneratedTask>>(loadedBacklog || [])
  const allTasks = Object.values(data).flat()
  const [selectedInitiative, setSelectedInitiative] = useState<number|null>()
  const [initiatives, setInitiatives] = useState<Array<GeneratedInitiative>>(loadedInitiatives || [])
  const [taskMap, setTaskMap] = useState<Record<number, Array<GeneratedTask>>>(data || {})
  const [itemsSelected, setItemsSelected] = useState(false)
  const [backloggedTaskIds, setBacklogTaskIds] = useState<Array<number>>([])
  const [selectedIdsFromBacklog, setSelectedIdsFromBacklog] = useState<Array<number>>([])
  const [manualTaskModalOpen, setManualTaskModalOpen] = useState(false)
  const [newTasks, setNewTasks] = useState<Array<ManualTaskData>>([])
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  const [alreadyUsedSuggestionButton, setAlreadyUsedSuggestionButton] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [backlogSuggestionsProcessing, setBacklogSuggestionsProcessing] = useState(false)
  const confirmationMessage = "Are you sure you want to close out planning and start the next sprint with the selected tasks?"

  function onConfirm() {
    inputRef.current!.value = JSON.stringify({
      sprint_id: initiatives.find(initiative => initiative.id === selectedInitiative)?.sprintId, 
      task_ids: idsChecked, initiative_id: selectedInitiative, 
      new_tasks: newTasks, 
      task_backlogged_ids: backloggedTaskIds,
      backlog_ids_used: selectedIdsFromBacklog,
      deleted_task_ids: getDeletedTasks().map(task => task.id)
    })
    formRef.current?.submit()
    setLoading(true)
  }

  function getUnchosenTasks() {
    return allTasks.filter(task => !idsChecked.includes(task.id))
  }

  function getDeletedTasks() {
    return allTasks.filter(task => !idsChecked.includes(task.id) && !backloggedTaskIds.includes(task.id)) 
  }

  const handleButtonClick = () => {
    if(step < 3) {
      setStep((prev) => prev + 1)
    } else {
      setConfirmModalOpen(true)
    }
  }

  const onAddTask = (task: ManualTaskData) => {
    setNewTasks([...newTasks, task])
    setManualTaskModalOpen(false)
  }

  const getBacklogSuggestions = async () => {
    if (!selectedInitiative) return
    setBacklogSuggestionsProcessing(true)
    const response = await fetch(`/api/backlog/`, {method: 'POST', body: JSON.stringify({initiative_id: selectedInitiative})}).then(res => res.json()).catch(err => null)
    if (response) {
      const suggestedTasks = response.tasks as Array<number>
      const updatedBacklog = backlog.filter(task => suggestedTasks.includes(task.id))
      setBacklog(updatedBacklog)
      setAlreadyUsedSuggestionButton(true)
    }
    setBacklogSuggestionsProcessing(false)
  }

  return (
    <div className="w-full flex flex-col">
      {step === 0 ? 
        (
          <>
            <p className="mt-5 mb-5 font-semibold text-neutral-800 dark:text-neutral-400">Choose an overall initiative for the sprint you wish to generate.</p>
            <div className="mt-5 flex flex-row gap-3">
              {initiatives.map((initiative, index) => {
                return (
                  <button 
                    key={index} 
                    className={"w-full p-2 rounded-xl font-medium flex flex-col justify-start items-start border-2 "+ (selectedInitiative === initiative.id ? "dark:bg-neutral-800 bg-white dark:text-neutral-200 text-neutral-800 border-neutral-800" : "bg-neutral-200 dark:bg-neutral-400 border-neutral-400 dark:border-neutral-400 dark:text-neutral-200 text-black ")}
                    onClick={() => setSelectedInitiative(initiative.id)}
                  >
                    <p className="font-bold underline text-lg">Option #{index + 1}</p>
                    <p className="text-left text-md">{initiative.description}</p>
                  </button>
                )
              })}
            </div>
            <div className="mt-5 mb-5 w-full overflow-scroll relative">
            {
              <div className="flex flex-col gap-3">
                { selectedInitiative ?  
                  <SprintPlanningTaskTable tasks={taskMap[selectedInitiative]} setItemsSelected={setItemsSelected} setIdsChecked={setIdsChecked}/> :
                  <p>Please select an initiative. The chosen option will determine the tasks that will be included in the sprint.</p>
                }
              </div>
            }
            </div>
          </>
        ) : step === 1 ? (
          <div className="mt-5 mb-5 min-h-[600px]">
            <div className="flex flex-row justify-between w-full items-center">
              <p className="font-semibold text-neutral-800 dark:text-neutral-400">Here's your backlog. Pull in any items you want tackle this sprint.</p>
              <div>
                <PLBasicButton 
                  icon="ri-sparkling-line" 
                  text="Suggest Items" 
                  noDefaultDarkModeStyles={true}
                  colorClasses={"bg-orange-200 text-orange-600 " + (alreadyUsedSuggestionButton ? " opacity-50 cursor-not-allowed" : " cursor-pointer hover:bg-orange-500 hover:text-white")}
                  useStaticWidth={false} 
                  showLoader={backlogSuggestionsProcessing}
                  onClick={getBacklogSuggestions}
                  disabled={alreadyUsedSuggestionButton}
                />
              </div>
            </div>
            <BacklogTable tasks={backlog} setIdsChecked={setSelectedIdsFromBacklog} listType="backlog"/>
          </div>
        
        ) : step == 2 ? (
          <>
            <div className="flex flex-row justify-between w-full items-center mt-5 mb-5">
              <p className="font-semibold text-neutral-800 dark:text-neutral-400">Manually add any tasks you would like in this sprint</p>
              <div className="flex flex-row gap-3">
                <PLBasicButton text="Add Task" onClick={() => setManualTaskModalOpen(true)} icon="ri-add-line"/>
              </div>
            </div>
            <div className="min-h-[550px] mb-5">
              <PLTable data={newTasks} checked={[]} columns={[{key: 'title', type: 'text'}, {key: 'description', type: 'text'}, {key: 'points', type: 'text'}, {key: 'category', type: 'text'}]} actionsAvailable={false}/>
            </div>
          </>
        ) : (
          <div className="mt-5 mb-5 min-h-[600px]">
            <p className="font-semibold text-neutral-800 dark:text-neutral-400">Mark unselected suggestions that you would like to move to your backlog. The rest will not be saved.</p>
            <BacklogTable tasks={getUnchosenTasks()} setIdsChecked={setBacklogTaskIds} listType="suggestions"/>
          </div>
        )
      }      
      <Form method="POST" ref={formRef}>
        <input type="hidden" ref={inputRef} name="sprint_data"/>
      </Form>
      <div>
        <PLBasicButton text={step < 3 ? 'Go to Next Step' : "Start Sprint"} onClick={handleButtonClick} icon="ri-arrow-right-line" disabled={step === 0 && !itemsSelected}/>
      </div>
      <PLConfirmModal message={confirmationMessage} open={confirmModalOpen} setOpen={setConfirmModalOpen} onConfirm={onConfirm}/>
      <PLAddTaskModal open={manualTaskModalOpen} setOpen={setManualTaskModalOpen} onSubmit={onAddTask} application_id={applicationId} authToken={authToken}/>
      <PLLoadingModal open={loading} setOpen={setLoading} title="Generating Sprint in PM Tool..."/>
    </div>
  )
}

function SprintPlanningTaskTable({tasks, setItemsSelected, setIdsChecked}: {tasks: Array<GeneratedTask>, setItemsSelected: (selected: boolean) => void, setIdsChecked: (ids: Array<number>) => void}) {

  function onCheck(ids:Array<number>) {
    setIdsChecked(ids)
    setItemsSelected(ids.length > 0)
  }

  const columns: Array<TableColumn> = [
    {key: "description", type: "text"},
    {key: "reason", type: "text"},
    {key: "points", type: "text"},
  ]
  if (tasks.length === 0) return <p>No tasks found for this initiative.</p>
  return (
    <div className="mt-5 min-h-[450px] mb-5">
      <PLTable data={tasks} checked={[]} columns={columns} onCheck={onCheck}/>
    </div>
  )
}

function BacklogTable({tasks, setIdsChecked, listType}: {tasks: Array<GeneratedTask>, setIdsChecked: (ids: Array<number>) => void, listType: 'backlog' | 'suggestions'}) {

  function onCheck(ids:Array<number>) {
    setIdsChecked(ids)
  }

  const columns: Array<TableColumn> = [
    {key: "title", type: "text"},
    {key: "reason", type: "text"},
  ]
  if (tasks.length === 0) return (
    <p className="text-red-400 mt-3">
      {listType === 'backlog' ? 'Your backlog is empty.' : 'There are no unused suggestions. All have been pulled into this sprint.'}
    </p>
  )

  return (
    <div className="mt-5 mb-5">
      <PLTable data={tasks} checked={[]} columns={columns} onCheck={onCheck}/>
    </div>
  )
}