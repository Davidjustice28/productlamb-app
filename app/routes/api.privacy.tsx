import { ActionFunction, json } from "@remix-run/node";
import { preferences } from "~/backend/cookies/preferences";
import { DB_CLIENT } from "~/services/prismaClient";

export const action: ActionFunction = async ({ request, params, response }) => {
  const cookie = request.headers.get('Cookie')
  const p = await preferences.parse(cookie)
  return json({ }, {
    headers: {
      'Set-Cookie': await preferences.serialize({ ...p, privacyPolicyAck: true }),
    },
  })
}