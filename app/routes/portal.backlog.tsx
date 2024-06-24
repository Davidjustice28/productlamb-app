import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { GeneratedTask, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { account } from "~/backend/cookies/account";
import { GeneratedTasksClient } from "~/backend/database/tasks/client";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLContentLess } from "~/components/common/contentless";
import { PLTable } from "~/components/common/table";
import { PLConfirmModal } from "~/components/modals/confirm";
import { PLAddTaskModal } from "~/components/modals/tasks/add-task-modal";
import { ManualTaskData } from "~/types/component.types";

interface BaseFormData<T='delete' | 'add' | 'edit'> {
  action: T,
}
type NewBackLogItemData = BaseFormData<'add'> & ManualTaskData

interface DeleteBugData extends BaseFormData {
  action: 'delete',
  ids: string
}

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as NewBackLogItemData | DeleteBugData
  const dbClient = new PrismaClient()

  if (data.action === 'add') {
    const {title, reason, description, category} = data
    await dbClient.generatedTask.create({data: {title, description, reason, category, applicationId, backlog: true, status: 'to do'}})
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

  return json({updatedTasks: null})
}


export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => { 
    const cookieHeader = request.headers.get("Cookie");
    const accountCookie = (await account.parse(cookieHeader) || {});
    let selectedApplicationId: number = accountCookie.selectedApplicationId
    const taskDbClient = new PrismaClient().generatedTask
    const backlog = await taskDbClient.findMany({where: {applicationId: selectedApplicationId, backlog: true}})
    return json({backlog})
  })
}

export default function BacklogPage() {
  const { backlog: loadedBacklog } = useLoaderData() as {backlog: GeneratedTask[]}
  const { updatedTasks } = useActionData<typeof action>() ?? {updatedTasks: null}
  const [backlog, setBacklog] = useState<GeneratedTask[]>(updatedTasks ?? loadedBacklog ?? [])
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
  const [itemsSelected, setItemsSelected] = useState<boolean>(false)
  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false)

  function handleDelete() {
    setDeleteModalOpen(true)
  }

  function onCheck(ids:Array<number>) {
    const itemsChecked = ids.length > 0
    setItemsSelected(itemsChecked)
    setIdsChecked(ids)
  }

  const deleteInputRef = useRef<HTMLInputElement>(null)
  const deleteFormRef = useRef<HTMLFormElement>(null)

  const submitDeleteRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    deleteInputRef.current!.value = idsChecked.join(',')
    deleteFormRef.current?.submit()
  }
  
  return (
    <div className="w-full flex flex-col text-black">
      <div className="w-full flex justify-between items-center">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Review and edit your backlog of tasks</p>
        <div className="flex gap-2">
          {itemsSelected && <PLIconButton icon="ri-delete-bin-line" onClick={handleDelete}/>}
          <PLIconButton icon="ri-add-line" onClick={() => setAddModalOpen(true)} />
        </div>
      </div>
      {
        backlog.length === 0 && <PLContentLess itemType="backlog"/>
      }
      {
        backlog.length > 0 && (
          <div className="mt-5"> 
            <form method="post" ref={deleteFormRef}>
              <input type="hidden" name="ids" ref={deleteInputRef}/>
              <input type="hidden" name="action" value="delete"/>
            </form>
            <PLTable data={backlog} columnsVisible checked={[]}  columns={[{key: 'title', type: 'text'}, {key: 'points', type: 'text'}, {key: 'category', type: 'status'}]} tableModalName="backlog" actionsAvailable={true} onCheck={onCheck}/>
          </div>
        )
      }
      <PLAddTaskModal open={addModalOpen} setOpen={setAddModalOpen}/>
      <PLConfirmModal open={deleteModalOpen} setOpen={setDeleteModalOpen} message="Are you sure you want to delete the selected items from your backlog?" onConfirm={submitDeleteRequest}/>
    </div>
  )
}