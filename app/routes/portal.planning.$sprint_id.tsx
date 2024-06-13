import { GeneratedInitiative, GeneratedTask, PrismaClient } from "@prisma/client"
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { useRef, useState } from "react"
import { account } from "~/backend/cookies/account"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { PLTable } from "~/components/common/table"
import { PLConfirmModal } from "~/components/modals/confirm"
import { PLAddTaskModal } from "~/components/modals/tasks/add-task-modal"
import { TableColumn } from "~/types/base.types"
import { ManualTaskData } from "~/types/component.types"

export const loader: LoaderFunction = async ({request, params}) => {
  const dbClient = new PrismaClient()
  const taskMap: Record<number, Array<GeneratedTask>> = {}
  const sprintId = parseInt(params.sprint_id || "-1")
  if(sprintId === -1) {
    return json({
      initiatives: [],
      taskMap: {}
    })
  }
  const initiatives = await dbClient.generatedInitiative.findMany({where: {sprintId}})
  if(initiatives.length === 0) {
    return json({
      initiatives: [],
      taskMap: {}
    })
  }
  const responses = await Promise.all(initiatives.map(async initiative => {
    const tasks = await dbClient.generatedTask.findMany({where: {initiativeId: initiative.id}})
    return {initiative_id: initiative.id, tasks}
  }))

  responses.forEach(response => {
    taskMap[response.initiative_id] = response.tasks
  })
  console.log('initiatives', initiatives)

  return json({
    initiatives,
    taskMap
  }) 
}

export const action: ActionFunction  = async ({request, params}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const form = await request.formData()
  const sprintData = JSON.parse(form.get('sprint_data') as string)
  const sprint_id = sprintData.sprint_id
  const dbClient = new PrismaClient()
  
  const response = await dbClient.generatedTask.updateMany({where: {id: {in: sprintData.task_ids}}, data: {sprintId: sprint_id}})
  console.log('Updated tasks', response.count)
  if (sprintData.new_tasks.length) {
    const createResponse = await dbClient.generatedTask.createMany({data: sprintData.new_tasks.map((task: ManualTaskData) => {
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
    console.log('Created tasks - ', createResponse.count)
  } else {
    console.log('No new tasks to create')
  }

  await dbClient.applicationSprint.update({where: {id: sprint_id}, data: {selectedInitiative: sprintData.initiative_id}})
  const url = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
  await fetch(`${url}/sprints/${sprint_id}/generate`, { method: 'POST' })
  return redirect(`/portal/sprints`)
}

export default function SprintGenerationPage() {
  const {taskMap: data, initiatives: loadedInitiatives} = useLoaderData() as {taskMap: Record<number, Array<GeneratedTask>>, initiatives: Array<GeneratedInitiative>}
  const [step, setStep] = useState<0|1>(0)
  const [selectedInitiative, setSelectedInitiative] = useState<number|null>()
  const [initiatives, setInitiatives] = useState<Array<GeneratedInitiative>>(loadedInitiatives || [])
  const [taskMap, setTaskMap] = useState<Record<number, Array<GeneratedTask>>>(data || {})
  const [itemsSelected, setItemsSelected] = useState(false)
  const [manualTaskModalOpen, setManualTaskModalOpen] = useState(false)
  const [newTasks, setNewTasks] = useState<Array<ManualTaskData>>([])
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmationMessage = "Are you sure you want to close out planning and start the next sprint with the selected tasks?"

  function onConfirm() {
    inputRef.current!.value = JSON.stringify({sprint_id: initiatives.find(initiative => initiative.id === selectedInitiative)?.sprintId, task_ids: idsChecked, initiative_id: selectedInitiative, new_tasks: newTasks})
    formRef.current?.submit()
  }

  const handleButtonClick = () => {
    if(step === 0) {
      setStep(1)
    } else {
      setConfirmModalOpen(true)
    }
  }

  const onAddTask = (task: ManualTaskData) => {
    setNewTasks([...newTasks, task])
    setManualTaskModalOpen(false)
  }

  return (
    <div className="w-full flex flex-col">
      {step === 0 ? 
        (
          <>
            <p className="font-semibold text-black dark:text-white">Choose an overall initiative for the sprint you wish to generate.</p>
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
        ) : (
          <>
            <div className="flex flex-row justify-between w-full items-center mt-5">
              <p className="font-semibold text-black dark:text-white">Manually add any tasks you would like in this sprint</p>
              <div className="flex flex-row gap-3">
                <PLBasicButton text="Add Task" onClick={() => setManualTaskModalOpen(true)} icon="ri-add-line"/>
              </div>
            </div>
            <div className="mt-5 h-[550px] overflow-y-scroll mb-5">
              <PLTable data={newTasks} checked={[]} columns={[{key: 'title', type: 'text'}, {key: 'description', type: 'text'}, {key: 'points', type: 'text'}, {key: 'category', type: 'text'}]} actionsAvailable={false}/>
            </div>
          </>
        )
      }      
      <Form method="POST" ref={formRef}>
        <input type="hidden" ref={inputRef} name="sprint_data"/>
      </Form>
      <div>
        <PLBasicButton text={step === 0 ? 'Go to Next Step' : "Start Sprint"} onClick={handleButtonClick} icon="ri-arrow-right-line" disabled={step === 0 && !itemsSelected}/>
      </div>
      <PLConfirmModal message={confirmationMessage} open={confirmModalOpen} setOpen={setConfirmModalOpen} onConfirm={onConfirm}/>
      <PLAddTaskModal open={manualTaskModalOpen} setOpen={setManualTaskModalOpen} onSubmit={onAddTask}/>
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
  ]
  if (tasks.length === 0) return <p>No tasks found for this initiative.</p>
  return (
    <div className="mt-5 h-[450px] overflow-y-scroll mb-5">
      <PLTable data={tasks} checked={[]} columns={columns} onCheck={onCheck}/>
    </div>
  )
}