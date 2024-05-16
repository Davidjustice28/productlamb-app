import { PrismaClient, ApplicationCodeRepositoryInfo } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"

export function wrapDeleteApplicationRepository(client: PrismaClient['applicationCodeRepositoryInfo']) {
  return deleteApplicationRepository

  async function deleteApplicationRepository(repo_id: number): Promise<BaseResponse<ApplicationCodeRepositoryInfo>> {
    try {
      const app = await client.delete({where: {id: repo_id}})
      return {data: app, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }

  }
}

export function wrapDeleteAllApplicationRepositories(client: PrismaClient['applicationCodeRepositoryInfo']) {
  return deleteAllApplicationRepositories

  async function deleteAllApplicationRepositories(app_id: number): Promise<BaseResponse<boolean>> {
    try {
      await client.deleteMany({where: {applicationId: app_id}})
      return {data: true, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }

  }
}