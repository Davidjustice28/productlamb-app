import { AccountApplication, PrismaClient } from "@prisma/client"
import { ActionFunction, LoaderFunction, json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { useRef, useState } from "react"
import { ApplicationsClient } from "~/backend/database/applications/client"
import { ApplicationGoalsClient } from "~/backend/database/goals/client"
import { PLIconButton } from "~/components/buttons/icon-button"
import { PLAddApplicationModal } from "~/components/modals/applications/add-application"
import { PLConfirmModal } from "~/components/modals/confirm"
import { NewApplicationData } from "~/types/database.types"

interface ApplicationDeleteData {
  applicationId: string
}

export let action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as NewApplicationData | ApplicationDeleteData
  const accountId = 1
  const dbClient = new PrismaClient()
  const appDbClient = ApplicationsClient(dbClient.accountApplication)
  const goalDbClient = ApplicationGoalsClient(dbClient.applicationGoal)

  if ('applicationId' in data) { 
    await appDbClient.deleteApplication(parseInt(data.applicationId))
    return json({})
  }

  const {data: createAppResult } = await appDbClient.addApplication(accountId, data)
  if (createAppResult) {
    const goals = data.goals.length < 0 ? [] : JSON.parse(data.goals).map((goal: {goal: string, isLongTerm: boolean}) => ({goal: goal.goal, isLongTerm: goal.isLongTerm}))
    await goalDbClient.addMultipleGoals(createAppResult.id, goals)
  }

  return json({})
}
export const loader: LoaderFunction = async ({ request }) => {
  const client = ApplicationsClient(new PrismaClient().accountApplication)
  const {data: apps} = await client.getAccountApplications(1)
  return json({apps: apps ?? []})
}
export default function ApplicationsPage() {
  const {apps} = useLoaderData<{apps: Array<AccountApplication>}>()
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [applicationModalOpen, setApplicationModalOpen] = useState(false)
  const [applicationId, setApplicationId] = useState<number | null>(null)

  const formRef = useRef<HTMLFormElement>(null)

  function openDeleteModal(e: React.FormEvent<HTMLButtonElement>, applicationId: number) {
    e.preventDefault()
    setApplicationId(applicationId)
    setConfirmModalOpen(true)
  }

  function openApplicationAddModal() {
    setApplicationModalOpen(true)
  }

  function confirmAppDeletion(e: React.FormEvent<HTMLButtonElement>) {
    formRef.current?.submit()
    setConfirmModalOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Manage all of your personal projects being managed by ProductLamb</p>
        <PLIconButton icon="ri-add-line" onClick={openApplicationAddModal}/>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-5">
        {apps.map((app, index) => {
          return (
            <div key={index} className="group flex flex-col bg-white rounded-lg shadow-lg dark:bg-neutral-800">
              <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
                <div className="flex items-center">
                  { <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex justify-center items-center text-lg"><i className="ri ri-image-line"></i></div> }
                  <h4 className="ml-2 font-semibold text-gray-700 dark:text-neutral-100">{app.name}</h4>
                </div>
                <div className="flex flex-row">
                  <Form className="flex flex-row" method="POST" ref={formRef}>
                    <input type="hidden" name="applicationId" value={applicationId ?? -1} />
                    <PLIconButton icon="ri-close-line" colorClasses="invisible group-hover:visible text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700" onClick={(e) => openDeleteModal(e, app.id)}/>
                  </Form>
                  <PLIconButton icon="ri-equalizer-line" colorClasses="text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-neutral-300">{app.summary}</p>
              </div>
            </div>
          )
        })}
      </div>
      <PLConfirmModal open={confirmModalOpen} setOpen={setConfirmModalOpen} message="Are you sure you would like to delete this application?" onConfirm={(e) => confirmAppDeletion(e)}/>
      <PLAddApplicationModal open={applicationModalOpen} setOpen={setApplicationModalOpen}/>
    </div>
  )
}