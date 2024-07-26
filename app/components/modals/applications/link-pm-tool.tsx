import { useEffect, useRef, useState } from "react"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { ClickUpData, JiraData, NotionData, PROJECT_MANAGEMENT_TOOL } from "~/types/database.types"


export function PLProjectManagementToolLink({onToolConfirmation}: {onToolConfirmation: (data: any) => void}) {
  const options = Object.values(PROJECT_MANAGEMENT_TOOL)
  const [selectedToolIndex, setSelectedToolIndex] = useState<number>(0)
  const [data, setData] = useState<NotionData|ClickUpData |JiraData>()
  const [toolConfirmed, setToolConfirmed] = useState<boolean>(false)

  const onTabChange = (index: number) => {
    if (!toolConfirmed) {
      setSelectedToolIndex(index)
    }
  }

  useEffect(() => {
    if (toolConfirmed) {
      onToolConfirmation(data)
    }
  }, [toolConfirmed])

  return (
    <div className="flex-col flex gap-5 p-5 text-black dark:text-white border-2 rounded dark:border-neutral-400 mt-8">
      <h2 className="text-xl font-bold">Connect to Project Management Tool</h2>
      <div className="flex gap-2">
        {options.map((tool, index) => {
          return (
            <button key={tool} onClick={() => onTabChange(index)} className={`flex border-2 items-center justify-center rounded-lg px-4 py-2 ${selectedToolIndex === index ? "bg-black border-black text-white" : "bg-white text-black"}`}>
              {tool}
            </button>
          )
        })}
      </div>
      <div>
        {selectedToolIndex === 0 && <ClickUpToolForm setData={setData} setToolConfirmed={setToolConfirmed}/>}
        {selectedToolIndex === 1 && <JiraToolForm setData={setData} setToolConfirmed={setToolConfirmed}/>}
        {selectedToolIndex === 2 && <NotionToolForm setData={setData} setToolConfirmed={setToolConfirmed}/>}
      </div>
    </div>
  )
}

const NotionToolForm = ({setData, setToolConfirmed}: {setData: any, setToolConfirmed: any}) => {

  const tokenInputRef = useRef<HTMLInputElement>(null)
  const parentIdInputRef = useRef<HTMLInputElement>(null)
  const [formValid, setFormValid] = useState<boolean>(false)
  const [confirmed, setConfirmed] = useState<boolean>(false)

  const checkValidity = () => {
    const notValid = !tokenInputRef.current?.value || !parentIdInputRef.current?.value
    setFormValid(!notValid)
  }

  const onConfirm = () => {
    setData({apiKey: tokenInputRef.current?.value, parentPageId: parentIdInputRef.current!.value})
    setConfirmed(true)
    setToolConfirmed(true)
  }

  return (
    <>
    <div className="flex flex-col gap-5 text-black dark:text-neutral-400 mb-5">
      <div className="flex flex-col gap-2">
        <label className="dark:text-white">API Key</label>
        <input type="password" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={tokenInputRef} onChange={checkValidity} disabled={confirmed}/>
        <small>Get your Notion API Token from <a href="https://www.notion.so/my-integrations">here</a></small>
      </div>
      <div className="flex flex-col gap-2">
        <label className="dark:text-white">Parent Page Id</label>
        <input type="text" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={parentIdInputRef} onChange={checkValidity} disabled={confirmed}/>
        <small>This page is where we create ProductLamb's page</small>
      </div>
    </div>
    <PLBasicButton onClick={onConfirm} text={confirmed ? 'Confirmed' : "Confirm Configuration"} disabled={!formValid || confirmed}/>
    </>
  )
}

