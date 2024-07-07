import { PrismaClient } from "@prisma/client";
import { ActionFunction, json } from "@remix-run/node";

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
    await new PrismaClient().accountUser.updateMany({ data: {darkMode: body.darkMode}, where: {userId: user_id} })
    return json({ errors: [], data: true })
  } catch (error) {
    console.error('Error caught updating account: ', error)
    return json({ errors: [14], data: false })
  }
}