import { PrismaClient } from "@prisma/client"
import { wrapCreateAccount } from "./createAccount"
import { wrapGetAccountById, wrapGetAllAccounts } from "./getAccounts"

export const AccountsClient = (client: PrismaClient['account']) => {
  const getAccountById = wrapGetAccountById(client)
  const getAllAccounts = wrapGetAllAccounts(client)
  const createAccount = wrapCreateAccount(client)

  return {
    getAccountById,
    getAllAccounts,
    createAccount
  }
}