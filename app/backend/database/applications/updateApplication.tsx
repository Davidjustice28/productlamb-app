import { AccountApplication, PrismaClient } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"
import { NewApplicationData } from "~/types/database.types"

export function wrapUpdateApplication(client: PrismaClient['accountApplication']) {
  return updateApplication

  async function updateApplication(id: number, data: Partial<NewApplicationData>): Promise<BaseResponse<AccountApplication>> {
    const {goals, ...rest} = data
    try {
      const entry = await client.update({where: {id}, data: {...rest}})
      return {data: entry, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}