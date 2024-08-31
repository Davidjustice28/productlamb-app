import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ApplicationSprint, ApplicationSuggestion } from "@prisma/client";
import { LoaderFunction, MetaFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { account } from "~/backend/cookies/account";
import { ApplicationsClient } from "~/backend/database/applications/client";
import { createCurrentSprintChartsData, createSprintPointsChartData, createSprintTaskCompletionPercentageChartData, createSprintTaskTotalsChartData, createTaskTypeChartData } from "~/backend/mocks/charts";
import { PLBarChart } from "~/components/charts/bar-chart";
import { PLRoadmapItemModal } from "~/components/modals/roadmaps/roadmap-view";
import { DB_CLIENT } from "~/services/prismaClient";
import { RoadmapItem } from "~/types/database.types";
import { calculateTimeLeft } from "~/utils/date";


const productLambRoadMap: RoadmapItem[] = [
  {id: 0, roadmap_id: 0, order: 0, initiative: "Increase AI manager's capabilites and improve onboarding experience", start_date: "2024-09-01T00:00:00.000Z", end_date: "2024-09-30T00:00:00.000Z", description: 'The goal of this phase is to expand the abilities of AI managers and what they can automate. Some of the features include: creating multiple types of documents, scanning codebase for context, & managing roadmaps.'},
  {id: 1, roadmap_id: 0, order: 1, initiative: "Expand supported third-party integrations & task management tools", start_date: "2024-10-01T00:00:00.000Z", end_date: "2024-10-31T00:00:00.000Z", description: 'The goal of this phase is to expand the number of third-party integrations and task management tools that can be used with ProductLamb. Integrations to be added include: Trello, Plausible, Google Drive, Excel, and more.'},
  {id: 2, roadmap_id: 0, order: 2, initiative: "Improve platform performance, reliability, and available analytics", start_date: "2024-11-01T00:00:00.000Z", end_date: "2024-11-30T00:00:00.000Z", description: 'Now that we have a solid user base, we will focus on improving the performance and reliability of the platform. We will also add more analytics to help users understand how they are using the platform.'},
]

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "ProductLamb | Dashboard" },
    {
      property: "og:title",
      content: "ProductLamb | Dashboard",
    },
  ];
};

