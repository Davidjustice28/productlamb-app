import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ApplicationNote, ApplicationSprint, GeneratedTask, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { account } from "~/backend/cookies/account";
import { preferences } from "~/backend/cookies/preferences";
import { AccountsClient } from "~/backend/database/accounts/client";
import { ApplicationsClient } from "~/backend/database/applications/client";
import { createCurrentSprintChartsData, createSprintTaskCompletionPercentageChartData, createSprintTaskTotalsChartData, mockBarChartdata, mockSprintTaskCompletionPercentageData, mockSprintTaskTotalData } from "~/backend/mocks/charts";
import { PLAreaChart } from "~/components/charts/area-chart";
import { PLBarChart } from "~/components/charts/bar-chart";
import { PLNotesDropBox } from "~/components/notes/notes-dropbox";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLCreateNoteModal } from "~/components/modals/notes/create-note";

export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => {
    const { sessionId, userId, getToken } = request.auth;
    const cookieHeader = request.headers.get("Cookie");
    const accountCookie = (await account.parse(cookieHeader) || {});
    let setupIsComplete: boolean|undefined = accountCookie.setupIsComplete
    let accountId: number| undefined = accountCookie.accountId
    let selectedApplicationId: number| undefined = accountCookie.selectedApplicationId
    console.log('dashboard app id', selectedApplicationId)
    let selectedApplicationName: string| undefined = accountCookie.selectedApplicationName
    const dbClient = new PrismaClient()
    if (!accountId || !setupIsComplete) {
      const accountClient = AccountsClient(dbClient.account)
      const {data: accountData} = await accountClient.getAccountByUserId(userId || "")
      console.log('dashboard loader', accountData, userId, {accountCookie})
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


      const notes = await dbClient.applicationNote.findMany({ where: { applicationId: accountCookie.selectedApplicationId}})
      
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
      const sprints = await dbClient.applicationSprint.findMany({ where: { applicationId: selectedApplicationId, status: { in: ['In Progress', 'Completed']}}})
      const tasks = await dbClient.generatedTask.findMany({ where: { sprintId: { in: sprints.map(s => s.id) } }})

      const taskTotalsChartData = createSprintTaskTotalsChartData(
        sprints.map(s => ({name: s.id.toString(), taskCount: tasks.filter(t => t.sprintId === s.id).length}))
      )

      const taskPercentagesChartData = createSprintTaskCompletionPercentageChartData(
        sprints.map(s => ({name: s.id.toString(), completed: tasks.filter(t => t.sprintId === s.id && t.status === 'Done').length, total: tasks.filter(t => t.sprintId === s.id).length}))
      )

      const currentSprint = sprints.find(s => s.status === 'In Progress')
      const currentSprintTasksData = currentSprint ? createCurrentSprintChartsData(tasks.filter(t => t.sprintId === currentSprint.id)) : []
      const daysLeftInSprint = currentSprint && currentSprint.endDate ? Math.floor((new Date(currentSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
      const currentSprintSummary = !currentSprint ? null : {total_tasks: tasks.filter(t => t.sprintId === currentSprint.id).length, incomplete_tasks: tasks.filter(t => t.sprintId === currentSprint.id && t.status !== 'Done').length, days_left: daysLeftInSprint}
      return json({ setupIsComplete, accountId, selectedApplicationName, selectedApplicationId, sprints, taskTotalsChartData, currentSprintTasksData, taskPercentagesChartData, currentSprintSummary, notes, currentSprint})
    }
  });
};

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const accountCookie = (await account.parse(cookieHeader) || {});
  const dbClient = new PrismaClient()
  const formData  = await request.formData()
  const data = Object.fromEntries(formData) as { [key: string]: string }
  if ('add_note' in data) {
    await dbClient.applicationNote.create({ data: { applicationId: accountCookie.selectedApplicationId, text: data.note, dateCreated: new Date().toISOString() }})
    const notes = await dbClient.applicationNote.findMany({ where: { applicationId: accountCookie.selectedApplicationId}})
    return json({notes})
  } else if ('delete_note' in data) {
    await dbClient.applicationNote.delete({ where: { id: parseInt(data.id) }})
    const notes = await dbClient.applicationNote.findMany({ where: { applicationId: accountCookie.selectedApplicationId}})
    return json({notes})
  } else {
    return json({})
  }
}

