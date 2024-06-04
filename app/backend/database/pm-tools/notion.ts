import { ApplicationClickupIntegration, ApplicationNotionIntegration, PrismaClient } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"

export function wrapAddNotionConfiguration(client: PrismaClient['applicationNotionIntegration']) {
  return addNotionConfiguration

  async function addNotionConfiguration(api_token: string, parent_page_id: string, application_id: number): Promise<BaseResponse<ApplicationNotionIntegration>> {
    try {
      const data = await client.create({
        data: {
          api_token,
          parent_page_id,
          applicationId: application_id
        }
      })
      return {data, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}

export function wrapUpdateNotionConfiguration(client: PrismaClient['applicationNotionIntegration']) {
  return addNotionConfiguration

  async function addNotionConfiguration(id: number, updates: Partial<ApplicationNotionIntegration>): Promise<BaseResponse<ApplicationNotionIntegration>> {
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

export function wrapDeleteNotionConfiguration(client: PrismaClient['applicationNotionIntegration']) {
  return deleteNotionConfiguration

  async function deleteNotionConfiguration(id: number): Promise<BaseResponse<boolean>> {
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