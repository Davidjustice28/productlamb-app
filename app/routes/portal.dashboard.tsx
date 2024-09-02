import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ApplicationSprint, ApplicationSuggestion, roadmap_item } from "@prisma/client";
import { LoaderFunction, MetaFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { account } from "~/backend/cookies/account";
import { ApplicationsClient } from "~/backend/database/applications/client";
import { createCurrentSprintChartsData } from "~/backend/mocks/charts";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLBarChart } from "~/components/charts/bar-chart";
import { PLManagedRoadmapModal } from "~/components/modals/roadmaps/add-roadmap-step";
import { PLRoadmapItemModal } from "~/components/modals/roadmaps/roadmap-view";
import { DB_CLIENT } from "~/services/prismaClient";
import { RoadmapItem } from "~/types/database.types";
import { calculateTimeLeft } from "~/utils/date";

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
      const app = await DB_CLIENT.accountApplication.findUnique({ where: { id: selectedApplicationId }})!
      const integrationCount = await DB_CLIENT.applicationIntegration.count({ where: { applicationId: selectedApplicationId }})
      const settings = await DB_CLIENT.accountManagerSettings.findFirst({ where: { accountId: accountId }})
      let score = 0
      // check for tool, 1 integration, sprint generation enabled, site url, 1 notifaction event
      if (app?.clickup_integration_id !== null || app?.notion_integration_id === null || app?.jira_integration_id === null) score += 1
      if (!!app?.siteUrl) score += 1
      if (!!app?.sprint_generation_enabled) score += 1
      if (settings?.notify_on_task_added || settings?.notify_on_member_join || settings?.notify_on_planning_ready || settings?.notify_on_sprint_ready) score += 1
      if (integrationCount > 0) score += 1
      const tasks = await DB_CLIENT.generatedTask.findMany({ where: { sprintId: { in: sprints.map(s => s.id) } }})
      const completedStatuses = ['done', 'complete', 'completed', 'finished']
      const completedTasks = tasks.filter(t => completedStatuses.includes(t.status.toLowerCase())).length
      const currentSprint = sprints.find(s => s.status === 'In Progress')
      const currentSprintTasksData = currentSprint ? createCurrentSprintChartsData(tasks.filter(t => t.sprintId === currentSprint.id)) : []
      const timeLeftInSprint = currentSprint && currentSprint?.endDate ? calculateTimeLeft(account!.timezone, undefined, currentSprint.endDate, 'Expired') : null
      const currentSprintSummary = !currentSprint ? null : {total_tasks: tasks.filter(t => t.sprintId === currentSprint.id).length, incomplete_tasks: tasks.filter(t => t.sprintId === currentSprint.id && !completedStatuses.includes(t.status.toLowerCase())  ).length, time_left: timeLeftInSprint}
      const roadmap = await DB_CLIENT.applicationRoadmap.findFirst({ where: { account_application_id: selectedApplicationId }, include: { roadmap_item: true }})
      const roadmap_id = roadmap?.id !== undefined && roadmap?.id !== null ? roadmap?.id : -1
      if (roadmap_id !== -1 && roadmap?.roadmap_item && roadmap?.roadmap_item.length > 0) score += 1
      const scorePercentage = (score / 6) * 100
      const configurationData = {
        hasProductRoadmap: roadmap?.roadmap_item && roadmap?.roadmap_item.length > 0, 
        hasIntegration: integrationCount > 0,
        hasSprintGeneration: !!app?.sprint_generation_enabled,
        hasTaskManager: app?.clickup_integration_id !== null ||  app?.notion_integration_id === null || app?.jira_integration_id === null,
        hasWebsiteUrl: !!app?.siteUrl,
        hasNotifications: settings?.notify_on_task_added || settings?.notify_on_member_join || settings?.notify_on_planning_ready || settings?.notify_on_sprint_ready
      }
      return json({ selectedApplicationName, selectedApplicationId, currentSprintTasksData, currentSprintSummary, currentSprint, suggestions, completedTasks, appScore: scorePercentage, roadmap_id, roadmap_items: roadmap?.roadmap_item || [], configurationData })
    }
  });
};


