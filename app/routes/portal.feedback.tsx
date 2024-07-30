import { ApplicationFeedback, ApplicationIntegration, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, MetaFunction, json, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { parse } from "papaparse";
import { useRef, useState } from "react";
import { account } from "~/backend/cookies/account";
import { FeedbackClient } from "~/backend/database/feedback/client";
import { IntegrationClient } from "~/backend/database/integrations/ client";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLContentLess } from "~/components/common/contentless";
import { PLConfirmModal } from "~/components/modals/confirm";
import { PLAddFeedbackModal } from "~/components/modals/feedback/add-feedback";
import { PLBulkUploadFeedbackModal } from "~/components/modals/feedback/bulk-upload/bulk-upload";
import { FeedbackIntegrations } from "~/types/component.types";
import { FeedbackSource } from "~/types/database.types";

export interface NewFeedbackData {
  feedback: string
  source: string
  date: string
}

export const meta: MetaFunction = () => {
  return [
    { title: "ProductLamb | Feedback" },
    {
      property: "og:title",
      content: "ProductLamb | Feedback",
    },
  ];
};

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
    
    const formData = Object.fromEntries(await request.formData()) as unknown as any
    console.log(formData)
    if (formData.action === 'add') {
      const {feedback, source, date} = formData
      const dateCreated = new Date(date)
      await feedbackDbClient.createFeedback(applicationId, feedback, source as FeedbackSource, dateCreated)
      const {data: allFeedback} = await feedbackDbClient.getApplicationFeedback(applicationId)
      return json({updatedFeedback: allFeedback ?? null})
    } else if (formData.action === 'delete') {
      const selectedIds = (formData.selectedIds as string).split(',').map((id: string) => parseInt(id))
      await dbClient.applicationFeedback.deleteMany({where: {id: {in: selectedIds}}})
      const {data: allFeedback} = await feedbackDbClient.getApplicationFeedback(applicationId)
      return json({updatedFeedback: allFeedback ?? null})
    } else if (formData.action === 'ignore') {
      const selectedIds = (formData.selectedIds as string).split(',').map((id: string) => parseInt(id))
      await dbClient.applicationFeedback.updateMany({where: {id: {in: selectedIds}}, data: {ignored: true}})
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
  const [selectedIds, setSelectedIds] = useState<Array<number>>([])
  const [confirmationTopic, setConfirmationTopic] = useState<string>("")
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false)

  const formRef = useRef<HTMLFormElement>(null)
  const formActionRef = useRef<HTMLInputElement>(null)

  const updateConfirmationTopic = (topic: 'ignore' | 'delete') => {
    setConfirmationTopic(topic)
    setConfirmationModalOpen(true)
  }

  const openBulkUploadModal = () => {
    setBulkModalOpen(true)
  }

  function onFeedbackItemClick(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  function filterAvailableIntegrations() {
    const availableIntegrations = integrations.map(integration => integration.name).filter(name => Object.values(FeedbackIntegrations).includes(name as FeedbackIntegrations)) as Array<FeedbackIntegrations>
    return availableIntegrations
  }

  function closeConfirmationModal(v: boolean) {
    if (!v) {
      setConfirmationTopic("")
    }
    setConfirmationModalOpen(v)
  }

  function confirmationMessage() {
    if (confirmationTopic === 'ignore') {
      return "Are you sure you would like the selected feedback to be ignored in upcoming sprints?"
    } else if (confirmationTopic === 'delete') {
      return "Are you sure you want to delete the selected feedback? This is irreversible."
    } else {
      return ""
    }
  }

  function UserFeedbackItem({feedback}: {feedback: ApplicationFeedback}) {
    return (
      <div 
        onClick={() => onFeedbackItemClick(feedback.id)}
        className={"flex flex-col gap-5 justify-between items-start border-2 rounded-xl dark:border-neutral-500 dark:bg-transparent px-6 py-5 bg-white" + (!selectedIds.includes(feedback.id) ? "" : " border-orange-400 dark:border-orange-500 shadow-sm shadow-orange-200 dark:shadow-orange-400")}
      >
        <p className="font-semibold text-black dark:text-neutral-400">"{feedback.feedback}"</p>
        <div className="flex flow-row items-center justify-between w-full">
          <div className="flex flow-row items-center justify-start gap-2">
            <i className="ri ri-file-line text-2xl dark:text-neutral-300 text-black"></i>
            <p className="text-sm dark:text-neutral-400 text-black italic">{feedback.source}</p>
          </div>
          <div className="flex flew-row items-center gap-2">
            {feedback.ignored && <i className="ri-rest-time-line text-purple-700 dark:text-purple-500"/>}
            <p className="text-sm dark:text-neutral-400 text-black italic">{new Date(feedback.feedbackDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    )
  }

  function deleteFeedback() {
    formActionRef.current!.value = 'delete'
    formRef.current?.submit()
  }

  function ignoreFeedback() {
    formActionRef.current!.value = 'ignore'
    formRef.current?.submit()
  }


  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">View and add feedback from users and integrations</p>
        <div className="flex items-center gap-2">
          {selectedIds.length ? <PLIconButton icon="ri-delete-bin-line" onClick={() => updateConfirmationTopic('delete')}/> : null}
          {selectedIds.length ? <PLIconButton icon="ri-rest-time-line" onClick={() => updateConfirmationTopic('ignore')}/> : null}
          <PLIconButton icon="ri-chat-upload-line" onClick={openBulkUploadModal}/>
          <PLIconButton icon="ri-add-line" onClick={() => setAddModalOpen(true)}/>
        </div>
      </div>
      { feedback.length === 0 && <PLContentLess itemType="feedback"/>}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {
          feedback.map((feedback, index) => {
            return (
              <UserFeedbackItem key={index} feedback={feedback}/>
            )
          })
        }
      </div>
      <Form method="post" ref={formRef}>
        <input type="hidden" name="action" ref={formActionRef}/>
        <input type="hidden" name="selectedIds" value={selectedIds.join(',')}/>
      </Form>
      <PLAddFeedbackModal open={addModalOpen} setOpen={setAddModalOpen} onClose={() => setAddModalOpen(false)}/>
      <PLBulkUploadFeedbackModal open={bulkUploadModalOpen} setOpen={setBulkModalOpen} onClose={() => setBulkModalOpen(false)} availableIntegrations={filterAvailableIntegrations()}/>
      <PLConfirmModal open={confirmationModalOpen} setOpen={closeConfirmationModal} message={confirmationMessage()} onConfirm={() => {
        if (confirmationTopic === 'delete') {
          deleteFeedback()
        } else if (confirmationTopic === 'ignore') {
          ignoreFeedback()
        } else {
          closeConfirmationModal(false)
        }
      }}/>
    </div>
  )
}