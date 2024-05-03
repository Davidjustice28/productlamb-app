import { useState } from "react";
import { PLIconButton } from "../buttons/icon-button";

export function SecuritySettings() {
  const [editMode, setEditMode] = useState<boolean>(false)
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex justify-center items-center text-lg"><i className="ri ri-lock-line"></i></div>
          <h4 className="ml-2 font-semibold text-gray-700 dark:text-neutral-100">Security</h4>
        </div>
        <div className={"flex flex-row " + (editMode ? 'visible' : 'invisible')}>
          <PLIconButton icon="ri-close-line" colorClasses="text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700" />
          <PLIconButton icon="ri-check-line" colorClasses="text-green-600 dark:text-green-300 hover:bg-gray-100 dark:hover:bg-neutral-700" />
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-700 dark:text-neutral-300">Update your password and other security settings.</p>
      </div>
    </>
  )
}