import { GeneratedInitiative, GeneratedTask, PrismaClient } from "@prisma/client"
import { LoaderFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import { account } from "~/backend/cookies/account"
import { ApplicationSprintsClient } from "~/backend/database/sprints/client"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { db } from "~/utils/db.server"

export const loader: LoaderFunction = async ({request, params}) => {
  const dbClient = new PrismaClient()
  const taskMap: Record<number, Array<GeneratedTask>> = {}
  const sprintId = parseInt(params.sprint_id || "-1")
  if(sprintId === -1) {
    return json({
      initiatives: [],
      taskMap: {}
    })
  }
  const initiatives = await dbClient.generatedInitiative.findMany({where: {sprintId}})
  if(initiatives.length === 0) {
    return json({
      initiatives: [],
      taskMap: {}
    })
  }
  initiatives.forEach(async initiative => {
    const tasks = await dbClient.generatedTask.findMany({where: {initiativeId: initiative.id}})
    taskMap[initiative.id] = tasks
  })

  return json({
    initiatives,
    taskMap
  })
}
export default function SprintGenerationPage() {
  const {taskMap: data, initiatives: loadedInitiatives} = useLoaderData() as {taskMap: Record<number, Array<GeneratedTask>>, initiatives: Array<GeneratedInitiative>}
  const [selectedInitiative, setSelectedInitiative] = useState<number|null>()
  const [initiatives, setInitiatives] = useState<Array<GeneratedInitiative>>(loadedInitiatives || [])
  const [taskMap, setTaskMap] = useState<Record<number, Array<GeneratedTask>>>(data || {})

  return (
    <div className="w-full flex flex-col">
      <p className="font-semibold text-black dark:text-white">Choose an overall initiative for the sprint you wish to generate.</p>
      <div className="mt-5 flex flex-row gap-3">
        {initiatives.map((initiative, index) => {
          return (
            <button 
              key={index} 
              className="w-full border-2 border-black dark:border-neutral-400 p-2 rounded-xl font-medium dark:text-neutral-400 text-black flex flex-col justify-center items-start"
              onClick={() => setSelectedInitiative(initiative.id)}
            >
              <p>Option #{index + 1}</p>
              <p>{initiative.description}</p>
            </button>
          )
        })}
      </div>
      {
        selectedInitiative &&
        <div className="mt-5 flex flex-col gap-3">
          {
          taskMap[selectedInitiative].map((task, index) => {
            return (
              <div key={index} className="flex flex-row gap-3">
                <p>{task.description}</p>
                <PLBasicButton text="Add to Sprint"/>
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}