import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ApplicationSprint, ApplicationSuggestion, PrismaClient } from "@prisma/client";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { account } from "~/backend/cookies/account";
import { AccountsClient } from "~/backend/database/accounts/client";
import { ApplicationsClient } from "~/backend/database/applications/client";
import { createCurrentSprintChartsData, createSprintPointsChartData, createSprintTaskCompletionPercentageChartData, createSprintTaskTotalsChartData, createTaskTypeChartData } from "~/backend/mocks/charts";
import { PLAreaChart } from "~/components/charts/area-chart";
import { PLBarChart } from "~/components/charts/bar-chart";
import { PLLineChart } from "~/components/charts/line-chart";
import { calculateTimeLeft } from "~/utils/date";


export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => {    
    const { userId } = request.auth;
    const cookieHeader = request.headers.get("Cookie");
    const accountCookie = (await account.parse(cookieHeader) || {});
    let setupIsComplete: boolean|undefined = accountCookie.setupIsComplete
    let accountId: number| undefined = accountCookie.accountId
    let selectedApplicationId: number| undefined = accountCookie.selectedApplicationId
    let selectedApplicationName: string| undefined = accountCookie.selectedApplicationName
    const dbClient = new PrismaClient()
    if (!userId) {
      return redirect("/")
    }
    if (!accountId || !setupIsComplete) {
      const accountClient = AccountsClient(dbClient.account)
      const user = await dbClient.accountUser.findFirst({ where: { userId: userId }})
      if (!user) return redirect("/portal/setup")
      const accountData = user.accountId ? await dbClient.account.findUnique({ where: { id: user.accountId }}) : null
      
      if (!accountData || !accountData.isSetup) {
        return redirect("/portal/setup")
      } 
      accountCookie.accountId = accountData?.id || undefined
      accountId = accountCookie.accountId
      const applicationClient = ApplicationsClient(dbClient.accountApplication)
      const {data: applications} = await applicationClient.getAccountApplications(accountCookie.accountId || 0)
      accountCookie.setupIsComplete = true
      setupIsComplete = accountCookie.setupIsComplete
      if (selectedApplicationId === undefined && applications && applications.length > 0) {
        accountCookie.selectedApplicationId = applications[0].id
        accountCookie.selectedApplicationName = applications[0].name
        selectedApplicationId = accountCookie.selectedApplicationId
        selectedApplicationName = accountCookie.selectedApplicationName
      }
     
      return redirect("/portal/dashboard", { headers: { "Set-Cookie": await account.serialize(accountCookie) } })
    } else {
      setupIsComplete = true
      accountId = accountCookie.accountId
      
      if (selectedApplicationId === undefined) {
        const applicationClient = ApplicationsClient(dbClient.accountApplication)
        const {data: applications} = await applicationClient.getAccountApplications(accountCookie.accountId || 0)
        if (applications && applications.length > 0) {
          accountCookie.selectedApplicationId = applications[0].id
          selectedApplicationId = accountCookie.selectedApplicationId
          accountCookie.selectedApplicationName = applications[0].name
          selectedApplicationName = accountCookie.selectedApplicationName
        }
      }
      const suggestions = await dbClient.applicationSuggestion.findMany({ where: { applicationId: selectedApplicationId }})
      const sprints = await dbClient.applicationSprint.findMany({ where: { applicationId: selectedApplicationId, status: { in: ['In Progress', 'Completed']}} })
      const tasks = await dbClient.generatedTask.findMany({ where: { sprintId: { in: sprints.map(s => s.id) } }})
      const completedStatuses = ['done', 'complete', 'completed', 'finished']

      const taskTotalsChartData = createSprintTaskTotalsChartData(
        sprints.sort((a,b) => a.id - b.id).map(s => ({name: s.id.toString(), taskCount: tasks.filter(t => t.sprintId === s.id).length}))
      )

      const sprintPointsChartData = createSprintPointsChartData(
        sprints.sort((a,b) => a.id - b.id).map(s => ({name: s.id.toString(), points: tasks.filter(t => t.sprintId === s.id && completedStatuses.includes(t.status.toLowerCase())).reduce((acc, t) => acc + (t.points || 0), 0)}))
      )

      const taskPercentagesChartData = createSprintTaskCompletionPercentageChartData(
        sprints.sort((a,b) => a.id - b.id).map(s => ({name: s.id.toString(), completed: tasks.filter(t => t.sprintId === s.id && completedStatuses.includes(t.status.toLowerCase())).length, total: tasks.filter(t => t.sprintId === s.id).length}))
      )

      const currentSprint = sprints.find(s => s.status === 'In Progress')
      const currentSprintTasksData = currentSprint ? createCurrentSprintChartsData(tasks.filter(t => t.sprintId === currentSprint.id)) : []
      const taskTypesData = createTaskTypeChartData(sprints, tasks)
      const timeLeftInSprint = currentSprint && currentSprint?.endDate ? calculateTimeLeft(new Date().toISOString(), currentSprint.endDate, 'Expired') : null
      const currentSprintSummary = !currentSprint ? null : {total_tasks: tasks.filter(t => t.sprintId === currentSprint.id).length, incomplete_tasks: tasks.filter(t => t.sprintId === currentSprint.id && !completedStatuses.includes(t.status.toLowerCase())  ).length, time_left: timeLeftInSprint}
      return json({ selectedApplicationName, selectedApplicationId, taskTotalsChartData, currentSprintTasksData, taskPercentagesChartData, currentSprintSummary, currentSprint, taskTypesData, suggestions, sprintPointsChartData})
    }
  });
};


