import { PrismaClient, ApplicationCodeRepositoryInfo } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"

export function wrapGetApplicationRepository(client: PrismaClient['applicationCodeRepositoryInfo']) {
  return getApplicationRepository

  async function getApplicationRepository(repo_id: number): Promise<BaseResponse<ApplicationCodeRepositoryInfo>> {
    try {
      const repo = await client.findUnique({where: {id: repo_id}})
      return {data: repo ?? undefined, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}

export function wrapGetAllApplicationRepositories(client: PrismaClient['applicationCodeRepositoryInfo']) {
  return getAllApplicationRepositories

  async function getAllApplicationRepositories(app_id: number): Promise<BaseResponse<ApplicationCodeRepositoryInfo[]>> {
    try {
      const repos = await client.findMany({where: {applicationId: app_id}})
      return {data: repos, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}