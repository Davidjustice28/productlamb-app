import { ApplicationIntegration, PrismaClient } from "@prisma/client"
import { ActionFunction, LoaderFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { useState } from "react"
import { account } from "~/backend/cookies/account"
import { IntegrationClient } from "~/backend/database/integrations/ client"
import { PLIconButton } from "~/components/buttons/icon-button"
import { PLIntegrationOption } from "~/components/integrations/integration"
import { PLIntegrationEditModal } from "~/components/modals/integrations/edit-integration"
import { PLIntegrationOptionsModal } from "~/components/modals/integrations/integration-options"
import { availableIntegrations } from "~/static/integration-options"
import { IntegrationOptions } from "~/types/component.types"
import { PLAvailableIntegrationNames } from "~/types/database.types"
import { GithubIntegrationSetupFormData, GitlabIntegrationSetupFormData, TypeformIntegrationMetaData, TypeformIntegrationSetupFormData } from "~/types/integrations.types"
import { encrypt } from "~/utils/encryption"

function getIntegrationsByname(setupIntegrations: Array<ApplicationIntegration>, options: Array<IntegrationOptions>) {
  const configuredOptions: Array<IntegrationOptions> = []
  const integrations = setupIntegrations.forEach(element => {
    const integration = options.find(i => i.name.toLowerCase() === element.name.toLowerCase())
    if (integration)  {
      configuredOptions.push(integration)
    }
  });
  return configuredOptions
}

export const action: ActionFunction = async ({ request }) => {
  console.log('integration page action called')
  const cookies = request.headers.get('Cookie')
  const form = await request.formData()
  const formData = Object.fromEntries(form) as unknown as TypeformIntegrationSetupFormData | GithubIntegrationSetupFormData | GitlabIntegrationSetupFormData
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  // console.log({formData, applicationId})
  const dbClient = new PrismaClient().applicationIntegration
  const integrationClient = IntegrationClient(dbClient)
  if ('integration_name' in formData) {
    console.log('integration_name', formData.integration_name,)
    const integrationOptionData = availableIntegrations.find(i => i.name.toLowerCase() === formData.integration_name.toLowerCase())
    const iv = process.env.ENCRYPTION_IV 
    const key = process.env.ENCRYPTION_KEY
     if (!key || !iv) {
       return json({updatedIntegrations: null})
     }
     
    const encryptedToken = encrypt(formData.api_token, key, iv)
    if (integrationOptionData && integrationOptionData.name.toLowerCase() === 'typeform') {
      console.log('integrationOptionData', integrationOptionData)
      await integrationClient.addIntegration<TypeformIntegrationMetaData>(applicationId, formData.integration_name as PLAvailableIntegrationNames, formData.api_token, {
        form_id: (formData as TypeformIntegrationSetupFormData).typeform_form_id,
        tag_name: 'productlamb-webhook',        
      })
    } else if (integrationOptionData && integrationOptionData.name.toLowerCase() === 'github') {
      await integrationClient.addIntegration(applicationId, formData.integration_name as PLAvailableIntegrationNames, formData.api_token, {
        repository_name: (formData as GithubIntegrationSetupFormData).repository_name,
        repository_owner: (formData as GithubIntegrationSetupFormData).repository_owner,
      })

    } else if (integrationOptionData && integrationOptionData.name.toLowerCase() === 'gitlab') {
      await integrationClient.addIntegration(applicationId, formData.integration_name as PLAvailableIntegrationNames, formData.api_token, {
        project_id: (formData as GitlabIntegrationSetupFormData).project_id,
      })
    }
    
    const {data: integrations} = await integrationClient.getAllApplicationIntegrations(applicationId)
    return json({updatedIntegrations: integrations || [null]})
  }
  return json({updatedIntegrations: null})
}


export const loader: LoaderFunction = async ({ request }) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  console.log('integrations loader', {applicationId})
  const dbClient = new PrismaClient().applicationIntegration
  const integrationClient = IntegrationClient(dbClient) 
  const {data: integrations} = await integrationClient.getAllApplicationIntegrations(applicationId) 
  console.log({integrations})
  return json({ integrations: integrations || []})
}

export default function IntegrationsPage() {
  const {updatedIntegrations} = useLoaderData<typeof action>() || {updatedIntegrations: null }
  const { integrations: configuredIntegrations } = useLoaderData<typeof loader>() || { integrations: [] }
  const [integrations, setIntegrations] = useState(updatedIntegrations || configuredIntegrations)
  const [integrationsSetup, setIntegrationsSetup] = useState(getIntegrationsByname(integrations, availableIntegrations))
  const [optionsModalOpen, setOptionsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationOptions|null>(null)

  const getIntegrationById = (name: string) => availableIntegrations.find(i => i.name === name)!

  const openEditModal = (integration_name: string) => {
    const integration = getIntegrationById(integration_name)
    setSelectedIntegration(integration)
    setEditModalOpen(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Connect your favorite apps to ProductLamb</p>
        <PLIconButton icon="ri-add-line" onClick={() => setOptionsModalOpen(true)}/>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-5">
        { integrationsSetup.map((integration, index) => <PLIntegrationOption key={index} integration={integration} addMode={false} onEditButtonClick={() => openEditModal(integration.name)}/>) }
      </div>
      <PLIntegrationOptionsModal open={optionsModalOpen} setOpen={setOptionsModalOpen} configuredIntegrations={[]}/>
      <PLIntegrationEditModal open={editModalOpen} setOpen={setEditModalOpen} integration={selectedIntegration}/>
    </div>
  )
}