export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => {    
    const { userId } = request.auth;
    const cookieHeader = request.headers.get("Cookie");
    const accountCookie = (await account.parse(cookieHeader) || {});
    let setupIsComplete: boolean|undefined = accountCookie.setupIsComplete
    let accountId: number| undefined = accountCookie.accountId
    let selectedApplicationId: number| undefined = accountCookie.selectedApplicationId
    let selectedApplicationName: string| undefined = accountCookie.selectedApplicationName
    if (!userId) {
      return redirect("/")
    }
    if (!accountId || !setupIsComplete) {
      const user = await DB_CLIENT.accountUser.findFirst({ where: { userId: userId }})
      if (!user) return redirect("/portal/setup")
      const accountData = user.accountId ? await DB_CLIENT.account.findUnique({ where: { id: user.accountId }}) : null
      
      if (!accountData || !accountData.isSetup) {
        return redirect("/portal/setup")
      } 
      accountCookie.accountId = accountData?.id || undefined
      accountId = accountCookie.accountId
      const applicationClient = ApplicationsClient(DB_CLIENT.accountApplication)
      const {data: applications} = await applicationClient.getAccountApplications(accountCookie.accountId || 0)
      accountCookie.setupIsComplete = true
      setupIsComplete = accountCookie.setupIsComplete
      if (selectedApplicationId === undefined && applications && applications.length > 0) {
        const id = accountData?.default_application_id !== null && applications.find(a => a.id === accountData?.default_application_id) ? accountData?.default_application_id : applications[0].id
        const selectedApp = applications.find(a => a.id === id)!
        if (selectedApp) {
          accountCookie.selectedApplicationId = selectedApp.id
          accountCookie.selectedApplicationName = selectedApp.name
          selectedApplicationId = accountCookie.selectedApplicationId
          selectedApplicationName = accountCookie.selectedApplicationName
        }
      }
      return redirect("/portal/dashboard", { headers: { "Set-Cookie": await account.serialize(accountCookie) } })
    } else {
      setupIsComplete = true
      accountId = accountCookie.accountId
      const account = await DB_CLIENT.account.findFirst({ where: { id: accountId }})
      
      if (selectedApplicationId === undefined) {

        const applicationClient = ApplicationsClient(DB_CLIENT.accountApplication)
        const {data: applications} = await applicationClient.getAccountApplications(accountCookie.accountId || 0)
        if (applications && applications.length > 0) {
          const selectedApp = applications.find(a => a.id === (account?.default_application_id !== null && applications.find(a => a.id === account?.default_application_id) ? account?.default_application_id : applications[0].id))!
          accountCookie.selectedApplicationId = selectedApp.id
          selectedApplicationId = accountCookie.selectedApplicationId
          accountCookie.selectedApplicationName = selectedApp.name
          selectedApplicationName = accountCookie.selectedApplicationName
        }
      }
      const suggestions = await DB_CLIENT.applicationSuggestion.findMany({ where: { applicationId: selectedApplicationId }})
      const sprints = (await DB_CLIENT.applicationSprint.findMany({
        where: {
          applicationId: selectedApplicationId,
          status: { in: ['In Progress', 'Completed'] }
        },
        orderBy: {
          startDate: 'desc'
        },
        take: 8
      })).sort((a,b) => (new Date(a.startDate!).getTime()) - (new Date(b.startDate!).getTime()))
      const tasks = await DB_CLIENT.generatedTask.findMany({ where: { sprintId: { in: sprints.map(s => s.id) } }})
      const completedStatuses = ['done', 'complete', 'completed', 'finished']

      const taskTotalsChartData = createSprintTaskTotalsChartData(
        sprints.filter(s => s.status !== 'In Progress').map(s => ({name: s.id.toString(), taskCount: tasks.filter(t => t.sprintId === s.id).length}))
      )

      const sprintPointsChartData = createSprintPointsChartData(
        sprints.filter(s => s.status !== 'In Progress').map(s => ({name: s.id.toString(), points: tasks.filter(t => t.sprintId === s.id && completedStatuses.includes(t.status.toLowerCase())).reduce((acc, t) => acc + (t.points || 0), 0)}))
      )

      const taskPercentagesChartData = createSprintTaskCompletionPercentageChartData(
        sprints.filter(s => s.status !== 'In Progress').map(s => ({name: s.id.toString(), completed: tasks.filter(t => t.sprintId === s.id && completedStatuses.includes(t.status.toLowerCase())).length, total: tasks.filter(t => t.sprintId === s.id).length}))
      )

      const currentSprint = sprints.find(s => s.status === 'In Progress')
      const currentSprintTasksData = currentSprint ? createCurrentSprintChartsData(tasks.filter(t => t.sprintId === currentSprint.id)) : []
      const taskTypesData = createTaskTypeChartData(sprints.filter(s => s.status !== 'In Progress'), tasks)
      const timeLeftInSprint = currentSprint && currentSprint?.endDate ? calculateTimeLeft(account!.timezone, undefined, currentSprint.endDate, 'Expired') : null
      const currentSprintSummary = !currentSprint ? null : {total_tasks: tasks.filter(t => t.sprintId === currentSprint.id).length, incomplete_tasks: tasks.filter(t => t.sprintId === currentSprint.id && !completedStatuses.includes(t.status.toLowerCase())  ).length, time_left: timeLeftInSprint}
      return json({ selectedApplicationName, selectedApplicationId, taskTotalsChartData, currentSprintTasksData, taskPercentagesChartData, currentSprintSummary, currentSprint, taskTypesData, suggestions, sprintPointsChartData})
    }
  });
};


