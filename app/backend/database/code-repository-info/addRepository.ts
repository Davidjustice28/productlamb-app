import { NewApplicationData } from '~/types/database.types'
import { BaseResponse } from '../../../types/base.types'
import { PrismaClient, Account, AccountApplication, ApplicationCodeRepositoryInfo } from '@prisma/client'

export interface RepositoryCreationBaseInfo {
  platform: string
  secret: string
}

export interface GithubRepositoryInfo extends RepositoryCreationBaseInfo {
  repositoryName: string
  repositoryOwner: string
}

export interface GitlabRepositoryInfo extends RepositoryCreationBaseInfo {
  repositoryId: number
}

export function wrapAddApplicationRepository(client: PrismaClient['applicationCodeRepositoryInfo']) {
  return addApplicationRepository

  async function addApplicationRepository(platform: "github" | "gitlab", info: GithubRepositoryInfo | GitlabRepositoryInfo): Promise<BaseResponse<ApplicationCodeRepositoryInfo>> {
    let data: any = {}

    if (platform === 'github') {
      const {repositoryName, repositoryOwner, secret} = info as GithubRepositoryInfo
      data = {repositoryName, repositoryOwner, secret, platform, archived: false}
    } else {
      const {repositoryId, secret} = info as GitlabRepositoryInfo
      data = {repositoryId, secret, platform, archived: false}
    }
    try {
      const repo = await client.create({data: data})
      return {data: repo, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}

export function wrapAddMultipleRepositories(client: PrismaClient['applicationCodeRepositoryInfo']) {
  return addMultipleRepositories

  async function addMultipleRepositories(application_id: number, repositories: Array<GithubRepositoryInfo | GitlabRepositoryInfo>): Promise<BaseResponse<Array<ApplicationCodeRepositoryInfo>>> {
    const response = await client.createMany({
      data: repositories.map(repo => {
        if (repo.platform === 'github') {
          const {repositoryName, repositoryOwner, secret, platform} = repo as GithubRepositoryInfo
          return {repositoryName, repositoryOwner, secret, platform, archived: false, applicationId: application_id}
        } else {
          const {repositoryId, secret, platform} = repo as GitlabRepositoryInfo
          return {repositoryId, secret, platform, applicationId: application_id, archived: false}
        }
      })
    })
    if (response.count !== repositories.length) {
      return {data: [], errors: [1]}
    }
    const entries = await client.findMany({ where: {applicationId: application_id} })
    return {data: entries, errors: []}
  }
}