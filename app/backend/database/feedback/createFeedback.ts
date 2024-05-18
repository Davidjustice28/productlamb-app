import { ApplicationFeedback, PrismaClient } from "@prisma/client";
import { BaseResponse } from "~/types/base.types";
import { FeedbackSource } from "~/types/database.types";

export function wrapCreateFeedback(client: PrismaClient['applicationFeedback']) {
  return createFeedback

  async function createFeedback(application_id: number, comment: string, source: FeedbackSource, dateCreated?: Date) {
    console.log('dateCreated: ', dateCreated)
    const date = dateCreated ? dateCreated.toISOString() : new Date().toISOString()
    try {
      const entry = await client.create({
        data: {
          feedbackDate: date,
          applicationId: application_id,
          feedback: comment,
          source
        }
      })
     
      return {data: entry, errors: []}
    } catch (error) {
      return {data: undefined,errors: [1]}
    }
  }
}

export function wrapBulkCreateFeedback(client: PrismaClient['applicationFeedback']) {
  return bulkCreateFeedback
  
  async function bulkCreateFeedback(application_id: number, feedbackData: Array<{application_id: number, comment: string, source: FeedbackSource, dateCreated?: Date}>): Promise<BaseResponse<Array<ApplicationFeedback>>> {
    try {
      
      const entries = await client.createMany({ data: feedbackData.map(d => {
        const date = d.dateCreated ? d.dateCreated.toISOString() : new Date().toISOString()
        return {applicationId: d.application_id, feedback: d.comment, source: d.source, feedbackDate: date}
      })})
      if (entries.count !== feedbackData.length) {
        console.log(`Error creating feedback entries: ${entries.count} created, ${feedbackData.length} expected`)
        return {data: [], errors: [1]}
      }
      const feedback = await client.findMany({ where: {applicationId: application_id} })
      console.log(`Created ${entries.count} feedback entries`)
      return {data: feedback, errors: []}
    } catch (error) {
      console.log('Error creating feedback entries: ', error)
      return {data: [], errors: [1]}
    }
  }
}