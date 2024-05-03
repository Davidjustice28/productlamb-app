import { useState } from "react";
import { PLOptionsButtonGroup } from "~/components/buttons/options-button-group";
import { BillingSettings } from "~/components/settings/biling";
import { GeneralAccountSettings } from "~/components/settings/general";
import { NotificationsSettings } from "~/components/settings/notifications";
import { PersonalInfoSettings } from "~/components/settings/personal";
import { PreferencesSettings } from "~/components/settings/preferences";
import { SecuritySettings } from "~/components/settings/security";
import { TeamSettings } from "~/components/settings/team";
import { UserSettingsTabGroup, AccountSettingsTabGroup } from "~/types/database.types";

export default function SettingsPage() {
  const userSettingsGroups = Object.values(UserSettingsTabGroup)
  const accountSettingsGroups = Object.values(AccountSettingsTabGroup)

  const [userSettingsGroup, setUserSettingsGroup] = useState<UserSettingsTabGroup>(UserSettingsTabGroup.PERSONAL)
  const [accountSettingsGroup, setAccountSettingsGroup] = useState<AccountSettingsTabGroup>(AccountSettingsTabGroup.GENERAL)

  function handleGroupChange(group: string, type: "user" | "account") {
    if(type === "user") {
      if(group === userSettingsGroup) return
      setUserSettingsGroup(group as UserSettingsTabGroup)
    } else {
      if(group === accountSettingsGroup) return
      setAccountSettingsGroup(group as AccountSettingsTabGroup)
    }
  }
  return (
    <div className="flex flex-col gap-10">
      <div className="w-full">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">User Settings</h1>
        <div className="w-full flex justify-start items-center mt-5">
          <PLOptionsButtonGroup groups={userSettingsGroups} current={userSettingsGroup} handleGroupChange={(group) => handleGroupChange(group, "user")} />
        </div>
        <div className="w-full border-2 rounded-lg border-black mt-2">
          {
            userSettingsGroup === UserSettingsTabGroup.PERSONAL && <PersonalInfoSettings/>
          }
          {
            userSettingsGroup === UserSettingsTabGroup.SECURITY && <SecuritySettings/>
          }
          {
            userSettingsGroup === UserSettingsTabGroup.NOTIFICATIONS && <NotificationsSettings/>
          }
          {
            userSettingsGroup === UserSettingsTabGroup.PREFERENCES && <PreferencesSettings/>
          }
        </div>
      </div>

      <div className="w-full">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Account Settings</h1>
        <div className="w-full flex justify-start items-center mt-5">
          <PLOptionsButtonGroup groups={accountSettingsGroups} current={accountSettingsGroup} handleGroupChange={(group) => handleGroupChange(group, "account")} />
        </div>
        <div className="w-full border-2 rounded-lg border-black mt-2">
          {
            accountSettingsGroup === AccountSettingsTabGroup.GENERAL && <GeneralAccountSettings/>
          }
          {
            accountSettingsGroup === AccountSettingsTabGroup.BILLING && <BillingSettings/>
          }
          {
            accountSettingsGroup === AccountSettingsTabGroup.TEAM && <TeamSettings/>
          }
        </div>
      </div>
    </div>
  )
}