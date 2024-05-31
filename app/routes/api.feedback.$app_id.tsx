import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { TypeformFeedbackPayload } from "~/types/integrations.types";

export const action: ActionFunction = async ({ request, params }) => {
  const { app_id } = params
  const data  = await request.json() as TypeformFeedbackPayload;
  return new Response(`Feedback for app ${app_id} received.`);
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { app_id } = params
  return new Response(`Feedback for app ${app_id}`);
}