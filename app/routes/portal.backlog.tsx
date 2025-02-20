import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ApplicationSprint, GeneratedTask } from "@prisma/client";
import { ActionFunction, LoaderFunction, MetaFunction, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useRef, useState } from "react";
import { account } from "~/backend/cookies/account";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLContentLess } from "~/components/common/contentless";
import { PLTable } from "~/components/common/table";
import { PLConfirmModal } from "~/components/modals/confirm";
import { PLAddTaskModal } from "~/components/modals/tasks/add-task-modal";
import { PLEditTaskModal } from "~/components/modals/tasks/edit-task-modal";
import { DB_CLIENT } from "~/services/prismaClient";
import { ManualTaskData } from "~/types/component.types";
import { encrypt } from "~/utils/encryption";

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

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "ProductLamb | Backlog" },
    {
      property: "og:title",
      content: "ProductLamb | Backlog",
    },
  ];
};

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as NewBackLogItemData | DeleteBugData | BacklogPullIntoSprintData

  if (data.action === 'add') {
    const {title, reason, description, category, points} = data
    await DB_CLIENT.generatedTask.create({data: {title, description, reason, category, applicationId, backlog: true, status: 'to do', points: parseInt(points)},}).catch(err => console.log(err)) 
    const taskDbClient = DB_CLIENT.generatedTask
    const backlog = await taskDbClient.findMany({where: {applicationId: applicationId, backlog: true}})
    return json({updatedTasks: backlog})
  }

  if (data.action === 'delete') {
    const ids = data.ids.split(',').map(id => parseInt(id))
    await DB_CLIENT.generatedTask.deleteMany({where: {id: {in: ids}}})
    const taskDbClient = DB_CLIENT.generatedTask
    const backlog = await taskDbClient.findMany({where: {applicationId: applicationId, backlog: true}})
    return json({updatedTasks: backlog})
  }

  if (data.action === 'pull') {
    const ids = data.ids.split(',').map(id => parseInt(id))
    const sprintId = parseInt(data.sprint_id)
    if (!sprintId) {
      return json({updatedTasks: null})
    }
    const sprint = await DB_CLIENT.applicationSprint.findFirst({where: {id: sprintId}})
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

    const taskDbClient = DB_CLIENT.generatedTask
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
    const backlog = await DB_CLIENT['generatedTask'].findMany({where: {applicationId: selectedApplicationId, backlog: true}})
    const activeSprint = await DB_CLIENT.applicationSprint.findFirst({ where: { applicationId: selectedApplicationId, status: 'In Progress'}})
    const iv = process.env.ENCRYPTION_IV as string
    const key = process.env.ENCRYPTION_KEY as string
    const authToken = encrypt(process.env.SPRINT_GENERATION_SECRET as string, key, iv)
    const app = await DB_CLIENT.accountApplication.findFirst({where: {id: selectedApplicationId}})
    let hasToolConfigured: boolean

    if (app?.clickup_integration_id !== null) {
      hasToolConfigured = true
    } else if (app?.jira_integration_id !== null) {
      hasToolConfigured = true
    } else if (app?.notion_integration_id !== null) {
      hasToolConfigured = true
    } else if(app?.github_integration_id !== null) {
      hasToolConfigured = true
    } else {
      hasToolConfigured = false
    }

    return json({backlog, activeSprint, application_id: selectedApplicationId, authToken, hasToolConfigured})
  })
}

export default function BacklogPage() {
  const { backlog: loadedBacklog, activeSprint, application_id, authToken, hasToolConfigured } = useLoaderData() as {backlog: GeneratedTask[], activeSprint: ApplicationSprint | null, application_id: number, authToken: string, hasToolConfigured: boolean}
  const { updatedTasks } = useActionData<typeof action>() ?? {updatedTasks: null}
  const [backlog, setBacklog] = useState<GeneratedTask[]>(updatedTasks ?? loadedBacklog ?? [])
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
  const [itemsSelected, setItemsSelected] = useState<boolean>(false)
  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false)
  const [pullModalOpen, setPullModalOpen] = useState<boolean>(false)
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
  const [selectedTask, setSelectedTask] = useState<GeneratedTask | null>(null)

  function handleEdit(task: GeneratedTask) {
    setSelectedTask(task)
    setEditModalOpen(true)
  }

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
              {(activeSprint && hasToolConfigured) && <PLIconButton icon="ri-check-line" onClick={() => setPullModalOpen(true)}/>}
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
            <PLTable data={backlog} columnsVisible checked={[]}  columns={[{key: 'title', type: 'text'}, {key: 'points', type: 'text', sortable: true}, {key: 'category', type: 'status', sortable: true}]} tableModalName="backlog" actionsAvailable={true} onCheck={onCheck} onRowClick={handleEdit}/>
          </div>
        )
      }
      <PLAddTaskModal open={addModalOpen} setOpen={setAddModalOpen} application_id={application_id} authToken={authToken}/>
      <PLConfirmModal open={deleteModalOpen} setOpen={setDeleteModalOpen} message="Are you sure you want to delete the selected items from your backlog?" onConfirm={submitDeleteRequest}/>
      <PLConfirmModal open={pullModalOpen} setOpen={setPullModalOpen} message="Are you sure you want to pull the selected tasks into the current sprint?" onConfirm={pullTasksIntoSprint} />
      <PLEditTaskModal open={editModalOpen} setOpen={setEditModalOpen} task={selectedTask} authToken={authToken} setTask={setSelectedTask} onSubmit={(tasks) => setBacklog(tasks)}/>
    </div>
  )
}