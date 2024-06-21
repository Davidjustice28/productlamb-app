import { PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request, params }) => {
  const application_id = params.application_id;
  if (!application_id) {
    console.error('No application_id provided');
    return new Response(null, { status: 400 });
  }
  const id = parseInt(application_id);
  const client = new PrismaClient()
  const notes = await client.applicationNote.findMany({
    where: {
      applicationId: id,
    },
  });

  return new Response(JSON.stringify({ notes }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}