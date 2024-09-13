import { useEffect, useRef, useState } from "react"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { ClickUpData, GithubData, JiraData, NotionData, PROJECT_MANAGEMENT_TOOL } from "~/types/database.types"


export function PLProjectManagementToolLink({onToolConfirmation, disabled, toolConfigured, application_id=-1}: {onToolConfirmation: (data: any) => void, disabled?: boolean, application_id?: number, toolConfigured?: {type: 'notion' | 'jira' | 'clickup' | 'github', data: JiraData | NotionData | ClickUpData | GithubData } | null, isApplicationSettingsPage?: boolean}) {
  const options = Object.values(PROJECT_MANAGEMENT_TOOL)
  const [selectedToolIndex, setSelectedToolIndex] = useState<number>(toolConfigured ? options.map(o => o.toLowerCase()).indexOf(toolConfigured.type === 'github' ? 'github projects' : toolConfigured.type) : 0)
  const [data, setData] = useState<NotionData|ClickUpData |JiraData | GithubData>()
  const [toolConfirmed, setToolConfirmed] = useState<boolean>(toolConfigured ? true : false)
  const [initalLoad, setInitialLoad] = useState<boolean>(true)
  const onTabChange = (index: number) => {
    if (!toolConfirmed) {
      setSelectedToolIndex(index)
    }
  }

  const removeConfig = application_id > -1 ? async () => {
    await fetch('/api/pm-tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({application_id: application_id, remove_config: true})
    }).then(res => {
        setToolConfirmed(false)
    }).catch(err => null)
  } : undefined

  useEffect(() => {
    if (toolConfirmed && !initalLoad) {
      onToolConfirmation(data)
    }

    if (initalLoad) {
      setInitialLoad(false)
    }
  }, [toolConfirmed])

  return (
    <div className={disabled ? 'hidden' : "flex-col flex gap-5 p-5 text-black dark:text-white border-2 rounded dark:border-neutral-400 border-gray-300 mt-8"}>
      <h2 className="text-xl font-bold -mb-4">Connect to Project Management Tool</h2>
      <p className="text-neutral-500 font-medium dark:text-neutral-400">If you would like your ProductLamb manager to be able to manage sprints for you, please configure a tool below. Skip otherwise.</p> 
      <div className="w-full border-2 mb-3 dark:border-neutral-600"></div>
      <div className="flex gap-2">
        {options.map((tool, index) => {
          return (
            <button key={tool} type="button" onClick={() => onTabChange(index)} className={`flex border-2 items-center justify-center rounded-lg px-4 py-2 ${selectedToolIndex === index ? "bg-black border-black text-white" : "bg-white text-black"}`}>
              {tool}
            </button>
          )
        })}
      </div>
      <div>
        {selectedToolIndex === 0 && <ClickUpToolForm setData={setData} setToolConfirmed={setToolConfirmed} removeConfig={removeConfig} clickupConfig={toolConfigured && toolConfigured.type === 'clickup' ? toolConfigured.data as any: undefined}/>}
        {selectedToolIndex === 1 && <JiraToolForm setData={setData} setToolConfirmed={setToolConfirmed} removeConfig={removeConfig} jiraConfig={toolConfigured && toolConfigured.type === 'jira' ? toolConfigured.data as any: undefined}/>}
        {selectedToolIndex === 2 && <NotionToolForm setData={setData} setToolConfirmed={setToolConfirmed} removeConfig={removeConfig} notionConfig={toolConfigured && toolConfigured.type === 'notion' ? toolConfigured.data as any: undefined}/>}
        {selectedToolIndex === 3 && <GithubProjectsToolForm setData={setData} setToolConfirmed={setToolConfirmed} removeConfig={removeConfig} githubConfig={toolConfigured && toolConfigured.type === 'github' ? toolConfigured.data as any: undefined}/>}
        <p className="text-black dark:text-white mt-5 italic">Need help finding your credentials? Here's a simple steps-by-step <a href="https://docs.google.com/document/d/1lfK0njWuhI0eGz1hEaE82UTUwZSW_N97Zu65DwYAci8/edit?usp=sharing" target="_blank" className="text-blue-600 dark:text-blue-500 font-bold underline"> guide</a></p>
      </div>
    </div>
  )
}

