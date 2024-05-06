import { NewApplicationData } from '~/types/database.types'
import { BaseResponse } from '../../../types/base.types'
import { PrismaClient, Account, AccountApplication } from '@prisma/client'

export function wrapDeleteAccountApplication(client: PrismaClient['accountApplication']) {
  return deleteAccountApplication

  async function deleteAccountApplication(app_id: number): Promise<BaseResponse<AccountApplication>> {
    
    try {
      const app = await client.delete({where: {id: app_id}})
      return {data: app, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}