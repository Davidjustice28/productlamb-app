import { useState } from "react";
import { PLOptionsButtonGroup } from "~/components/buttons/options-button-group";
import { BillingSettings } from "~/components/settings/billing";
import { SettingsTabGroup } from "~/types/database.types";
import { TeamSettings } from "~/components/settings/team";
import { ManagerSettings } from "~/components/settings/manager";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { account } from "~/backend/cookies/account";
import { AccountManagerSettings } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { DB_CLIENT } from "~/services/prismaClient";
import { createClerkClient } from "@clerk/remix/api.server";
import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import { generateInviteToken } from "~/utils/jwt";

interface SettingsBaseUpdate {
  account_id: string
  type: string
}

interface ManagerSettingsUpdate extends SettingsBaseUpdate {
  incomplete_tasks_action: string
  timezone: string
  planning_ready?: string
  sprint_started?: string
  team_member?: string
  task_added?: string
  default_application_id?: string
}

interface TeamMember {
  id: number
  organization_id: string
  clerk_member_id: string
  clerk_user_id: string
  role: string,
  imageUrl: string
  dateJoined: number
  dateLastActive: number
  email: string
}


interface TeamSettingsUpdate extends SettingsBaseUpdate {}

export const meta: MetaFunction = () => {
  return [
    { title: "ProductLamb | Settings" },
    {
      property: "og:title",
      content: "ProductLamb | Settings",
    },
  ];
};

export const action: ActionFunction = async (args) => {
  const request = args.request
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies) || {})
  const account_id = accountCookie.accountId
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY!})
  const form = await request.formData()
  const formData = Object.fromEntries(form) as unknown as ManagerSettingsUpdate | TeamSettingsUpdate
  if (!('type' in formData)) return json({}, {status: 400})
  if (formData.type === 'manager') {
    const { account_id, incomplete_tasks_action, timezone } = formData as ManagerSettingsUpdate
    const data: Partial<AccountManagerSettings> = {
      incomplete_tasks_action,
      timezone,
      notify_on_member_join: 'team_member' in formData,
      notify_on_planning_ready: 'planning_ready' in formData,
      notify_on_sprint_ready: 'sprint_started' in formData,
      notify_on_task_added: 'task_added' in formData
    }
    
    await DB_CLIENT.accountManagerSettings.updateMany({where: {accountId: Number(account_id)}, data})
    if ('default_application_id' in formData) {
      const { default_application_id } = formData
      await DB_CLIENT.account.update({where: {id: Number(account_id)}, data: {default_application_id: Number(default_application_id)}})
    }

    const updatedSettings = await DB_CLIENT.accountManagerSettings.findFirst({where: {accountId: Number(account_id)}})
    const updatedAccount = await DB_CLIENT.account.findFirst({where: {id: Number(account_id)}})
    return json({updatedManagerSettings: updatedSettings, defaultApplicationId: updatedAccount?.default_application_id})
  } else if (formData.type === 'team') {
    const data = formData as unknown as  { action: 'invite' | 'remove', data: string }  
    const { action, data: actionData } = data
    const { orgId, userId } = await getAuth(args)
    if (!userId || !orgId) {
      console.log('No orgId or userId', {orgId, userId})
      return json({success: false})
    }
    if (action === 'invite') {
      const url = process.env.SERVER_ENVIRONMENT === 'production' ? 'https://productlamb.com' : 'http://localhost:3000'
      try {
        const token = generateInviteToken(actionData, orgId, account_id)
        await clerkClient.organizations.createOrganizationInvitation({ 
          organizationId: orgId, 
          emailAddress: actionData, 
          inviterUserId: userId, 
          role: 'org:member', 
          redirectUrl: `${url}/api/accept-invite?token=${token}` ,
        })
        
        return json({ success: true });
      } catch (error) {
        console.error(error);
        return json({ success: false });
      }
    }
  
    if (action === 'remove') {
      const { members } = JSON.parse(actionData) as { members: Array<TeamMember>}
      if (!members.length) return json({success: false})
      try {
        await DB_CLIENT.accountUser.deleteMany({ where: { id: { in: members.map(m => m.id)}}})
        await Promise.all(members.map(async member => {
          await clerkClient.users.deleteUser(member.clerk_user_id)
          await clerkClient.organizations.deleteOrganizationMembership({organizationId: member.organization_id, userId: member.clerk_user_id})
        }))
        const {data: updatedMembers} = await clerkClient.organizations.getOrganizationMembershipList({organizationId: orgId})
        const {data: clerkUsers} = await clerkClient.users.getUserList({ userId: updatedMembers.map(member => member.publicUserData!.userId)})
        const users = await DB_CLIENT.accountUser.findMany({ where: {accountId: account_id}})
        const teamMembers: Array<TeamMember> = updatedMembers.reduce((acc: Array<TeamMember>, member) => {
          const dbUser = users.find(user => user.userId === member.publicUserData?.userId)
          const clerkUserData = clerkUsers.find(user => user.id === member.publicUserData?.userId)
          if (dbUser && clerkUserData) {
            const {fullName, imageUrl} = clerkUserData
            const role = member.role.split(':')[1]
            const data: TeamMember = {
              id: dbUser.id,
              organization_id: orgId,
              clerk_member_id: member.id,
              clerk_user_id: member.publicUserData?.userId || '',
              role: role,
              imageUrl,
              dateJoined: clerkUserData.createdAt,
              dateLastActive: clerkUserData?.lastActiveAt || 0,
              email: clerkUserData.emailAddresses.length ? clerkUserData.emailAddresses[0].emailAddress : ''
            }
            acc.push(data)
          }
          return acc
        }, [] as any)
        return json({success: true, teamMembers})
      } catch (e) {
        console.error(e)
        return json({error: 'Internal error occurred. Try again later.'}, {status: 500})
      }
    }
  
    return json({success: false})
  } else {
    return json({})
  }
}


