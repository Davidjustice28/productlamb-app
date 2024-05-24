import { BaseResponse } from '../../../types/base.types'
import { PrismaClient, Account } from '@prisma/client'

export function wrapCreateAccount(accountsClient: PrismaClient['account']) {
  return createUser

  async function createUser(id: string, subscriptionType: string): Promise<BaseResponse<Account>> {
    try {
      const account = await accountsClient.create({data: {
        user_prisma_id: id,
        dateCreated: new Date(),
        subscriptionType,
        status: 'pending',
        isSetup: false
      }})
      return {data: account, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}