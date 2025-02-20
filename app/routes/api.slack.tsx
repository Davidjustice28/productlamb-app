import { ActionFunction, json, redirect } from "@remix-run/node";
import { account } from "~/backend/cookies/account";
import { IntegrationClient } from "~/backend/database/integrations/ client";
import { DB_CLIENT } from "~/services/prismaClient";

export const loader: ActionFunction = async ({ request, }) => {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const token = query?.token
  const workspace_id = query?.workspace_id ?? ''
  if (!token) return json({ error: 'Slack OAuth flow failed' }, { status: 400 });
  const cookies = request.headers.get('Cookie')
  const accountCookies = await account.parse(cookies)
  const applicationId = accountCookies.selectedApplicationId as number
  const integrationClient = IntegrationClient(DB_CLIENT.applicationIntegration)
  await integrationClient.addIntegration(applicationId, 'slack', token, { workspace_id })
  return redirect('/portal/integrations')
}