export default function DashboardPage() {
  const { accountId, setupIsComplete, sprints, taskTotalsChartData, currentSprintTasksData, taskPercentagesChartData, currentSprintSummary, notes: loadedNotes, currentSprint: loadedCurrentSprint } = useLoaderData<{setupIsComplete: boolean, accountId: number|undefined, selectedApplicationName: string| undefined, sprints: Array<ApplicationSprint>, taskTotalsChartData: any, currentSprintTasksData: any[], taskPercentagesChartData: any, currentSprintSummary: {incomplete_tasks: number, total_tasks: number, days_left: number|null} | null, notes: ApplicationNote[], currentSprint: ApplicationSprint|null }>();
  const {notes: notesAfterAction } = useActionData<{notes: ApplicationNote[]|null}>() || {notes: null}
  const [barChartData, setBarChartData] = useState<Array<any>>(currentSprintTasksData || [])
  const [chartData, setChartData] = useState<Array<any>>([(taskTotalsChartData || []), (taskPercentagesChartData || [])])
  const [chartIndex, setChartIndex] = useState<number>(0)
  const [currentSprint, setCurrentSprint] = useState<ApplicationSprint|null>(loadedCurrentSprint)
  const [tasks, setTasks] = useState<GeneratedTask[]>([])
  const yKey = chartIndex == 0 ? "taskCount" : "completed"
  const [notes, setNotes] = useState<Array<{text: string, id: number}>>(notesAfterAction || loadedNotes);
  const [addNotemodalOpen, setAddNoteModalOpen] = useState<boolean>(false)

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

  return (
    <div className="flex flex-col items-center gap-5 justify-start">
      <div className="w-full flex flex-col">
        <div className="flex flex-row justify-between w-full items-center">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Sprint Metrics - <span className="italic text-black dark:text-neutral-500">{chartIndex === 1 ? 'Completion Percentage' : 'Tasks Assigned'}</span></h2>
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
          <PLAreaChart data={chartData[chartIndex]} xKey="name" yKey={yKey} />
        </div>
      </div>
      <div className="flex md:flex-row flex-col justify-evenly w-full sm:gap-10" style={{height: "350px"}}>
        <div className="w-full md:w-1/2 h-full flex flex-col gap-2">
          <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Current Sprint - <span className="italic text-black dark:text-neutral-500">{currentSprint ? '#' + currentSprint.id : 'No active sprint'}</span></h2>
          <div className="rounded-xl w-full md:h-full flex flex-row items-center justify-evenly gap-4">
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">{currentSprintSummary !== null ? currentSprintSummary.total_tasks : 'N/A'}</h3>
              <p className="text-black text-xs dark:text-gray-500">Total</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Tasks</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">{currentSprintSummary !== null ? currentSprintSummary.incomplete_tasks : 'N/A'}</h3>
              <p className="text-black text-xs dark:text-gray-500">Incomplete</p>
            </div>
            <div className="justify-evenly flex flex-col items-center h-full bg-white dark:bg-neutral-800 flex-1 rounded-md">
              <p className="text-black text-xs dark:text-gray-500">Days</p>
              <h3 className="text-black font-bold text-3xl dark:text-neutral-400">{currentSprintSummary && currentSprintSummary.days_left ? currentSprintSummary.days_left : 'N/A'}</h3>
              <p className="text-black text-xs dark:text-gray-500">Left</p>
            </div>
          </div>
          <div className="rounded-xl mt-2 bg-white dark:bg-neutral-800 h-15 md:h-full pt-2">
            <PLBarChart data={barChartData}/>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-full flex flex-col gap-2">
          <div className="flex flex-row justify-between w-full items-center">
            <h2 className="text-gray-700 dark:text-gray-500 font-bold text-sm">Digital CorkBoard - <span className="italic text-black dark:text-neutral-500">{notes.length} Notes</span></h2>
            <PLIconButton icon="ri-add-line" onClick={() => setAddNoteModalOpen(true)}/>
          </div>
          <div className="rounded-xl bg-white dark:bg-neutral-800 w-full h-52 md:h-full overflow-y-scroll flex flex-col p-2  gap-2 items-start">
            {!notes.length ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No sticky notes added</p>
              </div>
            ) : <PLNotesDropBox notes={notes} />}
          </div>
        </div>
      </div>
      <PLCreateNoteModal open={addNotemodalOpen} setOpen={setAddNoteModalOpen} onClose={() => setAddNoteModalOpen(false)}/>
    </div>
  )
}