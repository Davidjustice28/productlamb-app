import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import { ApplicationIntegration, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import React from "react";
import { useState } from "react";
import { account } from "~/backend/cookies/account";
import { AccountsClient } from "~/backend/database/accounts/client";
import { ApplicationsClient } from "~/backend/database/applications/client";
import { ApplicationGoalsClient } from "~/backend/database/goals/client";
import { IntegrationClient } from "~/backend/database/integrations/ client";
import { PLBasicButton } from "~/components/buttons/basic-button";
import { PLOrganizationDetailsModal } from "~/components/modals/account/organization-details";
import { PLAddApplicationModal } from "~/components/modals/applications/add-application";
import { PLIntegrationOptionsModal } from "~/components/modals/integrations/integration-options";
import { availableIntegrations } from "~/static/integration-options";
import { NewApplicationData, PLAvailableIntegrationNames, SupportedTimezone } from "~/types/database.types";
import { TypeformIntegrationMetaData, TypeformIntegrationSetupFormData } from "~/types/integrations.types";
import { createClerkClient } from '@clerk/remix/api.server';


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
    const { userId } = request.auth;
    const dbClient = new PrismaClient()
    const appClient = ApplicationsClient(dbClient.accountApplication)
    const integrationClient = IntegrationClient(dbClient.applicationIntegration)
    const accountClient = AccountsClient(dbClient.account)
    const cookieHeader = request.headers.get("Cookie");
    const accountCookie = (await account.parse(cookieHeader) || {});
    let accountId: number| undefined = accountCookie.accountId
    if (!userId) {
      return redirect('/')
    }
    if (accountId === undefined) {
      const {data: accountData} = await accountClient.getAccountByUserId(userId)
      if(!accountData) {
        const result = await accountClient.createAccount(userId, "free", SupportedTimezone.MST)
        if (result.errors.length > 0 || !result.data) return json({})
        await dbClient.accountUser.create({data: {accountId: result.data.id, userId: userId}})
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
      let integrations: ApplicationIntegration[] = []
      if (apps && apps.length > 0) {
        integrations = (await integrationClient.getAllApplicationIntegrations(apps[0].id)).data ?? []
      }

      if (accountData && !accountData.isSetup) return json({hasApplication: apps ? apps.length : false, isSetup: false, hasIntegration: !!integrations.length, providedFeedback: false, applicationId: apps && apps?.length > 0 ? apps[0].id : null, organizationCreated: !!accountData?.organization_id})
      if (accountData && accountData.isSetup) return redirect('/portal/dashboard', { headers: { "Set-Cookie": await account.serialize(accountCookie)}})
      return json({hasApplication: apps ? apps.length : false, isSetup: false, hasIntegration: !!integrations.length, providedFeedback: false, applicationId: apps && apps?.length > 0 ? apps[0].id : null, organizationCreated: !!accountData?.organization_id})
    }
  })
}

export let action: ActionFunction = async (args) => {
  const { userId } = await getAuth(args);
  const request = args.request
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as {new_application?: string, integration?: string, setup_complete?: string, organization_details?: string} 
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const accountId = accountCookie.accountId
  const dbClient = new PrismaClient()
  const appDbClient = ApplicationsClient(dbClient.accountApplication)
  const goalDbClient = ApplicationGoalsClient(dbClient.applicationGoal)
  const accountClient = AccountsClient(dbClient.account)
  const integrationClient = IntegrationClient(dbClient.applicationIntegration)
  if ('setup_complete' in data) {
    await accountClient.updateAccount(accountId, {isSetup: true})
    await appDbClient.getAccountApplications(accountId)
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
    }
    return json({hasApplication: true, applicationId: createAppResult?.id})
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
  } else if('organization_details' in data) {
    const name = data.organization_details as string
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY!})
    const org = await clerkClient.organizations.createOrganization({
      name: name,
      createdBy: userId!,
    })
    if (org) {
      await accountClient.updateAccount(accountId, {organization_id: org.id})
      return json({organizationCreated: true})
    }
    return json({organizationCreated: true})

  } else {
    return json({})
  }
}

