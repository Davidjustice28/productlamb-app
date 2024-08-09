import { ChangeEvent, useRef, useState } from "react";
import { PLBaseModal } from "../base";
import { PLBasicButton } from "~/components/buttons/basic-button";
import { PLStatusBadge } from "~/components/common/status-badge";
import { Colors } from "~/types/base.types";


export function PLApplicationContextModel({ open, setOpen, applicationId=-1}: { open: boolean, applicationId?: number, setOpen: (open: boolean) => void}) {
  const [dataType, setDataType] = useState<'bugs' | 'feedback' | 'backlog'>('bugs')
  const [sourceType, setSourceType] = useState<'file' | 'notion'>('notion')
  const [fileType, setFileType] = useState<'csv' | 'json'| null>(null)
  const [loading, setLoading] = useState(false)
  function handleLabelChange(type: 'bugs' | 'feedback' | 'backlog') {
    setDataType(type)
  }

  const storeFile = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = e.target.files
    if (!files) return
    const file = files[0]
    file.stream
    const mimeType = file.type
    setFileType(mimeType === 'application/json' ? 'json' : 'csv')
  }

  const formRef = useRef<HTMLFormElement>(null)


  function NotionInstructions() {
    return (
      <div className="w-full flex flex-col gap-5 text-black dark:text-neutral-400">
        <p>Here's some instructions on how to export your data from Notion</p>
        <div className="flex flex-row gap-10 w-full mx-auto">
          <div className="w-1/3 flex flex-col gap-2 justify-start">
            <small>1. Click ellipse menu at top right corner</small>
            <img src="https://storage.googleapis.com/productlamb_project_images/Screenshot%202024-08-06%20at%209.45.10%E2%80%AFPM.png" alt="Notion Instructions" className="w-full object-contain border-2"/>
          </div>
          <div className="w-1/3 flex flex-col gap-2 justify-start">
            <small>2. Click "Export" option</small>
            <img src="https://storage.googleapis.com/productlamb_project_images/Screenshot%202024-08-06%20at%209.46.09%E2%80%AFPM.png" alt="Notion Instructions" className="w-full object-contain border-2"/>
          </div>
          <div className="w-1/3 flex flex-col gap-2 justify-start">
            <small>3. Select "Markdown & CSV" option</small>
            <img src="https://storage.googleapis.com/productlamb_project_images/Screenshot%202024-08-06%20at%209.45.37%E2%80%AFPM.png" alt="Notion Instructions" className="w-full object-contain border-2"/>
          </div>
        </div>
        <FileUploadComponent />
      </div>
    )
  }
  
  function FileUploadComponent() {
    return (
      <div className="flex flex-row gap-2">
        <form method="POST" encType="multipart/form-data" ref={formRef} action={`/api/context-file/${applicationId}`}>
          <input type="hidden" name="dataType" value={dataType}/>
          <input type="hidden" name="file_type" value={fileType ?? 'csv'}/>
          <input type="file" accept=".csv, .json" className="dark:text-neutral-400 font-bold" name="contextFile" onChange={(e) => storeFile(e)}/>
        </form>
      </div>
    )
  }

  function handleFormSubmit() {
    setLoading(true)
    formRef.current?.submit()
  }

  return (
    <PLBaseModal title="Application Initial Context" open={open} setOpen={setOpen} titleCenter={true} size="md">
      <div className="p-8 flex flex-col gap-2 h-[520px]">
        <div className="flex flex-row gap-2">
          <p className="text-black dark:text-neutral-400 font-bold">What are you uploading context for?</p>
          <div className="flex flex-row gap-3">
            <PLStatusBadge text='Bugs' color={Colors.RED} isActive={dataType === 'bugs'} onClick={() => handleLabelChange('bugs')}/>
            <PLStatusBadge text='Feedback' color={Colors.GREEN} isActive={dataType === 'feedback'} onClick={() => handleLabelChange('feedback')}/>
            <PLStatusBadge text='Backlog' color={Colors.BLUE} isActive={dataType === 'backlog'} onClick={() => handleLabelChange('backlog')}/>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <p className="text-black dark:text-neutral-400 font-bold">What source would you like to use to get data?</p>
          <div className="flex flex-row gap-3">
            <PLStatusBadge text='Notion' color={sourceType === 'notion' ? Colors.BLACK : Colors.WHITE} onClick={() => setSourceType('notion')}/>
            <PLStatusBadge text='File' color={sourceType !== 'notion' ? Colors.BLACK : Colors.WHITE} onClick={() => setSourceType('file')}/>
          </div>
        </div>

        {sourceType === 'notion' ? <NotionInstructions /> : <FileUploadComponent />}
        <div>
          <PLBasicButton 
            showLoader={loading}
            text={`Upload ${dataType}`} 
            noDefaultDarkModeStyles={true}
            colorClasses={"bg-orange-200 text-orange-600 absolute bottom-7" + (false ? ' cursor-not-allowed opacity-50' : ' cursor-pointer hover:bg-orange-500 hover:text-white')}
            useStaticWidth={false} 
            onClick={handleFormSubmit}
            disabled={applicationId === -1 || !fileType}
          />
        </div>
      </div>
    </PLBaseModal>

  )
}