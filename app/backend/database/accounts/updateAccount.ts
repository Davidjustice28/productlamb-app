import { Account, AccountApplication, PrismaClient } from "@prisma/client"
import { BaseResponse } from "~/types/base.types"
import { NewApplicationData } from "~/types/database.types"

export function wrapUpdateAccount(client: PrismaClient['account']) {
  return updateAccount

  async function updateAccount(account_id: number, data: Partial<Account>): Promise<BaseResponse<Account>> {
    const {id, ...rest} = data
    try {
      const entry = await client.update({where: {id: account_id}, data: {...rest}})
      return {data: entry, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}