export default function SetupPage() {
  const { hasApplication: loaderHasApplication, isSetup: loaderIsSetup, hasIntegration: loaderHasIntegration, applicationId: loadedApplicationId, organizationCreated: loadedOrganizationCreated } = useLoaderData<{hasApplication: boolean, isSetup: boolean, hasIntegration: boolean, organizationCreated: boolean, applicationId?: number }>()
  const { hasApplication: actionHasApplication, isSetup: actionIsSetup, hasIntegration: actionHasIntegration, applicationId: actionApplicationId, organizationCreated: actionOrganizationCreated } = useActionData<{hasApplication?: boolean|null, isSetup?: boolean|null, hasIntegration?: boolean|null, organizationCreated?: boolean|null, applicationId?: number}>() || {hasApplication: null, isSetup: null, hasIntegration: null, organizationCreated: null, applicationId: null}
  const hasApplication = loaderHasApplication ?? actionHasApplication
  const hasIntegration = loaderHasIntegration ?? actionHasIntegration
  const [addApplicationModalOpen, setAddApplicationModalOpen] = useState(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [organizationDetailsModalOpen, setOrganizationDetailsModalOpen] = useState(false)
  const [applicationId, setApplicationId] = useState(loadedApplicationId ?? actionApplicationId)
  const [organizationCreated, setOrganizationCreated] = useState(loadedOrganizationCreated ?? actionOrganizationCreated)
  const isSetup = hasApplication
  const [stepsMap, setStepsMap] = useState<{[key: number]: {completed: boolean, enabled: boolean}}>({
    0: {completed: !!organizationCreated, enabled: true},
    1: {completed: !!hasApplication, enabled: organizationCreated},
    2: {completed: !!hasIntegration, enabled: hasApplication},
  })

  const newAppFormRef = React.createRef<HTMLFormElement>()
  const newAppInputRef = React.createRef<HTMLInputElement>()

  const integrationFormRef = React.createRef<HTMLFormElement>()
  const integrationInputRef = React.createRef<HTMLInputElement>()

  const setupCompleteFormRef = React.createRef<HTMLFormElement>()
  const setupCompleteInputRef = React.createRef<HTMLInputElement>()
  const organizationDetailsFormRef = React.createRef<HTMLFormElement>()
  const organizationDetailsInputRef = React.createRef<HTMLInputElement>()
  const fields: SetupFieldProps[] = [
    // {
    //   id: 0,
    //   title: "Choose a Subscription Plan",
    //   description: "Add your payment information and pick a subscription plan.",
    //   onClick: () => console.log("Adding payment info"),
    //   icon: "ri-money-dollar-circle-line",
    //   buttonText: "Open Stripe"
    // },
    {
      id: 0,
      title: "Add Organization Details",
      description: "Add your organization details to get started with your account.",
      onClick: () => setOrganizationDetailsModalOpen(true),
      icon: "ri-organization-chart",
      buttonText: "Add Details"
    },
    {
      id: 1,
      title: "Setup First Application",
      description: "Add your first application that will be managed by ProductLamb.",
      onClick: () => setAddApplicationModalOpen(true),
      icon: "ri-terminal-window-line",
      buttonText: "Add Application",
    },
    {
      id: 2,
      title: "Configure an Integration",
      description: "Configure an integration to get started with your account.",
      onClick: () => setIntegrationModalOpen(true),
      icon: "ri-git-merge-line",
      buttonText: "Add Integration",
      isOptional: true
    },
  ]
  const onAddApplication = (data: any) => {
    newAppInputRef.current!.value = JSON.stringify(data)
    newAppFormRef.current!.submit()
    setAddApplicationModalOpen(false)
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

  const onIntegrationSubmit = (data: any) => {
    integrationInputRef.current!.value = JSON.stringify(data)
    integrationFormRef.current!.submit()
    setIntegrationModalOpen(false)
  }


  const finishOnboarding = () => {
    setupCompleteInputRef.current!.value = 'true'
    setupCompleteFormRef.current!.submit()
  }

  const onOrganizationDetailsSubmit = (name: string) => {
    organizationDetailsInputRef.current!.value = name
    organizationDetailsFormRef.current!.submit()
    setOrganizationDetailsModalOpen(false)
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
      <form method="POST" ref={integrationFormRef}>
        <input type="hidden" name="integration" ref={integrationInputRef}/>
      </form>
      <form method="POST" ref={setupCompleteFormRef}>
        <input type="hidden" name="setup_complete" ref={setupCompleteInputRef}/>
      </form>

      <form method="POST" ref={organizationDetailsFormRef}>
        <input type="hidden" name="organization_details" ref={organizationDetailsInputRef}/>
      </form>
      <PLIntegrationOptionsModal configuredIntegrations={[]} open={integrationModalOpen} setOpen={setIntegrationModalOpen} onSubmit={onIntegrationSubmit} applicationId={applicationId ?? 0}/>
      <PLAddApplicationModal open={addApplicationModalOpen} setOpen={setAddApplicationModalOpen} onSubmit={onAddApplication}/>
      <PLOrganizationDetailsModal isOpen={organizationDetailsModalOpen} setIsOpen={setOrganizationDetailsModalOpen} onSubmit={onOrganizationDetailsSubmit}/>
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