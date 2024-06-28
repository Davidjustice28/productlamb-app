import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ApplicationSprint, GeneratedTask, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useRef, useState } from "react";
import { account } from "~/backend/cookies/account";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLContentLess } from "~/components/common/contentless";
import { PLTable } from "~/components/common/table";
import { PLConfirmModal } from "~/components/modals/confirm";
import { PLAddTaskModal } from "~/components/modals/tasks/add-task-modal";
import { ManualTaskData } from "~/types/component.types";

interface BaseFormData<T='delete' | 'add' | 'edit' | 'pull'> {
  action: T,
}
type NewBackLogItemData = BaseFormData<'add'> & ManualTaskData

interface DeleteBugData extends BaseFormData {
  action: 'delete',
  ids: string
}

interface BacklogPullIntoSprintData extends BaseFormData {
  action: 'pull',
  ids: string,
  sprint_id: string
}

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as NewBackLogItemData | DeleteBugData | BacklogPullIntoSprintData
  const dbClient = new PrismaClient()

  if (data.action === 'add') {
    const {title, reason, description, category, points} = data
    await dbClient.generatedTask.create({data: {title, description, reason, category, applicationId, backlog: true, status: 'to do', points: parseInt(points)}})
    const taskDbClient = new PrismaClient().generatedTask
    const backlog = await taskDbClient.findMany({where: {applicationId: applicationId, backlog: true}})
    return json({updatedTasks: backlog})
  }

  if (data.action === 'delete') {
    const ids = data.ids.split(',').map(id => parseInt(id))
    await dbClient.generatedTask.deleteMany({where: {id: {in: ids}}})
    const taskDbClient = new PrismaClient().generatedTask
    const backlog = await taskDbClient.findMany({where: {applicationId: applicationId, backlog: true}})
    return json({updatedTasks: backlog})
  }

  if (data.action === 'pull') {
    const ids = data.ids.split(',').map(id => parseInt(id))
    const sprintId = parseInt(data.sprint_id)
    if (!sprintId) {
      return json({updatedTasks: null})
    }
    const sprint = await dbClient.applicationSprint.findFirst({where: {id: sprintId}})
    if (!sprint) {
      return json({updatedTasks: null})
    }
    const baseUrl = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
    await fetch(`${baseUrl}/sprints/pull-in/${sprintId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ids, type: 'backlog'})
    })

    const taskDbClient = new PrismaClient().generatedTask
    const tasks = await taskDbClient.findMany({where: {applicationId: applicationId, backlog: true}})
    return json({updatedTasks: tasks ?? null})
  }

  return json({updatedTasks: null})
}


export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => { 
    const cookieHeader = request.headers.get("Cookie");
    const accountCookie = (await account.parse(cookieHeader) || {});
    let selectedApplicationId: number = accountCookie.selectedApplicationId
    const dbClient = new PrismaClient()
    const backlog = await dbClient['generatedTask'].findMany({where: {applicationId: selectedApplicationId, backlog: true}})
    const activeSprint = await dbClient.applicationSprint.findFirst({ where: { applicationId: selectedApplicationId, status: 'In Progress'}})
    return json({backlog, activeSprint})
  })
}

export default function BacklogPage() {
  const { backlog: loadedBacklog, activeSprint } = useLoaderData() as {backlog: GeneratedTask[], activeSprint: ApplicationSprint | null}
  const { updatedTasks } = useActionData<typeof action>() ?? {updatedTasks: null}
  const [backlog, setBacklog] = useState<GeneratedTask[]>(updatedTasks ?? loadedBacklog ?? [])
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
  const [itemsSelected, setItemsSelected] = useState<boolean>(false)
  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false)
  const [pullModalOpen, setPullModalOpen] = useState<boolean>(false)

  function handleDelete() {
    setDeleteModalOpen(true)
  }

  function onCheck(ids:Array<number>) {
    const itemsChecked = ids.length > 0
    setItemsSelected(itemsChecked)
    setIdsChecked(ids)
  }
  const idsInputRef = useRef<HTMLInputElement>(null)
  const actionInputRef = useRef<HTMLInputElement>(null)
  const sprintIdInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)




  const submitDeleteRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    idsInputRef.current!.value = idsChecked.join(',')
    actionInputRef.current!.value = 'delete'
    formRef.current?.submit()
  }

  const pullTasksIntoSprint = async (e: React.FormEvent<HTMLFormElement>) => {
    idsInputRef.current!.value = idsChecked.join(',')
    actionInputRef.current!.value = 'pull'
    sprintIdInputRef.current!.value = activeSprint?.id.toString() || ''
    formRef.current?.submit()
  }
  return (
    <div className="w-full flex flex-col text-black">
      <div className="w-full flex justify-between items-center">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Review and edit your backlog of tasks</p>
        <div className="flex gap-2">
          {itemsSelected && (
            <>
              <PLIconButton icon="ri-delete-bin-line" onClick={handleDelete}/>
              {activeSprint && <PLIconButton icon="ri-check-line" onClick={() => setPullModalOpen(true)}/>}
            </>
          )}
          <PLIconButton icon="ri-add-line" onClick={() => setAddModalOpen(true)} />
        </div>
      </div>
      {
        backlog.length === 0 && <PLContentLess itemType="backlog"/>
      }
      {
        backlog.length > 0 && (
          <div className="mt-5"> 
            <form method="post" ref={formRef}>
              <input type="hidden" name="ids" ref={idsInputRef}/>
              <input type="hidden" name="action" ref={actionInputRef}/>
              <input type="hidden" name="sprint_id" ref={sprintIdInputRef}/>
            </form>
            <PLTable data={backlog} columnsVisible checked={[]}  columns={[{key: 'title', type: 'text'}, {key: 'points', type: 'text'}, {key: 'category', type: 'status'}]} tableModalName="backlog" actionsAvailable={true} onCheck={onCheck}/>
          </div>
        )
      }
      <PLAddTaskModal open={addModalOpen} setOpen={setAddModalOpen}/>
      <PLConfirmModal open={deleteModalOpen} setOpen={setDeleteModalOpen} message="Are you sure you want to delete the selected items from your backlog?" onConfirm={submitDeleteRequest}/>
      <PLConfirmModal open={pullModalOpen} setOpen={setPullModalOpen} message="Are you sure you want to pull the selected tasks into the current sprint?" onConfirm={pullTasksIntoSprint} />

    </div>
  )
}