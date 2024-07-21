import { ApplicationIntegration, PrismaClient } from "@prisma/client"
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import React from "react"
import { useState } from "react"
import { account } from "~/backend/cookies/account"
import { IntegrationClient } from "~/backend/database/integrations/ client"
import { PLIconButton } from "~/components/buttons/icon-button"
import { PLContentLess } from "~/components/common/contentless"
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
  const cookies = request.headers.get('Cookie')
  const form = await request.formData()
  const formData = Object.fromEntries(form) as unknown as TypeformIntegrationSetupFormData | GithubIntegrationSetupFormData | GitlabIntegrationSetupFormData | { action: string, integration_id: string } | { google_type: string, application_id: string, form_id?: string }
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  const prisma = new PrismaClient()
  const dbClient = new PrismaClient().applicationIntegration
  const integrationClient = IntegrationClient(dbClient)
  if ('google_type' in formData) {
    const type = formData.google_type.toLowerCase().includes('calendar') ? 'calendar' : 'forms'
    // update create base url based on environment
    const baseUrl = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
    const body: {form_id?: string, type: string} = {type}
    if (type === 'forms' && 'form_id' in formData) {
      body['form_id'] = formData.form_id
    }
    const response = await fetch(`${baseUrl}/integrations/google/${applicationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (response.status === 200) {
      const body = await response.json()
      if (body?.url) {
        return redirect(body.url)
      }
    }
    const {data: integrations} = await integrationClient.getAllApplicationIntegrations(applicationId)
    return json({updatedIntegrations: integrations || [null]})
  } else if ('integration_name' in formData) {
    const integrationOptionData = availableIntegrations.find(i => i.name.toLowerCase() === formData.integration_name.toLowerCase())
    const iv = process.env.ENCRYPTION_IV 
    const key = process.env.ENCRYPTION_KEY
     if (!key || !iv) {
       return json({updatedIntegrations: null})
     }
     
    const encryptedToken = encrypt(formData.api_token, key, iv)
    if (integrationOptionData && integrationOptionData.name.toLowerCase() === 'typeform') {
      await integrationClient.addIntegration<TypeformIntegrationMetaData>(applicationId, formData.integration_name as PLAvailableIntegrationNames, encryptedToken, {
        form_id: (formData as TypeformIntegrationSetupFormData).typeform_form_id,
        tag_name: 'productlamb-webhook',        
      })
    } else if (integrationOptionData && integrationOptionData.name.toLowerCase() === 'github') {
      await integrationClient.addIntegration(applicationId, formData.integration_name as PLAvailableIntegrationNames, encryptedToken, {
        repository_name: (formData as GithubIntegrationSetupFormData).repo_name,
        repository_owner: (formData as GithubIntegrationSetupFormData).repo_owner,
      })

    } else if (integrationOptionData && integrationOptionData.name.toLowerCase() === 'gitlab') {
      await integrationClient.addIntegration(applicationId, formData.integration_name as PLAvailableIntegrationNames, encryptedToken, {
        project_id: (formData as GitlabIntegrationSetupFormData).project_id,
      })
    }
    
    const {data: integrations} = await integrationClient.getAllApplicationIntegrations(applicationId)
    return json({updatedIntegrations: integrations || [null]})
  } else if ('action' in formData && formData.action === 'disconnect') {
    const {data: integration} = await integrationClient.getIntegration(Number(formData.integration_id))
    const googleIntegrations = await dbClient.count({where: {name: { contains: 'google'}, applicationId}})
    if (integration?.name.toLowerCase().includes('google') && googleIntegrations < 2) {
      await prisma.applicationGoogleIntegration.deleteMany({where: {applicationId}})
    }
    await integrationClient.deleteIntegration(Number(formData.integration_id))
    const {data: integrations} = await integrationClient.getAllApplicationIntegrations(applicationId)
    return json({updatedIntegrations: integrations || [null]})
  } else {
    return json({updatedIntegrations: null})
  }
}


export const loader: LoaderFunction = async ({ request }) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  const dbClient = new PrismaClient()
  const integrationClient = IntegrationClient(dbClient.applicationIntegration) 
  const {data: integrations} = await integrationClient.getAllApplicationIntegrations(applicationId) 
  const hasGoogleOAuth = !!(await dbClient.applicationGoogleIntegration.count({where: {applicationId}}))
  return json({ integrations: integrations || [], applicationId, hasGoogleOAuth})
}

export default function IntegrationsPage() {
  const {updatedIntegrations, applicationId, hasGoogleOAuth} = useLoaderData<typeof action>() || {updatedIntegrations: null, applicationId: null, hasGoogleOAuth: null}
  const { integrations: configuredIntegrations } = useLoaderData<typeof loader>() || { integrations: [] }
  const [integrations, setIntegrations] = useState<ApplicationIntegration[]>(updatedIntegrations || configuredIntegrations)
  const [integrationsSetup, setIntegrationsSetup] = useState(getIntegrationsByname(integrations, availableIntegrations))
  const [optionsModalOpen, setOptionsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationOptions|null>(null)

  const formRef = React.createRef<HTMLFormElement>()
  const actionRef = React.createRef<HTMLInputElement>()
  const integrationIdRef = React.createRef<HTMLInputElement>()
  const getIntegrationById = (name: string) => availableIntegrations.find(i => i.name === name)!

  const openEditModal = (integration_name: string) => {
    const integration = getIntegrationById(integration_name)
    setSelectedIntegration(integration)
    setEditModalOpen(true)
  }
  const getConfiguredIntegrations = () => {
    return getIntegrationsByname(integrations, availableIntegrations).map(i => i.id)
  }

  const getIntegrationByAvailableName = (currentIntegration: IntegrationOptions) => {
    return integrations.find(option => option.name.toLowerCase() === currentIntegration.name.toLowerCase())
  }

  const deleteIntegration = (integration_id: number) => {
    console.log('deleting integration', integration_id)
    integrationIdRef.current!.value = `${integration_id}`
    actionRef.current!.value = 'disconnect'
    formRef.current!.submit()
  }

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Connect your favorite apps to ProductLamb</p>
        <PLIconButton icon="ri-add-line" onClick={() => setOptionsModalOpen(true)}/>
      </div>
      <Form method="post" ref={formRef}>
        <input type="hidden" name="action" ref={actionRef}/>
        <input type="hidden" name="integration_id" ref={integrationIdRef}/>
      </Form>
      { integrationsSetup.length === 0 && <PLContentLess itemType="integration"/>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-5">
        { integrationsSetup.map((integration, index) => <PLIntegrationOption key={index} integration={integration} addMode={false} onEditButtonClick={() => openEditModal(integration.name)} onDelete={() => deleteIntegration(getIntegrationByAvailableName(integration)!.id)}/>) }
      </div>

      <PLIntegrationOptionsModal open={optionsModalOpen} setOpen={setOptionsModalOpen} configuredIntegrations={getConfiguredIntegrations()} applicationId={applicationId} hasGoogleOAuth={hasGoogleOAuth}/>
      {/* TODO: Update to not allow editing google items */}
      <PLIntegrationEditModal open={editModalOpen} setOpen={setEditModalOpen} integration={selectedIntegration}/>
    </div>
  )
}