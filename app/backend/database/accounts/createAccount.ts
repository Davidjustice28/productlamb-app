import { SupportedTimezone } from '~/types/database.types'
import { BaseResponse } from '../../../types/base.types'
import { PrismaClient, Account } from '@prisma/client'

export function wrapCreateAccount(accountsClient: PrismaClient['account']) {
  return createUser

  async function createUser(id: string, subscriptionType: string, timezone: SupportedTimezone): Promise<BaseResponse<Account>> {
    try {
      const account = await accountsClient.create({data: {
        user_prisma_id: id,
        dateCreated: new Date(),
        subscriptionType,
        status: 'pending',
        isSetup: false,
        timezone,
      }})
      console.log(`Account created for user with id: ${id}`)
      return {data: account, errors: []}
    } catch (e) {
      console.log(`Error while creating account for user with id: ${id}`, e)
      return {data: undefined, errors: [1]}
    }
  }
}