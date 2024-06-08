import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ApplicationCodeRepositoryInfo, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import React, { useEffect } from "react";
import { useState } from "react";
import { account } from "~/backend/cookies/account";
import { preferences } from "~/backend/cookies/preferences";
import { AccountsClient } from "~/backend/database/accounts/client";
import { ApplicationsClient } from "~/backend/database/applications/client";
import { CodeRepositoryInfoClient } from "~/backend/database/code-repository-info/client";
import { ApplicationGoalsClient } from "~/backend/database/goals/client";
import { IntegrationClient } from "~/backend/database/integrations/ client";
import { PLBasicButton } from "~/components/buttons/basic-button";
import { PLAddAccountInfoModal } from "~/components/modals/account/add-account-info";
import { PLOnboardingFeedbackModal } from "~/components/modals/account/onboarding-feedback";
import { PLAddApplicationModal } from "~/components/modals/applications/add-application";
import { PLIntegrationOptionsModal } from "~/components/modals/integrations/integration-options";
import { availableIntegrations } from "~/static/integration-options";
import { Colors } from "~/types/base.types";
import { NewApplicationData, PLAvailableIntegrationNames } from "~/types/database.types";
import { TypeformIntegrationMetaData, TypeformIntegrationSetupFormData } from "~/types/integrations.types";

interface SetupFieldProps {
  id: number, 
  title: string, 
  description: string, 
  onClick?: () => void, 
  icon: string, 
  buttonText: string
  isOptional?: boolean
}

export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => {
    const { sessionId, userId, getToken } = request.auth;
    const dbClient = new PrismaClient()
    const appClient = ApplicationsClient(dbClient.accountApplication)
    const integrationClient = IntegrationClient(dbClient.applicationIntegration)
    const accountClient = AccountsClient(dbClient.account)
    const cookieHeader = request.headers.get("Cookie");
    const accountCookie = (await account.parse(cookieHeader) || {});
    let accountId: number| undefined = accountCookie.accountId
    console.log('set page loader called', {accountId, userId})
    if (!userId) {
      return redirect('/')
    }
    if (accountId === undefined) {
      const {data: accountData} = await accountClient.getAccountByUserId(userId)
      if(!accountData) {
        const result = await accountClient.createAccount(userId, "free")
        // error handling maybe a boundary page
        if (result.errors.length > 0 || !result.data) return json({});
        accountId = result.data.id
        accountCookie.accountId = accountId
        accountCookie.setupIsComplete = false
        return json({hasApplication: false, isSetup: false, hasIntegration: false, providedFeedback: false}, {
          headers: {
            "Set-Cookie": await account.serialize(accountCookie)
          }
        })
      } 
      console.log('account data', accountData)
      const {data: apps} = await appClient.getAccountApplications(accountData.id)
      const {data: integrations} = await integrationClient.getAllApplicationIntegrations(apps![0].id)
      const isSetup = (accountData.isSetup)
      accountCookie.accountId = accountData.id
      accountCookie.setupIsComplete = isSetup

      if (!isSetup) {
        return json({hasApplication: apps ? apps.length : false, isSetup: accountData.isSetup, hasIntegration: integrations ? integrations.length : false, providedFeedback: false}, {headers: {
          "Set-Cookie": await account.serialize(accountCookie)
        }})
      } else {
        return json({hasApplication: apps ? apps.length : false, isSetup: false, hasIntegration: integrations ? integrations.length : false, providedFeedback: false}, {headers: {
          "Set-Cookie": await account.serialize(accountCookie)
        }})
      }
    } else {
      const {data: accountData} = await accountClient.getAccountById(accountId)
      const {data: apps} = await appClient.getAccountApplications(accountId)
      const {data: integrations} = await integrationClient.getAllApplicationIntegrations(apps![0].id)

      if (accountData && !accountData.isSetup) return json({hasApplication: apps ? apps.length : false, isSetup: false, hasIntegration: integrations ? integrations.length : false, providedFeedback: false})
      if (accountData && accountData.isSetup) return redirect('/portal/dashboard', { headers: { "Set-Cookie": await account.serialize(accountCookie)}})
      return json({hasApplication: apps ? apps.length : false, isSetup: false, hasIntegration: integrations ? integrations.length : false, providedFeedback: false})
    }
  })
}

