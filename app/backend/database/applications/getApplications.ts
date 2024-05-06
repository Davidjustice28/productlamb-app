import { NewApplicationData } from '~/types/database.types'
import { BaseResponse } from '../../../types/base.types'
import { PrismaClient, Account, AccountApplication } from '@prisma/client'

export function wrapGetAccountApplications(client: PrismaClient['accountApplication']) {
  return getAccountApplications

  async function getAccountApplications(account_id: number): Promise<BaseResponse<Array<AccountApplication>>> {
    try {
      const apps = await client.findMany({where: {accountId: account_id}})
      return {data: apps, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}