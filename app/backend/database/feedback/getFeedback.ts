import { ApplicationFeedback, PrismaClient } from "@prisma/client";
import { BaseResponse } from "~/types/base.types";

export function wrapGetApplicationFeedback(client: PrismaClient['applicationFeedback']) {
  return getAllApplicationFeedback;
  async function getAllApplicationFeedback(application_id: number): Promise<BaseResponse<Array<ApplicationFeedback>>> {
    try {
      const feedback = await client.findMany({ where: { applicationId: application_id }});
      return { data: feedback, errors: [] };
    } catch (error) {
      return { data: undefined, errors: [1] };
    }
  };
}

export function wrapGetFeedbackById(client: PrismaClient['applicationFeedback']) {
  return getFeedbackById;
  async function getFeedbackById(feedback_id: number): Promise<BaseResponse<ApplicationFeedback>> {
    try {
      const feedback = await client.findUnique({ where: { id: feedback_id }});
      if (!feedback) return { data: undefined, errors: [1] };
      return { data: feedback, errors: [] };
    } catch (error) {
      return { data: undefined, errors: [1] };
    }
  };
}