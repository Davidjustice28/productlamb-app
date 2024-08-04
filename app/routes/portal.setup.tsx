import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import { Account, ApplicationIntegration, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, MetaFunction, json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import React, { useEffect } from "react";
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
import { ClickUpData, JiraData, NewApplicationData, NotionData, PLAvailableIntegrationNames, SupportedTimezone } from "~/types/database.types";
import { GithubIntegrationSetupFormData, GitlabIntegrationSetupFormData, TypeformIntegrationMetaData, TypeformIntegrationSetupFormData } from "~/types/integrations.types";
import { createClerkClient } from '@clerk/remix/api.server';
import { useOrganizationList } from "@clerk/remix";
import { PLInviteMemberModal } from "~/components/modals/account/invite-member";
import { generateInviteToken } from "~/utils/jwt";
import { encrypt } from "~/utils/encryption";
import { ApplicationPMToolClient } from "~/backend/database/pm-tools/client";

interface SetupFieldProps {
  id: number, 
  title: string, 
  description: string, 
  onClick?: () => void, 
  icon: string, 
  buttonText: string
  isOptional?: boolean
}

export const meta: MetaFunction = () => {
  return [
    { title: "ProductLamb | Setup" },
    {
      property: "og:title",
      content: "ProductLamb | Setup",
    },
  ];
};

export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => {
    const { userId, orgId } = request.auth;
    const dbClient = new PrismaClient();
    const appClient = ApplicationsClient(dbClient.accountApplication);
    const integrationClient = IntegrationClient(dbClient.applicationIntegration);
    const accountClient = AccountsClient(dbClient.account);
    const cookieHeader = request.headers.get("Cookie");
    const accountCookie = (await account.parse(cookieHeader)) || {};
    let accountId: number | undefined = accountCookie.accountId;

    if (!userId) {
      return redirect('/');
    }

    let user = await dbClient.accountUser.findFirst({ where: { userId: userId } });
    if (!user) {
      try {
        const result = await dbClient.accountUser.createMany({ data: [{ userId: userId }] });
        if (result.count) {
          user = await dbClient.accountUser.findFirst({ where: { userId: userId } });
        }
      } catch (err) {
        console.error('create user id db failed: ', err);
      }
      return redirect('/portal/setup');
    }

    if (accountId === undefined) {
      const accountData = await dbClient.account.findFirst({ where: { user_prisma_id: userId! } });
      if (!accountData) {
        const result = await accountClient.createAccount(userId, "free", SupportedTimezone.MST);
        if (result.errors.length > 0 || !result.data) return json({});
        await dbClient.accountManagerSettings.create({ data: { accountId: result.data.id } });
        await dbClient.accountUser.update({ where: { id: user.id }, data: { accountId: result.data.id } });
        accountId = result.data.id;
        accountCookie.accountId = accountId;
        accountCookie.setupIsComplete = false;

        return json({ hasApplication: false, isSetup: false, hasIntegration: false, providedFeedback: false, account_id: accountId, subscriptionPaid: false }, {
          headers: {
            "Set-Cookie": await account.serialize(accountCookie)
          }
        });
      } 
      accountId = accountData.id;
      const { data: apps } = await appClient.getAccountApplications(accountData.id);
      let integrations: ApplicationIntegration[] = [];
      if (apps && apps.length > 0) {
        integrations = (await integrationClient.getAllApplicationIntegrations(apps[0].id)).data ?? [];
      }
      const isSetup = accountData.isSetup;
      accountCookie.accountId = accountData.id;
      accountCookie.setupIsComplete = isSetup;
      const subscriptionPaid = accountData.status === 'active';
      if (!isSetup) {
        return json({ hasApplication: apps ? apps.length : false, isSetup: accountData.isSetup, hasIntegration: integrations ? integrations.length : false, providedFeedback: false, account_id: accountData.id, subscriptionPaid}, {
          headers: {
            "Set-Cookie": await account.serialize(accountCookie)
          }
        });
      } else {
        return redirect('/portal/dashboard', { headers: { "Set-Cookie": await account.serialize(accountCookie) } });
      }
    } else {
      const { data: accountData } = await accountClient.getAccountById(accountId);
      const { data: apps } = await appClient.getAccountApplications(accountId);
      let integrations: ApplicationIntegration[] = [];
      if (apps && apps.length > 0) {
        integrations = (await integrationClient.getAllApplicationIntegrations(apps[0].id)).data ?? [];
      }
      if (accountData && !accountData.isSetup) {
        const subscriptionPaid = accountData.status === 'active';
        return json({ account_id: accountData.id, hasApplication: apps ? apps.length : false, isSetup: false, hasIntegration: !!integrations.length, providedFeedback: false, applicationId: apps && apps.length > 0 ? apps[0].id : null, organizationCreated: !!accountData?.organization_id, subscriptionPaid });
      }
      if (accountData && accountData.isSetup) {
        return redirect('/portal/dashboard', { headers: { "Set-Cookie": await account.serialize(accountCookie) } });
      }
      return json({ account_id: accountId, hasApplication: apps ? apps.length : false, isSetup: false, hasIntegration: !!integrations.length, providedFeedback: false, applicationId: apps && apps.length > 0 ? apps[0].id : null, organizationCreated: !!accountData?.organization_id, subscriptionPaid: false });
    }
  });
};



