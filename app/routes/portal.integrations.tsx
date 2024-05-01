import { mockIntegrations } from "~/backend/mocks/integrations"
import { PLIconButton } from "~/components/buttons/icon-button"
import { PLIntegrationOption } from "~/components/common/integration"

export default function IntegrationsPage() {
  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Connect your favorite apps to ProductLamb</p>
        <PLIconButton icon="ri-add-line"/>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-5">
        { mockIntegrations.map((integration, index) => <PLIntegrationOption key={index} integration={integration} addMode={false} />) }
      </div>
    </div>
  )
}