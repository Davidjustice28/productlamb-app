import { PrismaClient, ApplicationIntegration } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"

export function wrapGetApplicationIntegrations(client: PrismaClient['applicationIntegration']) {
  return getApplicationIntegrations

  async function getApplicationIntegrations(application_id: number): Promise<BaseResponse<ApplicationIntegration[]>> {
    try {
      const integrations = await client.findMany({
        where: {
          applicationId: application_id
        }
      })

      return {data: integrations, errors: []}
    } catch(err) {
      return {data: undefined, errors: [1]}
    }
  }
}

export function wrapGetIntegration(client: PrismaClient['applicationIntegration']) {
  return getIntegration

  async function getIntegration(integration_id: number): Promise<BaseResponse<ApplicationIntegration>> {
    try {
      const integration = await client.findUnique({
        where: {
          id: integration_id
        }
      })

      if (!integration) {
        return {data: undefined, errors: [1]}
      }
      return {data: integration, errors: []}
    } catch(err) {
      return {data: undefined, errors: [2]}
    }
  }
}