export let action: ActionFunction = async (args) => {
  const { userId } = await getAuth(args);
  const request = args.request
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as {new_application?: string, integration?: string, setup_complete?: string, organization_details?: string, invited_email?: string, payment_account_id?: string} 
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
  } else if ('invited_email' in data) {
    if (!data?.invited_email ) return json({ success: false });
    const url = process.env.SERVER_ENVIRONMENT === 'production' ? 'https://productlamb.com' : 'http://localhost:3000'
    try {
      const { orgId, userId } = await getAuth(args)
      if (!userId || !orgId) {
        console.log('No orgId or userId', {orgId, userId})
        return json({success: false})
      }
      const token = generateInviteToken(data.invited_email, orgId, accountId)
      const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY!})
      await clerkClient.organizations.createOrganizationInvitation({ 
        organizationId: orgId, 
        emailAddress: data.invited_email, 
        inviterUserId: userId, 
        role: 'org:member', 
        redirectUrl: `${url}/api/accept-invite?token=${token}` ,
      })
      
      return json({ success: true });
    } catch (error) {
      console.error(error);
      return json({ success: false });
    }
  } else if ('new_application' in data) {
    const newAppData = JSON.parse(data.new_application as string) as NewApplicationData 
    const pmToolClient = ApplicationPMToolClient(dbClient)

    const {data: createAppResult } = await appDbClient.addApplication(accountId, newAppData)
    if (createAppResult) {
      const goals = newAppData.goals.length < 0 ? [] : JSON.parse(newAppData.goals).map((goal: {goal: string, isLongTerm: boolean}) => ({goal: goal.goal, isLongTerm: goal.isLongTerm}))
      await goalDbClient.addMultipleGoals(createAppResult.id, goals)      

      const pmToolData = JSON.parse(newAppData.projectManagementTool) as ClickUpData | NotionData | JiraData

      let pmToolConfigurationResponseId: number| null = null
      let pmToolType: 'clickup' | 'notion' | 'jira' | null = null
      if ('parentFolderId' in pmToolData) {
        const {parentFolderId, apiToken} = pmToolData
        const {data, errors} = await pmToolClient.clickup.addConfig(apiToken, parentFolderId, createAppResult.id)
        if (data) {
          pmToolConfigurationResponseId = data.id
          pmToolType = 'clickup'
        }

        if (errors) {
          console.log('error adding clickup config', errors)
        }

      } else if ('parentBoardId' in pmToolData) {
        const {parentBoardId, apiToken, email, hostUrl, projectKey} = pmToolData
        const {data, errors} = await pmToolClient.jira.addConfig(apiToken, parentBoardId, email, projectKey, hostUrl, createAppResult.id)
        if (data) {
          pmToolConfigurationResponseId = data.id
          pmToolType = 'jira'
        } else {
          console.error('error adding jira config', errors)
        }

      }else {
        const {parentPageId, apiKey} = pmToolData
        const {data, errors} = await pmToolClient.notion.addConfig(apiKey, parentPageId, createAppResult.id)
        if (data) {
          pmToolConfigurationResponseId = data.id
          pmToolType = 'notion'
        } else {
          console.error('error adding notion config', errors)
        }
      }
      if (pmToolConfigurationResponseId && pmToolType) {
        if (pmToolType === 'clickup') {
          const response = await appDbClient.updateApplication(createAppResult.id, {clickup_integration_id: pmToolConfigurationResponseId})
        } else if(pmToolType === 'jira') {
          const response = await appDbClient.updateApplication(createAppResult.id, {jira_integration_id: pmToolConfigurationResponseId})
        } else {
          const response = await appDbClient.updateApplication(createAppResult.id, {notion_integration_id: pmToolConfigurationResponseId})
        }
      }
    }
    return json({hasApplication: true, applicationId: createAppResult?.id})
  }  else if ('integration' in data) {
    const {data: apps} = await appDbClient.getAccountApplications(accountId)
    const application_id = accountCookie.selectedApplicationId as number
    const integrationData = JSON.parse(data.integration as string) as TypeformIntegrationSetupFormData | GithubIntegrationSetupFormData | GitlabIntegrationSetupFormData | { google_type: string, application_id: string, form_id?: string }
    const integrationName = "integration_name" in integrationData ? integrationData.integration_name : "google_type" in integrationData ? ( integrationData.google_type.toLowerCase().includes('forms') ? 'google forms' : 'google calendar') : null
    if (integrationName === null) return json({})
    const integrationOptionData = availableIntegrations.find(i => i.name.toLowerCase() === integrationName)
    if (!integrationOptionData) return json({})

    if ('google_type' in integrationData) {
      const type = integrationData.google_type.toLowerCase().includes('calendar') ? 'calendar' : 'forms'
      const baseUrl = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
      const body: {form_id?: string, type: string} = {type}
      if (type === 'forms' && 'form_id' in integrationData) {
        body['form_id'] = integrationData.form_id
      }
      const response = await fetch(`${baseUrl}/integrations/google/${application_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      
      if (response.status === 200) {
        const body = await response.json()
        if (body?.url) {
          return redirect(body.url)
        }
      }
    } else {
      const integrationOptionData = availableIntegrations.find(i => i.name.toLowerCase() === integrationData.integration_name.toLowerCase())
      const iv = process.env.ENCRYPTION_IV 
      const key = process.env.ENCRYPTION_KEY
       if (!key || !iv) {
         return json({})
       }
       
      const encryptedToken = encrypt(integrationData.api_token, key, iv)
      if (integrationOptionData && integrationOptionData.name.toLowerCase() === 'typeform') {
        await integrationClient.addIntegration<TypeformIntegrationMetaData>(application_id, integrationName as PLAvailableIntegrationNames, encryptedToken, {
          form_id: (integrationData as TypeformIntegrationSetupFormData).typeform_form_id,
          tag_name: 'productlamb-webhook',        
        })
      } else if (integrationOptionData && integrationOptionData.name.toLowerCase() === 'github') {
        await integrationClient.addIntegration(application_id, integrationName  as PLAvailableIntegrationNames, encryptedToken, {
          repository_name: (integrationData as GithubIntegrationSetupFormData).repo_name,
          repository_owner: (integrationData as GithubIntegrationSetupFormData).repo_owner,
        })
  
      } else if (integrationOptionData && integrationOptionData.name.toLowerCase() === 'gitlab') {
        await integrationClient.addIntegration(application_id, integrationName  as PLAvailableIntegrationNames, encryptedToken, {
          project_id: (integrationData as GitlabIntegrationSetupFormData).project_id,
        })
      } else {
        return json({})
      }
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

  } else if ('payment_account_id' in data) {
    const account_id = accountCookie.accountId as number
    const accountData = await accountClient.getAccountById(account_id)
    if (accountData) {
      await accountClient.updateAccount(account_id, {status: 'active', subscriptionType: 'Monthly'})
      return json({subscriptionPaid: true})
    }
    return json({})
  } else {
    return json({})
  }
}

export default function SetupPage() {
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {infinite: true},
  })

  const { subscriptionPaid, account_id, hasApplication: loaderHasApplication, isSetup: loaderIsSetup, hasIntegration: loaderHasIntegration, applicationId: loadedApplicationId, organizationCreated: loadedOrganizationCreated } = useLoaderData<{hasApplication: boolean, isSetup: boolean, hasIntegration: boolean, organizationCreated: boolean, applicationId?: number, account_id: number, subscriptionPaid: boolean }>()
  const { hasApplication: actionHasApplication, isSetup: actionIsSetup, hasIntegration: actionHasIntegration, applicationId: actionApplicationId, organizationCreated: actionOrganizationCreated } = useActionData<{hasApplication?: boolean|null, isSetup?: boolean|null, hasIntegration?: boolean|null, organizationCreated?: boolean|null, applicationId?: number}>() || {hasApplication: null, isSetup: null, hasIntegration: null, organizationCreated: null, applicationId: null}
  const hasApplication = loaderHasApplication ?? actionHasApplication
  const hasIntegration = loaderHasIntegration ?? actionHasIntegration
  const [addApplicationModalOpen, setAddApplicationModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [organizationDetailsModalOpen, setOrganizationDetailsModalOpen] = useState(false)
  const [applicationId, setApplicationId] = useState(loadedApplicationId ?? actionApplicationId)
  const [organizationCreated, setOrganizationCreated] = useState(loadedOrganizationCreated ?? actionOrganizationCreated)
  const isSetup = hasApplication && subscriptionPaid && organizationCreated
  const [paymentMade, setPaymentMade] = useState(false)
  const [stepsMap, setStepsMap] = useState<{[key: number]: {completed: boolean, enabled: boolean, required: boolean}}>({
    0: {completed: !!organizationCreated, enabled: true, required: true},
    1: {completed: subscriptionPaid, enabled: organizationCreated, required: true},
    2: {completed: !!hasApplication, enabled: subscriptionPaid, required: true},
    3: {completed: !!hasIntegration, enabled: hasApplication, required: false},
    4: {completed: false, enabled: organizationCreated && hasApplication && subscriptionPaid, required: false}
  })

  const incompleteSteps = Object.values(stepsMap).filter(s => !s.completed && s.required).length

  const newAppFormRef = React.createRef<HTMLFormElement>()
  const newAppInputRef = React.createRef<HTMLInputElement>()

  const integrationFormRef = React.createRef<HTMLFormElement>()
  const integrationInputRef = React.createRef<HTMLInputElement>()

  const setupCompleteFormRef = React.createRef<HTMLFormElement>()
  const setupCompleteInputRef = React.createRef<HTMLInputElement>()
  const organizationDetailsFormRef = React.createRef<HTMLFormElement>()
  const organizationDetailsInputRef = React.createRef<HTMLInputElement>()

  const inviteFormRef  = React.createRef<HTMLFormElement>()
  const inviteDataRef = React.createRef<HTMLInputElement>()
  const paymentLinkRef = React.createRef<HTMLAnchorElement>()
  const paymentAccountIdRef = React.createRef<HTMLInputElement>()
  const paymentFormRef = React.createRef<HTMLFormElement>()

  const fields: SetupFieldProps[] = [
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
      title: "Choose a Subscription Plan",
      description: "Add your payment information and pick a subscription plan.",
      onClick: () => openPaymentOverlay(),
      icon: "ri-money-dollar-circle-line",
      buttonText: "Make Payment",
    },
    
    {
      id: 2,
      title: "Setup First Application",
      description: "Add your first application that will be managed by ProductLamb.",
      onClick: () => setAddApplicationModalOpen(true),
      icon: "ri-terminal-window-line",
      buttonText: "Add Application",
    },
    {
      id: 3,
      title: "Configure an Integration",
      description: "Configure an integration to get started with your account.",
      onClick: () => setIntegrationModalOpen(true),
      icon: "ri-git-merge-line",
      buttonText: "Add Integration",
      isOptional: true
    },
    {
      id: 4,
      title: "Invite Team Members",
      description: "Invite team members to collaborate on your applications.",
      onClick: () => setInviteModalOpen(true),
      icon: "ri-team-line",
      buttonText: "Send Invite",
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

  const openPaymentOverlay = () => {
    paymentLinkRef.current!.click()
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

  async function handleInviteMember(email: string) {
    inviteDataRef.current!.value = email
    inviteFormRef.current?.submit()
    setInviteModalOpen(false)
  }

  function submitPaymentForm() {
    paymentFormRef.current?.submit()
    setPaymentMade(false)
  }
  
  useEffect(() => {
    if (isLoaded && userMemberships.data.length > 0) {
      const membership = userMemberships.data[0]
      setActive({organization: membership.organization.id})
    }
  }, [])

  useEffect(() => {
    if (paymentMade) {
      submitPaymentForm()
    }
  }, [paymentMade])

  useEffect(() => {
    window.createLemonSqueezy()
    window.LemonSqueezy.Setup({
      eventHandler: (event) => {
        if(event?.event === 'Checkout.Success') setPaymentMade(true)
      },
  })
  }, [])

  return (
    <div className="flex flex-col h-full items-center text-black">
      <h1 className="text-black mt-5 font-bold text-2xl dark:text-neutral-200">Let's get Onboarded! 📋</h1>
      <p className="text-black mt-2 mb-5 dark:text-neutral-200">Complete the following steps to get started with your account.</p>
      <div className="w-4/5 bg-white rounded-xl shadow-sm mt-5 flex flex-col divide-y-2 dark:bg-neutral-800 dark:divide-neutral-600">
        <div className="w-full flex flex-row justify-between items-center px-10 py-5 ">
          <h2 className="text-black text-lg font-bold dark:text-neutral-300">Getting Started</h2>
          <p className="text-black text-sm dark:text-neutral-300">Required Steps Left: <span className="font-bold">{incompleteSteps}</span></p>
        </div>
        <div className="w-full flex flex-col gap-5 px-10 py-5">
          {fields.map((field, index) => <SetupFieldComponent key={index} fieldInfo={field} enabled={seeIfEnabled(field.id)} completed={stepsMap[field.id].completed}/>)}
        </div>
        <div className="w-full flex flex-row gap-2 justify-end py-5 px-10">
          <PLBasicButton icon="ri-play-circle-line" text="Finish Onboarding" colorClasses={"bg-green-400 text-white hover:bg-green-400 dark:text-white hover:text-white dark:bg-green-700"} onClick={() => finishOnboarding()} disabled={!isSetup}/>
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

      <form method="POST" ref={inviteFormRef}>
        <input type="hidden" name="invited_email" ref={inviteDataRef}/>
      </form>
      <form method="POST" ref={paymentFormRef}>
        <input type="hidden" name="payment_account_id" ref={paymentAccountIdRef}/>
      </form>
      <a href={`https://productlamb.lemonsqueezy.com/buy/70d85f32-6fd0-4d35-8224-7460db09ffcc?checkout[custom][pl_account_id]=${account_id}&embed=1`} className="lemonsqueezy-button" ref={paymentLinkRef}></a>
      <PLIntegrationOptionsModal configuredIntegrations={[]} open={integrationModalOpen} setOpen={setIntegrationModalOpen} onSubmit={onIntegrationSubmit} applicationId={applicationId ?? 0}/>
      <PLAddApplicationModal open={addApplicationModalOpen} setOpen={setAddApplicationModalOpen} onSubmit={onAddApplication}/>
      <PLOrganizationDetailsModal isOpen={organizationDetailsModalOpen} setIsOpen={setOrganizationDetailsModalOpen} onSubmit={onOrganizationDetailsSubmit}/>
      <PLInviteMemberModal isOpen={inviteModalOpen} onSubmit={handleInviteMember} setIsOpen={setInviteModalOpen}/>

    </div>
  )
}

function SetupFieldComponent({fieldInfo,enabled, completed}: {fieldInfo: SetupFieldProps, enabled?: boolean, completed?: boolean}) {
  const {title, description, onClick, buttonText, icon} = fieldInfo;
  return (
    <div className={"w-full flex items-center gap-7 "}>
      <div className={"h-[50px] w-[50px] border-2 border-black dark:border-neutral-400 rounded-sm flex justify-center items-center " +  (completed ? " opacity-50" : "")}>
        <i className={icon + " text-3xl dark:text-neutral-400"}></i>
      </div>
      <div className="flex-1 h-full flex flex-row justify-between items-center">
        <div className={"h-full flex flex-col justify-center gap-1 " +  (completed ? " opacity-50" : "")}>
          <h2 className="text-black text-lg font-bold dark:text-neutral-300">{title}</h2>
          <p className="text-black text-sm dark:text-neutral-300">{description}</p>
        </div>
        {
          completed ?
          (<div className="h-[40px] w-[40px] rounded-full flex justify-center items-center bg-green-400">
            <i className={"ri-check-line text-white text-2xl"}></i>
          </div>) :
          <PLBasicButton text={buttonText} colorClasses={"bg-orange-200 text-orange-600 hover:bg-orange-200 hover:text-orange-600 dark:bg-orange-200 dark:text-orange-600 dark:hover:bg-orange-200 dark:hover:text-orange-600"  + (!enabled ? 'opacity-50' : '')} onClick={onClick} useStaticWidth={true} disabled={!enabled}/>
        }
      </div>
    </div>
  )
}