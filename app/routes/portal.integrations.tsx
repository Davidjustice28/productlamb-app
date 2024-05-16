import { LoaderFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { useState } from "react"
import { PLIconButton } from "~/components/buttons/icon-button"
import { PLIntegrationOption } from "~/components/integrations/integration"
import { PLIntegrationEditModal } from "~/components/modals/integrations/edit-integration"
import { PLIntegrationOptionsModal } from "~/components/modals/integrations/integration-options"
import { availableIntegrations } from "~/static/integration-options"
import { IntegrationOptions } from "~/types/component.types"

export const loader: LoaderFunction = async ({ request }) => {
  return json({ integrations: []})
}

export default function IntegrationsPage() {
  const { integrations: configuredIntegrations } = useLoaderData<typeof loader>() || { integrations: [] }
  const [integrations, setIntegrations] = useState(configuredIntegrations)
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