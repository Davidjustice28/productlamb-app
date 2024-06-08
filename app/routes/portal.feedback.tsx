import { ApplicationFeedback, ApplicationIntegration, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { parse } from "papaparse";
import { useState } from "react";
import { account } from "~/backend/cookies/account";
import { FeedbackClient } from "~/backend/database/feedback/client";
import { IntegrationClient } from "~/backend/database/integrations/ client";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLAddFeedbackModal } from "~/components/modals/feedback/add-feedback";
import { PLBulkUploadFeedbackModal } from "~/components/modals/feedback/bulk-upload/bulk-upload";
import { FeedbackIntegrations } from "~/types/component.types";
import { FeedbackSource } from "~/types/database.types";

export interface NewFeedbackData {
  feedback: string
  source: string
  date: string
}

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  const dbClient = new PrismaClient()
  const feedbackDbClient = FeedbackClient(new PrismaClient().applicationFeedback)
  if (request.headers.get('content-type')?.includes('multipart')) {
    const uploadHandler = unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
        maxPartSize: 5_000_000,
        file: ({ filename }) => filename,
      }),
      // parse everything else into memory
      unstable_createMemoryUploadHandler()
    );
    const form = await unstable_parseMultipartFormData(request, uploadHandler)
    const formData = Object.fromEntries(form)
    // let formData = await request.formData();
    let file = formData.csv as Blob;

    if (file) {
      let text = await file.text();
      let csvData = (parse(text, { header: true }).data as Array<any>).filter(d => "feedback" in d && "source" in d && "date" in d) as Array<NewFeedbackData>
      const uploadData = csvData.map(({feedback, source, date}) => ({application_id: applicationId , comment: feedback, source: source as FeedbackSource, dateCreated: new Date(date)}))
      const {data: updatedFeedback} = await feedbackDbClient.bulkCreateFeedback(applicationId, uploadData)
      return json({ updatedFeedback: updatedFeedback ?? null });
    }

  } else {
    const formData = Object.fromEntries(await request.formData()) as unknown as NewFeedbackData & {action: string}
  
    if (formData.action === 'add') {
      const {feedback, source, date} = formData
      const dateCreated = new Date(date)
      await feedbackDbClient.createFeedback(applicationId, feedback, source as FeedbackSource, dateCreated)
      const {data: allFeedback} = await feedbackDbClient.getApplicationFeedback(applicationId)
      return json({updatedFeedback: allFeedback ?? null})
    } 
  }

  return json({updatedFeedback: null})

}

export const loader: LoaderFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  
  const dbClient = new PrismaClient().applicationIntegration
  const integrationClient = IntegrationClient(dbClient) 
  const {data: integrations} = await integrationClient.getAllApplicationIntegrations(applicationId)

  const feedbackDbClient = FeedbackClient(new PrismaClient().applicationFeedback)
  const {data: feedback} = await feedbackDbClient.getApplicationFeedback(applicationId)
  return json({feedback: feedback || [], integrations: integrations ? integrations : []})
}

export default function FeedbackPage() {
  const {feedback: loadedFeedback, integrations}: {feedback: Array<ApplicationFeedback>, integrations: Array<ApplicationIntegration>} = useLoaderData<typeof loader>() || {feedback: [], integrations: []}
  const { updatedFeedback } = useActionData<typeof action>() || {updatedFeedback: null}
  const [feedback, setFeedback] = useState<Array<ApplicationFeedback>>(updatedFeedback ?? loadedFeedback)
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false)
  const [bulkUploadModalOpen, setBulkModalOpen] = useState(false)


  const openBulkUploadModal = () => {
    setBulkModalOpen(true)
  }

  function filterAvailableIntegrations() {
    const availableIntegrations = integrations.map(integration => integration.name).filter(name => Object.values(FeedbackIntegrations).includes(name as FeedbackIntegrations)) as Array<FeedbackIntegrations>
    return availableIntegrations
  }

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">View and add feedback from users and integrations</p>
        <div className="flex items-center gap-2">
          <PLIconButton icon="ri-chat-upload-line" onClick={openBulkUploadModal}/>
          <PLIconButton icon="ri-add-line" onClick={() => setAddModalOpen(true)}/>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {
          feedback.map((feedback, index) => {
            return (
              <UserFeedbackRow key={index} feedback={feedback}/>
            )
          })
        }
      </div>
      <PLAddFeedbackModal open={addModalOpen} setOpen={setAddModalOpen} onClose={() => setAddModalOpen(false)}/>
      <PLBulkUploadFeedbackModal open={bulkUploadModalOpen} setOpen={setBulkModalOpen} onClose={() => setBulkModalOpen(false)} availableIntegrations={filterAvailableIntegrations()}/>
    </div>
  )
}

function UserFeedbackRow({feedback}: {feedback: ApplicationFeedback}) {
  return (
    <div className="flex flex-col gap-5 justify-between items-start border-2 rounded-xl dark:border-neutral-500 dark:bg-transparent bg-white px-6 py-5">
      <p className="font-semibold text-black dark:text-neutral-400">"{feedback.feedback}"</p>
      <div className="flex flow-row items-center justify-between w-full">
        <div className="flex flow-row items-center justify-start gap-2">
          <i className="ri ri-file-line text-2xl dark:text-neutral-300 text-black"></i>
          <p className="text-sm dark:text-neutral-400 text-black italic">{feedback.source}</p>
        </div>
        <p className="text-sm dark:text-neutral-400 text-black italic">{new Date(feedback.feedbackDate).toLocaleDateString()}</p>
      </div>
    </div>
  )
}