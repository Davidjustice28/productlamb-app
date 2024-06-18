import { AccountApplication, PrismaClient } from "@prisma/client"
import { ActionFunction, LoaderFunction, json } from "@remix-run/node"
import { Form, Outlet, useActionData, useLoaderData, useLocation, useNavigate } from "@remix-run/react"
import { useRef, useState } from "react"
import { account } from "~/backend/cookies/account"
import { ApplicationsClient } from "~/backend/database/applications/client"
import { ApplicationGoalsClient } from "~/backend/database/goals/client"
import { ApplicationPMToolClient } from "~/backend/database/pm-tools/client"
import { PLIconButton } from "~/components/buttons/icon-button"
import { PLAddApplicationModal } from "~/components/modals/applications/add-application"
import { PLConfirmModal } from "~/components/modals/confirm"
import { ClickUpData, NewApplicationData, NotionData } from "~/types/database.types"

interface ApplicationDeleteData {
  applicationId: string
}

interface ApplicationChangeData {
  selectedAppId: string
  selectedAppName: string
}

export let action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as NewApplicationData | ApplicationDeleteData | ApplicationChangeData 
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const accountId = accountCookie.accountId
  const dbClient = new PrismaClient()
  const appDbClient = ApplicationsClient(dbClient.accountApplication)
  const goalDbClient = ApplicationGoalsClient(dbClient.applicationGoal)
  if ('applicationId' in data) {
    await appDbClient.deleteApplication(parseInt(data.applicationId))
    return json({})
  } else if ('selectedAppId' in data) {
    const cookies = request.headers.get('Cookie')
    const accountCookie = (await account.parse(cookies))
    accountCookie.selectedApplicationId = parseInt(data.selectedAppId)
    accountCookie.selectedApplicationName = data.selectedAppName
    return json({appId: accountCookie.selectedApplicationId}, {
      headers: {
        'Set-Cookie': await account.serialize(accountCookie)
      }
    })
  } else if ('name' in data) {
    const {data: createAppResult } = await appDbClient.addApplication(accountId, data)
    const pmToolClient = ApplicationPMToolClient(dbClient)
    if (createAppResult) {
      const goals = data.goals.length < 0 ? [] : JSON.parse(data.goals).map((goal: {goal: string, isLongTerm: boolean}) => ({goal: goal.goal, isLongTerm: goal.isLongTerm}))
      await goalDbClient.addMultipleGoals(createAppResult.id, goals)
      const pmToolData = JSON.parse(data.projectManagementTool) as ClickUpData | NotionData

      let pmToolConfigurationResponseId: number| null = null
      let pmToolType: 'clickup' | 'notion' | null = null
      console.log(pmToolData)
      if ('parentFolderId' in pmToolData) {
        const {parentFolderId, apiToken} = pmToolData
        console.log('attempting to add clickup config')
        const {data, errors} = await pmToolClient.clickup.addConfig(apiToken, parentFolderId, createAppResult.id)
        if (data) {
          pmToolConfigurationResponseId = data.id
          pmToolType = 'clickup'
        }

        if (errors) {
          console.log('error adding clickup config', errors)
        }

      } else {
        const {parentPageId, apiKey} = pmToolData
        console.log('attempting to add notion config')
        const {data, errors} = await pmToolClient.notion.addConfig(apiKey, parentPageId, createAppResult.id)
        if (data) {
          pmToolConfigurationResponseId = data.id
          pmToolType = 'notion'
        } else {
          console.error('error adding notion config', errors)
        }
      }
      if (pmToolConfigurationResponseId && pmToolType) {
        console.log(`adding pm tool config for app ${createAppResult.id}`)
        if (pmToolType === 'clickup') {
          const response = await appDbClient.updateApplication(createAppResult.id, {clickup_integration_id: pmToolConfigurationResponseId})
          console.log('updated app with clickup config', response)
        } else {
          const response = await appDbClient.updateApplication(createAppResult.id, {notion_integration_id: pmToolConfigurationResponseId})
          console.log('updated app with notion config', response)
        }

        console.log('added pm tool config')
      } else {
        console.log('failed to add pm tool config due to missing data')
      }
    }
    return json({})
  } else {
    return json({}, {status: 400})
  }
}
export const loader: LoaderFunction = async ({ request }) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const client = ApplicationsClient(new PrismaClient().accountApplication)
  const {data: apps} = await client.getAccountApplications(Number(accountCookie.accountId))
  return json({apps: apps ?? [], activeIdOnLoad: accountCookie.selectedApplicationId})
}
export default function ApplicationsPage() {
  const {apps, activeIdOnLoad} = useLoaderData<{apps: Array<AccountApplication>, activeIdOnLoad: number}>()
  const actionData: {appId?: number} = useActionData() ?? {}
  const {pathname} = useLocation()
  const individualAppPage = pathname.split('/applications/').length > 1
  const [activeAppId, _] = useState<number>(actionData?.appId ?? activeIdOnLoad)
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false)
  const [switchConfirmModalOpen, setSwitchConfirmModalOpen] = useState(false)
  const [applicationModalOpen, setApplicationModalOpen] = useState(false)
  const [action, setAction] = useState<"delete"| 'switch' | null>()
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)

  function openDeleteModal(e: React.FormEvent<HTMLButtonElement>, applicationId: number) {
    e.preventDefault()
    setSelectedAppId(applicationId)
    setAction('delete')
    setDeleteConfirmModalOpen(true)
  }

  function openApplicationAddModal() {
    setApplicationModalOpen(true)
  }

  function confirmAppDeletion(e: React.FormEvent<HTMLButtonElement>) {
    formRef.current?.submit()
    setAction(null)
    setDeleteConfirmModalOpen(false)
    setSelectedAppId(null)
  }

  function switchToApplication(applicationId: number) {
    setSelectedAppId(applicationId)
    setAction('switch')
    setSwitchConfirmModalOpen(true)
  }

  function confirmAppSwitch(e: React.FormEvent<HTMLButtonElement>) {
    formRef.current?.submit()
    setAction(null)
    setSwitchConfirmModalOpen(false)
    setSelectedAppId(null)
  }

  function editApplication(applicationId: number) {
    navigate(`/portal/applications/${applicationId}`)
  }

