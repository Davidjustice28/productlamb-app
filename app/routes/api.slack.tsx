import { PrismaClient } from "@prisma/client";
import { ActionFunction, json } from "@remix-run/node";
import { account } from "~/backend/cookies/account";
import { IntegrationClient } from "~/backend/database/integrations/ client";

export const loader: ActionFunction = async ({ request, }) => {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const token = query?.code
  const workspace_id = query?.workspace_id ?? ''
  if (!token) return json({ error: 'Slack OAuth flow failed' }, { status: 400 });
  const dbClient = new PrismaClient()
  const cookies = request.headers.get('Cookie')
  const accountCookies = await account.parse(cookies)
  const applicationId = accountCookies.selectedApplicationId as number
  const integrationClient = IntegrationClient(dbClient.applicationIntegration)
  await integrationClient.addIntegration(applicationId, 'slack', token, { workspace_id })
  const {data: updatedIntegrations} = await integrationClient.getAllApplicationIntegrations(applicationId)
  console.log('successfully added slack integration')
  return json({ updatedIntegrations })
}