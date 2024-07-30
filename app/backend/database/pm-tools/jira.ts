import { ApplicationJiraIntegration, PrismaClient } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"
import { encrypt } from "~/utils/encryption"

export function wrapAddJiraConfiguration(client: PrismaClient['applicationJiraIntegration']) {
  return addJiraConfiguration

  async function addJiraConfiguration(api_token: string, parent_board_id: number, email: string, project_key: string, host_url: string, application_id: number): Promise<BaseResponse<ApplicationJiraIntegration>> {
    const board_id = typeof parent_board_id === 'number' ? parent_board_id : Number(parent_board_id)
    const encryptedToken = encrypt(api_token, process.env.ENCRYPTION_KEY!, process.env.ENCRYPTION_IV!)

    try {
      const data = await client.create({
        data: {
          api_token: encryptedToken,
          parent_board_id: board_id,
          email,
          project_key,
          host_url,
          applicationId: application_id
        }
      })
      return {data, errors: []}
    } catch (e) {
      console.log(e)
      return {data: undefined, errors: [1]}
    }
  }
}

export function wrapUpdateJiraConfiguration(client: PrismaClient['applicationJiraIntegration']) {
  return addJiraConfiguration

  async function addJiraConfiguration(id: number, updates: Partial<ApplicationJiraIntegration>): Promise<BaseResponse<ApplicationJiraIntegration>> {
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

export function wrapDeleteJiraConfiguration(client: PrismaClient['applicationJiraIntegration']) {
  return deleteJiraConfiguration

  async function deleteJiraConfiguration(id: number): Promise<BaseResponse<boolean>> {
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