const NotionToolForm = ({setData, setToolConfirmed, notionConfig, removeConfig}: {setData: any, setToolConfirmed: any, notionConfig?: {apiKey: string, parentPageId: string}, removeConfig?: (() => Promise<void>)}) => {

  const tokenInputRef = useRef<HTMLInputElement>(null)
  const parentIdInputRef = useRef<HTMLInputElement>(null)
  const [formValid, setFormValid] = useState<boolean>(false)
  const [confirmed, setConfirmed] = useState<boolean>(notionConfig ? true : false)

  const checkValidity = () => {
    const notValid = !tokenInputRef.current?.value || !parentIdInputRef.current?.value
    setFormValid(!notValid)
  }

  const onConfirm = () => {
    setData({apiKey: tokenInputRef.current?.value, parentPageId: parentIdInputRef.current!.value})
    setConfirmed(true)
    setToolConfirmed(true)
  }

  const deleteConfig = async () => {
    if (removeConfig) {
      await removeConfig()
      tokenInputRef.current!.value = ''
      parentIdInputRef.current!.value = ''
    }
    setToolConfirmed(false)
  }

  useEffect(() => {
    if (notionConfig) {
      tokenInputRef.current!.value = notionConfig.apiKey
      parentIdInputRef.current!.value = notionConfig.parentPageId
      setFormValid(true)
    }
  }, [])

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
    {!notionConfig ? <PLBasicButton onClick={onConfirm} text={confirmed ? 'Confirmed' : "Confirm Configuration"} disabled={!formValid || confirmed}/> :
      <div><PLBasicButton text="Remove Config" icon="ri-close-line" iconSide="left" noDefaultDarkModeStyles colorClasses="bg-red-500 text-black" onClick={deleteConfig}/></div>
    }
    </>
  )
}

const ClickUpToolForm = ({setData, setToolConfirmed, clickupConfig, removeConfig}: {setData: any, setToolConfirmed: any, clickupConfig?: {apiToken: string, parentFolderId: string}, removeConfig?: (() => Promise<void>)}) => {
  const tokenInputRef = useRef<HTMLInputElement>(null)
  const parentIdInputRef = useRef<HTMLInputElement>(null)
  const [formValid, setFormValid] = useState<boolean>(false)
  const [confirmed, setConfirmed] = useState<boolean>(clickupConfig ? true : false)

  const checkValidity = () => {
    const notValid = !tokenInputRef.current?.value || !parentIdInputRef.current?.value
    setFormValid(!notValid)
  }

  const onConfirm = () => {
    setData({apiToken: tokenInputRef.current?.value, parentFolderId: parseInt(parentIdInputRef.current!.value)})
    setConfirmed(true)
    setToolConfirmed(true)
  }

  const deleteConfig = async () => {
    if (removeConfig) {
      await removeConfig()
      tokenInputRef.current!.value = ''
      parentIdInputRef.current!.value = ''
    }
    setToolConfirmed(false)
  }

  useEffect(() => {
    if (clickupConfig) {
      tokenInputRef.current!.value = clickupConfig.apiToken
      parentIdInputRef.current!.value = clickupConfig.parentFolderId
      setFormValid(true)
    }
  } , [])

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
      {!clickupConfig ? <PLBasicButton onClick={onConfirm} text={confirmed ? 'Confirmed' : "Confirm Configuration"} disabled={!formValid || confirmed}/> :
       <div><PLBasicButton text="Remove Config" icon="ri-close-line" iconSide="left" noDefaultDarkModeStyles colorClasses="bg-red-500 text-black" onClick={deleteConfig}/></div>
      }
    </>
  )
}

const JiraToolForm = ({setData, setToolConfirmed, jiraConfig, removeConfig}: {setData: any, setToolConfirmed: any, jiraConfig?: {apiToken: string, parentBoardId: string, email: string, hostUrl: string, projectKey: string}, removeConfig?: (() => Promise<void>)}) => {
  const tokenInputRef = useRef<HTMLInputElement>(null)
  const parentIdInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const hostUrlInputRef = useRef<HTMLInputElement>(null)
  const projectKeyInputRef = useRef<HTMLInputElement>(null)
  const [formValid, setFormValid] = useState<boolean>(false)
  const [confirmed, setConfirmed] = useState<boolean>(jiraConfig ? true : false)

  const checkValidity = () => {
    const notValid = !tokenInputRef.current?.value || !parentIdInputRef.current?.value || !emailInputRef.current?.value || !hostUrlInputRef.current?.value || !projectKeyInputRef.current?.value
    setFormValid(!notValid)
  }

  const onConfirm = () => {
    setData({apiToken: tokenInputRef.current?.value, parentBoardId: parentIdInputRef.current!.value, email: emailInputRef.current!.value, hostUrl: hostUrlInputRef.current!.value, projectKey: projectKeyInputRef.current!.value})
    setConfirmed(true)
    setToolConfirmed(true)
  }

  const deleteConfig = async () => {
    if (removeConfig) {
      await removeConfig()
      tokenInputRef.current!.value = ''
      parentIdInputRef.current!.value = ''
      emailInputRef.current!.value = ''
      hostUrlInputRef.current!.value = ''
      projectKeyInputRef.current!.value = ''
    }
    setToolConfirmed(false)
  }

  useEffect(() => {
    if (jiraConfig) {
      tokenInputRef.current!.value = jiraConfig.apiToken
      parentIdInputRef.current!.value = jiraConfig.parentBoardId
      emailInputRef.current!.value = jiraConfig.email
      hostUrlInputRef.current!.value = jiraConfig.hostUrl
      projectKeyInputRef.current!.value = jiraConfig.projectKey
      setFormValid(true)
    }
  }, [])

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
    {!jiraConfig ? <PLBasicButton onClick={onConfirm} text={confirmed ? 'Confirmed' : "Confirm Configuration"} disabled={!formValid || confirmed}/> :
      <div><PLBasicButton text="Remove Config" icon="ri-close-line" iconSide="left" noDefaultDarkModeStyles colorClasses="bg-red-500 text-black" onClick={deleteConfig}/></div>
    }
    </>
  )
}

