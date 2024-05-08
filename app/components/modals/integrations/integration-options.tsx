import { useState } from "react"
import { PLBaseModal } from "../base"
import { PLIntegrationOption } from "~/components/integrations/integration"
import { availableIntegrations } from "~/static/integration-options"
import { IntegrationSetupComponent } from "~/components/integrations/setup-component"

export function PLIntegrationOptionsModal({open, onClose, setOpen, configuredIntegrations }: {open: boolean, onClose?: () => void, setOpen: (open: boolean) => void, configuredIntegrations: Array<number>}) {
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
            <IntegrationSetupComponent integration={availableIntegrations.find(i => i.id === integrationSelected)!} onBackButtonClick={() => setIntegrationSelected(null)}/>
          </div> 
        )
      }
      {
        integrationSelected === null &&
        (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 my-5 p-5 overflow-scroll" style={{height: "550px"}}>
            { availableIntegrations.filter(i => !configuredIntegrations.includes(i.id)).map((integration, index) => <PLIntegrationOption key={index} integration={integration} addMode={true} onAddButtonClick={() => onAddButtonClick(integration.id)}/>) }
          </div>
        )
      }
    </PLBaseModal>
  )
}