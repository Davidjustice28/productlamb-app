import { PrismaClient } from "@prisma/client";
import { wrapGetApplicationFeedback, wrapGetFeedbackById } from "./getFeedback";
import { wrapCreateFeedback, wrapBulkCreateFeedback } from "./createFeedback";
import { wrapDeleteAllApplicationFeedback } from "./deleteFeedback";

export const FeedbackClient = (client: PrismaClient['applicationFeedback']) => {
  const getAllApplicationFeedback = wrapGetApplicationFeedback(client)
  const getFeedbackById = wrapGetFeedbackById(client)
  const createFeedback = wrapCreateFeedback(client)
  const bulkCreateFeedback = wrapBulkCreateFeedback(client)
  const deleteAllApplicationFeedback = wrapDeleteAllApplicationFeedback(client)
  return {
    getApplicationFeedback: getAllApplicationFeedback,
    getFeedbackById,
    createFeedback,
    bulkCreateFeedback,
    deleteAllApplicationFeedback
  }
}