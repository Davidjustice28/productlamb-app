import { PLStatusBadge } from "~/components/common/status-badge"
import { Colors, TableColumn } from "~/types/base.types"
import { useState } from "react"
import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { ActionFunction, LoaderFunction, json } from "@remix-run/node"
import { account } from "~/backend/cookies/account"
import { ApplicationCodeRepositoryInfo, ApplicationSprint, GeneratedInitiative, GeneratedTask, PrismaClient } from "@prisma/client"
import { ApplicationSprintsClient } from "~/backend/database/sprints/client"
import { CodeRepositoryInfoClient } from "~/backend/database/code-repository-info/client"
import { PLTable } from "~/components/common/table"
import { ApplicationsClient } from "~/backend/database/applications/client"

export const loader: LoaderFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = await account.parse(cookies)
  const dbClient = new PrismaClient()
  const sprintsClient = ApplicationSprintsClient(dbClient['applicationSprint'])
  const codeRepositoryClient = CodeRepositoryInfoClient(dbClient['applicationCodeRepositoryInfo'])
  const {data: sprints, errors} = await sprintsClient.getApplicationSprints(accountCookie.selectedApplicationId)
  const {data: repositories} = await codeRepositoryClient.getAllApplicationRepositories(accountCookie.selectedApplicationId)
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
      taskMap[sprint.id] = sprint.generatedTasks
    })
    sprints.forEach(sprint => {
      sprintInitiativesMap[sprint.id] = sprint.selectedInitiative ? initiatives.find(initiative => initiative.id === sprint.selectedInitiative)?.description || "" : ""
    })
  }
  return json({
    sprints,
    taskMap,
    repositories,
    sprintInitiativesMap
  })
}

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = await account.parse(cookies)
  const accountId = accountCookie.accountId
  const application_id = accountCookie.selectedApplicationId
  const dbClient = new PrismaClient()
  const usersAccount = await dbClient['account'].findUnique({ where: { id: accountId } })
  if (!usersAccount || application_id) {
    return json({})
  } 

  const applicationClient = ApplicationsClient(dbClient.accountApplication)

  await applicationClient.updateApplication(application_id, {sprint_generation_enabled: true})
  const url = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
  const response = await fetch(`${url}/sprints/suggest/${application_id}`, { method: 'POST', headers: { 'Authorization': `${process.env.SPRINT_GENERATION_SECRET}` } })
  const sprintsClient = ApplicationSprintsClient(dbClient['applicationSprint'])
  const codeRepositoryClient = CodeRepositoryInfoClient(dbClient['applicationCodeRepositoryInfo'])
  const {data: sprints, errors} = await sprintsClient.getApplicationSprints(accountCookie.selectedApplicationId)
  const {data: repositories} = await codeRepositoryClient.getAllApplicationRepositories(accountCookie.selectedApplicationId)
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
      taskMap[sprint.id] = sprint.generatedTasks
    })
    sprints.forEach(sprint => {
      sprintInitiativesMap[sprint.id] = sprint.selectedInitiative ? initiatives.find(initiative => initiative.id === sprint.selectedInitiative)?.description || "" : ""
    })
  }
  return json({
    sprints,
    taskMap,
    repositories,
    sprintInitiativesMap
  })

}
export default function SprintPage() {
  const {sprints: loadedSprints, taskMap, repositories, sprintInitiativesMap } = useLoaderData<typeof loader>() as {sprints: Array<ApplicationSprint>, taskMap: Record<number, GeneratedTask[]>, repositories: Array<ApplicationCodeRepositoryInfo>, sprintInitiativesMap: Record<number, string>}
  const [sprints, setSprints] = useState<Array<ApplicationSprint>>(loadedSprints || [])
  const {pathname} = useLocation()
  const parsedPath = pathname.split('/sprints/')
  const generationPage = parsedPath.length > 1 && parsedPath[1] === 'generation'

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
        <p className="font-sm italic text-red-400  mt-5 mb-5">No sprints have been generated yet. Click button to start your first sprint planning session.</p>
        <div>
        <PLBasicButton text="Begin Sprint" rounded iconSide="right" icon="ri-circle-line" colorClasses="bg-white dark:bg-neutral-800 dark:text-neutral-100 text-black hover:bg-orange-400 hover:text-white dark:hover:bg-neutral-600" noDefaultDarkModeStyles iconColorClass="text-orange-400 group-hover:text-white dark:group-hover:text-orange-300"/>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Review and monitor key details about ProductLamb generated sprints for your project's</p>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {sprints.sort((a,b) => a.id - b.id).reverse().map((sprint, index) => {
          return <SprintTableRow data={sprint} key={index} repoPlatform={index % 2 === 0 ? 'github' : 'gitlab'} tasks={taskMap[sprint.id]} repositories={repositories} initiative={sprintInitiativesMap[sprint.id]}/>
        })}
      </div>
    </div>
  )
}


