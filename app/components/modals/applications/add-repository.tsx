import { ApplicationCodeRepositoryInfo } from "@prisma/client"
import { useEffect, useRef, useState } from "react"
import { GithubRepositoryInfo, GitlabRepositoryInfo, RepositoryCreationBaseInfo } from "~/backend/database/code-repository-info/addRepository"
import { PLBasicButton } from "~/components/buttons/basic-button"
import { PLIconButton } from "~/components/buttons/icon-button"
import { PLStatusBadge } from "~/components/common/status-badge"
import { Colors } from "~/types/base.types"

export function PLNewRepositoryComponent({onRepositoriesChange, initialRepos}: {initialRepos?:ApplicationCodeRepositoryInfo[],  onRepositoriesChange?: (repositories: RepositoryCreationBaseInfo[]) => void}) {
  const [platform, setPlatform] = useState<"Github" | "Gitlab">("Github")
  const [repositories, setRepositories] = useState<(GithubRepositoryInfo| GitlabRepositoryInfo)[]>(convertRepoEntries(initialRepos) ?? [])
  const [addingRepo, setAddingRepo] = useState(false)

  const maxRepositories = 5

  const updatePlatform = (value: "Github" | "Gitlab") => {
    setPlatform(value)
  }

  const toggleAddingRepo = () => {
    setAddingRepo(true)
  }

  const secretInputRef = useRef<HTMLInputElement>(null)
  const ownerInputRef = useRef<HTMLInputElement>(null)
  const repositoryNameInputRef = useRef<HTMLInputElement>(null)
  const repositoryIdInputRef = useRef<HTMLInputElement>(null)

  const addRepository = () => {
    let newRepoData: GitlabRepositoryInfo | GithubRepositoryInfo 

    if (platform === "Github") {
      newRepoData = {
        platform,
        secret: secretInputRef.current?.value || "",
        repositoryName: repositoryNameInputRef.current?.value || "",
        repositoryOwner: ownerInputRef.current?.value || ""
      }
    } else {
      newRepoData = {
        platform,
        secret: secretInputRef.current?.value || "",
        repositoryId: repositoryIdInputRef.current?.value ? parseInt(repositoryIdInputRef.current?.value) : 0
      }
    }
    const updatedRepositories = [...repositories, newRepoData]
    setRepositories(updatedRepositories)
    setPlatform("Github")
    secretInputRef.current!.value = ""
    if (platform === "Github") {
      ownerInputRef.current!.value = ""
      repositoryNameInputRef.current!.value = ""
    } else {
      repositoryIdInputRef.current!.value = ""
    }
    setAddingRepo(false)
    onRepositoriesChange && onRepositoriesChange(updatedRepositories)
  }

  const removeRepository = (index: number) => {
    const updatedRepositories = repositories.reduce((acc, item, i) => {
      return index === i ? acc : [...acc, item]
    }, [] as (GitlabRepositoryInfo | GithubRepositoryInfo)[])
    setRepositories(updatedRepositories)
    onRepositoriesChange && onRepositoriesChange(updatedRepositories)
  }


  

  function NewRepositoryVaryingFields({platform}: {platform: "Github" | "Gitlab"}) {
    return (
      <>
        {platform === "Github" ? 
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Repository Name</label>
              <input 
                type="text" 
                className="p-2 text-black dark:text-neutral-400 mt-1 block w-32 border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" 
                ref={repositoryNameInputRef}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Repository Owner</label>
              <input 
                type="text" 
                className="p-2 text-black dark:text-neutral-400 mt-1 block w-32 border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" 
                ref={ownerInputRef}
              />
            </div>
          </>
        :
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Repository ID</label>
              <input 
                type="number" 
                className="p-2 text-black dark:text-neutral-400 mt-1 block w-32 border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" 
                ref={repositoryIdInputRef}
                min={0}
              />
            </div>
          </>
        }
      </>
    )
  }
  
  return (
    <div className="w-full mt-5 gap-2 flex flex-col">
      <div className='w-full flex flex-col gap-3'>
        <div className="flex items-center gap-3">
         <PLBasicButton text="Link Repository" icon="ri-git-commit-line" onClick={toggleAddingRepo} disabled={(maxRepositories - repositories.length) <= 0}/>
         <p className={"text-black dark:text-neutral-300 " + (!repositories.length ? 'hidden' : '')}>{maxRepositories - repositories.length} Repositories left</p>
        </div>
        <div className={!addingRepo ? ' hidden' : "flex gap-3 items-end"}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Platform</label>
            <select 
              name="platform"
              value={platform}
              onChange={(e) => updatePlatform(e.target.value as "Github" | "Gitlab")}
              className="p-2 text-black dark:text-neutral-300 mt-1 block w-32 border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm"
            >
              <option value="Github">Github</option>
              <option value="Gitlab">Gitlab</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Secret</label>
            <input 
              type="password"
              className="p-2 text-black dark:text-neutral-400 mt-1 block w-32 border-2 dark:bg-transparent dark:border-neutral-700 border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 sm:text-sm" 
              ref={secretInputRef}
            />
          </div>
          <NewRepositoryVaryingFields platform={platform} />
          <div className="h-10">
            <PLBasicButton text="Link" icon={platform === "Github" ? "ri-github-fill" : "ri-gitlab-fill"} onClick={addRepository}/>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full border-t-2 border-neutral-400 mt-5 py-5">
        {
          !repositories.length ? <p className="text-black dark:text-neutral-300">Link atleast 1 code repository</p> :
          repositories.map((repo, index) => (
            <div key={index} className="flex flex-row gap-3 text-black dark:text-neutral-300 items-center">
              <p>
                {repo.platform} - {repo.platform === "Github" ? (repo as GithubRepositoryInfo).repositoryName : (repo as GitlabRepositoryInfo).repositoryId}
              </p>
              <PLStatusBadge text="Ready" color={Colors.GREEN}/>
              <PLIconButton icon="ri-close-line" colorClasses="text-red-600 text-lg hover:bg-neutral-100" onClick={() => removeRepository(index)}/>
            </div>
          ))
        }
      </div>
    </div>
  )
} 

function convertRepoEntries(dbEntries?: Array<ApplicationCodeRepositoryInfo>) : (GithubRepositoryInfo| GitlabRepositoryInfo)[] {
  if (!dbEntries) return []

  const initialData = dbEntries.map(({platform, id, secret, ...rest}) => {
    if (platform === "Github") {
      return {
        applicationId: id,
        platform,
        secret,
        repositoryName: rest.repositoryName!,
        repositoryOwner: rest.repositoryOwner!
      }
    } else {
      return {
        applicationId: id,
        platform,
        secret,
        repositoryId: rest.repositoryId!
      }
    }
  })

  return initialData

}