import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ApplicationSprint, GeneratedTask, PrismaClient } from "@prisma/client";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { account } from "~/backend/cookies/account";
import { preferences } from "~/backend/cookies/preferences";
import { AccountsClient } from "~/backend/database/accounts/client";
import { ApplicationsClient } from "~/backend/database/applications/client";
import { mockBarChartdata, mockSprintTaskCompletionPercentageData, mockSprintTaskTotalData } from "~/backend/mocks/charts";
import { PLAreaChart } from "~/components/charts/area-chart";
import { PLBarChart } from "~/components/charts/bar-chart";
import { TableColumn } from "~/types/base.types";

export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => {
    const { sessionId, userId, getToken } = request.auth;
    // fetch data
    const cookieHeader = request.headers.get("Cookie");
    const preferencesCookie = (await preferences.parse(cookieHeader) || {}); 
    const accountCookie = (await account.parse(cookieHeader) || {});
    const darkMode = preferencesCookie.darkMode ? true : false;
    let setupIsComplete: boolean|undefined = accountCookie.setupIsComplete
    let accountId: number| undefined = accountCookie.accountId
    let selectedApplicationId: number| undefined = accountCookie.selectedApplicationId
    let selectedApplicationName: string| undefined = accountCookie.selectedApplicationName
    
    const dbClient = new PrismaClient()
    if (!accountId || !setupIsComplete) {
      const accountClient = AccountsClient(dbClient.account)
      const {data: accountData} = await accountClient.getAccountByUserId(userId || "")
      console.log("Account Data: ", accountData)
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
      // return json({ darkMode, hasApplication, accountId, selectedApplicationId, selectedApplicationName }, { headers: { "Set-Cookie": await account.serialize(accountCookie) } })
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
      return json({ darkMode, setupIsComplete, accountId, selectedApplicationName, selectedApplicationId})
    }
  });
};

export default function DashboardPage() {
  const { darkMode, accountId, setupIsComplete } = useLoaderData<{darkMode: boolean|undefined, setupIsComplete: boolean, accountId: number|undefined, selectedApplicationName: string| undefined}>()
  const [chartData, setChartData] = useState<Array<any>>([])
  // const [barChartData, setBarChartData] = useState<Array<any>>(mockBarChartdata)
  const [barChartData, setBarChartData] = useState<Array<any>>([])
  // const [chartData, setChartData] = useState<Array<any>>([mockSprintTaskTotalData, mockSprintTaskCompletionPercentageData])
  const [chartIndex, setChartIndex] = useState<number>(0)
  const [currentSprint, setCurrentSprint] = useState<ApplicationSprint|null>(null)
  const [tasks, setTasks] = useState<GeneratedTask[]>([])
  const yKey = chartIndex == 0 ? "taskCount" : "percentage"

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

  const columns: Array<TableColumn> = [
    {key: 'type' , type: 'image'},
    {key: "originator", type: "text"},
    {key: "date", type: "text"},
    {key: "description", type: "text"},
  ]

  return (
    <div className="flex flex-col items-center gap-5 justify-start">
      <div className="w-full flex flex-col">
        <div className="flex flex-row justify-between w-full items-center">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Sprint Metrics - <span className="italic text-black dark:text-neutral-500">{chartIndex === 1 ? 'Completion Percentage' : 'Tasks Generated'}</span></h2>
          <div className="inline-flex">
            <button 
              className={"text-gray-700 dark:text-gray-500 font-bold py-2 px-2 " + (chartData.length <= 1 || chartIndex == 0 ? "cursor-not-allowed" : "hover:text-gray-400")} 
              onClick={() => handleChartChange(false)}
              disabled={(chartData.length <= 1 || chartIndex == 0)}
            >
              <i className="ri ri-arrow-left-s-line"></i>
            </button>
            <button 
              className={"text-gray-700 dark:text-gray-500 font-bold py-2 px-2 " + (chartData.length <= 1 || chartIndex == chartData.length - 1 ? "cursor-not-allowed" : "hover:text-gray-400")}
              onClick={() => handleChartChange(true)}
              disabled={(chartData.length <= 1 || chartIndex == chartData.length - 1)}
            >
              <i className="ri ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
        <div className="rounded-xl w-full h-full bg-white dark:bg-neutral-800 p-5" style={{height: "325px"}}>
          <PLAreaChart data={chartData[chartIndex]} xKey="name" yKey={yKey} darkMode={darkMode}/>
        </div>
      </div>
      <div className="flex md:flex-row flex-col justify-evenly w-full sm:gap-10" style={{height: "350px"}}>
        <div className="w-full md:w-1/2 h-full flex flex-col gap-2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Current Sprint - <span className="italic text-black dark:text-neutral-500">{currentSprint ? '#' + currentSprint.id : 'No active sprint'}</span></h2>
          <div className="rounded-xl w-full md:h-full flex flex-row items-center justify-evenly gap-4">
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">{tasks.length ? tasks.length : 'N/A'}</h3>
              <p className="text-black text-xs dark:text-gray-500">Total</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">{tasks.length ? tasks.map(t=> t.status === 'completed').length : 'N/A'}</h3>
              <p className="text-black text-xs dark:text-gray-500">Incomplete</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Days</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">{currentSprint ? 5 : 'N/A'}</h3>
              <p className="text-black text-xs dark:text-gray-500">Left</p>
            </div>
          </div>
          <div className="rounded-xl mt-2 bg-white dark:bg-neutral-800 h-15 md:h-full pt-2">
            <PLBarChart darkMode={darkMode} data={barChartData}/>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-full flex flex-col gap-2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Digital CorkBoard - <span className="italic text-black dark:text-neutral-500">0 Notes</span></h2>
          <div className="rounded-xl bg-white dark:bg-neutral-800 w-full h-52 md:h-full overflow-hidden hover:overflow-y-scroll flex flex-col p-2  gap-2 items-start">
            {true ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No sticky notes added</p>
              </div>
            ) : <></>}
            
          </div>
        </div>
      </div>
    </div>
  )
}