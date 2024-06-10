import { Account, PrismaClient } from "@prisma/client";
import { ActionFunction, json } from "@remix-run/node";
import { AccountsClient } from "~/backend/database/accounts/client";
import { TypeformFeedbackPayload } from "~/types/integrations.types";

export const action: ActionFunction = async ({ request, params, response }) => {
  const { account_id } = params
  const body = await request.json() as Partial<Account>
  if (!account_id) return json({ errors: [10], data: false })
  const keys = Object.keys(body)
  const validKeys = ['darkMode']
  if (keys.length === 0) return json({ errors: [11], data: false })
  const invalidKeys = keys.filter(key => !validKeys.includes(key))
  if (invalidKeys.length) return json({ errors: [12], data: false })

  const accountDbClient = AccountsClient(new PrismaClient().account)
  try {
    const { data, errors } = await accountDbClient.updateAccount(Number(account_id), {darkMode: body.darkMode})
    if (errors.length) {
      return json({ errors: errors, data: false})
    } else if(!data) {
      return json({ errors: [13], data: false })
    } else {
      return json({ errors: [], data: true })
    }
  } catch (error) {
    console.error('Error caught updating account: ', error)
    return json({ errors: [14], data: false })
  }
}