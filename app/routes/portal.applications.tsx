import { AccountApplication } from "@prisma/client"
import { ActionFunction, LoaderFunction, MetaFunction, json, redirect } from "@remix-run/node"
import { Form, Outlet, useActionData, useLoaderData, useLocation, useNavigate } from "@remix-run/react"
import { useRef, useState } from "react"
import { account } from "~/backend/cookies/account"
import { ApplicationsClient } from "~/backend/database/applications/client"
import { ApplicationGoalsClient } from "~/backend/database/goals/client"
import { ApplicationPMToolClient } from "~/backend/database/pm-tools/client"
import { useAdmin } from "~/backend/providers/admin"
import { PLIconButton } from "~/components/buttons/icon-button"
import { PLContentLess } from "~/components/common/contentless"
import { PLAddApplicationModal } from "~/components/modals/applications/add-application"
import { PLConfirmModal } from "~/components/modals/confirm"
import { DB_CLIENT } from "~/services/prismaClient"
import { ClickUpData, GithubData, JiraData, NewApplicationData, NotionData } from "~/types/database.types"

interface ApplicationDeleteData {
  applicationId: string
}

interface ApplicationChangeData {
  selectedAppId: string
  selectedAppName: string
}

export const meta: MetaFunction = () => {
  return [
    { title: "ProductLamb | Applications" },
    {
      property: "og:title",
      content: "ProductLamb | Applications",
    },
  ];
};

