import { PrismaClient } from "@prisma/client"
import { DeleteApplicationGoals } from "~/types/function.types"

export function wrapDeleteApplicationGoal(client: PrismaClient['applicationGoal']) {
  return deleteApplicationGoal
  async function deleteApplicationGoal (id: number) {
    try {
      await client.delete({ where: { id } })
      return { data: true, errors: [] }
    } catch (e) {
      return { data: false, errors: [1] }
    }
  }
}

export function wrapDeleteApplicationGoals(client: PrismaClient['applicationGoal']): DeleteApplicationGoals {
  return deleteApplicationGoals

  async function deleteApplicationGoals(application_id: number, ids?: number[]) {
    const query = ids ? { id: { in: ids }, applicationId: application_id } : { applicationId: application_id }
    try {
      const {count} = await client.deleteMany({ where: query })
      if (ids && count !== ids.length) {
        return { data: false, errors: [2] }
      }
      return { data: true, errors: [] }
    } catch (e) {
      return { data: false, errors: [1] }
    }
  }
}