import { PLStatusBadge } from "~/components/common/status-badge"
import { Colors, TableColumn } from "~/types/base.types"
import { useState } from "react"
import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { ActionFunction, LoaderFunction, json } from "@remix-run/node"
import { account } from "~/backend/cookies/account"
import { ApplicationSprint, GeneratedInitiative, GeneratedTask, PrismaClient } from "@prisma/client"
import { ApplicationSprintsClient } from "~/backend/database/sprints/client"
import { PLTable } from "~/components/common/table"
import { ApplicationsClient } from "~/backend/database/applications/client"
import React from "react"
import { PLContentLess } from "~/components/common/contentless"
import { calculateTimeLeft } from "~/utils/date"
import { PLConfirmModal } from "~/components/modals/confirm"
import { PMToolIconComponent } from "~/components/common/pm-tool"

export const loader: LoaderFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = await account.parse(cookies)
  const dbClient = new PrismaClient()
  const sprintsClient = ApplicationSprintsClient(dbClient['applicationSprint'])
  const accountData = await dbClient['account'].findFirst({ where: { id: accountCookie.accountId } })
  const {data: sprints, errors} = await sprintsClient.getApplicationSprints(accountCookie.selectedApplicationId)
  let sprintInitiativeIds: Array<number> = []
  if ( sprints && sprints.length > 0) {
   sprintInitiativeIds = sprints.filter(sprint => sprint.selectedInitiative ).map(sprint => sprint.selectedInitiative!)
  }

  let initiatives: Array<GeneratedInitiative> = []
  if (sprintInitiativeIds.length) {
    initiatives = await dbClient['generatedInitiative'].findMany({
      where: {
        applicationId: accountCookie.selectedApplicationId,
        id: {
          in: sprintInitiativeIds
        }
      }
    })
  }
  const sprintInitiativesMap: Record<number, string> = {}
  const taskMap: Record<number,GeneratedTask[]> = {}
  if (sprints) {
    sprints.forEach(sprint => {
      taskMap[sprint.id] = sprint.GeneratedTask
    })
    sprints.forEach(sprint => {
      sprintInitiativesMap[sprint.id] = sprint.selectedInitiative ? initiatives.find(initiative => initiative.id === sprint.selectedInitiative)?.description || "" : ""
    })
  }
  return json({
    sprints,
    taskMap,
    sprintInitiativesMap,
    timezone: accountData!.timezone
  })
}

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = await account.parse(cookies)
  const accountId = accountCookie.accountId
  const application_id = accountCookie.selectedApplicationId
  const dbClient = new PrismaClient()
  const usersAccount = await dbClient['account'].findUnique({ where: { id: accountId } })
  if (!usersAccount || !application_id) {
    console.error('No account or application found to generate sprints for.')
    return json({})
  } 

  const applicationClient = ApplicationsClient(dbClient.accountApplication)

  await applicationClient.updateApplication(application_id, {sprint_generation_enabled: true})
 
  const url = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
  const response = await fetch(`${url}/sprints/suggest/${application_id}`, { method: 'POST', headers: { 'Authorization': `${process.env.SPRINT_GENERATION_SECRET}` } })
  const sprintsClient = ApplicationSprintsClient(dbClient['applicationSprint'])
  const {data: sprints, errors} = await sprintsClient.getApplicationSprints(accountCookie.selectedApplicationId)
  let sprintInitiativeIds: Array<number> = []
  if ( sprints && sprints.length > 0) {
   sprintInitiativeIds = sprints.filter(sprint => sprint.selectedInitiative ).map(sprint => sprint.selectedInitiative!)
  }

  let initiatives: Array<GeneratedInitiative> = []
  if (sprintInitiativeIds.length) {
    initiatives = await dbClient['generatedInitiative'].findMany({
      where: {
        applicationId: accountCookie.selectedApplicationId,
        id: {
          in: sprintInitiativeIds
        }
      }
    })
  }
  const sprintInitiativesMap: Record<number, string> = {}
  const taskMap: Record<number,GeneratedTask[]> = {}
  if (sprints) {
    sprints.forEach(sprint => {
      taskMap[sprint.id] = sprint.GeneratedTask
    })
    sprints.forEach(sprint => {
      sprintInitiativesMap[sprint.id] = sprint.selectedInitiative ? initiatives.find(initiative => initiative.id === sprint.selectedInitiative)?.description || "" : ""
    })
  }
  return json({
    sprints,
    taskMap,
    sprintInitiativesMap,
  })

}
export default function SprintPage() {
  const {sprints: loadedSprints, taskMap, sprintInitiativesMap, timezone } = useLoaderData<typeof loader>() as {sprints: Array<ApplicationSprint>, taskMap: Record<number, GeneratedTask[]>, sprintInitiativesMap: Record<number, string>, timezone: string}
  const [sprints, setSprints] = useState<Array<ApplicationSprint>>(loadedSprints || [])
  const {pathname} = useLocation()
  const parsedPath = pathname.split('/sprints/')
  const generationPage = parsedPath.length > 1 && parsedPath[1] === 'generation'
  const formRef = React.createRef<HTMLFormElement>()
  function generateFirstSprint() {
    formRef.current?.submit()
  }

  if (generationPage) {
    return (
      <div>
        <Outlet />
      </div>
    )
  }

  if (sprints.length === 0) {
    return (
      <div className="w-full flex flex-col text-black">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Review and monitor key details about ProductLamb generated sprints for your project's</p>
        <PLContentLess itemType="sprint" additionMessage="Click button to start your enable sprint generation and start your first planning session."/>
        <div className="mt-5">
          <PLBasicButton 
            onClick={generateFirstSprint}
            text="Begin Sprint" 
            rounded iconSide="right" 
            icon="ri-circle-line" 
            colorClasses="bg-white dark:bg-neutral-800 dark:text-neutral-100 text-black hover:bg-orange-400 hover:text-white dark:hover:bg-neutral-600" 
            noDefaultDarkModeStyles 
            iconColorClass="text-orange-400 group-hover:text-white dark:group-hover:text-orange-300"
          />
        </div>
        <form ref={formRef} method="POST">
          <input type="hidden" name="generate" value="true"/>
        </form>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Review and monitor key details about ProductLamb generated sprints for your project's</p>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {sprints.sort((a,b) => (new Date(a.startDate!).getTime()) - (new Date(b.startDate!).getTime())).reverse().map((sprint, index) => {
          return <SprintTableRow data={sprint} key={index} tasks={taskMap[sprint.id]} initiative={sprintInitiativesMap[sprint.id]} timezone={timezone} />
        })}
      </div>
    </div>
  )
}


