import { ApplicationBug, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, MetaFunction, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useRef, useState } from "react";
import { account } from "~/backend/cookies/account";
import { ApplicationBugsClient } from "~/backend/database/bugs/client";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLOptionsButtonGroup } from "~/components/buttons/options-button-group";
import { PLTable } from "~/components/common/table";
import { PLAddBugModal } from "~/components/modals/bugs/add-bug";
import { PLEditBugModal } from "~/components/modals/bugs/edit-bug";
import { PLConfirmModal } from "~/components/modals/confirm";
import { TableColumn } from "~/types/base.types";
import { BugGroup, BugPriority, BugSource, BugStatus } from "~/types/database.types";

interface BaseFormData {
  action: 'delete' | 'add' | 'edit' | 'pull',
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

interface BugPullIntoSprintData extends BaseFormData {
  action: 'pull',
  ids: string,
  sprint_id: string
}

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "ProductLamb | Bugs" },
    {
      property: "og:title",
      content: "ProductLamb | Bugs",
    },
  ];
};

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as NewOrEditBugData | DeleteBugData | BugPullIntoSprintData
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

  if (data.action === 'pull') {
    const ids = data.ids.split(',').map(id => parseInt(id))
    const sprintId = parseInt(data.sprint_id)
    if (!sprintId) {
      return json({updateBugs: null})
    }
    const sprint = await dbClient.applicationSprint.findFirst({where: {id: sprintId}})
    if (!sprint) {
      return json({updateBugs: null})
    }
    const baseUrl = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
    
    await fetch(`${baseUrl}/sprints/pull-in/${sprintId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ids, type: 'bugs'})
    })
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
  const activeSprint = await dbClient.applicationSprint.findFirst({ where: { applicationId, status: 'In Progress'}})
  const bugClient = ApplicationBugsClient(dbClient.applicationBug)
  const {data: bugs} = await bugClient.getAllBugs(applicationId)
  const data: Array<ApplicationBug> = bugs ? bugs : []
  return json({bugs: bugs ?? null, activeSprint: activeSprint})

}

export default function BugsPage() {
  const {bugs: loadedBugs, activeSprint} = useLoaderData<typeof loader>() ?? {loadedBugs: [], activeSprint: null}
  const {updateBugs} = useActionData<typeof action>() ?? {updateBugs: null}
  const groups: Array<BugGroup> = Object.values(BugGroup)
  const [bugGroup, setBugGroup] = useState<BugGroup>(BugGroup.ALL)
  const [bugs, setBugs] = useState<Array<ApplicationBug>>(updateBugs ?? loadedBugs)
  const [filterBugs, setFilterBugs] = useState<Array<ApplicationBug>>(bugs)
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
  const [itemsSelected, setItemsSelected] = useState<boolean>(false)
  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false)
  const [pullModalOpen, setPullModalOpen] = useState<boolean>(false)
  const [selectedBug, setSelectedBug] = useState<ApplicationBug | null>(null)
  const [editBugModalOpen, setEditBugModalOpen] = useState<boolean>(false)

  function handleDelete() {
    setDeleteModalOpen(true)
  }

  function onCheck(ids:Array<number>) {
    const itemsChecked = ids.length > 0
    setItemsSelected(itemsChecked)
    setIdsChecked(ids)
  }

  function onEdit(bug: ApplicationBug) {
    setSelectedBug(bug)
    setEditBugModalOpen(true)
  }

  function onEditModalClose() {
    setEditBugModalOpen(false)
    setSelectedBug(null)
  }

  const columns: Array<TableColumn> = [
    {key: "title", type: "text"},
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
  const idsInputRef = useRef<HTMLInputElement>(null)
  const actionInputRef = useRef<HTMLInputElement>(null)
  const sprintIdInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const submitDeleteRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    idsInputRef.current!.value = idsChecked.join(',')
    actionInputRef.current!.value = 'delete'
    formRef.current?.submit()
  }

  const pullBugsIntoSprint = async (e: React.FormEvent<HTMLFormElement>) => {
    idsInputRef.current!.value = idsChecked.join(',')
    actionInputRef.current!.value = 'pull'
    sprintIdInputRef.current!.value = activeSprint?.id.toString() || ''
    formRef.current?.submit()
  }

  return (
    <div className="flex flex-col gap-6 mt-3">
      <div className="w-full flex justify-between items-center">
        <PLOptionsButtonGroup groups={groups} current={bugGroup} handleGroupChange={(group) => handleGroupChange(group as BugGroup)} />
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
      <form method="post" ref={formRef}>
        <input type="hidden" name="ids" ref={idsInputRef}/>
        <input type="hidden" name="action" ref={actionInputRef}/>
        <input type="hidden" name="sprint_id" ref={sprintIdInputRef}/>
      </form>
      <PLTable data={filterBugs} checked={[]} actionsAvailable={true} columns={columns} tableModalName="bugs" onCheck={onCheck} onRowClick={onEdit}/>
      <PLConfirmModal open={deleteModalOpen} setOpen={setDeleteModalOpen} message="Are you sure you want to delete the selected bugs?" onConfirm={submitDeleteRequest}/>
      <PLConfirmModal open={pullModalOpen} setOpen={setPullModalOpen} message="Are you sure you want to pull the selected bugs into the current sprint?" onConfirm={pullBugsIntoSprint} />
      <PLAddBugModal open={addModalOpen} onClose={() => setAddModalOpen(false)} setOpen={setAddModalOpen}/>
      <PLEditBugModal open={editBugModalOpen} onClose={onEditModalClose} setOpen={setEditBugModalOpen} bug={selectedBug} onSubmit={(bugs) => {
        setBugs(bugs)
        setFilterBugs(bugs)
      }} />
    </div>
  )
}