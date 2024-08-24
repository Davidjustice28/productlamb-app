import { ActionFunction, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData, json, redirect } from "@remix-run/node";
import { wrapOpenAIClient } from "~/services/openai/performChat";
import { DB_CLIENT } from "~/services/prismaClient";


export const action: ActionFunction = async ({ request, params }) => {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    return json({ error: 'Please try again later' }, { status: 500 })
  }
  const ifMultipartForm = request.headers.get('content-type')?.includes('multipart')
  const { application_id } = params
  if (!application_id) return json({ error: 'Please try again later' }, { status: 400 })
  if (ifMultipartForm) {
    const uploadHandler = unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
        maxPartSize: 5_000_000,
        file: ({ filename }) => filename,
      }),
      // parse everything else into memory
      unstable_createMemoryUploadHandler()
    );
    const form = await unstable_parseMultipartFormData(request, uploadHandler)
    const data = Object.fromEntries(form)
    if ('contextFile' in data && 'dataType' in data && 'file_type' in data) {
      const fileUploaded = form.get("contextFile") as File
      const b = await fileUploaded.arrayBuffer()
      const text = new TextDecoder().decode(b)
      const openaiClient = wrapOpenAIClient(openaiApiKey)

      const response = await openaiClient.convertDataToInternalData(text, data.file_type as 'json' | 'csv', data.dataType as 'bugs' | 'backlog' | 'feedback')
      if (!response) {
        return json({ error: 'Please try again later' }, { status: 500 })
      }
      
      if ('bugs' in response) {
        const { bugs } = response
        try {
          await DB_CLIENT.applicationBug.createMany({
            data: bugs.map(bug => ({
              applicationId: parseInt(application_id),
              title: bug.title,
              description: bug.description,
              source: bug.source,
              priority: 'low'
            }))
          })
        } catch (e) {
          console.error(e)
          return json({ error: 'Please try again later' }, { status: 500 })
        }
        
      } else if ('feedback' in response) {
        const { feedback } = response
        try {
          await DB_CLIENT.applicationFeedback.createMany({
            data: feedback.map(feedback => ({
              applicationId: parseInt(application_id),
              feedback: feedback.feedback,
              source: feedback.source,
              feedbackDate: new Date().toISOString()
            }))
          })
        } catch (e) {
          console.error(e)
          return json({ error: 'Please try again later' }, { status: 500 })
        }
      } else if ('backlog' in response) {
        const { backlog } = response
        try {
          await DB_CLIENT.generatedTask.createMany({
            data: backlog.map(backlog => ({
              applicationId: parseInt(application_id),
              title: backlog.title,
              description: backlog.description,
              reason: backlog.reason,
              category: backlog.category,
              backlog: true,
              status: 'to do',
              points: 1,
            }))
          })
        } catch (e) {
          console.error(e)
          return json({ error: 'Please try again later' }, { status: 500 })
        }
      } else {
        console.error('Invalid data type')
      }

      return redirect('/portal/setup')
    } else {
      return json({ error: 'Please try again later' }, { status: 400 })
    }
  }
  return json({ error: 'Please try again later' }, { status: 400 })
}