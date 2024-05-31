import { PLStatusBadge } from "~/components/common/status-badge"
import { Colors } from "~/types/base.types"
import { useState } from "react"
import { Sprint, mockSprints } from "~/backend/mocks/sprints"
import { PLIconButton } from "~/components/buttons/icon-button"
import { Outlet, useLoaderData, useLocation } from "@remix-run/react"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node"
import { account } from "~/backend/cookies/account"
import { ApplicationCodeRepositoryInfo, ApplicationSprint, PrismaClient } from "@prisma/client"
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
  const taskCountMap: Record<number,number> = {}
  if (sprints) {
    sprints.forEach(sprint => {
      taskCountMap[sprint.id] = sprint.generatedTasks.length
    })
  }
  return json({
    sprints,
    taskCountMap,
    repositories
  })
}
export default function SprintPage() {
  const {sprints: loadedSprints, taskCountMap, repositories } = useLoaderData<typeof loader>() as {sprints: Array<ApplicationSprint>, taskCountMap: Record<number, number>, repositories: Array<ApplicationCodeRepositoryInfo>}
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
          return <SprintTableRow data={sprint} key={index} repoPlatform={index % 2 === 0 ? 'github' : 'gitlab'} taskCount={taskCountMap[sprint.id]} repositories={repositories}/>
        })}
      </div>
    </div>
  )
}


function SprintTableRow({data, repoPlatform, taskCount, repositories, initiative}: {data: ApplicationSprint, repoPlatform: 'github' | 'gitlab', taskCount: number, repositories: Array<ApplicationCodeRepositoryInfo>, initiative?: string}) {
  const [showDetails, setShowDetails] = useState<boolean>(false)

  function toggleDetails() {
    setShowDetails(!showDetails)
  }

  return (
    <div className="w-full p-5 rounded-lg bg-white dark:bg-neutral-800 divide-y-2 flex flex-col gap-5">
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex flex-row justify-between items-center">
          <h3 className="text-black dark:text-white font-semibold">Sprint <span className="text-gray-500">#{data.id}</span></h3>
          <button className="text-gray-500 dark:text-white font-semibold" onClick={toggleDetails}>
            <i className={showDetails ? 'ri-arrow-up-double-fill' : "ri-arrow-down-double-fill"}></i>
          </button>
        </div>
        <div className="w-full flex justify-start items-center gap-5">
          <p className="italic text-gray-500 dark:text-white"><i className="ri ri-calendar-line"></i> 14 Dec 2022</p>
          <p className="italic text-gray-500 dark:text-white"><i className="ri-task-line"></i> {taskCount} tasks</p>
          <button>
            <span className="italic text-gray-500 dark:text-white"><i className="ri ri-survey-line"></i> l9879709789-7</span>
          </button>
          <RepositoriesList repositories={repositories}/>
          <PLStatusBadge color={data.status === 'Completed' ? Colors.GREEN : data.status === 'In Progress' ? Colors.BLUE : data.status === 'Under Construction' ? Colors.YELLOW : Colors.RED} text={data.status}/>
        </div>
      </div>
      <div className={"w-full pt-5 " + (showDetails ? '' : 'hidden')}>
        <p className="text-neutral-700 dark:text-neutral-500"><span className="text-black dark:text-neutral-400 font-semibold">Initiative: </span>{initiative ?? 'No initiative selected yet'}</p>
      </div>
    </div>
  )
}

function RepositoriesList({repositories}: {repositories: Array<ApplicationCodeRepositoryInfo>}) {
  console.log(repositories)
  return (
    <div className="flex flex-row gap-2 text-black dark:text-white">
      {repositories.slice(0,3).map((repo, index) => {
        return <button><i className={repo.platform === 'Github' ? "ri-github-fill" : 'ri-gitlab-fill'}></i></button>
      })}
      {repositories.length > 3 && <p className="text-black dark:text-white">+{repositories.length - 3} more</p>}
    </div>
  )
}