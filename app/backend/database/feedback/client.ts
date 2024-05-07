import { PrismaClient } from "@prisma/client";
import { wrapGetApplicationFeedback, wrapGetFeedbackById } from "./getFeedback";
import { wrapCreateFeedback, wrapBulkCreateFeedback } from "./createFeedback";

export const FeedbackClient = (client: PrismaClient['applicationFeedback']) => {
  const getAllApplicationFeedback = wrapGetApplicationFeedback(client)
  const getFeedbackById = wrapGetFeedbackById(client)
  const createFeedback = wrapCreateFeedback(client)
  const bulkCreateFeedback = wrapBulkCreateFeedback(client)
  return {
    getApplicationFeedback: getAllApplicationFeedback,
    getFeedbackById,
    createFeedback,
    bulkCreateFeedback
  }
}