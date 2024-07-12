import { ActionFunction, json } from "@remix-run/node";
import { decrypt, encrypt } from "~/utils/encryption";

export const action: ActionFunction = async ({request}) => {
  const body: {title?: string, description?: string, application_id?: string} = await request.json() as {} || {}
  if (!body?.title || !body?.description || !body?.application_id) {
    console.error('Invalid request', body)
    return json({error: 'Invalid request'}, {status: 400})
  }
  const {title, description, application_id} = body
  const iv = process.env.ENCRYPTION_IV as string
  const key = process.env.ENCRYPTION_KEY as string
  const sprintManagerUrl = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
  const encryptedAuthToken = request.headers.get('Authorization') || ''
  if (!encryptedAuthToken.length ) return json({error: 'Authorization header is required'}, {status: 401})
  const decryptedToken = decrypt(encryptedAuthToken, key, iv)
  if (!decryptedToken) return json({error: 'Invalid authorization'}, {status: 401})
  if (decryptedToken !== process.env.SPRINT_GENERATION_SECRET) return json({error: 'Invalid authorization'}, {status: 401})
  const url = `${sprintManagerUrl}/sprints/points/suggest`
  const points: number|null = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `${encryptedAuthToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({title, description, application_id})
  }).then(async (res) => {
    const data = await res.json()
    return data.points
  }).catch(err => {
    return null
  })
  if (points) {
    return json({points})
  } else {
    return json({error: 'Failed to get points suggestion'}, {status: 500})
  }
}