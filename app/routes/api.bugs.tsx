import { PrismaClient } from "@prisma/client";
import { ActionFunction, json } from "@remix-run/node";
import { account } from "~/backend/cookies/account";
import { EditBugData } from "~/types/component.types";

export const action: ActionFunction = async ({request}) => {
  const body = await request.json() as EditBugData
  const cookies = request.headers.get('Cookie')
  const accountCookie = await account.parse(cookies)
  const applicationId = accountCookie.selectedApplicationId
  const prismaClient = new PrismaClient().applicationBug
  await prismaClient.update({
    where: {id: parseInt(body.id)},
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority,
      source: body.source
    }
  })
  const bugs = await prismaClient.findMany({
    where: {
      applicationId
    }
  })
  return json({bugs})
}