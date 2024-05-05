import { PrismaClient, Account } from '@prisma/client'
import { BaseResponse } from '../../../types/base.types'

export function wrapGetAllAccounts(accountsClient: PrismaClient['account']) {
  return getAllAccounts
  
  async function getAllAccounts(): Promise<BaseResponse<Array<Account>>> {
    const prisma = new PrismaClient()
    try {
      const accounts = await accountsClient.findMany()
      return {data: accounts, errors: []}
    } catch (e) {
      return {data: undefined, errors: [2]}
    }
  }
}

export function wrapGetAccountById(accountsClient: PrismaClient['account']) {
  return getAccountById
  async function getAccountById(id: number): Promise<BaseResponse<Account>> {
    try {
      const account = await accountsClient.findUnique({where: {id}})
      if (!account) {
        return {data: undefined, errors: [4]}
      }
      return {data: account, errors: []}
    } catch (e) {
      return {data: undefined, errors: [3]}
    }
  }
}

export function wrapGetAccountByUserId(accountsClient: PrismaClient['account']) {
  return getAccountById
  async function getAccountById(id: string): Promise<BaseResponse<Account>> {
    try {
      const account = await accountsClient.findFirst({where: {user_prisma_id: id}})
      if (!account) {
        return {data: undefined, errors: [4]}
      }
      return {data: account, errors: []}
    } catch (e) {
      return {data: undefined, errors: [3]}
    }
  }
}