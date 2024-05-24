import { useActionData } from "@remix-run/react";
import { useState, useRef } from "react";
import { PLBasicButton } from "~/components/buttons/basic-button";
import { CodeSnippet } from "~/components/common/code-snippet";
import { PLBaseModal } from "../../base";

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
    <div className="flex flex-col gap-3">
      <h1>Make sure your csv file is structured correctly. Follow our template below:</h1>
      <CodeSnippet />
      <form method="post" encType="multipart/form-data" style={{display: "flex", gap: 2}} ref={formRef}>
        <input type="file" name="csv" accept=".csv" onChange={handleFileChange} />
        <PLBasicButton text="Upload Feedback" onClick={submitFeedback}/>
      </form>
      {fileName && <p>Selected file: {fileName}</p>}
    </div>
  );
}