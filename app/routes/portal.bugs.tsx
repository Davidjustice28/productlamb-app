import { useState } from "react";
import { Bug, mockBugs } from "~/backend/mocks/bugs";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLOptionsButtonGroup } from "~/components/buttons/options-button-group";
import { PLTable } from "~/components/common/table";
import { PLConfirmModal } from "~/components/modals/confirm";
import { TableColumn } from "~/types/base.types";
import { BugGroup } from "~/types/database.types";


export default function BugsPage() {
  const groups: Array<BugGroup> = Object.values(BugGroup)
  const [bugGroup, setBugGroup] = useState<BugGroup>(BugGroup.ALL)
  const [bugs, setBugs] = useState<Array<Bug>>(mockBugs)
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
  const [itemsSelected, setItemsSelected] = useState<boolean>(false)

  function handleDelete() {
    setDeleteModalOpen(true)
  }

  function onCheck(ids:Array<number>) {
    const itemsChecked = ids.length > 0
    if(itemsChecked === itemsSelected) return
    setItemsSelected(itemsChecked)
  }

  const columns: Array<TableColumn> = [
    {key: "description", type: "text"},
    {key: "status", type: "status", sortable: true},
    {key: "created_date", type: "text", sortable: true},
  ]

  function handleGroupChange(group: BugGroup) {
    if(group === bugGroup) return
    setBugGroup(group)
    if(group === BugGroup.ALL) {
      setBugs(mockBugs)
    } else {
      switch (group) {
        case BugGroup.COMPLETED:
          setBugs(mockBugs.filter(bug => bug.status === 'Fixed'))
          break
        case BugGroup.DELETED:
          setBugs(mockBugs.filter(bug => bug.status === 'Archived'))
          break
        case BugGroup.MANUAL:
          setBugs(mockBugs.filter(bug => bug.type === 'Manual'))
          break
        case BugGroup.EXTERNAL:
          setBugs(mockBugs.filter(bug => bug.type === 'External'))
          break
        default:
          setBugs([])
      }
    }
  }
  return (
    <div className="flex flex-col gap-6 mt-3">
      <div className="w-full flex justify-between items-center">
        <PLOptionsButtonGroup groups={groups} current={bugGroup} handleGroupChange={(group) => handleGroupChange(group as BugGroup)} />
        <div className="flex gap-2">
          {itemsSelected && <PLIconButton icon="ri-delete-bin-line" onClick={handleDelete}/>}
          <PLIconButton icon="ri-add-line" />
        </div>

      </div>
      <PLTable data={bugs} checked={[]} actionsAvailable={true} columns={columns} tableModalName="bugs" onCheck={onCheck}/>
      <PLConfirmModal open={deleteModalOpen} setOpen={setDeleteModalOpen} message="Are you sure you want to delete the selected bugs?" />
    </div>
  )
}