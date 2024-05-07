import { useState } from "react"
import { mockUsers, User } from "~/backend/mocks/users"
import { TableColumn } from "~/types/base.types"
import { PLIconButton } from "../buttons/icon-button"
import { PLTable } from "../common/table"

export function TeamSettings() {
  const [users, setUsers] = useState<Array<User>>(mockUsers)
  const [editMode, setEditMode] = useState<boolean>(false)
  const columns: Array<TableColumn> = [
    {key: 'image' , type: 'image'},
    {key: "name", type: "text", sortable: true},
    {key: "email", type: "text"},
    {key: "role", type: "text"},
    {key: "type", type: "text", sortable: true},
    {key: "active", type: "status", sortable: true},
  ]

  function handleItemCheck(checked: Array<number>) {
    if (checked.length && !editMode) {
      setEditMode(true)
    }

    if (!checked.length && editMode) {
      setEditMode(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex justify-center items-center text-lg"><i className="ri ri-team-line"></i></div>
          <h4 className="ml-2 font-semibold text-gray-700 dark:text-neutral-100">Team</h4>
        </div>
        <div className={"flex flex-row " + (editMode ? 'visible' : 'invisible')}>
          <PLIconButton icon="ri-close-line" colorClasses="text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700" />
          <PLIconButton icon="ri-check-line" colorClasses="text-green-600 dark:text-green-300 hover:bg-gray-100 dark:hover:bg-neutral-700" />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-5">
        <p className="text-sm text-gray-700 dark:text-neutral-300">Manage your team members and user access to your various projects</p>
        <div className="w-full">
          <PLTable data={users} checked={[]} actionsAvailable={true} columnsVisible columns={columns} tableModalName="users" onCheck={handleItemCheck}/>
        </div>
      </div>
    </>
  )
}