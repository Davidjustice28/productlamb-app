import { NewApplicationData } from '~/types/database.types'
import { BaseResponse } from '../../../types/base.types'
import { PrismaClient, Account, AccountApplication } from '@prisma/client'

export function wrapAddAccountApplication(client: PrismaClient['accountApplication']) {
  return addAccountApplication

  async function addAccountApplication(account_id: number, data: NewApplicationData): Promise<BaseResponse<AccountApplication>> {
    const { name, goals, summary, siteUrl, type,  } = data
    try {
      const app = await client.create({data: {
        accountId: account_id,
        name,
        summary,
        type,
        siteUrl,
        archived: false,
        sprint_generation_enabled: false,
      }})
      return {data: app, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}