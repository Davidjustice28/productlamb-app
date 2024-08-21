import { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLOptionsButtonGroup } from "~/components/buttons/options-button-group";
import { PLAccordian } from "~/components/common/accordian";
import { InviteTeamMemberTutorial } from "~/components/tutorials/invite-team-member";
import { NewApplicationTutorial } from "~/components/tutorials/new-application";
import { SetupIntegrationTutorial } from "~/components/tutorials/setup-integrations";
import { SprintBasicsTutorial } from "~/components/tutorials/sprint-basics";
import { UploadFeedbackTutorial } from "~/components/tutorials/upload-feedback";
import { generalQuestions, troubleshootingQuestions, featuresQuestions } from "~/static/faq-questions";
import { FAQQuestion } from "~/types/base.types";

export const meta: MetaFunction = () => {
  return [
    { title: "ProductLamb | Docs" },
    {
      property: "og:title",
      content: "ProductLamb | Docs",
    },
  ];
};

export default function DocumentationPage() {
  const faqOptions = ["general", "troubleshoot", "features"]
  const tutorialOptions = ["New Application", "Connect GitHub", "Invite Team", "Upload Feedback", "Sprint Basics"]
  const tutorials = [NewApplicationTutorial, SetupIntegrationTutorial, InviteTeamMemberTutorial, UploadFeedbackTutorial, SprintBasicsTutorial]
  const [faqTab, setFaqTab] = useState<string>(faqOptions[0])
  const [tutorialTab, setTutorialTab] = useState<string>(tutorialOptions[0])
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState<FAQQuestion[]>(generalQuestions)
  const [tutorialIndex, setTutorialIndex] = useState<number>(0)
  const [tutorialExpanded, setTutorialExpanded] = useState<boolean>(false)

  function handleGroupChange(group: string, groupType: 'faq'|'tutorials') {
    if (groupType === 'faq') {
      if(group === faqTab) return
      setFaqTab(group)
      switch(group) {
        case "general":
          setQuestionsAndAnswers(generalQuestions)
          break
        case "troubleshoot":
          setQuestionsAndAnswers(troubleshootingQuestions)
          break
        case "features":
          setQuestionsAndAnswers(featuresQuestions)
          break
      }
    } else {
      if(group === tutorialTab) return
      setTutorialTab(group)
      switch(group) {
        case "New Application":
          setTutorialIndex(0)
          break
        case "Connect GitHub":
          setTutorialIndex(1)
          break
        case "Invite Team":
          setTutorialIndex(2)
          break
        case "Upload Feedback":
          setTutorialIndex(3)
          break
        case "Sprint Basics":
          setTutorialIndex(4)
          break
        default:
          break
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 justify-start pt-3">
      <div className="w-full gap-5 flex flex-col">
        <h2 className="text-2xl font-bold text-black dark:text-white">FAQ</h2>
        <PLOptionsButtonGroup groups={ faqOptions } current={faqTab} handleGroupChange={(group) => handleGroupChange(group, 'faq')} />
        <PLAccordian items={questionsAndAnswers.map((item) => {
          return { label: item.question, body: item.answer, iconCombo: "plus-minus"}
          })} />
      </div>
      <div className="w-full gap-5 flex flex-col">
        <h2 className="text-2xl font-bold text-black dark:text-white">Tutorials</h2>
        <div className="w-full flex flex-col gap-3">
          <PLOptionsButtonGroup groups={ tutorialOptions } current={tutorialTab} handleGroupChange={(group) => handleGroupChange(group, 'tutorials')}/>
          <div className="flex flex-col w-full bg-white dark:bg-neutral-800 rounded-lg">
            <div className={(!tutorialExpanded ? "h-52 overflow-hidden" : "h-auto")}>
              {tutorials.filter((_, index) => index === tutorialIndex).map((Tutorial, index) => {
                return <Tutorial key={index} />
              })}
            </div>
            <div className="px-5 pb-5 w-full flex justify-end">
              <PLIconButton icon={(tutorialExpanded ? "ri-arrow-up-line" : "ri-arrow-down-line") + " text-2xl ark:text-white"} onClick={() => setTutorialExpanded(prev => !prev)}/>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}