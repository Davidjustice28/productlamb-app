import { PrismaClient } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"

export function wrapDeleteBugs(client: PrismaClient['applicationBug']) {
  return deleteBugs
  async function deleteBugs(application_id: number, ids?: Array<number>): Promise<BaseResponse<boolean>> {
    const query = ids ? {id: {in: ids}, applicationId: application_id}: {applicationId: application_id} 
    try {
      const result = await client.deleteMany({ where: query })
      const success = ids ? result.count === ids.length : true
      return {data: success, errors: []}
    } catch (error) {
      return {data: false, errors: [1]}
    }
  }
}

export function wrapDeleteBug(client: PrismaClient['applicationBug']) {
  return deleteBug
  async function deleteBug(application_id: number, id: number): Promise<BaseResponse<boolean> > {
    try {
      const result = await client.delete({ where: {id, applicationId: application_id} })
      return {data: true, errors: []}
    } catch (error) {
      return {data: false, errors: [1]}
    }
  }
}