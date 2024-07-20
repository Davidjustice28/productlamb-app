import { PLBaseModal } from "../../base";
import { FeedbackIntegrations } from "~/types/component.types";
import { useActionData } from "@remix-run/react";
import { useState, useRef } from "react";
import { PLBasicButton } from "~/components/buttons/basic-button";

export function PLBulkUploadFeedbackModal({open, onClose, setOpen, availableIntegrations}: {availableIntegrations: Array<FeedbackIntegrations>, open: boolean, onClose?: () => void, setOpen: (open: boolean) => void}) {
  const closeModal = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <PLBaseModal open={open} onClose={closeModal} setOpen={setOpen} size="sm" title="Bulk upload feedback">
      <div className="p-5 flex flex-col gap-3 text-black dark:text-white">
        <CsvUploadComponent/> 
      </div>
    </PLBaseModal>
  );
}


export function CsvUploadComponent() {
  let {data, actionError} = useActionData() as {data?: any, actionError?: any} || {data: null, actionError: null};
  let [fileName, setFileName] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const handleFileChange = (event: any) => {
    setFileName(event.target.files[0]?.name || "");
  };

  const submitFeedback = async () => {
    formRef.current?.submit();
  }

  return (
    <div className="flex flex-col gap-5 py-2">
      <h1 className="">Have a lot of feedback written down or on random files? Choose a csv with all of your feedback and upload it all at once. Use the below template to correctly structure your data.</h1>
      <CodeSnippet />
      <form method="post" encType="multipart/form-data" className="flex flex-col gap-5" ref={formRef}>
        <input type="file" name="csv" accept=".csv" onChange={handleFileChange} />
        <div>
          <PLBasicButton text="Upload Feedback" onClick={submitFeedback} disabled={!fileName.length}/>
        </div>
      </form>
    </div>
  );
}

export const CodeSnippet = () => {
  return (
    <div style={{
      padding: '10px',
      backgroundColor: 'black',
      borderRadius: '5px',
    
    }}>
      <pre style={{margin: 0}}>
        <code className="javascript" style={{
          // backgroundColor: '#f8f8f8',
          color: 'white',
          borderRadius: '5px',
        
        }}>
          {`SOURCE_NAME,FEEDBACK,MM/DD/YYYY`}
        </code>
      </pre>
    </div>
  );
};
