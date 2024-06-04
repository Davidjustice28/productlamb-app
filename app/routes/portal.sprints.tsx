import { PLStatusBadge } from "~/components/common/status-badge"
import { Colors } from "~/types/base.types"
import { useState } from "react"
import { Sprint, mockSprints } from "~/backend/mocks/sprints"
import { PLIconButton } from "~/components/buttons/icon-button"
import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node"
import { account } from "~/backend/cookies/account"
import { ApplicationCodeRepositoryInfo, ApplicationSprint, GeneratedInitiative, PrismaClient } from "@prisma/client"
import { ApplicationSprintsClient } from "~/backend/database/sprints/client"
import { CodeRepositoryInfoClient } from "~/backend/database/code-repository-info/client"

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
  const taskCountMap: Record<number,number> = {}
  if (sprints) {
    sprints.forEach(sprint => {
      taskCountMap[sprint.id] = sprint.generatedTasks.length
    })
    sprints.forEach(sprint => {
      sprintInitiativesMap[sprint.id] = sprint.selectedInitiative ? initiatives.find(initiative => initiative.id === sprint.selectedInitiative)?.description || "" : ""
    })
  }
  return json({
    sprints,
    taskCountMap,
    repositories,
    sprintInitiativesMap
  })
}
export default function SprintPage() {
  const {sprints: loadedSprints, taskCountMap, repositories, sprintInitiativesMap } = useLoaderData<typeof loader>() as {sprints: Array<ApplicationSprint>, taskCountMap: Record<number, number>, repositories: Array<ApplicationCodeRepositoryInfo>, sprintInitiativesMap: Record<number, string>}
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
  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Review and monitor key details about ProductLamb generated sprints for your project's</p>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {sprints.map((sprint, index) => {
          return <SprintTableRow data={sprint} key={index} repoPlatform={index % 2 === 0 ? 'github' : 'gitlab'} taskCount={taskCountMap[sprint.id]} repositories={repositories} initiative={sprintInitiativesMap[sprint.id]}/>
        })}
      </div>
    </div>
  )
}


function SprintTableRow({data, repoPlatform, taskCount, repositories, initiative}: {data: ApplicationSprint, repoPlatform: 'github' | 'gitlab', taskCount: number, repositories: Array<ApplicationCodeRepositoryInfo>, initiative?: string}) {
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const navigate = useNavigate()
  function toggleDetails() {
    setShowDetails(!showDetails)
  }

  function startPlanning() {
    navigate(`/portal/planning/${data.id}`)
  }

  return (
    <div className="w-full p-5 rounded-lg bg-white dark:bg-neutral-800 divide-y-2 flex flex-col gap-5">
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex flex-row justify-between items-center">
          <h3 className="text-black dark:text-white font-semibold">Sprint <span className="text-gray-500">#{data.id}</span></h3>
          <button className={"text-gray-500 dark:text-white font-semibold " + (data.status === 'Under Construction' ? ' text-neutral-300' : '')} onClick={toggleDetails} disabled={data.status === 'Under Construction'}>
            <i className={showDetails ? 'ri-arrow-up-double-fill' : "ri-arrow-down-double-fill"}></i>
          </button>
        </div>
        <div className="w-full flex justify-start items-center gap-5">
          {/* Make start date not optional */}
          <p className="italic text-gray-500 dark:text-white"><i className="ri ri-calendar-line"></i> {convertToDateString(data.startDate!)}</p>
          <p className="italic text-gray-500 dark:text-white"><i className="ri-task-line"></i> {taskCount} tasks</p>
          <RepositoriesList repositories={repositories}/>
          <PLStatusBadge color={data.status === 'Completed' ? Colors.GREEN : data.status === 'In Progress' ? Colors.BLUE : data.status === 'Under Construction' ? Colors.YELLOW : Colors.RED} text={data.status}/>
          {data.status === 'Under Construction' && <PLBasicButton text="Start Planning" onClick={startPlanning} colorClasses="py-[3px] px-[8px] text-xs"/>}
        </div>
      </div>
      <div className={"w-full pt-5 " + (showDetails ? '' : 'hidden')}>
        <p className="text-neutral-700 dark:text-neutral-500"><span className="text-black dark:text-neutral-400 font-semibold">Initiative: </span>{initiative && initiative.length ? initiative : 'No initiative selected yet'}</p>
      </div>
    </div>
  )
}

function RepositoriesList({repositories}: {repositories: Array<ApplicationCodeRepositoryInfo>}) {
 const getRepoLink = (repo: ApplicationCodeRepositoryInfo) => {
    if (repo.platform === 'Github') {
      return `https://github.com/${repo.repositoryOwner}/${repo.repositoryName}`
    } else {
      return `https://gitlab.com/${repo.repositoryOwner}/${repo.repositoryName}`
    }
  }
  return (
    <div className="flex flex-row gap-2 text-black dark:text-white">
      {repositories.slice(0,3).map((repo, index) => {
        return <a href={getRepoLink(repo)}><button key={index}><i className={repo.platform === 'Github' ? "ri-github-fill" : 'ri-gitlab-fill'}></i></button></a>
      })}
      {repositories.length > 3 && <p className="text-black dark:text-white">+{repositories.length - 3} more</p>}
    </div>
  )
}

function convertToDateString(date_string: string) {
  const date = new Date(date_string)
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
}