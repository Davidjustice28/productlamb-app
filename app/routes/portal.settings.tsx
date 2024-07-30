import { useEffect, useState } from "react";
import { PLOptionsButtonGroup } from "~/components/buttons/options-button-group";
import { BillingSettings } from "~/components/settings/billing";
import { SettingsTabGroup } from "~/types/database.types";
import { TeamSettings } from "~/components/settings/team";
import { ManagerSettings } from "~/components/settings/manager";
import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { account } from "~/backend/cookies/account";
import { AccountManagerSettings, PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";

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

export const action: ActionFunction = async ({request}) => {
  const form = await request.formData()
  const formData = Object.fromEntries(form) as unknown as ManagerSettingsUpdate | TeamSettingsUpdate
  if (!('type' in formData)) return json({}, {status: 400})
  if (formData.type === 'manager') {
    const { account_id, incomplete_tasks_action, timezone } = formData as ManagerSettingsUpdate
    const prisma = new PrismaClient()
    const data: Partial<AccountManagerSettings> = {
      incomplete_tasks_action,
      timezone,
      notify_on_member_join: 'team_member' in formData,
      notify_on_planning_ready: 'planning_ready' in formData,
      notify_on_sprint_ready: 'sprint_started' in formData,
      notify_on_task_added: 'task_added' in formData
    }
    await prisma.accountManagerSettings.updateMany({where: {accountId: Number(account_id)}, data})
    const updatedSettings = await prisma.accountManagerSettings.findFirst({where: {accountId: Number(account_id)}})
    return json({updatedManagerSettings: updatedSettings})
  } else {
    return json({})
  }
}

export const loader: LoaderFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies)) || {};
  let accountId: number = accountCookie.accountId;
  const managerSettings = await new PrismaClient().accountManagerSettings.findFirst({where: {accountId: accountId}})
  return json({managerSettings})
}

export default function SettingsPage() {
  const {managerSettings: loadedManagerSettings} = useLoaderData<{managerSettings: AccountManagerSettings}>()
  const {updatedManagerSettings} = useLoaderData<{updatedManagerSettings: AccountManagerSettings| null}>() || {updatedManagerSettings: null}
  const userSettingsGroups = Object.values(SettingsTabGroup)
  const managerSettings = updatedManagerSettings || loadedManagerSettings
  const [userSettingsGroup, setUserSettingsGroup] = useState<SettingsTabGroup>(SettingsTabGroup.MANAGER)
  const disabledList = [SettingsTabGroup.TEAM, SettingsTabGroup.BILLING]
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
            userSettingsGroup === SettingsTabGroup.MANAGER && <ManagerSettings timezone={managerSettings.timezone} incomplete_tasks_action={managerSettings.incomplete_tasks_action} account_id={managerSettings.accountId} notificationSettings={notificationSettings}/>
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