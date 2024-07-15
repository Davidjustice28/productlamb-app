import { ActionFunction, json } from "@remix-run/node";
import { account } from "~/backend/cookies/account";
import { TaskSuggestions } from "~/types/component.types";

export const action: ActionFunction = async ({ request }) => {
  const cookies = request.headers.get('Cookie')
  const accountCookies = await account.parse(cookies)
  const application_id = accountCookies.selectedApplicationId
  if (!application_id) return json({ tasks: null });
  const data = await request.json() || {}
  if (!data || !data?.initiative || typeof data?.initiative !== 'string' || !data.initiative.length) return json({ tasks: null });
  const initiative = data.initiative as string
  const sprintManagerUrl = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
  const apiResponse: null | TaskSuggestions[] = await fetch(`${sprintManagerUrl}/sprints/initiative/manual/${application_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ initiative})
  })
    .then(res => res.json()).then(data => data.tasks)
    .catch(err => null)
  return json({ tasks: apiResponse });
}