export let action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as {new_application?: string, feedback?: string, integration?: string} 
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const accountId = accountCookie.accountId
  const dbClient = new PrismaClient()
  const appDbClient = ApplicationsClient(dbClient.accountApplication)
  const goalDbClient = ApplicationGoalsClient(dbClient.applicationGoal)
  const repoDbClient = CodeRepositoryInfoClient(dbClient.applicationCodeRepositoryInfo)
  const accountClient = AccountsClient(dbClient.account)
  const integrationClient = IntegrationClient(dbClient.applicationIntegration)
  if ('setup_complete' in data) {
    await accountClient.updateAccount(accountId, {isSetup: true})
    const {data: accountData} = await appDbClient.getAccountApplications(accountId)
    accountCookie.setupIsComplete = true

    return redirect('/portal/dashboard', {
      headers: {
        "Set-Cookie": await account.serialize(accountCookie)
      }
    })
  } else if ('new_application' in data) {
    const newAppData = JSON.parse(data.new_application as string) as NewApplicationData 
    const {data: createAppResult } = await appDbClient.addApplication(accountId, newAppData)
    if (createAppResult) {
      const goals = newAppData.goals.length < 0 ? [] : JSON.parse(newAppData.goals).map((goal: {goal: string, isLongTerm: boolean}) => ({goal: goal.goal, isLongTerm: goal.isLongTerm}))
      await goalDbClient.addMultipleGoals(createAppResult.id, goals)
      const {repositories} = JSON.parse(newAppData.repositories) as {repositories: Array<ApplicationCodeRepositoryInfo>}
      if (repositories.length > 0) {
        await repoDbClient.addMultipleRepositories(createAppResult.id, repositories as any)
      }
    }
    return json({hasApplication: true})
  }  else if ('integration' in data) {
    const {data: apps} = await appDbClient.getAccountApplications(accountId)
    const integrationData = JSON.parse(data.integration as string) as TypeformIntegrationSetupFormData
    const integrationOptionData = availableIntegrations.find(i => i.name.toLowerCase() === integrationData.integration_name)
    if (integrationOptionData && integrationOptionData.name === 'typeform') {
      await integrationClient.addIntegration<TypeformIntegrationMetaData>(apps![0].id, integrationData.integration_name as PLAvailableIntegrationNames, integrationData.api_token, {
        form_id: integrationData.typeform_form_id,
        tag_name: 'productlamb-webhook',
        webhook_id: ''
      })
    } 
    
    const {data: integrations} = await integrationClient.getAllApplicationIntegrations(apps![0].id)
    return json({hasIntegration: integrations ? integrations.length > 0 : false})
  } else {
    return json({})
  }
}

