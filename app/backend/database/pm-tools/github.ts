import { ApplicationGithubIntegration, PrismaClient } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"
import { encrypt } from "~/utils/encryption"

export function wrapAddGithubConfiguration(client: PrismaClient['applicationGithubIntegration']) {
  return addGithubConfiguration

  async function addGithubConfiguration(api_token: string, project_id: number, repo: string, owner: string, application_id: number): Promise<BaseResponse<ApplicationGithubIntegration>> {
    const encryptedToken = encrypt(api_token, process.env.ENCRYPTION_KEY!, process.env.ENCRYPTION_IV!)
    
    try {
      const data = await client.create({
        data: {
          api_token: encryptedToken,
          project_id,
          applicationid: application_id,
          repo,
          owner
        }
      })
      return {data, errors: []}
    } catch (e) {
      console.log(e)
      return {data: undefined, errors: [1]}
    }
  }
}

export function wrapUpdateGithubConfiguration(client: PrismaClient['applicationGithubIntegration']) {
  return addGithubConfiguration

  async function addGithubConfiguration(id: number, updates: Partial<ApplicationGithubIntegration>): Promise<BaseResponse<ApplicationGithubIntegration>> {
    try {
      const data = await client.update({
        data: updates,
        where: {id}
      })
      return {data, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}

export function wrapDeleteGithubConfiguration(client: PrismaClient['applicationGithubIntegration']) {
  return deleteGithubConfiguration

  async function deleteGithubConfiguration(id: number): Promise<BaseResponse<boolean>> {
    try {
      await client.delete({
        where: {id}
      })
      return {data: true, errors: []}
    } catch (e) {
      return {data: false, errors: [1]}
    }
  }
}