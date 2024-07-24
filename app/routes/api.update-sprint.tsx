import { GeneratedTask, PrismaClient } from "@prisma/client";
import { ActionFunction, json } from "@remix-run/node";
import { account } from "~/backend/cookies/account";

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = await account.parse(cookies)
  const applicationId = accountCookie.selectedApplicationId as number 
  const body = await request.json() as {ids: Array<number>, sprint_id: number, action: string}
  if (body?.action !== 'remove' || !body.ids || !body.sprint_id) return json({ tasks: null });
  if (body.ids.length === 0) return json({ tasks: [] });
  const sprintManagerUrl = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
  const apiResponse: null | GeneratedTask[] = await fetch(`${sprintManagerUrl}/sprints/items/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({...body, application_id: applicationId})
  })
    .then(res => res.json()).then(data => data.tasks)
    .catch(err => null)
  return json({ tasks: apiResponse });
}