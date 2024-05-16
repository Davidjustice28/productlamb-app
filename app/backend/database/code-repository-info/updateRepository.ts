import { PrismaClient, ApplicationCodeRepositoryInfo } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"

export function wrapUpdateApplicationRepository(client: PrismaClient['applicationCodeRepositoryInfo']) {
  return updateApplicationRepository

  async function updateApplicationRepository(repo_id: number, data: Partial<ApplicationCodeRepositoryInfo>): Promise<BaseResponse<ApplicationCodeRepositoryInfo>> {
    try {
      const repo = await client.update({where: {id: repo_id}, data: data})
      return {data: repo, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }

}