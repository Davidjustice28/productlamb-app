import { PrismaClient } from "@prisma/client";
import { ActionFunction } from "@remix-run/node";
import { act } from "react";
import { account } from "~/backend/cookies/account";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();
  const cookie = request.headers.get("Cookie");
  const accountCookie = await account.parse(cookie);
  const action = body?.action;
  
  
  console.log(body)
  if (!action.length) {
    return new Response(JSON.stringify({ error: "No action found" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  
  const client = new PrismaClient().applicationNote
  if (action === "delete") {
    const note_id = body?.note_id;
    if (!note_id && !note_id.length) {
      return new Response(JSON.stringify({ error: "Insuffice data" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    await client.delete({ where: { id: Number(note_id)} })
    return new Response(JSON.stringify({}), { status: 200 });
  } else if (action === "add") {
    const note = body?.note;
    const applicationId = accountCookie.selectedApplicationId
    if (!note || !note.length|| !applicationId) {
      return new Response(JSON.stringify({ error: "Insuffice data" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    await client.create({
      data: {
        text: note,
        applicationId,
        dateCreated: new Date().toISOString(),
      },
    })

    return new Response(JSON.stringify({}), { status: 200 });
  }  else {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 401 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}