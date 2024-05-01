import { useState } from "react";
import { User, mockUsers } from "~/backend/mocks/users";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLTable } from "~/components/common/table";
import { TableColumn } from "~/types/base.types";



export default function UsersPage() {
  const [users, setUsers] = useState<Array<User>>(mockUsers)
  const columns: Array<TableColumn> = [
    {key: 'image' , type: 'image'},
    {key: "name", type: "text", sortable: true},
    {key: "email", type: "text"},
    {key: "role", type: "text"},
    {key: "type", type: "text", sortable: true},
    {key: "active", type: "status", sortable: true},
  ]
  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Manage your team members and user access to your various projects</p>
        <PLIconButton icon="ri-add-line" />
      </div>
      <div className="mt-5">
        <PLTable data={users} checked={[]} actionsAvailable={true} columnsVisible columns={columns} tableModalName="users"/>
      </div>
    </div>
  )
}