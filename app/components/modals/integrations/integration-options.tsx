import { useState } from "react"
import { PLBaseModal } from "../base"
import { PLIntegrationOption } from "~/components/integrations/integration"
import { availableIntegrations } from "~/static/integration-options"
import { IntegrationSetupComponent } from "~/components/integrations/setup-component"

export function PLIntegrationOptionsModal({open, onClose, setOpen, configuredIntegrations, onSubmit, applicationId, hasGoogleOAuth }: {applicationId: number, open: boolean, onClose?: () => void, setOpen: (open: boolean) => void, configuredIntegrations: Array<number>, onSubmit?: (data: any) => void, hasGoogleOAuth?: boolean}) {
  const [integrationSelected, setIntegrationSelected] = useState<number|null>(null) 
  const onAddButtonClick = (id: number) => {
    setIntegrationSelected(id)
  }

  return (
    <PLBaseModal open={open} onClose={onClose} title="Available Integrations" setOpen={setOpen} size="lg">
      {
        integrationSelected !== null &&
        (
          <div style={{height: "590px"}}>
            <IntegrationSetupComponent integration={availableIntegrations.find(i => i.id === integrationSelected)!} onBackButtonClick={() => setIntegrationSelected(null)} onSubmit={onSubmit} applicationId={applicationId} hasGoogleOAuth={hasGoogleOAuth}/>
          </div> 
        )
      }
      {
        integrationSelected === null &&
        (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 my-5 p-5 overflow-scroll" style={{height: "550px"}}>
            { availableIntegrations.filter(i => !configuredIntegrations.includes(i.id)).sort((a,b) => (a.available && !b.available ? -1 : 1 )).map((integration, index) => <PLIntegrationOption key={index} integration={integration} addMode={true} onAddButtonClick={() => onAddButtonClick(integration.id)}/>) }
          </div>
        )
      }
    </PLBaseModal>
  )
}