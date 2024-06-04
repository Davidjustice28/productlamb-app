import { GeneratedInitiative, GeneratedTask, PrismaClient } from "@prisma/client"
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { useEffect, useRef, useState } from "react"
import { ApplicationSprintsClient } from "~/backend/database/sprints/client"
import { GeneratedTasksClient } from "~/backend/database/tasks/client"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { PLTable } from "~/components/common/table"
import { PLConfirmModal } from "~/components/modals/confirm"
import { TableColumn } from "~/types/base.types"

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

  return json({
    initiatives,
    taskMap
  }) 
}

export const action: ActionFunction  = async ({request, params}) => {
  const form = await request.formData()
  const sprintData = JSON.parse(form.get('sprint_data') as string)
  const sprint_id = sprintData.sprint_id
  const dbClient = new PrismaClient()
  const taskClient = GeneratedTasksClient(dbClient.generatedTask)
  const sprintClient = ApplicationSprintsClient(dbClient.applicationSprint)

  const response = await dbClient.generatedTask.updateMany({where: {id: {in: sprintData.task_ids}}, data: {sprintId: sprint_id}})
  console.log('Updated tasks', response.count)

  await dbClient.applicationSprint.update({where: {id: sprint_id}, data: {selectedInitiative: sprintData.initiative_id}})
  await fetch(`http://localhost:8000/sprints/${sprint_id}/generate`, { method: 'POST' })
  return redirect(`/portal/sprints`)
}
export default function SprintGenerationPage() {
  const {taskMap: data, initiatives: loadedInitiatives} = useLoaderData() as {taskMap: Record<number, Array<GeneratedTask>>, initiatives: Array<GeneratedInitiative>}
  const [selectedInitiative, setSelectedInitiative] = useState<number|null>()
  const [initiatives, setInitiatives] = useState<Array<GeneratedInitiative>>(loadedInitiatives || [])
  const [taskMap, setTaskMap] = useState<Record<number, Array<GeneratedTask>>>(data || {})
  const [itemsSelected, setItemsSelected] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmationMessage = "Are you sure you want to close out planning and start the next sprint with the selected tasks?"

  function onConfirm() {
    inputRef.current!.value = JSON.stringify({sprint_id: initiatives.find(initiative => initiative.id === selectedInitiative)?.sprintId, task_ids: idsChecked, initiative_id: selectedInitiative})
    formRef.current?.submit()
  }
  useEffect(() => {
    console.log('selectedInitiative', selectedInitiative)
    console.log('initiatives', initiatives)
    console.log('taskMap', taskMap)
  }, [selectedInitiative])

  return (
    <div className="w-full flex flex-col">
      <p className="font-semibold text-black dark:text-white">Choose an overall initiative for the sprint you wish to generate.</p>
      <div className="mt-5 flex flex-row gap-3">
        {initiatives.map((initiative, index) => {
          return (
            <button 
              key={index} 
              className="w-full border-2 border-black dark:border-neutral-400 p-2 rounded-xl font-medium dark:text-neutral-400 text-black flex flex-col justify-center items-start"
              onClick={() => setSelectedInitiative(initiative.id)}
            >
              <p>Option #{index + 1}</p>
              <p>{initiative.description}</p>
            </button>
          )
        })}
      </div>
      <div className="mt-5 mb-5 w-full overflow-scroll relative">
      {
        <div className="mt-5 flex flex-col gap-3">
          { selectedInitiative ?  
            <SprintPlanningTaskTable tasks={taskMap[selectedInitiative]} setItemsSelected={setItemsSelected} setIdsChecked={setIdsChecked}/> :
            <p>Please select an initiative. The chosen option will determine the tasks that will be included in the sprint.</p>
          }
        </div>
      }

      </div>
      <Form method="POST" ref={formRef}>
        <input type="hidden" ref={inputRef} name="sprint_data"/>
      </Form>
      <PLBasicButton text="Start Sprint" onClick={() => setConfirmModalOpen(true)} icon="ri-arrow-right-line" useStaticWidth disabled={!itemsSelected}/>
      <PLConfirmModal message={confirmationMessage} open={confirmModalOpen} setOpen={setConfirmModalOpen} onConfirm={onConfirm}/>
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
    <PLTable data={tasks} checked={[]} columns={columns} onCheck={onCheck}/>
  )
}