import { ApplicationBug, PrismaClient } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"

export function wrapGetAllBugs(client: PrismaClient['applicationBug']) {
  return getAllBugs
  async function getAllBugs(application_id: number): Promise<BaseResponse<Array<ApplicationBug>>> {
    try {
      const bugs = await client.findMany({ where: {applicationId: application_id} })
      return {data: bugs, errors: []}
    } catch (error) {
      return {data: [], errors: [1]}
    }
  }
}

export function wrapGetBugById(client: PrismaClient['applicationBug']) {
  return getBugById
  async function getBugById(id: number): Promise<BaseResponse<ApplicationBug | null>> {
    try {
      const bug = await client.findUnique({ where: {id} })
      return {data: bug, errors: []}
    } catch (error) {
      return {data: null, errors: [1]}
    }
  }
}