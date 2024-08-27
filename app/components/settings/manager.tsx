import { useState } from "react"
import { PLIconButton } from "../buttons/icon-button"
import { SupportedTimezone } from "~/types/database.types"
import { PLBasicButton } from "../buttons/basic-button"
import { PLCheckbox } from "../forms/checkbox";

export function ManagerSettings({incomplete_tasks_action, timezone, account_id, notificationSettings, defaultApplicationId, applications}: {account_id: number, applications: {name: string, id: number}[], defaultApplicationId: number, timezone: string, incomplete_tasks_action: string, notificationSettings: {
  planning_ready: boolean;
  sprint_started: boolean;
  team_member: boolean;
  task_added: boolean;
}}) {
  const [editMode, setEditMode] = useState<boolean>(false)
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex justify-center items-center text-lg"><i className="ri ri-tools-line"></i></div>
          <h4 className="ml-2 font-semibold text-gray-700 dark:text-neutral-200">Configure how your product manager operates.</h4>
        </div>
        <div className={"flex flex-row " + (editMode ? 'visible' : 'invisible')}>
          <PLIconButton icon="ri-close-line" colorClasses="text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700" />
          <PLIconButton icon="ri-check-line" colorClasses="text-green-600 dark:text-green-300 hover:bg-gray-100 dark:hover:bg-neutral-700" />
        </div>
      </div>
      <form className="flex flex-col gap-5 py-6 px-6" method="post" action="/portal/settings">
        <input type="hidden" name="account_id" value={account_id}/>
        <input type="hidden" name="type" value="manager"/>
        <div className="">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-neutral-400">What to do with incomplete tasks after sprint?</h5>
          <select 
            defaultValue={incomplete_tasks_action}
            className="form-select mt-2 block w-44 text-gray-700 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            name="incomplete_tasks_action"
          >
            <option value='backlog'>Move to backlog</option>
            <option value='roll'>Roll to next sprint</option>
            <option value='disregard'>Do nothing</option>
          </select>
        </div>
        <div className="">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-neutral-400">Timezone</h5>
          <select
            defaultValue={timezone}
            name="timezone"
            className="form-select mt-2 block w-36 text-gray-700 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {Object.entries(SupportedTimezone).map(([abbreviation, timezone], index) => 
              <option key={index} value={timezone}>{abbreviation}</option>
            )}
          </select>
        </div>
        <div className="">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-neutral-400">Default Application</h5>
          <select 
            defaultValue={defaultApplicationId}
            className="form-select mt-2 block w-44 text-gray-700 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            name="default_application_id"
          >
            {applications.map((application, index) => {
              return <option key={index} value={application.id}>{application.name}</option>
            })}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-neutral-400">Notifications</h5>           
          <PLCheckbox labelText="Sprint Planning Ready" name="planning_ready" checkedByDefault={notificationSettings.planning_ready}/>
          <PLCheckbox labelText="Sprint Started" name="sprint_started" checkedByDefault={notificationSettings.sprint_started}/>
          <PLCheckbox labelText="New Team Member" name="team_member" checkedByDefault={notificationSettings.team_member}/>
          <PLCheckbox labelText="Task Added to Sprint" name="task_added" checkedByDefault={notificationSettings.task_added}/>
        </div>
        <div>
          <PLBasicButton text="Save Changes"/>
        </div>
      </form>
    </>
  )
}