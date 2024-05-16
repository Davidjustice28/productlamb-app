import { PrismaClient } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"

export function wrapDeleteAllApplicationFeedback(client: PrismaClient['applicationFeedback']) {
  return deleteAllApplicationFeedback

  async function deleteAllApplicationFeedback(app_id: number): Promise<BaseResponse<boolean>> {
    try {
      await client.deleteMany({where: {applicationId: app_id}}, )
      return {data: true, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}