export default function DashboardPage() {
  const { taskTotalsChartData, currentSprintTasksData, taskPercentagesChartData, currentSprintSummary, currentSprint: loadedCurrentSprint, taskTypesData, suggestions, sprintPointsChartData } = useLoaderData<{ selectedApplicationName: string| undefined, taskTotalsChartData: any, currentSprintTasksData: any[], sprintPointsChartData: any[], taskPercentagesChartData: any, currentSprintSummary: {incomplete_tasks: number, total_tasks: number, time_left: {type: string, count: number | string} |null} | null, currentSprint: ApplicationSprint|null, taskTypesData: any[], suggestions: ApplicationSuggestion[]}>();
  const [barChartData, setBarChartData] = useState<Array<any>>(currentSprintTasksData || [])
  const [chartData, setChartData] = useState<Array<any>>([(taskTotalsChartData || []), (taskPercentagesChartData || []), (taskTypesData || []), (sprintPointsChartData || [])])
  const [chartIndex, setChartIndex] = useState<number>(0)
  const [currentSprint, setCurrentSprint] = useState<ApplicationSprint|null>(loadedCurrentSprint)
  const yKey = chartIndex == 0 ? "taskCount" : "completed"

  const handleChartChange = (goingForward: boolean) => {
    
    if(chartData === null) return 
    if (goingForward) {
      if (chartIndex == chartData.length - 1) {
        setChartIndex(0)
      } else {
        setChartIndex(chartIndex + 1)
      }
    } else {
      if (chartIndex <= 0) {
        setChartIndex(chartData.length - 1)
      } else {
        setChartIndex(chartIndex - 1)
      }
    }
  }
  const timeLeftTitle = (currentSprintSummary && currentSprintSummary.time_left ? currentSprintSummary.time_left.type : 'time')

  return (
    <div className="flex flex-col items-center gap-5 justify-start">
      <div className="w-full flex flex-col">
        <div className="flex flex-row justify-between w-full items-center">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Sprint Metrics - <span className="italic text-black dark:text-neutral-500">{chartIndex === 1 ? 'Task Completed' : (chartIndex === 0) ? 'Tasks Assigned' : chartIndex === 2 ? 'Task Types' : 'Points Completed'}</span></h2>
          <div className="inline-flex">
            <button 
              className={"text-gray-700 dark:text-gray-500 font-bold py-2 px-2 " + (chartData.length <= 2 || chartIndex == 0 ? "cursor-not-allowed" : "hover:text-gray-400")} 
              onClick={() => handleChartChange(false)}
              disabled={(chartData[chartIndex] <= 1 || chartIndex == 0)}
            >
              <i className="ri ri-arrow-left-s-line"></i>
            </button>
            <button 
              className={"text-gray-700 dark:text-gray-500 font-bold py-2 px-2 " + (chartData.length <= 2 || chartIndex == chartData.length - 1 ? "cursor-not-allowed" : "hover:text-gray-400")}
              onClick={() => handleChartChange(true)}
              disabled={(chartData[chartIndex].length <= 1 || chartIndex == chartData.length - 1)}
            >
              <i className="ri ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
        <div className="rounded-xl w-full h-full bg-white dark:bg-neutral-800 pt-5 pb-3 px-2" style={{height: "325px"}}>
          {(chartIndex < 2 || chartIndex > 2 ) && <PLAreaChart data={chartData[chartIndex]} xKey="name" yKey={yKey} fill={chartIndex === 1 ? "#82ca9d" : "#F28C28"}/>}
          {(chartIndex === 2) && <PLLineChart data={chartData[chartIndex]}/>}
          
        </div>
      </div>
      <div className="flex md:flex-row flex-col justify-evenly w-full sm:gap-10" style={{height: "330px"}}>
        <div className="w-full md:w-1/2 h-full flex flex-col gap-2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Current Sprint - <span className="italic text-black dark:text-neutral-500">{currentSprint ? '#' + currentSprint.id : 'No active sprint'}</span></h2>
          <div className="rounded-xl w-full md:h-1/2 flex flex-row items-center justify-evenly gap-4">
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-2xl dark:text-neutral-400">{currentSprintSummary !== null ? currentSprintSummary.total_tasks : 'N/A'}</h3>
              <p className="text-black text-xs dark:text-gray-500">Total</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-2xl dark:text-neutral-400">{currentSprintSummary !== null ? currentSprintSummary.incomplete_tasks : 'N/A'}</h3>
              <p className="text-black text-xs dark:text-gray-500">Incomplete</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">{timeLeftTitle.charAt(0).toUpperCase() + timeLeftTitle.slice(1)}</p>
              <h3 className="text-black font-bold text-2xl dark:text-neutral-400">{currentSprintSummary && currentSprintSummary.time_left ? currentSprintSummary.time_left.count : 'N/A'}</h3>
              <p className="text-black text-xs dark:text-gray-500">Left</p>
            </div>
          </div>
          <div className="rounded-xl mt-2 bg-white dark:bg-neutral-800 h-15 md:h-full pt-2">
            <PLBarChart data={barChartData}/>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-full flex flex-col gap-2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Suggested Actions</h2>
          <div className="rounded-xl bg-white dark:bg-neutral-800 w-full h-52 md:h-full flex flex-col px-3 justify-evenly">
            {!suggestions.length && <p className='dark:text-neutral-400 text-neutral-600 w-full h-full flex items-center justify-center'>There are no suggestions at this time.</p>}
            {suggestions.map(s => <PLSuggestion suggestion={s} key={s.id}/>)}
          </div>
        </div>
      </div>
    </div>
  )
}

function PLSuggestion({suggestion}: {suggestion: ApplicationSuggestion}) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl w-full py-2 px-2 flex flex-row items-center justify-between border-2 border-neutral-300 dark:border-neutral-500 gap-2">
      <div className="flex flex-row justify-between items-center border-2 dark:border-neutral-500 rounded-full px-2 py-1">
        <i className="ri ri-lightbulb-line text-xl text-yellow-500"></i>
      </div>
      <p className="text-black dark:text-gray-300 italic text-xs w-full text-left">"{suggestion.suggestion}"</p>
    </div>
  )
}