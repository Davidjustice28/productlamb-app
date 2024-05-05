import { PrismaClient } from "@prisma/client"
import { wrapCreateAccount } from "./createAccount"
import { wrapGetAccountById, wrapGetAccountByUserId, wrapGetAllAccounts } from "./getAccounts"

export const AccountsClient = (client: PrismaClient['account']) => {
  const getAccountById = wrapGetAccountById(client)
  const getAllAccounts = wrapGetAllAccounts(client)
  const createAccount = wrapCreateAccount(client)
  const getAccountByUserId = wrapGetAccountByUserId(client)
  return {
    getAccountById,
    getAllAccounts,
    createAccount,
    getAccountByUserId
  }
}