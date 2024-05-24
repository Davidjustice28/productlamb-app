import { PrismaClient } from "@prisma/client"
import { wrapCreateAccount } from "./createAccount"
import { wrapGetAccountById, wrapGetAccountByUserId, wrapGetAllAccounts } from "./getAccounts"
import { wrapUpdateAccount } from "./updateAccount"

export const AccountsClient = (client: PrismaClient['account']) => {
  const getAccountById = wrapGetAccountById(client)
  const getAllAccounts = wrapGetAllAccounts(client)
  const createAccount = wrapCreateAccount(client)
  const getAccountByUserId = wrapGetAccountByUserId(client)
  const updateAccount = wrapUpdateAccount(client)
  return {
    getAccountById,
    getAllAccounts,
    createAccount,
    getAccountByUserId,
    updateAccount
  }
}