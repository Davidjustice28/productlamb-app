import { createClerkClient } from "@clerk/remix/api.server"
import { PrismaClient, AccountApplication, Account, AccountUser } from "@prisma/client"
import { LoaderFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { useState } from "react"
import { PLOptionsButtonGroup } from "~/components/buttons/options-button-group"
import { PMToolIconComponent } from "~/components/common/pm-tool"
import { PLTable } from "~/components/common/table"
import { TableColumn } from "~/types/base.types"


enum InternalPortalTabGroup {
  ORGANIZATIONS = "organizations",
  APPLICATIONS = 'applications',
  USERS = "users",
}
export const loader: LoaderFunction = async ({request}) => {
  const dbClient = new PrismaClient()
  const applications = await dbClient.accountApplication.findMany()
  const accounts = await dbClient.account.findMany()
  const users = await dbClient.accountUser.findMany()
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
  const prismaUsers = (await clerkClient.users.getUserList()).data
  const prismaAccounts = (await clerkClient.organizations.getOrganizationList()).data
  const sprints = await dbClient.applicationSprint.findMany({where: {status: { in: ['Completed', 'In Progress']}}})
  const totalSprints = sprints.length
  const toolCounts = sprints.reduce((acc, sprint) => {
    if (sprint?.clickup_sprint_id) {
      return {...acc, clickup: acc.clickup + 1}
    } else if (sprint?.jira_sprint_id) {
      return {...acc, jira: acc.jira + 1}
    } else  {
      return {...acc, notion: acc.notion + 1}
    }
  }, {notion: 0, clickup: 0, jira: 0} as {clickup: number, jira: number, notion: number})
  const mostPopularTool = Object.entries(toolCounts).reduce((acc, [tool, count]) => {
    if (count > acc.count) {
      acc = {tool, count}
    }
    return acc
  }, {tool: 'none', count: 0}).tool

  const tasksCompleted = await dbClient.generatedTask.count({where: {status: { in: ['Done', 'complete', 'completed', 'finished'] }}})
  const data = {
    applications, 
    accounts: accounts.map(account => ({...account, status: account.status === 'active' ? 'Active' : 'Inactive', name: prismaAccounts.find(org => org.id === account.organization_id)?.name || 'N/A'})),
    users: users.map(user => {
      const prismaUser = prismaUsers.find(prismaUser => prismaUser.id === user.userId)
      const hasEmail = prismaUser?.emailAddresses?.length
      const imageUrl = prismaUser?.imageUrl 
      const dateLastActive = prismaUser?.lastActiveAt ?? 0
      return {...user, name: prismaUser?.fullName || 'N/A', email: hasEmail ? prismaUser.emailAddresses[0].emailAddress : 'N/A', imageUrl, dateLastActive}
    }),
    totalSprints,
    mostPopularTool,
    tasksCompleted
  }
  return json(data)

}

export default function InternalPage() {
  const {applications, accounts, users, mostPopularTool, totalSprints, tasksCompleted} = (useLoaderData<typeof loader>() ?? {tasksCompleted: 0, accounts: [], applications: [], users: [], totalSprints: 0, mostPopularTool: 'none'}) as {applications: Array<AccountApplication>, accounts: Array<Account & {name: string}>, users: Array<AccountUser & {name: string}>, totalSprints: number, mostPopularTool: string, tasksCompleted: number}
  const groups: Array<InternalPortalTabGroup> = Object.values(InternalPortalTabGroup)
  const [tabGroup, setTabGroup] = useState<InternalPortalTabGroup>(InternalPortalTabGroup.ORGANIZATIONS)
  const [filteredApplications, setFilterApplications] = useState<Array<AccountApplication>>(applications.sort((a, b) => a.id - b.id))
  const [filteredAccounts, setFilterAccounts] = useState<Array<Account & {name: string}>>(accounts.sort((a, b) => a.id - b.id))
  const [filteredUsers, setFilterUsers] = useState<Array<AccountUser & {name: string}>>(users.sort((a, b) => a.id - b.id))

  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  
  const appColumns: Array<TableColumn> = [
    {key: "id", type: "text", sortable: true},
    {key: "name", type: "text", capitalize: true},
    {key: "sprint_generation_enabled", type: 'status', label: "Generation Enabled", sortable: true},
    {key: "accountId", type: "text", sortable: true, label: "Organization"},
  ]

  const orgColumns: Array<TableColumn> = [
    {key: "id", type: "text", sortable: true},
    {key: "name", type: "text", capitalize: true},
    {key: "status", type: "status", sortable: true},
    {key: "isSetup", type: "status", sortable: true, label: "Setup Completed"},
  ]

  const userColumns: Array<TableColumn> = [
    {key: "id", type: "text", sortable: true},
    {type: 'image', key: 'imageUrl', label: 'Avatar'},
    {key: "name", type: "text", capitalize: true},
    {key: "email", type: "text"},
    {type: 'date', key: 'dateLastActive', label: 'Last Session'},
    {key: "accountId", type: "text", sortable: true, label: "Organization"},

  ]


  function onCheck(ids:Array<number>) {
    const itemsChecked = ids.length > 0
    setIdsChecked(ids)
  }

  function handleGroupChange(group: string) {
    setTabGroup(group as InternalPortalTabGroup)
  }

  return (
    <div className="flex flex-col gap-8 mt-3">
      <div className="rounded-xl w-full md:h-36 flex flex-row items-center justify-evenly gap-16">
        <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
          <p className="text-black text-sm dark:text-gray-500">Sprints</p>
          <h3 className="text-black font-bold text-2xl dark:text-neutral-400">{totalSprints}</h3>
          <p className="text-black text-sm dark:text-gray-500">Managed</p>
        </div>
        <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
          <p className="text-black text-sm dark:text-gray-500">Preferred</p>
          <PMToolIconComponent tool={mostPopularTool as 'clickup' | 'jira' | 'notion' | 'none'} large={true}/>
          <p className="text-black text-sm dark:text-gray-500">Tool</p>
        </div>
        <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
          <p className="text-black text-sm dark:text-gray-500">Tasks</p>
          <h3 className="text-black font-bold text-2xl dark:text-neutral-400">{tasksCompleted}</h3>
          <p className="text-black text-sm dark:text-gray-500">Completed</p>
        </div>
        <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
          <p className="text-black text-sm dark:text-gray-500">Applications</p>
          <h3 className="text-black font-bold text-2xl dark:text-neutral-400">{applications.length}</h3>
          <p className="text-black text-sm dark:text-gray-500">Managed</p>
        </div>
      </div>
      <div className="w-full flex justify-between items-center">
        <PLOptionsButtonGroup groups={groups} current={tabGroup} handleGroupChange={handleGroupChange}/>
      </div>
      { tabGroup === InternalPortalTabGroup.APPLICATIONS && <PLTable data={filteredApplications} checked={[]} actionsAvailable={false} columns={appColumns} tableModalName="applications" onCheck={onCheck}/>}
      { tabGroup === InternalPortalTabGroup.ORGANIZATIONS && <PLTable data={filteredAccounts} checked={[]} actionsAvailable={false} columns={orgColumns} tableModalName="organizations" onCheck={onCheck}/>}
      { tabGroup === InternalPortalTabGroup.USERS && <PLTable data={filteredUsers} checked={[]} actionsAvailable={false} columns={userColumns} tableModalName="users" onCheck={onCheck}/>}
    </div>
  )
}