const GithubProjectsToolForm = ({setData, setToolConfirmed, githubConfig, removeConfig}: {setData: any, setToolConfirmed: any, githubConfig?: GithubData, removeConfig?: (() => Promise<void>)}) => {
  const tokenInputRef = useRef<HTMLInputElement>(null)
  const projectIdInputRef = useRef<HTMLInputElement>(null)
  const repoInputRef = useRef<HTMLInputElement>(null)
  const ownerInputRef = useRef<HTMLInputElement>(null)
  
  const [formValid, setFormValid] = useState<boolean>(false)
  const [confirmed, setConfirmed] = useState<boolean>(githubConfig ? true : false)

  const checkValidity = () => {
    const notValid = !tokenInputRef.current?.value || !projectIdInputRef.current?.value
    setFormValid(!notValid)
  }

  const onConfirm = () => {
    setData({apiToken: tokenInputRef.current?.value, projectId: parseInt(projectIdInputRef.current!.value), repo: repoInputRef.current!.value, owner: ownerInputRef.current!.value})
    setConfirmed(true)
    setToolConfirmed(true)
  }

  const deleteConfig = async () => {
    if (removeConfig) {
      await removeConfig()
      tokenInputRef.current!.value = ''
      projectIdInputRef.current!.value = ''
      repoInputRef.current!.value = ''
      ownerInputRef.current!.value = ''
    }
    setToolConfirmed(false)
  }

  useEffect(() => {
    if (githubConfig) {
      tokenInputRef.current!.value = githubConfig.apiToken
      projectIdInputRef.current!.value = `${githubConfig.projectId}`
      repoInputRef.current!.value = githubConfig.repo
      ownerInputRef.current!.value = githubConfig.owner
      setFormValid(true)
    }
  } , [])

  return (
    <>
      <div className="flex flex-col gap-5 text-black dark:text-neutral-400 mb-5">
        <div className="flex flex-col gap-2">
          <label className="dark:text-white">API Token</label>
          <input type="password" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={tokenInputRef} onChange={checkValidity} disabled={confirmed}/>
          <small>Get your Github API Token from <a href="https://app.clickup.com/234234/settings">here</a></small>
        </div>
        <div className="flex flex-col gap-2">
          <label className="dark:text-white">Project Id</label>
          <input type="number" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" min={0} ref={projectIdInputRef} onChange={checkValidity} disabled={confirmed}/>
          <small>This project's board is where your tasks live</small>
        </div>
        <div className="flex flex-col gap-2">
          <label className="dark:text-white">Repositories</label>
          <input type="text" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={repoInputRef} onChange={checkValidity} disabled={confirmed}/>
          <small>Provide a comma separated list of repository names we can create issues for {'(Case Sensitive)'}</small>
        </div>
        <div className="flex flex-col gap-2">
          <label className="dark:text-white">Organization</label>
          <input type="text" className="border-2 border-gray-300 rounded-md p-2 dark:bg-transparent dark:border-neutral-700" ref={ownerInputRef} onChange={checkValidity} disabled={confirmed}/>
          <small>The name of the GitHub Organization {'(Case Sensitive)'}</small>
        </div>
      </div>
      {!githubConfig ? <PLBasicButton onClick={onConfirm} text={confirmed ? 'Confirmed' : "Confirm Configuration"} disabled={!formValid || confirmed}/> :
       <div><PLBasicButton text="Remove Config" icon="ri-close-line" iconSide="left" noDefaultDarkModeStyles colorClasses="bg-red-500 text-black" onClick={deleteConfig}/></div>
      }
    </>
  )
}