if (individualAppPage) {
  return <Outlet />
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
            <div key={index} className="group flex flex-col rounded-lg shadow-lg bg-white dark:bg-neutral-800">
              <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
                <div className="flex items-center">
                  { <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex justify-center items-center text-lg">
                    {app.logo_url ? <img src={app.logo_url} alt="logo" className="w-full h-full object-contain rounded-full"/> : <i className="ri ri-image-line"></i>}
                    </div> 
                  }
                  <h4 className="ml-2 font-semibold text-gray-700 dark:text-neutral-100">{app.name}</h4>
                  {activeAppId === app.id && <PLIconButton icon="ri-check-fill" colorClasses="text-green-600 dark:text-green-300 cursor-default font-bold text-lg"/>}
                </div>
                <div className="flex flex-row">
                  <Form className="flex flex-row" method="POST" ref={formRef}>
                    {
                      action === 'delete' && <input type="hidden" name="applicationId" value={selectedAppId ?? -1} />
                    }
                    {
                      action === 'switch' && (
                      <>
                        <input type="hidden" name="selectedAppId" value={selectedAppId!} />
                        <input type="hidden" name="selectedAppName" value={apps.find(app => app.id === selectedAppId!)?.name} />
                      </>
                      )
                    }
                    { activeAppId !== app.id &&
                      <>
                        <PLIconButton icon="ri-close-line" colorClasses="invisible group-hover:visible text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700" onClick={(e) => openDeleteModal(e, app.id)}/> 
                        <PLIconButton icon="ri-star-line" colorClasses="text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-yellow-500" onClick={(_) => switchToApplication(app.id)}/>
                      </>
                    }
                  </Form>
                  <PLIconButton icon="ri-equalizer-line" colorClasses="text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700" onClick={(_) => editApplication(app.id)}/>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-neutral-300">{app.summary}</p>
              </div>
            </div>
          )
        })}
      </div>
      <PLConfirmModal open={deleteConfirmModalOpen} setOpen={setDeleteConfirmModalOpen} message="Are you sure you would like to delete this application?" onConfirm={(e) => confirmAppDeletion(e)}/>
      <PLConfirmModal open={switchConfirmModalOpen} setOpen={setSwitchConfirmModalOpen} message="Are you sure you would like to switch applications?" onConfirm={(e) => confirmAppSwitch(e)}/>
      <PLAddApplicationModal open={applicationModalOpen} setOpen={setApplicationModalOpen}/>
    </div>
  )
}