const ClickUpToolForm = ({setData, setToolConfirmed}: {setData: any, setToolConfirmed: any}) => {

  const tokenInputRef = useRef<HTMLInputElement>(null)
  const parentIdInputRef = useRef<HTMLInputElement>(null)
  const [formValid, setFormValid] = useState<boolean>(false)
  const [confirmed, setConfirmed] = useState<boolean>(false)


  const checkValidity = () => {
    const notValid = !tokenInputRef.current?.value || !parentIdInputRef.current?.value
    setFormValid(!notValid)
  }

  const onConfirm = () => {
    setData({apiToken: tokenInputRef.current?.value, parentFolderId: parseInt(parentIdInputRef.current!.value)})
    setConfirmed(true)
    setToolConfirmed(true)
  }

  return (
    <>
      <div className="flex flex-col gap-5 text-black dark:text-neutral-400 mb-5">
        <div className="flex flex-col gap-2">
          <label className="dark:text-white">API Token</label>
          <input type="password" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={tokenInputRef} onChange={checkValidity} disabled={confirmed}/>
          <small>Get your ClickUp API Token from <a href="https://app.clickup.com/234234/settings">here</a></small>
        </div>
        <div className="flex flex-col gap-2">
          <label className="dark:text-white">Parent Folder Id</label>
          <input type="number" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" min={0} ref={parentIdInputRef} onChange={checkValidity} disabled={confirmed}/>
          <small>This folder is where we create ProductLamb's folder</small>
        </div>
      </div>
      <PLBasicButton onClick={onConfirm} text={confirmed ? 'Confirmed' : "Confirm Configuration"} disabled={!formValid || confirmed}/>
    </>
  )
}

const JiraToolForm = ({setData, setToolConfirmed}: {setData: any, setToolConfirmed: any}) => {

  const tokenInputRef = useRef<HTMLInputElement>(null)
  const parentIdInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const hostUrlInputRef = useRef<HTMLInputElement>(null)
  const projectKeyInputRef = useRef<HTMLInputElement>(null)
  const [formValid, setFormValid] = useState<boolean>(false)
  const [confirmed, setConfirmed] = useState<boolean>(false)

  const checkValidity = () => {
    const notValid = !tokenInputRef.current?.value || !parentIdInputRef.current?.value || !emailInputRef.current?.value || !hostUrlInputRef.current?.value || !projectKeyInputRef.current?.value
    setFormValid(!notValid)
  }

  const onConfirm = () => {
    setData({apiToken: tokenInputRef.current?.value, parentBoardId: parentIdInputRef.current!.value, email: emailInputRef.current!.value, hostUrl: hostUrlInputRef.current!.value, projectKey: projectKeyInputRef.current!.value})
    setConfirmed(true)
    setToolConfirmed(true)
  }

  return (
    <>
    <div className="flex flex-col gap-5 text-black dark:text-neutral-400 mb-5">
      <div className="flex flex-col gap-2">
        <label className="dark:text-white">API Key</label>
        <input type="password" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={tokenInputRef} onChange={checkValidity} disabled={confirmed}/>
        <small>Get your Jira API Token from <a href="https://www.notion.so/my-integrations">here</a></small>
      </div>
      <div className="flex flex-col gap-2">
        <label className="dark:text-white">Parent Board Id</label>
        <input type="number" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={parentIdInputRef} onChange={checkValidity} disabled={confirmed}/>
        <small>This board is where we create ProductLamb's sprints</small>
      </div>
      <div className="flex flex-col gap-2">
        <label className="dark:text-white">Email</label>
        <input type="email" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={emailInputRef} onChange={checkValidity} disabled={confirmed}/>
        <small>The email address used for your Jira account</small>
      </div>
      <div className="flex flex-col gap-2">
        <label className="dark:text-white">Host URL</label>
        <input type="text" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={hostUrlInputRef} onChange={checkValidity} disabled={confirmed}/>
        <small>The URL of your Jira instance</small>
      </div>
      <div className="flex flex-col gap-2">
        <label className="dark:text-white">Project Key</label>
        <input type="text" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={projectKeyInputRef} onChange={checkValidity} disabled={confirmed}/>
        <small>The key of the project you want to link</small>
      </div>
    </div>
    <PLBasicButton onClick={onConfirm} text={confirmed ? 'Confirmed' : "Confirm Configuration"} disabled={!formValid || confirmed}/>
    </>
  )
}