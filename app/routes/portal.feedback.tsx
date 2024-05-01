import { useState } from "react";
import { Feedback, mockFeedback } from "~/backend/mocks/feedback";
import { PLIconButton } from "~/components/buttons/icon-button";

export default function BugsPage() {
  const [feedback, setFeedback] = useState<Array<Feedback>>(mockFeedback)

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">View and add feedback from users and integrations</p>
        <PLIconButton icon="ri-add-line"/>
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
    </div>
  )
}

function UserFeedbackRow({feedback}: {feedback: Feedback}) {
  return (
    <div className="flex flex-col gap-5 justify-between items-center border-2 rounded-xl dark:border-neutral-500 dark:bg-transparent bg-white px-6 py-5">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-black dark:text-neutral-400">"{feedback.comment}"</p>
      </div>
      <div className="flex flow-row items-center justify-start w-full gap-2">
        {feedback.type === 'integration' ? <img src={feedback.source_img} alt="source" className="w-10 h-10 rounded-2xl object-cover"/> : <i className="ri ri-file-line text-2xl dark:text-neutral-300 text-black"></i>}
        <p className="text-sm dark:text-neutral-400 text-black italic">{feedback.creator_name}</p>
      </div>
    </div>
  )
}