function SprintTableRow({data, tasks: initialTasks, initiative, timezone}: {data: ApplicationSprint, tasks?: GeneratedTask[], initiative?: string, timezone: string }) {
  const [tasks, setTasks] = useState<Array<GeneratedTask>|undefined>(initialTasks)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const isCurrentSprint = data.status === 'In Progress'
  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  const {percentage, percentageWidthClass} = calculatePercentage()
  const [removeItemsModalOpen, setRemoveItemsModalOpen] = useState<boolean>(false)

  const navigate = useNavigate()

  function handleCheck(ids: Array<number>) {
    setIdsChecked(ids)
  }

  async function handleRemovingItems() {
    const response: {tasks: GeneratedTask[]} | null = await fetch('/api/update-sprint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ids: idsChecked,
        sprint_id: data.id,
        action: 'remove'
      })
    }).then(res => res.json()).catch(err => null)

    if (response && response?.tasks) {
      setTasks(response.tasks)
      setIdsChecked([])
    }
  }

  function toggleDetails() {
    setShowDetails(!showDetails)
  }

  function startPlanning() {
    navigate(`/portal/planning/${data.id}`)
  }

  function calculatePercentage() {
    const totalTasks = tasks?.length || 0
    const completedTasks = tasks?.filter(task => ['completed', 'done', 'complete'].includes(task.status.toLowerCase())).length || 0
    const percentage =  Math.round((completedTasks / totalTasks) * 100)
    if (!percentage) return {percentage, percentageWidthClass:'w-0'}
    // if (percentage === 100) return {percentage, percentageWidthClass:'w-full'}
    if (percentage < 10) return {percentage, percentageWidthClass: 'w-1/12 bg-red-400 dark:bg-red-300'}
    if (percentage < 20) return {percentage, percentageWidthClass:'w-2/12 bg-red-400 dark:bg-red-300'}
    if (percentage < 30) return {percentage, percentageWidthClass:'w-3/12 bg-yellow-400 dark:bg-yellow-300'}
    if (percentage < 40) return {percentage, percentageWidthClass:'w-1/3 bg-yellow-400 dark:bg-yellow-300'}
    if (percentage < 50) return {percentage, percentageWidthClass:'w-1/2 bg-yellow-400 dark:bg-yellow-300'}
    if (percentage < 60) return {percentage, percentageWidthClass:'w-7/12 bg-yellow-400 dark:bg-yellow-300'}
    if (percentage < 70) return {percentage, percentageWidthClass:'w-2/3 bg-green-500 dark:bg-green-400'}
    if (percentage < 80) return {percentage, percentageWidthClass:'w-3/4 bg-green-500 dark:bg-green-400'}
    if (percentage < 90) return {percentage, percentageWidthClass:'w-9/10 bg-green-500 dark:bg-green-400'}
    return {percentage, percentageWidthClass:'w-full'}
  }

  
  const columns: Array<TableColumn> = [
    {key: "id", type: "text"},
    {key: "title", type: "text"},
    {key: "description", type: "text"},
    {key: "category", type: "text", sortable: true},
    {key: "status", type: "status", sortable: true},
    {key: "points", type: "text", sortable: true},
  ]

  const timeData = calculateTimeLeft(timezone, data.startDate!, data.endDate!, 'Past Due')
  const timeTitle = timeData.type.charAt(0).toUpperCase() + timeData.type.slice(1)
  const timeLeft = `${timeTitle} left: ${timeData.count}`
  const tool = data?.jira_sprint_id ? 'jira' : data?.clickup_sprint_id ? 'clickup' : data?.notion_sprint_id ? 'notion' : 'none'

  return (
    <div className="w-full p-5 rounded-lg bg-white dark:bg-neutral-800 divide-y-2 flex flex-col gap-5">
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="flex flex-row gap-3 items-center">
            <h3 className="text-black dark:text-white font-semibold">Sprint <span className="text-gray-500">#{data.id}</span></h3>
            <PMToolIconComponent tool={tool} />
          </div>
          <div className="flex flex-row justify-between items-center gap-3">
            <button className={"text-gray-500 dark:text-white font-semibold " + (isCurrentSprint && idsChecked.length ? '' : ' hidden')} onClick={() => setRemoveItemsModalOpen(true)}>
              <i className='ri-eraser-line'></i>
            </button>
            <button className={"text-gray-500 dark:text-white font-semibold " + (data.status === 'Under Construction' ? ' hidden' : '')} onClick={toggleDetails} disabled={data.status === 'Under Construction'}>
              <i className={showDetails ? 'ri-arrow-up-double-fill' : "ri-arrow-down-double-fill"}></i>
            </button>
          </div>
        </div>
        <div className="w-full flex justify-start items-center gap-5">
          {/* Make start date not optional */}
          <p className="italic text-gray-500 dark:text-white"><i className="ri ri-calendar-line"></i> {convertToDateString(data.startDate!)}</p>
          <p className="italic text-gray-500 dark:text-white"><i className="ri-task-line"></i> {tasks?.length ?? 0} tasks</p>
          <PLStatusBadge color={data.is_generating ? Colors.ORANGE : data.status === 'Completed' ? Colors.GREEN : data.status === 'In Progress' ? Colors.BLUE : data.status === 'Under Construction' ? Colors.YELLOW : Colors.RED} text={data.is_generating ? 'Generating' : data.status}/>
          {data.status === 'Under Construction' && !data.is_generating && <PLBasicButton text="Start Planning" onClick={startPlanning} colorClasses="py-[3px] px-[8px] text-xs bg-green-200 dark:bg-green-300 hover:bg-green-300 hover:dark:bg-green-400" icon="ri-tools-line" noDefaultDarkModeStyles/>}
          {data.status === 'In Progress' && <p className="text-black dark:text-white">{timeLeft}</p>}
          {data.status !== 'Under Construction' && (
              <div className="bg-gray-300 rounded-lg w-1/3 h-6 relative">
                <div className={`rounded-lg h-6  ${percentageWidthClass}`}></div>
              </div>
            )
          }
        </div>
      </div>
      <div className={"w-full pt-5 flex flex-col gap-5 " + (showDetails ? '' : 'hidden')}>
        <p className="text-neutral-700 dark:text-neutral-500"><span className="text-black dark:text-neutral-400 font-semibold">Initiative: </span>{initiative && initiative.length ? initiative : 'No initiative selected yet'}</p>
        {tasks && <PLTable actionsAvailable={isCurrentSprint} checked={idsChecked} data={tasks} columns={columns} onCheck={handleCheck}/>}
      </div>
      <PLConfirmModal
        message="Are you sure you want to remove the selected items? They will be moved to your backlog and their statuses will be reset." 
        onConfirm={handleRemovingItems} 
        open={removeItemsModalOpen} 
        setOpen={setRemoveItemsModalOpen}
      />
    </div>
  )
}

function convertToDateString(date_string: string) {
  const date = new Date(date_string)
  return `${date.getMonth() + 1}/${date.getDate() + 1}/${date.getFullYear()}`
}