export default function DashboardPage() {
  const { currentSprintSummary, currentSprint: loadedCurrentSprint, suggestions, currentSprintTasksData, completedTasks, appScore, roadmap_id: loadedRoadmapId, roadmap_items: loadedRoadmapItems, configurationData} = useLoaderData<{ currentSprintTasksData: any[], selectedApplicationName: string| undefined, currentSprintSummary: {incomplete_tasks: number, total_tasks: number, time_left: {type: string, count: number | string} |null} | null, currentSprint: ApplicationSprint|null, suggestions: ApplicationSuggestion[], completedTasks: number, appScore: number, roadmap_id: number, roadmap_items: roadmap_item[], configurationData: any }>();
  const [roadmap_id, setRoadmapId] = useState<number>(loadedRoadmapId)
  const [roadmap_items, setRoadmapItems] = useState<RoadmapItem[]>(loadedRoadmapItems)
  const [barChartData, setBarChartData] = useState<Array<any>>(currentSprintTasksData || [])
  const [currentSprint, setCurrentSprint] = useState<ApplicationSprint|null>(loadedCurrentSprint)
  const [roadMapItemModalOpen, setRoadMapItemModalOpen] = useState(false)
  const [roadmapManagerModalOpen, setRoadmapManagerModalOpen] = useState(false)
  const [selectedRoadMapItem, setSelectedRoadMapItem] = useState<RoadmapItem|null>(null)
  const timeLeftTitle = (currentSprintSummary && currentSprintSummary.time_left ? currentSprintSummary.time_left.type : 'time')
  // list of features and date ranges for feature/development to take place. dates are iso strings
  const openRoadmapModal = async () => {
    if (roadmap_id !== -1) {
      setRoadmapManagerModalOpen(true)
    } else {
      await fetch('/api/roadmaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'create', item: null })
      }).then(async res => {
        const data = await res.json();
        if ('roadmap_id' in data) {
          setRoadmapId(data.roadmap_id)
          setRoadmapManagerModalOpen(true)
        }
      }).catch(err => console.error(err));
    }
  }
  return (
    <div className="flex flex-col items-center gap-5 justify-start h-[95%]">
      <div className="flex flex-row gap-8 w-full h-[40%]">
        <div className="h-full flex flex-col justify-evenly gap-2 w-1/2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Application Overview</h2>
          <div className="h-full flex flex-row items-center justify-evenly gap-8 w-full">
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 w-1/2 rounded-md px-5 py-3">
              <p className="text-black text-sm dark:text-gray-500">Configuration</p>
              <PLMeterChart score={appScore} data={configurationData}/>
              <p className="text-black text-sm dark:text-gray-500">Health</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 w-1/2 rounded-md">
              <p className="text-black text-sm dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-7xl dark:text-neutral-400">{completedTasks}</h3>
              <p className="text-black text-sm dark:text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="h-full flex flex-col justify-evenly gap-2 w-1/2">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Product Roadmap</h2>
          <PLIconButton icon="ri-map-2-line" onClick={openRoadmapModal} />
        </div>
          {/* TODO: Eventually this will be a feature for customers to display roadmap for an application. Items will be clickable with a popup modal with a more descriptive understanding of what is coming */}
          <div className={"flex flex-col items-center h-full bg-white dark:bg-neutral-800 w-full rounded-md p-3 gap-2 " + (roadmap_items.length ? 'justify-start' : 'justify-center')}>
            {roadmap_items.slice(0,3).map((r, i) => {
              const handleClick = () => {
                setSelectedRoadMapItem(r)
                setRoadMapItemModalOpen(true)
              }
              return (
                <div key={i} className="hover:-translate-y-1 cursor-pointer w-full h-1/3 flex flex-col px-4 rounded-md gap-1 justify-center shadow-lg dark:shadow-black" onClick={handleClick}>
                  <p className="text-black dark:text-gray-300 font-semibold text-sm">{r.initiative}</p>
                  <p className="text-black dark:text-gray-300 text-xs italic">{new Date(r.start_date).toLocaleDateString()} - {new Date(r.end_date).toLocaleDateString()}</p>
                </div>
              )
            })}
            {roadmap_items.length === 0 && <p className='dark:text-neutral-400 text-neutral-600 w-full h-full flex items-center justify-center'>You haven't implemented a roadmap for this project.</p>}
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
      {selectedRoadMapItem !== null && <PLRoadmapItemModal open={roadMapItemModalOpen} setOpen={setRoadMapItemModalOpen} roadmapItem={selectedRoadMapItem}/>}
      <PLManagedRoadmapModal open={roadmapManagerModalOpen} onClose={() => setRoadmapManagerModalOpen(false)} setOpen={setRoadmapManagerModalOpen} roadmapItems={roadmap_items} roadmap_id={roadmap_id} setRoadmapItems={setRoadmapItems}/>
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

function PLMeterChart({score, data}: {score: number, data: {
  hasProductRoadmap: boolean,
  hasIntegration: boolean,
  hasSprintGeneration: boolean,
  hasTaskManager: boolean,
  hasWebsiteUrl: boolean,
  hasNotifications: boolean
}}) {
  const colorMap = {
    neutral: ['bg-neutral-500 opacity-90', 'bg-neutral-400 opacity-90', 'bg-neutral-300 opacity-90', 'bg-neutral-300 opacity-70', 'bg-neutral-200 opacity-80', 'bg-neutral-100 opacity-70'],
    green: ['bg-green-500 opacity-90', 'bg-green-400 opacity-90', 'bg-green-300 opacity-90', 'bg-green-300 opacity-70', 'bg-green-200 opacity-80', 'bg-green-100 opacity-70'],
    yellow: ['bg-yellow-500 opacity-90', 'bg-yellow-400 opacity-90', 'bg-yellow-300 opacity-90', 'bg-yellow-300 opacity-70', 'bg-yellow-200 opacity-80', 'bg-yellow-100 opacity-70'],
    orange: ['bg-orange-500 opacity-90', 'bg-orange-400 opacity-90', 'bg-orange-300 opacity-90', 'bg-orange-300 opacity-70', 'bg-orange-200 opacity-80', 'bg-orange-100 opacity-70'],
    red: ['bg-red-500 opacity-90', 'bg-red-400 opacity-90', 'bg-red-300 opacity-90', 'bg-red-300 opacity-70', 'bg-red-200 opacity-80', 'bg-red-100 opacity-70'],
    blue: ['bg-blue-500 opacity-90', 'bg-blue-400 opacity-90', 'bg-blue-300 opacity-90', 'bg-blue-300 opacity-70', 'bg-blue-200 opacity-80', 'bg-blue-100 opacity-70']
  };
  
  const getColor = (score: number, index: number) => {
    let color: 'neutral' | 'green' | 'yellow' | 'orange' | 'red' | 'blue' = 'neutral';
  
    if (score >= 100) {
      color = 'green'; // New color for the highest range
    } else if (score >= 80) {
      color = 'blue';
    } else if (score >= 60) {
      color = 'yellow';
    } else if (score >= 40) {
      color = 'orange';
    } else if (score >= 20) {
      color = 'red';
    } else {
      color = 'neutral';
    }
  
    // Ensure index is within bounds of colorMap
    const adjustedIndex = Math.min(index, colorMap[color].length - 1);
    return colorMap[color][adjustedIndex];
  }

  const getListItemColor = (complete: boolean): 'green' | 'red' => {
    return complete ? 'green' : 'red'
  }
  return (
    <div className="relative group flex flex-col border-2 border-neutral-300 dark:border-gray-500 h-32 w-40 gap-3 p-2 cursor-default">
      {[0, 1, 2, 3, 4, 5].map((i) => {
        return (
          <div key={i} className={"flex-1 w-full flex flex-row gap-2 " + getColor(score, i)}></div>
        )
      })}
      <ul className='cursor-default left-20 absolute hidden group-hover:visible w-[300px] mx-h-1/3 shadow-md rounded-md bg-neutral-200 dark:bg-neutral-600 text-black dark:text-neutral-100 group-hover:flex group-hover:flex-col justify-center items-start px-5 py-3'>
        <li className='font-bold underline mb-2'>Application Configuration</li>
        <li className='flex flex-row gap-2 items-center'><div className={`bg-${getListItemColor(data.hasProductRoadmap)}-400 w-2 h-2 rounded-full`}></div> <p>Has a product roadmap</p></li>
        <li className='flex flex-row gap-2 items-center'><div className={`bg-${getListItemColor(data.hasIntegration)}-400 w-2 h-2 rounded-full`}></div> <p>Configured atleast 1 integration</p></li>
        <li className='flex flex-row gap-2 items-center'><div className={`bg-${getListItemColor(data.hasSprintGeneration)}-400 w-2 h-2 rounded-full`}></div> <p>Sprint generation is enabled</p></li>
        <li className='flex flex-row gap-2 items-center'><div className={`bg-${getListItemColor(data.hasTaskManager)}-400 w-2 h-2 rounded-full`}></div> <p>Task manager tool is setup</p></li>
        <li className='flex flex-row gap-2 items-center'><div className={`bg-${getListItemColor(data.hasWebsiteUrl)}-400 w-2 h-2 rounded-full`}></div> <p>Has a website url</p></li>
        <li className='flex flex-row gap-2 items-center'><div className={`bg-${getListItemColor(data.hasNotifications)}-400 w-2 h-2 rounded-full`}></div> <p>Notifications are enabled</p></li>
      </ul>
    </div>
  );
}