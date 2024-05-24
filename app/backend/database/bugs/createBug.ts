import { ApplicationBug, PrismaClient } from "@prisma/client";
import { BaseResponse } from "~/types/base.types";
import { BugSource, BugStatus, BugPriority, BugCreateData } from "~/types/database.types";


export function wrapCreateBug(client: PrismaClient['applicationBug']) {
  return createBug
  async function createBug(application_id: number, title: string, description: string, source: BugSource, status: BugStatus, priority: BugPriority = 'low' ): Promise<BaseResponse<ApplicationBug>> {
    const date = new Date().toISOString()
    try {
      const entry = await client.create({
        data: {
          title,
          description,
          source,
          status,
          priority,
          createdDateMs: date,
          applicationId: application_id,
        }
      })
      if (!entry) {
      }
      return {data: entry, errors: []}
    } catch (error) {
      return {data: undefined,errors: [1]}
    }
  }
}

export function wrapCreateManyBugs(client: PrismaClient['applicationBug']) {
  return createManyBugs
  
  async function createManyBugs(application_id: number, bugData: Array<BugCreateData>): Promise<BaseResponse<Array<ApplicationBug>>> {
    const date = new Date().toISOString()
    try {
      const data = bugData.map(bug => ({
        title: bug.title,
        description: bug.description,
        source: bug.source,
        status: bug.status,
        priority: bug.priority,
        createdDateMs: date,
        applicationId: application_id,
      }))
      const entries = await client.createMany({ data })
      if (entries.count !== bugData.length) {
        return {data: [], errors: [1]}
      }
      const bugs = await client.findMany({ where: {applicationId: application_id} })

      if (bugs.length >= bugData.length) {
        return {data: [], errors: [2]}
      }
      return {data: bugs, errors: []}
    } catch (error) {
      return {data: [], errors: [1]}
    }
  }
}