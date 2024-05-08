import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { Account, PrismaClient } from "@prisma/client";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useState } from "react";
import { account } from "~/backend/cookies/account";
import { preferences } from "~/backend/cookies/preferences";
import { AccountsClient } from "~/backend/database/accounts/client";
import { ApplicationsClient } from "~/backend/database/applications/client";
import { mockBarChartdata, mockSprintTaskCompletionPercentageData, mockSprintTaskTotalData } from "~/backend/mocks/charts";
import { mockEvents } from "~/backend/mocks/events";
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
    let hasApplication: boolean|undefined = accountCookie.hasApplication
    let accountId: number| undefined = accountCookie.accountId
    let selectedApplicationId: number| undefined = accountCookie.selectedApplicationId
    let selectedApplicationName: string| undefined = accountCookie.selectedApplicationName
    
    const dbClient = new PrismaClient()
    if (accountId === undefined || hasApplication === undefined) {
      const accountClient = AccountsClient(dbClient.account)
      const {data: accountData} = await accountClient.getAccountByUserId(userId || "")
      accountCookie.accountId = accountData?.id || undefined
      accountId = accountCookie.accountId
    
      const applicationClient = ApplicationsClient(dbClient.accountApplication)
      const {data: applications} = await applicationClient.getAccountApplications(accountCookie.accountId || 0)
      accountCookie.hasApplication = applications ? !!applications.length : false
      hasApplication = accountCookie.hasApplication
      if (selectedApplicationId === undefined && applications && applications.length > 0) {
        accountCookie.selectedApplicationId = applications[0].id
        accountCookie.selectedApplicationName = applications[0].name
        selectedApplicationId = accountCookie.selectedApplicationId
        selectedApplicationName = accountCookie.selectedApplicationName
      }
     
      return redirect("/portal/dashboard", { headers: { "Set-Cookie": await account.serialize(accountCookie) } })
      // return json({ darkMode, hasApplication, accountId, selectedApplicationId, selectedApplicationName }, { headers: { "Set-Cookie": await account.serialize(accountCookie) } })
    } else {
      hasApplication = accountCookie.hasApplication
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
      return json({ darkMode, hasApplication, accountId, selectedApplicationName, selectedApplicationId})
    }
  });
};

export default function DashboardPage() {
  const { darkMode, accountId, hasApplication } = useLoaderData<{darkMode: boolean|undefined, hasApplication: boolean, accountId: number|undefined, selectedApplicationName: string| undefined}>()
  const [chartData, setChartData] = useState<Array<any>>([mockSprintTaskTotalData, mockSprintTaskCompletionPercentageData])
  const [chartIndex, setChartIndex] = useState<number>(0)
  const xKey = "name"
  const yKey = chartIndex == 0 ? "taskCount" : "percentage"
  const handleChartChange = (goingForward: boolean) => {
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
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Current Sprint - <span className="italic text-black dark:text-neutral-500">#0</span></h2>
          <div className="rounded-xl w-full md:h-full flex flex-row items-center justify-evenly gap-4">
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">13</h3>
              <p className="text-black text-xs dark:text-gray-500">Total</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">8</h3>
              <p className="text-black text-xs dark:text-gray-500">Incomplete</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Days</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">2</h3>
              <p className="text-black text-xs dark:text-gray-500">Left</p>
            </div>
          </div>
          <div className="rounded-xl mt-2 bg-white dark:bg-neutral-800 h-15 md:h-full pt-2">
            <PLBarChart darkMode={darkMode} data={mockBarChartdata}/>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-full flex flex-col gap-2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Alerts & Events - <span className="italic text-black dark:text-neutral-500">{mockEvents.length}</span></h2>
          <div className="rounded-xl bg-white dark:bg-neutral-800 w-full h-52 md:h-full overflow-hidden hover:overflow-y-scroll flex flex-col p-2  gap-2 items-start">
            {mockEvents.map((event, index) => {
              return (
              <p
                key={index}
                className="text-gray-900 dark:text-gray-300 text-xs"
              >
                {`{"timestamp": ${event.date}, "type": "${event.type}", "origin": "${event.originator}" explanation: "${event.description}"}`}
              </p>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}