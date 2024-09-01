import { roadmap_item } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { account } from "~/backend/cookies/account";
import { DB_CLIENT } from "~/services/prismaClient";

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = await account.parse(cookies)
  const applicationId = accountCookie.selectedApplicationId
  const body: {item: roadmap_item, action: 'delete' | 'add' | 'create'} = await request.json()
  if (!('item' in body) || !('action' in body) || !(['delete', 'add', 'create'].includes(body.action))) return json({error: 'Invalid request'}, {status: 400})
  const { item, action } = body
  if (!item && action !== 'create') return json({error: 'Invalid request'}, {status: 400})
  if (action !== 'create' && !item) return json({error: 'Invalid request'}, {status: 400})
  if (action === 'create') {
    try {
      const result = await DB_CLIENT.applicationRoadmap.create({data: {
        account_application_id: applicationId,
      }})
      return json({roadmap_id: result.id})
    } catch (e) {
      return json({error: 'Failed to create roadmap'}, {status: 500})
    }
  } else if (action === 'delete') {
    const prismaClient = DB_CLIENT.roadmap_item
    await prismaClient.delete({where: {id: item.id}})
    const roadmapItems = await prismaClient.findMany({where: {roadmap_id: item.roadmap_id}})
    return json({items: roadmapItems})
  } else {
    const prismaClient = DB_CLIENT.roadmap_item
    const { id, ...newItem } = item
    await prismaClient.create({data: item})
    const roadmapItems = await prismaClient.findMany({where: {roadmap_id: item.roadmap_id}})
    return json({items: roadmapItems})
  }
}

export const loader: LoaderFunction = async ({request}) => {
  return json({})
}