export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => {
    const cookies = request.headers.get('Cookie')
    const accountCookie = (await account.parse(cookies) || {})
    const accountId = accountCookie.accountId
    const { orgId } = request.auth
    const managerSettings = await DB_CLIENT.accountManagerSettings.findFirst({where: {accountId: accountId}})

    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY!})
    const accountData = await DB_CLIENT.account.findUnique({ where: {id: accountId}, include: {AccountApplication: true}})
    if (!accountData) {
      return redirect('/portal/dashboard')
    }
    const {data: members} = await clerkClient.organizations.getOrganizationMembershipList({organizationId: accountData.organization_id})
    const {data: clerkUsers} = await clerkClient.users.getUserList({ userId: members.map(member => member.publicUserData!.userId)})
    const users = await DB_CLIENT.accountUser.findMany({ where: {accountId: accountId}})
    const teamMembers: Array<TeamMember> = members.reduce((acc: Array<TeamMember>, member) => {
      const dbUser = users.find(user => user.userId === member.publicUserData?.userId)
      const clerkUserData = clerkUsers.find(user => user.id === member.publicUserData?.userId)
      if (dbUser && clerkUserData) {
        const { publicMetadata } = member
        const {fullName, imageUrl} = clerkUserData
        const role = member.role.split(':')[1]
        const data: TeamMember = {
          id: dbUser.id,
          email: clerkUserData.emailAddresses.length ? clerkUserData.emailAddresses[0].emailAddress : '',
          organization_id: accountData.organization_id,
          clerk_member_id: member.id,
          clerk_user_id: member.publicUserData?.userId || '',
          role: role,
          imageUrl,
          dateJoined: clerkUserData.createdAt,
          dateLastActive: clerkUserData?.lastActiveAt || 0

        }
        acc.push(data)
      }
      return acc
    }, [] as any)
    return {members: teamMembers, managerSettings, defaultApplicationId: accountData.default_application_id, applications: accountData.AccountApplication.map(app => ({name: app.name, id: app.id}))}
   })
}

export default function SettingsPage() {
  const {managerSettings: loadedManagerSettings, applications, defaultApplicationId} = useLoaderData<{managerSettings: AccountManagerSettings, defaultApplicationId: number, applications: {name: string, id: number}[]}>()
  const {updatedManagerSettings} = useLoaderData<{updatedManagerSettings: AccountManagerSettings| null}>() || {updatedManagerSettings: null}
  const userSettingsGroups = Object.values(SettingsTabGroup)
  const managerSettings = updatedManagerSettings || loadedManagerSettings
  const [userSettingsGroup, setUserSettingsGroup] = useState<SettingsTabGroup>(SettingsTabGroup.MANAGER)
  const disabledList = [SettingsTabGroup.BILLING]
  const [notificationSettings, setNotificationSettings] = useState<{planning_ready: boolean, sprint_started: boolean, team_member: boolean, task_added: boolean}>({
    planning_ready: managerSettings.notify_on_planning_ready,
    sprint_started: managerSettings.notify_on_sprint_ready,
    team_member: managerSettings.notify_on_member_join,
    task_added: managerSettings.notify_on_task_added
  })
  function handleGroupChange(group: string) {
    if(group === userSettingsGroup) return
    setUserSettingsGroup(group as SettingsTabGroup)
  }
  return (
    <div className="flex flex-col gap-10">
      <div className="w-full">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">User Settings</h1>
        <div className="w-full flex justify-start items-center mt-5">
          <PLOptionsButtonGroup groups={userSettingsGroups} current={userSettingsGroup} handleGroupChange={(group) => handleGroupChange(group)} disabledList={disabledList}/>
        </div>
        <div className="w-full border-2 rounded-lg border-black mt-5">
          {
            userSettingsGroup === SettingsTabGroup.MANAGER && <ManagerSettings timezone={managerSettings.timezone} incomplete_tasks_action={managerSettings.incomplete_tasks_action} account_id={managerSettings.accountId} notificationSettings={notificationSettings} applications={applications} defaultApplicationId={defaultApplicationId}/>
          }
          {
            userSettingsGroup === SettingsTabGroup.TEAM && <TeamSettings/>
          }
          {
            userSettingsGroup === SettingsTabGroup.BILLING && <BillingSettings/>
          }
        </div>
      </div>
    </div>
  )
}