export default function SetupPage() {
  const { hasApplication: loaderHasApplication, isSetup: loaderIsSetup, providedFeedback, hasIntegration: loaderHasIntegration } = useLoaderData<{hasApplication: boolean, isSetup: boolean, hasIntegration: boolean, providedFeedback: boolean}>()
  const { hasApplication: actionHasApplication, isSetup: actionIsSetup, hasIntegration: actionHasIntegration } = useActionData<{hasApplication?: boolean|null, isSetup?: boolean|null, hasIntegration?: boolean|null, providedFeedback?: boolean|null}>() || {hasApplication: null, isSetup: null, hasIntegration: null, hasFeedback: null}
  const hasApplication = loaderHasApplication ?? actionHasApplication
  const hasIntegration = loaderHasIntegration ?? actionHasIntegration
  const [addApplicationModalOpen, setAddApplicationModalOpen] = useState(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const isSetup = hasApplication
  const [stepsMap, setStepsMap] = useState<{[key: number]: {completed: boolean, enabled: boolean}}>({
    0: {completed: hasApplication, enabled: true},
    1: {completed: hasIntegration, enabled: hasApplication},
    2: {completed: providedFeedback, enabled: hasApplication},
  })

  const newAppFormRef = React.createRef<HTMLFormElement>()
  const newAppInputRef = React.createRef<HTMLInputElement>()

  const feedbackFormRef = React.createRef<HTMLFormElement>()
  const feedbackInputRef = React.createRef<HTMLInputElement>()

  const integrationFormRef = React.createRef<HTMLFormElement>()
  const integrationInputRef = React.createRef<HTMLInputElement>()

  const setupCompleteFormRef = React.createRef<HTMLFormElement>()
  const setupCompleteInputRef = React.createRef<HTMLInputElement>()
  
  const fields: SetupFieldProps[] = [
    // {
    //   id: 1,
    //   title: "Choose a Subscription Plan",
    //   description: "Add your payment information and pick a subscription plan.",
    //   onClick: () => console.log("Adding payment info"),
    //   icon: "ri-money-dollar-circle-line",
    //   buttonText: "Open Stripe"
    // },
    {
      id: 0,
      title: "Setup a Personal Project",
      description: "Add your first application to get started with your account.",
      onClick: () => setAddApplicationModalOpen(true),
      icon: "ri-terminal-window-line",
      buttonText: "Add Application",
    },
    {
      id: 1,
      title: "Configure an Integration",
      description: "Configure an integration to get started with your account.",
      onClick: () => setIntegrationModalOpen(true),
      icon: "ri-git-merge-line",
      buttonText: "Add Integration",
      isOptional: true
    },
    {
      id: 2,
      title: "Provide Feedback",
      description: "Let us know how we can improve your onboarding experience.",
      onClick: () => setFeedbackModalOpen(true),
      icon: "ri-feedback-line",
      buttonText: "Fill Survey",
      isOptional: true
    }
  ]
  const onAddApplication = (data: any) => {
    newAppInputRef.current!.value = JSON.stringify(data)
    newAppFormRef.current!.submit()
    setAddApplicationModalOpen(false)
  }

  const onFeedbackSubmit = (data: any) => {
    feedbackInputRef.current!.value = JSON.stringify(data)
    feedbackFormRef.current!.submit()
  }

  const onIntegrationSubmit = (data: any) => {
    integrationInputRef.current!.value = JSON.stringify(data)
    integrationFormRef.current!.submit()
    setIntegrationModalOpen(false)
  }

  const seeIfEnabled = (id: number) => {
    if (id === 0) {
      return true;
    } else if (fields[id - 1].isOptional && stepsMap[id - 1].enabled) {
      return true
    } else {
      return stepsMap[id - 1].completed || stepsMap[id].enabled
    }
  }

  const seeIfSetupCompleted = () => {
    return Object.values(stepsMap).every((step, i) => {
      return step.completed || fields[i].isOptional
    })
  }

  const finishOnboarding = () => {
    setupCompleteInputRef.current!.value = 'true'
    setupCompleteFormRef.current!.submit()
  }

  return (
    <div className="flex flex-col h-full items-center text-black">
      <h1 className="text-black mt-5 font-bold text-2xl">Let's get Onboarded! 📋</h1>
      <p className="text-black mt-2 mb-5">Complete the following steps to get started with your account.</p>
      <div className="w-4/5 bg-white rounded-xl shadow-sm mt-5 flex flex-col divide-y-2">
        <div className="w-full flex flex-row justify-between items-center px-10 py-5 ">
          <h2 className="text-black text-lg font-bold">Getting Started</h2>
          <p className="text-black text-sm">{Object.values(stepsMap).filter(s => !s.completed).length} steps left</p>
        </div>
        <div className="w-full flex flex-col gap-5 px-10 py-5">
          {fields.map((field, index) => <SetupFieldComponent key={index} fieldInfo={field} enabled={seeIfEnabled(field.id)} completed={stepsMap[field.id].completed}/>)}
        </div>
        <div className="w-full flex flex-row gap-2 justify-end py-5 px-10">
          <PLBasicButton icon="ri-play-circle-line" text="Finish Onboarding" colorClasses={"bg-green-400 text-white hover:bg-green-400 hover:text-white"} onClick={() => finishOnboarding()} disabled={!isSetup}/>
        </div>
      </div>
      <form method="POST" ref={newAppFormRef}>
        <input type="hidden" name="new_application" ref={newAppInputRef}/>
      </form>
      <form method="POST" ref={feedbackFormRef}>
        <input type="hidden" name="feedback" ref={feedbackInputRef}/>
      </form>
      <form method="POST" ref={integrationFormRef}>
        <input type="hidden" name="integration" ref={integrationInputRef}/>
      </form>
      <form method="POST" ref={setupCompleteFormRef}>
        <input type="hidden" name="setup_complete" ref={setupCompleteInputRef}/>
      </form>

      <PLAddApplicationModal open={addApplicationModalOpen} setOpen={setAddApplicationModalOpen} onSubmit={onAddApplication}/>
      <PLIntegrationOptionsModal configuredIntegrations={[]} open={integrationModalOpen} setOpen={setIntegrationModalOpen} onSubmit={onIntegrationSubmit}/>
      <PLOnboardingFeedbackModal isOpen={feedbackModalOpen} onSubmit={() => setFeedbackModalOpen(false)} setIsOpen={setFeedbackModalOpen}/>
    </div>
  )
}

function SetupFieldComponent({fieldInfo,enabled, completed}: {fieldInfo: SetupFieldProps, enabled?: boolean, completed?: boolean}) {
  const {title, description, onClick, buttonText, icon} = fieldInfo;
  return (
    <div className={"w-full flex items-center gap-7 "}>
      <div className={"h-[50px] w-[50px] border-2 border-black rounded-sm flex justify-center items-center " +  (completed ? " opacity-50" : "")}>
        <i className={icon + " text-3xl"}></i>
      </div>
      <div className="flex-1 h-full flex flex-row justify-between items-center">
        <div className={"h-full flex flex-col justify-center gap-1 " +  (completed ? " opacity-50" : "")}>
          <h2 className="text-black text-lg font-bold">{title}</h2>
          <p className="text-black text-sm">{description}</p>
        </div>
        {
          completed ?
          (<div className="h-[40px] w-[40px] rounded-full flex justify-center items-center bg-green-400">
            <i className={"ri-check-line text-white text-2xl"}></i>
          </div>) :
          <PLBasicButton text={buttonText} colorClasses={"bg-orange-200 text-orange-600 hover:bg-orange-200 hover:text-orange-600 "  + (!enabled ? 'opacity-50' : '')} onClick={onClick} useStaticWidth={true} disabled={!enabled}/>
        }
      </div>
    </div>
  )
}