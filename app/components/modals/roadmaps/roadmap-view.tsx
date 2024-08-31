import { PLBaseModal } from "../base"
import { RoadmapItem } from "~/types/database.types"

export function PLRoadmapItemModal({open, setOpen, roadmapItem}: {open: boolean, setOpen: (open: boolean) => void, roadmapItem: RoadmapItem}) {
  const onClose = () => {
    setOpen(false)
    console.log('closed')
  }
  
  return (
    <PLBaseModal open={open} onClose={onClose} title={roadmapItem.initiative} setOpen={setOpen} size="md">
      <div className="flex flex-col gap-2 p-5 pb-10">
        <p className="text-black dark:text-gray-300 italic underline">{new Date(roadmapItem.start_date).toLocaleDateString()} - {new Date(roadmapItem.end_date).toLocaleDateString()}</p>
        <p className="text-black dark:text-gray-300">{roadmapItem.description}</p>
      </div>
    </PLBaseModal>
  )
}