export default function DashboardPage() {
  const { currentSprintSummary, currentSprint: loadedCurrentSprint, suggestions, currentSprintTasksData } = useLoaderData<{ currentSprintTasksData: any[], selectedApplicationName: string| undefined, currentSprintSummary: {incomplete_tasks: number, total_tasks: number, time_left: {type: string, count: number | string} |null} | null, currentSprint: ApplicationSprint|null, suggestions: ApplicationSuggestion[]}>();
  const [barChartData, setBarChartData] = useState<Array<any>>(currentSprintTasksData || [])
  const [currentSprint, setCurrentSprint] = useState<ApplicationSprint|null>(loadedCurrentSprint)
  const [roadMapModalOpen, setRoadMapModalOpen] = useState(false)
  const [selectedRoadMapItem, setSelectedRoadMapItem] = useState<RoadmapItem|null>(null)
  const timeLeftTitle = (currentSprintSummary && currentSprintSummary.time_left ? currentSprintSummary.time_left.type : 'time')
  // list of features and date ranges for feature/development to take place. dates are iso strings
  
  return (
    <div className="flex flex-col items-center gap-5 justify-start h-[95%]">
      <div className="flex flex-row gap-8 w-full h-[40%]">
        <div className="h-full flex flex-col justify-evenly gap-2 w-1/2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Application Overview</h2>
          <div className="h-full flex flex-row items-center justify-evenly gap-8 w-full">
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 w-1/2 rounded-md"></div>
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 w-1/2 rounded-md"></div>
          </div>
        </div>
        <div className="h-full flex flex-col justify-evenly gap-2 w-1/2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">ProductLamb Roadmap</h2>
          {/* TODO: Eventually this will be a feature for customers to display roadmap for an application. Items will be clickable with a popup modal with a more descriptive understanding of what is coming */}
          <div className="flex flex-col items-center h-full bg-white dark:bg-neutral-800 w-full rounded-md p-3 justify-evenly gap-2">
            {productLambRoadMap.map((r, i) => {
              const handleClick = () => {
                setSelectedRoadMapItem(r)
                setRoadMapModalOpen(true)
              }
              return (
                <div key={i} className="hover:-translate-y-1 hover:shadow-orange-300 dark:hover:shadow-orange-400 cursor-pointer w-full h-1/3 flex flex-col px-4 rounded-md gap-1 justify-center shadow-lg dark:shadow-black" onClick={handleClick}>
                  <p className="text-black dark:text-gray-100 font-semibold">{r.initiative}</p>
                  <p className="text-black dark:text-gray-300 italic">{new Date(r.start_date).toLocaleDateString()} - {new Date(r.end_date).toLocaleDateString()}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="flex md:flex-row flex-col justify-evenly w-full sm:gap-10 min-h-[330px] flex-1">
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
          <div className="rounded-xl bg-white dark:bg-neutral-800 w-full h-52 md:h-full flex flex-col px-3 py-3  gap-2 overflow-y-scroll">
            {!suggestions.length && <p className='dark:text-neutral-400 text-neutral-600 w-full h-full flex items-center justify-center'>There are no suggestions at this time.</p>}
            {suggestions.map(s => <PLSuggestion suggestion={s} key={s.id}/>)}
          </div>
        </div>
      </div>
      {selectedRoadMapItem !== null && <PLRoadmapItemModal open={roadMapModalOpen} setOpen={setRoadMapModalOpen} roadmapItem={selectedRoadMapItem}/>}
    </div>
  )
}

function PLSuggestion({suggestion}: {suggestion: ApplicationSuggestion}) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl w-full py-2 px-2 flex flex-row items-center justify-between border-2 border-neutral-300 dark:border-neutral-500 gap-2">
      <div className="flex flex-row justify-between items-center border-2 dark:border-neutral-500 rounded-full px-2 py-1">
        <i className="ri ri-lightbulb-line text-xl text-yellow-500"></i>
      </div>
      <p className="text-black dark:text-gray-300 italic text-[10px] text-xs w-full text-left">"{suggestion.suggestion}"</p>
    </div>
  )
}