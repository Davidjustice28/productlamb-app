import { ApplicationFeedback, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { account } from "~/backend/cookies/account";
import { FeedbackClient } from "~/backend/database/feedback/client";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLAddFeedbackModal } from "~/components/modals/feedback/add-feeback";
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
  const feedbackDbClient = FeedbackClient(new PrismaClient().applicationFeedback)
  const formData = Object.fromEntries(await request.formData()) as unknown as NewFeedbackData & {action: string}

  if (formData.action === 'add') {
    const {feedback, source, date} = formData
    const dateCreated = new Date(date)
    await feedbackDbClient.createFeedback(applicationId, feedback, source as FeedbackSource, dateCreated)
    const {data: allFeedback} = await feedbackDbClient.getApplicationFeedback(applicationId)
    return json({updatedFeedback: allFeedback ?? null})
  } 

  return json({updatedFeedback: null})

}

export const loader: LoaderFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie.selectedApplicationId as number
  const feedbackDbClient = FeedbackClient(new PrismaClient().applicationFeedback)
  const {data: feedback} = await feedbackDbClient.getApplicationFeedback(applicationId)
  return json({feedback: feedback || []})
}

export default function FeedbackPage() {
  const {feedback: loadedFeedback}: {feedback: Array<ApplicationFeedback>} = useLoaderData<typeof loader>() || {feedback: []}
  const { updatedFeedback } = useActionData<typeof action>() || {updatedFeedback: null}
  const [feedback, setFeedback] = useState<Array<ApplicationFeedback>>(updatedFeedback ?? loadedFeedback)
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false)

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">View and add feedback from users and integrations</p>
        <PLIconButton icon="ri-add-line" onClick={() => setAddModalOpen(true)}/>
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
      <PLAddFeedbackModal open={addModalOpen} setOpen={setAddModalOpen}/>
    </div>
  )
}

function UserFeedbackRow({feedback}: {feedback: ApplicationFeedback}) {
  return (
    <div className="flex flex-col gap-5 justify-between items-center border-2 rounded-xl dark:border-neutral-500 dark:bg-transparent bg-white px-6 py-5">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-black dark:text-neutral-400">"{feedback.feedback}"</p>
      </div>
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