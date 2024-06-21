import { PrismaClient } from "@prisma/client";
import { ActionFunction } from "@remix-run/node";
import { account } from "~/backend/cookies/account";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();
  const cookie = request.headers.get("Cookie");
  const accountCookie = await account.parse(cookie);
  const note = body?.note;
  const applicationId = accountCookie.selectedApplicationId

  if (!note || !applicationId) {
    return new Response(JSON.stringify({ error: "Incorrect request" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const client = new PrismaClient().applicationNote
  await client.create({
    data: {
      text: note,
      applicationId,
      dateCreated: new Date().toISOString(),
    },
  })
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}