function SprintTableRow({data, repoPlatform, tasks, repositories, initiative}: {data: ApplicationSprint, repoPlatform: 'github' | 'gitlab', tasks?: GeneratedTask[], repositories: Array<ApplicationCodeRepositoryInfo>, initiative?: string}) {
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const navigate = useNavigate()
  function toggleDetails() {
    setShowDetails(!showDetails)
  }

  function startPlanning() {
    navigate(`/portal/planning/${data.id}`)
  }

  function calculateDaysLeft() {
    if (!data.startDate || !data.endDate) {
      return 'N/A'
    }
    const startDate = new Date(data.startDate!)
    const endDate = new Date(data.endDate!)
    const today = new Date()
    const daysLeft = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return `${daysLeft}`
  }
  
  const columns: Array<TableColumn> = [
    {key: "category", type: "text"},
    {key: "title", type: "text"},
    {key: "description", type: "text"},
    {key: "status", type: "status", sortable: true},
    {key: "points", type: "text", sortable: true},
  ]

  return (
    <div className="w-full p-5 rounded-lg bg-white dark:bg-neutral-800 divide-y-2 flex flex-col gap-5">
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex flex-row justify-between items-center">
          <h3 className="text-black dark:text-white font-semibold">Sprint <span className="text-gray-500">#{data.id}</span></h3>
          <button className={"text-gray-500 dark:text-white font-semibold " + (data.status === 'Under Construction' ? ' hidden' : '')} onClick={toggleDetails} disabled={data.status === 'Under Construction'}>
            <i className={showDetails ? 'ri-arrow-up-double-fill' : "ri-arrow-down-double-fill"}></i>
          </button>
        </div>
        <div className="w-full flex justify-start items-center gap-5">
          {/* Make start date not optional */}
          <p className="italic text-gray-500 dark:text-white"><i className="ri ri-calendar-line"></i> {convertToDateString(data.startDate!)}</p>
          <p className="italic text-gray-500 dark:text-white"><i className="ri-task-line"></i> {tasks?.length ?? 0} tasks</p>
          <RepositoriesList repositories={repositories}/>
          <PLStatusBadge color={data.status === 'Completed' ? Colors.GREEN : data.status === 'In Progress' ? Colors.BLUE : data.status === 'Under Construction' ? Colors.YELLOW : Colors.RED} text={data.status}/>
          {data.status === 'Under Construction' && <PLBasicButton text="Start Planning" onClick={startPlanning} colorClasses="py-[3px] px-[8px] text-xs bg-green-200 dark:bg-green-300 hover:bg-green-300 dark:hover:bg-green-400" icon="ri-tools-line" noDefaultDarkModeStyles/>}
          {data.status === 'In Progress' && <p className="text-black dark:text-white">Days left: {calculateDaysLeft()}</p>}
        </div>
      </div>
      <div className={"w-full pt-5 flex flex-col gap-5 " + (showDetails ? '' : 'hidden')}>
        <p className="text-neutral-700 dark:text-neutral-500"><span className="text-black dark:text-neutral-400 font-semibold">Initiative: </span>{initiative && initiative.length ? initiative : 'No initiative selected yet'}</p>
        {tasks && <PLTable actionsAvailable={false} checked={[]} data={tasks} columns={columns}/>}
      </div>
    </div>
  )
}

function RepositoriesList({repositories}: {repositories: Array<ApplicationCodeRepositoryInfo>}) {
 const getRepoLink = (repo: ApplicationCodeRepositoryInfo) => {
    if (repo.platform === 'github') {
      return `https://github.com/${repo.repositoryOwner}/${repo.repositoryName}`
    } else {
      return `https://gitlab.com/${repo.repositoryOwner}/${repo.repositoryName}`
    }
  }
  return (
    <div className="flex flex-row gap-2 text-black dark:text-white">
      {repositories.slice(0,3).map((repo, index) => {
        return (
          <div className="relative group">
            <p className="text-black dark:text-white text-xs absolute bottom-8 border-2 rounded-md p-2 border-neutral-700 dark:border-neutral-300 invisible group-hover:visible">{getRepoLink(repo)}</p>
            <a target="_blank" href={getRepoLink(repo)}><button key={index}><i className={repo.platform === 'github' ? "ri-github-fill" : 'ri-gitlab-fill'}></i></button></a>
          </div>
        )
      })}
      {repositories.length > 3 && <p className="text-black dark:text-white">+{repositories.length - 3} more</p>}
    </div>
  )
}

function convertToDateString(date_string: string) {
  const date = new Date(date_string)
  return `${date.getMonth() + 1}/${date.getDate() + 1}/${date.getFullYear()}`
}