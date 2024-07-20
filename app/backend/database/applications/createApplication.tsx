import { NewApplicationData } from '~/types/database.types'
import { BaseResponse } from '../../../types/base.types'
import { PrismaClient, Account, AccountApplication } from '@prisma/client'

export function wrapAddAccountApplication(client: PrismaClient['accountApplication']) {
  return addAccountApplication

  async function addAccountApplication(account_id: number, data: NewApplicationData): Promise<BaseResponse<AccountApplication>> {
    const { name, summary, type, sprint_interval, siteUrl  } = data
    try {
      const app = await client.create({data: {
        accountId: account_id,
        name,
        summary,
        type,
        siteUrl: siteUrl.length ? siteUrl : null,
        archived: false,
        sprint_generation_enabled: false,
        sprint_interval
      }})
      return {data: app, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}