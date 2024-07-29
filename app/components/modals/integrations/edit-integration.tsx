import { IntegrationSetupComponent } from "~/components/integrations/setup-component";
import { PLBaseModal } from "../base";

export function PLIntegrationEditModal({open, onClose, setOpen, integration, onBackButtonClick, applicationId }: {open: boolean, onClose?: () => void, setOpen: (open: boolean) => void, integration: any, onBackButtonClick?: any, applicationId: number}){
  if (!integration) return null
  return (
    <PLBaseModal open={open} onClose={onClose} title="Edit Integration" setOpen={setOpen} size="lg">
      <div style={{height: "590px"}}>
        <IntegrationSetupComponent integration={integration} showBackButton={false} applicationId={applicationId}/>
      </div> 
    </PLBaseModal>
  )

}