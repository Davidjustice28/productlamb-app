import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { account } from "~/backend/cookies/account";
import { encrypt } from "~/utils/encryption";

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = await account.parse(cookies)
  const applicationId = accountCookie.selectedApplicationId
  const body: {initiative?: string} = await request.json() as {} || {}
  if (!body?.initiative || !body.initiative.length) return json({error: 'Invalid request'}, {status: 400})
  const secret = process.env.SPRINT_GENERATION_SECRET
  if (!secret) return json({error: 'Invalid secret'}, {status: 500})
  const { initiative } = body
  const iv = process.env.ENCRYPTION_IV as string
  const key = process.env.ENCRYPTION_KEY as string
  const sprintManagerUrl = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
  const authToken = encrypt(secret, key, iv)
  const url = `${sprintManagerUrl}/sprints/backlog/suggest/${applicationId}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({initiative})
  })
  const data = await response.json()
  const tasks = data?.tasks || null
  if (tasks) {
    return json({tasks})
  } else {
    return json({error: 'Failed to get backlog suggestions'}, {status: 500})
  }
}