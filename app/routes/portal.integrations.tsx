import { PrismaClient } from "@prisma/client"
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
import { TypeformIntegrationMetaData, TypeformIntegrationSetupFormData } from "~/types/integrations.types"

export const action: ActionFunction = async ({ request }) => {
  const cookies = request.headers.get('Cookie')
  const form = await request.formData()
  const formData = Object.fromEntries(form) as unknown as TypeformIntegrationSetupFormData
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  // console.log({formData, applicationId})
  const dbClient = new PrismaClient().applicationIntegration
  const integrationClient = IntegrationClient(dbClient)
  if ('integration_name' in formData) {
    const integrationOptionData = availableIntegrations.find(i => i.name.toLowerCase() === formData.integration_name)
    if (integrationOptionData && integrationOptionData.name === 'typeform') {
      // const webhookId = await integrationOptionData.onAdd(dbClient, formData.typeform_form_id, 'productlamb-webhook', applicationId)
      await integrationClient.addIntegration<TypeformIntegrationMetaData>(applicationId, formData.integration_name as PLAvailableIntegrationNames, formData.api_token, {
        form_id: formData.typeform_form_id,
        tag_name: 'productlamb-webhook',
        webhook_id: ''
        
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
  const [optionsModalOpen, setOptionsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationOptions|null>(null)

  const getIntegrationsById = (ids: Array<number>) => availableIntegrations.filter(i => ids.includes(i.id))
  const getIntegrationById = (id: number) => availableIntegrations.find(i => i.id === id)!

  const openEditModal = (id: number) => {
    const integration = getIntegrationById(id)
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
        { getIntegrationsById(integrations).map((integration, index) => <PLIntegrationOption key={index} integration={integration} addMode={false} onEditButtonClick={() => openEditModal(integration.id)}/>) }
      </div>
      <PLIntegrationOptionsModal open={optionsModalOpen} setOpen={setOptionsModalOpen} configuredIntegrations={[]}/>
      <PLIntegrationEditModal open={editModalOpen} setOpen={setEditModalOpen} integration={selectedIntegration}/>
    </div>
  )
}