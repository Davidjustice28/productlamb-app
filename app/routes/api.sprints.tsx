import { json, LoaderFunction } from "@remix-run/node";
import { account } from "~/backend/cookies/account";
import { DB_CLIENT } from "~/services/prismaClient";

export const loader: LoaderFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = await account.parse(cookies)
  const application_id = accountCookie.selectedApplicationId as number
  const sprints = await DB_CLIENT.applicationSprint.findMany({where: {applicationId: application_id}})
  return json({sprints})
}