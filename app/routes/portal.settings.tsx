import { useState } from "react";
import { PLOptionsButtonGroup } from "~/components/buttons/options-button-group";
import { BillingSettings } from "~/components/settings/biling";
import { NotificationsSettings } from "~/components/settings/notifications";
import { PreferencesSettings } from "~/components/settings/preferences";
import { SettingsTabGroup } from "~/types/database.types";


export default function SettingsPage() {
  const userSettingsGroups = Object.values(SettingsTabGroup)

  const [userSettingsGroup, setUserSettingsGroup] = useState<SettingsTabGroup>(SettingsTabGroup.PREFERENCES)

  function handleGroupChange(group: string) {
    if(group === userSettingsGroup) return
    setUserSettingsGroup(group as SettingsTabGroup)
  }
  return (
    <div className="flex flex-col gap-10">
      <div className="w-full">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">User Settings</h1>
        <div className="w-full flex justify-start items-center mt-5">
          <PLOptionsButtonGroup groups={userSettingsGroups} current={userSettingsGroup} handleGroupChange={(group) => handleGroupChange(group)} />
        </div>
        <div className="w-full border-2 rounded-lg border-black mt-2">
          {
            userSettingsGroup === SettingsTabGroup.PREFERENCES && <PreferencesSettings/>
          }
          {
            userSettingsGroup === SettingsTabGroup.NOTIFICATIONS && <NotificationsSettings/>
          }
          {
            userSettingsGroup === SettingsTabGroup.BILLING && <BillingSettings/>
          }
        </div>
      </div>
    </div>
  )
}