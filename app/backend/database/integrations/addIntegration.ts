import { ApplicationIntegration, PrismaClient } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"
import { PLAvailableIntegrationNames } from "~/types/database.types"


export function wrapAddIntegration(client: PrismaClient['applicationIntegration']) {
  return addIntegration

  async function addIntegration<T>(application_id: number, integrationName: PLAvailableIntegrationNames, secret: string, metadata: T): Promise<BaseResponse<ApplicationIntegration>> {
    const data = JSON.stringify(metadata)
    try {
      const integration = await client.create({
        data: {
          applicationId: application_id,
          name: integrationName,
          secret: secret,
          metadata: data,
        }
      })
      return {data: integration, errors: []}
    } catch(err) {
      return {data: undefined, errors: [1]}
    }
  }
}