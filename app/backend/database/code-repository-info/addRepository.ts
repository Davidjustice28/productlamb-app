import { NewApplicationData } from '~/types/database.types'
import { BaseResponse } from '../../../types/base.types'
import { PrismaClient, Account, AccountApplication, ApplicationCodeRepositoryInfo } from '@prisma/client'

interface RepositoryCreationBaseInfo {
  applicationId: number
  platform: string
  secret: string
}

interface GithubRepositoryInfo extends RepositoryCreationBaseInfo {
  repositoryName: string
  repositoryOwner: string
}
interface GitlabRepositoryInfo extends RepositoryCreationBaseInfo {
  repositoryId: number
}

export function wrapAddApplicationRepository(client: PrismaClient['applicationCodeRepositoryInfo']) {
  return addApplicationRepository

  async function addApplicationRepository(platform: "github" | "gitlab", info: GithubRepositoryInfo | GitlabRepositoryInfo): Promise<BaseResponse<ApplicationCodeRepositoryInfo>> {
    let data: any = {}

    if (platform === 'github') {
      const {repositoryName, repositoryOwner, secret, applicationId} = info as GithubRepositoryInfo
      data = {repositoryName, repositoryOwner, secret, applicationId, platform, archived: false}
    } else {
      const {repositoryId, secret, applicationId} = info as GitlabRepositoryInfo
      data = {repositoryId, secret, platform, applicationId, archived: false}
    }
    try {
      const repo = await client.create({data: data})
      return {data: repo, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}