export let action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as NewApplicationData | ApplicationDeleteData | ApplicationChangeData 
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const accountId = accountCookie.accountId
  const appDbClient = ApplicationsClient(DB_CLIENT.accountApplication)
  const goalDbClient = ApplicationGoalsClient(DB_CLIENT.applicationGoal)
  if ('applicationId' in data) {
    const id = parseInt(data.applicationId)
    const account = await DB_CLIENT.account.findFirst({where: {id: accountId}})
    if (!account || account?.default_application_id === id) {
      const applications = await DB_CLIENT.accountApplication.findFirst({where: {accountId: accountId, id: {not: id}}})
      await DB_CLIENT.account.update({where: {id: accountId}, data: {default_application_id: applications?.id}})
    }
    await appDbClient.deleteApplication(id)
    await DB_CLIENT.applicationGithubIntegration.deleteMany({where: {applicationid: id}})
    return json({})
  } else if ('selectedAppId' in data) {
    const cookies = request.headers.get('Cookie')
    const accountCookie = (await account.parse(cookies))
    accountCookie.selectedApplicationId = parseInt(data.selectedAppId)
    accountCookie.selectedApplicationName = data.selectedAppName
    return redirect('/portal/dashboard', {
      headers: {
        'Set-Cookie': await account.serialize(accountCookie)
      }
    })
  } else if ('name' in data) {
    const {data: createAppResult } = await appDbClient.addApplication(accountId, data)
    const pmToolClient = ApplicationPMToolClient(DB_CLIENT)
    if (createAppResult) {
      const goals = data.goals.length < 0 ? [] : JSON.parse(data.goals).map((goal: {goal: string, isLongTerm: boolean}) => ({goal: goal.goal, isLongTerm: goal.isLongTerm}))
      await goalDbClient.addMultipleGoals(createAppResult.id, goals)

      if (data?.projectManagementTool && data.projectManagementTool.length > 2) {
        const pmToolData = JSON.parse(data.projectManagementTool) as ClickUpData | NotionData | JiraData | GithubData
  
        let pmToolConfigurationResponseId: number| null = null
        let pmToolType: 'clickup' | 'notion' | 'jira' | 'github' | null = null
        if ('parentFolderId' in pmToolData) {
          const {parentFolderId, apiToken} = pmToolData
          const {data, errors} = await pmToolClient.clickup.addConfig(apiToken, parentFolderId, createAppResult.id)
          if (data) {
            pmToolConfigurationResponseId = data.id
            pmToolType = 'clickup'
          }
  
          if (errors) {
            console.log('error adding clickup config', errors)
          }
  
        } else if ('parentBoardId' in pmToolData) {
          const {parentBoardId, apiToken, email, hostUrl, projectKey} = pmToolData
          const {data, errors} = await pmToolClient.jira.addConfig(apiToken, parentBoardId, email, projectKey, hostUrl, createAppResult.id)
          if (data) {
            pmToolConfigurationResponseId = data.id
            pmToolType = 'jira'
          } else {
            console.error('error adding jira config', errors)
          }
  
        } else if('projectId' in pmToolData) {
          const {projectId, apiToken, repo, owner} = pmToolData
          const {data, errors} = await pmToolClient.github.addConfig(apiToken, projectId, repo, owner, createAppResult.id)
          if (data) {
            pmToolConfigurationResponseId = data.id
            pmToolType = 'github'
          } else {
            console.error('error adding github config', errors)
          }

        } else {
          const {parentPageId, apiKey} = pmToolData
          let parent_id = '' 
          // ex: PAGETITLE-aba935a7aca940cfb6605de9edd598a8 || aba935a7aca940cfb6605de9edd598a8 || aba935a7-aca9-40cf-b660-5de9edd598a8 
          const sections = parentPageId.split('-')
          if (sections.length === 2) {
            // PAGETITLE-aba935a7aca940cfb6605de9edd598a8 - remove page title and turn into a valid uuid
            const id = parentPageId.split('-')[1]
            const parts = [id.slice(0, 8), id.slice(8, 12), id.slice(12, 16), id.slice(16, 20), id.slice(20)]
            parent_id = parts.join('-')
          } else if (sections.length === 5) {
            // aba935a7-aca9-40cf-b660-5de9edd598a8 - is a valid uuid
            parent_id = parentPageId
          } else if (sections.length === 1) {
            // aba935a7aca940cfb6605de9edd598a8 - turn into a valid uuid
            const id = parentPageId
            const parts = [id.slice(0, 8), id.slice(8, 12), id.slice(12, 16), id.slice(16, 20), id.slice(20)]
            parent_id = parts.join('-')
          } else {
            // invalid id
            console.error(`Invalid Notion Page ID: ${parentPageId}. Please update later`)
            parent_id = parentPageId
          }
          const {data, errors} = await pmToolClient.notion.addConfig(apiKey, parent_id, createAppResult.id)
          if (data) {
            pmToolConfigurationResponseId = data.id
            pmToolType = 'notion'
          } else {
            console.error('error adding notion config', errors)
          }
        }
        if (pmToolConfigurationResponseId && pmToolType) {
          if (pmToolType === 'clickup') {
            const response = await appDbClient.updateApplication(createAppResult.id, {clickup_integration_id: pmToolConfigurationResponseId})
          } else if(pmToolType === 'jira') {
            const response = await appDbClient.updateApplication(createAppResult.id, {jira_integration_id: pmToolConfigurationResponseId})
          } else if (pmToolType === 'github') {
            const response = await appDbClient.updateApplication(createAppResult.id, {github_integration_id: pmToolConfigurationResponseId})
          } else {    
            const response = await appDbClient.updateApplication(createAppResult.id, {notion_integration_id: pmToolConfigurationResponseId})
          }
        }
        
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
  const client = ApplicationsClient(DB_CLIENT.accountApplication)
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
  const {isAdmin} = useAdmin()
  function openDeleteModal(e: React.FormEvent<HTMLButtonElement>, applicationId: number) {
    if (e && e?.preventDefault) {
      e.preventDefault()
    }
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
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Manage all of your organizations applications being managed by ProductLamb</p>
        <PLIconButton icon="ri-add-line" onClick={openApplicationAddModal}/>
      </div>
      {!apps.length ? <PLContentLess itemType='application'/> : null} 
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
                        {isAdmin && <PLIconButton icon="ri-close-line" colorClasses="invisible group-hover:visible text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700" onClick={(e) => openDeleteModal(e, app.id)}/> }
                        <PLIconButton icon="ri-star-line" colorClasses="text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-yellow-500" onClick={(_) => switchToApplication(app.id)}/>
                      </>
                    }
                  </Form>
                  {isAdmin && <PLIconButton icon="ri-equalizer-line" colorClasses="text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700" onClick={(_) => editApplication(app.id)}/>}
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