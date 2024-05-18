import { useActionData } from "@remix-run/react";
import { useRef, useState } from "react";
import { PLBaseModal } from "../base";
import { CodeSnippet } from "~/components/common/code-snippet";
import { PLBasicButton } from "~/components/buttons/basic-button";

export function PLCsvUploadModal({open, onClose, setOpen}: {open: boolean, onClose?: () => void, setOpen: (open: boolean) => void}) {
  let {data, actionError} = useActionData() as {data?: any, actionError?: any} || {data: null, actionError: null};
  let [fileName, setFileName] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const handleFileChange = (event: any) => {
    setFileName(event.target.files[0]?.name || "");
  };

  const submitFeedback = async () => {

  }
  return (
    <PLBaseModal open={open} onClose={onClose} setOpen={setOpen} size="md">
      <div className="p-5 flex flex-col gap-3">
        <h1>Make sure your csv file is structured correctly. Follow our template below:</h1>
        <CodeSnippet />
        <form method="post" encType="multipart/form-data" style={{display: "flex", gap: 2}} ref={formRef}>
          <input type="file" name="csv" accept=".csv" onChange={handleFileChange} />
          <PLBasicButton text="Upload Feedback" onClick={submitFeedback}/>
        </form>
        {fileName && <p>Selected file: {fileName}</p>}
      </div>
    </PLBaseModal>
  );
}