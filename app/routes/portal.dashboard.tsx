import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { theme } from "~/backend/cookies/dark-mode";
import { PlatformEvent, mockEvents } from "~/backend/mocks/events";
import { PLAreaChart, mockSprintTaskTotalData, mockSprintTaskCompletionPercentageData } from "~/components/charts/area-chart";
import { PLTable } from "~/components/common/table";
import { TableColumn } from "~/types/base.types";



export const loader: LoaderFunction = async ({request}) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await theme.parse(cookieHeader) || {});    
  const darkMode = cookie.darkMode ? true : false;
  return { darkMode }
};

export default function DashboardPage() {
  const { darkMode } = useLoaderData<{darkMode: boolean|undefined}>()
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
      <div className="flex md:flex-row flex-col justify-evenly w-full sm:gap-10" style={{height: "320px"}}>
        <div className="w-full md:w-1/2 h-full flex flex-col gap-2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Current Sprint - <span className="italic text-black dark:text-neutral-500">#0</span></h2>
          <div className="rounded-xl bg-white dark:bg-neutral-800 w-full md:h-full p-4 flex flex-row items-center justify-evenly gap-4">
            <div className="justify-evenly flex flex-col items-center h-full border-black dark:border-neutral-400 border-2 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">13</h3>
              <p className="text-black text-xs dark:text-gray-500">Total</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full border-black dark:border-neutral-400 border-2 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">8</h3>
              <p className="text-black text-xs dark:text-gray-500">Incomplete</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full border-black dark:border-neutral-400 border-2 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Days</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">2</h3>
              <p className="text-black text-xs dark:text-gray-500">Left</p>
            </div>
          </div>
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-md text-sm">Team notes</h2>
          <div className="rounded-xl bg-white dark:bg-neutral-800 w-full h-15 md:h-full"></div>
        </div>
        <div className="w-full md:w-1/2 h-full flex flex-col gap-2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Alerts & Events - <span className="italic text-black dark:text-neutral-500">{mockEvents.length}</span></h2>
          <div className="rounded-xl bg-white dark:bg-neutral-800 w-full h-52 md:h-full overflow-hidden hover:overflow-y-scroll">
            <PLTable data={mockEvents} checked={[]} columnsVisible={false} actionsAvailable={false} columns={columns} component={({data} ) => <PlatformEventComponent data={data} />} />
          </div>
        </div>
      </div>
    </div>
  )
}

function PlatformEventComponent({data}: {data: PlatformEvent}) {
  return (
    <div className="flex flex-row justify-start items-center gap-5 p-5 italic border-b-2 dark:border-neutral-500">
      <img src={data.creator_img_url} alt="event originator" className="w-9 h-9 object-cover"/>
        {/* <i className="ri-user-fill text-xl"></i> */}
      <div className="flex flex-row justify-between w-full">
        <p className="text-sm">{data.description}</p>
        <p className="text-xs text-gray-500">{data.date}</p>
      </div>
    </div>
  )
}