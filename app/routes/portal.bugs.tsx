import { ApplicationBug, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useRef, useState } from "react";
import { account } from "~/backend/cookies/account";
import { ApplicationBugsClient } from "~/backend/database/bugs/client";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLOptionsButtonGroup } from "~/components/buttons/options-button-group";
import { PLTable } from "~/components/common/table";
import { PLAddBugModal } from "~/components/modals/bugs/add-bug";
import { PLConfirmModal } from "~/components/modals/confirm";
import { TableColumn } from "~/types/base.types";
import { BugGroup, BugPriority, BugSource, BugStatus } from "~/types/database.types";

interface BaseFormData {
  action: 'delete' | 'add' | 'edit',
}
interface NewOrEditBugData extends BaseFormData {
  action: 'add' | 'edit'
  title: string,
  description: string,
  priority: BugPriority,
  source: BugSource
}

interface DeleteBugData extends BaseFormData {
  action: 'delete',
  ids: string
}

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as NewOrEditBugData | DeleteBugData
  const dbClient = new PrismaClient()
  const bugClient = ApplicationBugsClient(dbClient.applicationBug)
  if (data.action === 'add') {
    const {title, source, description, priority} = data
    await bugClient.createBug(applicationId, title, description, source, priority)
    const {data: bugs} = await bugClient.getAllBugs(applicationId)
    return json({updateBugs: bugs ?? null})
  }

  if (data.action === 'delete') {
    const ids = data.ids.split(',').map(id => parseInt(id))
    await bugClient.deleteBugs(applicationId, ids)
    const {data: bugs} = await bugClient.getAllBugs(applicationId)
    return json({updateBugs: bugs ?? null})
  }
  return json({updateBugs: null})
}

export const loader: LoaderFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  const dbClient = new PrismaClient()
  const bugClient = ApplicationBugsClient(dbClient.applicationBug)
  const {data: bugs} = await bugClient.getAllBugs(applicationId)
  const data: Array<ApplicationBug> = bugs ? bugs : []
  return json({bugs: bugs ?? null})

}

export default function BugsPage() {
  const {bugs: loadedBugs} = useLoaderData<typeof loader>() ?? {loadedBugs: []}
  const {updateBugs} = useActionData<typeof action>() ?? {updateBugs: null}
  const groups: Array<BugGroup> = Object.values(BugGroup)
  const [bugGroup, setBugGroup] = useState<BugGroup>(BugGroup.ALL)
  const [bugs, setBugs] = useState<Array<ApplicationBug>>(updateBugs ?? loadedBugs)
  const [filterBugs, setFilterBugs] = useState<Array<ApplicationBug>>(bugs)
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
  const [itemsSelected, setItemsSelected] = useState<boolean>(false)
  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false)

  function handleDelete() {
    setDeleteModalOpen(true)
  }

  function onCheck(ids:Array<number>) {
    const itemsChecked = ids.length > 0
    if(itemsChecked === itemsSelected) return
    setItemsSelected(itemsChecked)
    setIdsChecked(ids)
  }

  const columns: Array<TableColumn> = [
    {key: "description", type: "text"},
    {key: "priority", type: "status", sortable: true},
  ]

  function handleGroupChange(group: BugGroup) {
    if(group === bugGroup) return
    setBugGroup(group)
    if(group === BugGroup.ALL) {
      setFilterBugs(bugs)
    } else {
      switch (group) {
        case BugGroup.HIGH_PRIORITY:
          setFilterBugs(bugs.filter(bug => bug.priority === 'high'))
          break
        default:
          setFilterBugs([])
      }
    }
  }
  const deleteInputRef = useRef<HTMLInputElement>(null)
  const deleteFormRef = useRef<HTMLFormElement>(null)
  const submitDeleteRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    deleteInputRef.current!.value = idsChecked.join(',')
    deleteFormRef.current?.submit()
  }

  return (
    <div className="flex flex-col gap-6 mt-3">
      <div className="w-full flex justify-between items-center">
        <PLOptionsButtonGroup groups={groups} current={bugGroup} handleGroupChange={(group) => handleGroupChange(group as BugGroup)} />
        <div className="flex gap-2">
          {itemsSelected && <PLIconButton icon="ri-delete-bin-line" onClick={handleDelete}/>}
          <PLIconButton icon="ri-add-line" onClick={() => setAddModalOpen(true)} />
        </div>
      </div>
      <form method="post" ref={deleteFormRef}>
        <input type="hidden" name="ids" ref={deleteInputRef}/>
        <input type="hidden" name="action" value="delete"/>
      </form>
      <PLTable data={filterBugs} checked={[]} actionsAvailable={true} columns={columns} tableModalName="bugs" onCheck={onCheck}/>
      <PLConfirmModal open={deleteModalOpen} setOpen={setDeleteModalOpen} message="Are you sure you want to delete the selected bugs?" onConfirm={submitDeleteRequest}/>
      <PLAddBugModal open={addModalOpen} onClose={() => setAddModalOpen(false)} setOpen={setAddModalOpen}/>
    </div>
  )
}