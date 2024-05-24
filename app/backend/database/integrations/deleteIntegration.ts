import { PrismaClient, ApplicationIntegration } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"

export function wrapDeleteIntegration(client: PrismaClient['applicationIntegration']) {
  return deleteIntegration

  async function deleteIntegration(integration_id: number): Promise<BaseResponse<boolean>> {
    try {
      const integration = await client.delete({
        where: {
          id: integration_id
        }
      })

      return {data: true, errors: []}
    } catch(err) {
      return {data: undefined, errors: [1]}
    }
  }
}