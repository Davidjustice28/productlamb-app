import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { encrypt } from "~/utils/encryption";

export const action: ActionFunction = async ({request}) => {
  const body: {initiative_id?: string} = await request.json() as {} || {}
  if (!body?.initiative_id) return json({error: 'Invalid request'}, {status: 400})
  const secret = process.env.SPRINT_GENERATION_SECRET
  if (!secret) return json({error: 'Invalid secret'}, {status: 500})
  const { initiative_id } = body
  const iv = process.env.ENCRYPTION_IV as string
  const key = process.env.ENCRYPTION_KEY as string
  const sprintManagerUrl = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
  const authToken = encrypt(secret, key, iv)
  const url = `${sprintManagerUrl}/sprints/backlog/suggest/${initiative_id}`
  const tasks: number[]|null = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `${authToken}`,
      'Content-Type': 'application/json',
    },
  }).then(async (res) => {
    const data = await res.json()
    return data.tasks
  }).catch(err => {
    return null
  })
  if (tasks) {
    return json({tasks})
  } else {
    return json({error: 'Failed to get backlog suggestions'}, {status: 500})
  }
}