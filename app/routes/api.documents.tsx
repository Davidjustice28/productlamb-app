import { ApplicationDocuments } from "@prisma/client";
import { ActionFunction, json } from "@remix-run/node";
import { account } from "~/backend/cookies/account";
import { deleteFileFromCloudStorage } from "~/services/gcp/delete-file";
import { DB_CLIENT } from "~/services/prismaClient";

export const action: ActionFunction = async ({request}) => {
  const body = await request.json() as {documents: Array<{id: number, url: string}>}
  const cookies = request.headers.get('Cookie')
  const accountCookie = await account.parse(cookies)
  const applicationId = accountCookie.selectedApplicationId as number
  await Promise.all(body.documents.map(async (d )=> {
    const {success} = await deleteFileFromCloudStorage(d.url.split('images/').pop()!)
    if(success) {
      await DB_CLIENT.applicationDocuments.deleteMany({where: {applicationId, id: d.id}})
    }
  }))
  const updatedDocuments = await DB_CLIENT.applicationDocuments.findMany({where: {applicationId}})
  return json({documents: updatedDocuments})
}