import { ApplicationClickupIntegration, PrismaClient } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"
import { encrypt } from "~/utils/encryption"

export function wrapAddClickupConfiguration(client: PrismaClient['applicationClickupIntegration']) {
  return addClickupConfiguration

  async function addClickupConfiguration(api_token: string, parent_folder_id: number, application_id: number): Promise<BaseResponse<ApplicationClickupIntegration>> {
    const encryptedToken = encrypt(api_token, process.env.ENCRYPTION_KEY!, process.env.ENCRYPTION_IV!)
    
    try {
      const data = await client.create({
        data: {
          api_token: encryptedToken,
          parent_folder_id,
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

export function wrapUpdateClickupConfiguration(client: PrismaClient['applicationClickupIntegration']) {
  return addClickupConfiguration

  async function addClickupConfiguration(id: number, updates: Partial<ApplicationClickupIntegration>): Promise<BaseResponse<ApplicationClickupIntegration>> {
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

export function wrapDeleteClickupConfiguration(client: PrismaClient['applicationClickupIntegration']) {
  return deleteClickupConfiguration

  async function deleteClickupConfiguration(id: number): Promise<BaseResponse<boolean>> {
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