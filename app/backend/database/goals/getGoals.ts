import { PrismaClient, ApplicationGoal } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"

export function wrapGetApplicationGoals(client: PrismaClient['applicationGoal']) {
  return getApplicationGoals

  async function getApplicationGoals(application_id: number): Promise<BaseResponse<Array<ApplicationGoal>>> {
    try {
      const entries = await client.findMany({where: {applicationId: application_id}})
      return {data: entries, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}