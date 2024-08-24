import { ActionFunction, json } from "@remix-run/node";
import { DB_CLIENT } from "~/services/prismaClient";

export const action: ActionFunction = async ({ request, params, response }) => {
  const { user_id } = params
  const body = await request.json() as {darkMode: boolean}
  if (!user_id) return json({ errors: [10], data: false })
  const keys = Object.keys(body)
  const validKeys = ['darkMode']
  if (keys.length === 0) return json({ errors: [11], data: false })
  const invalidKeys = keys.filter(key => !validKeys.includes(key))
  if (invalidKeys.length) return json({ errors: [12], data: false })

  try {
    await DB_CLIENT.accountUser.updateMany({ data: {darkMode: body.darkMode}, where: {userId: user_id} })
    return json({ errors: [], data: true })
  } catch (error) {
    console.error('Error caught updating account: ', error)
    return json({ errors: [14], data: false })
  }
}