import { PLBaseModal } from "./base";
import {BeatLoader, CircleLoader} from 'react-spinners'

export const PLLoadingModal = ({ open, setOpen, title="Loading"}: {open: boolean, setOpen: (open: boolean) => void, title?: string}) => {
  return (
    <PLBaseModal title="" open={open} setOpen={setOpen} size="tiny" hideTitle noDefaultSizeStyle={true}>
      <div className="flex flex-col items-center justify-center gap-5 w-80 h-52 dark:bg-neutral-700">
        <h2 className="text-center text-xl font-bold text-neutral-800 dark:text-white">{title}</h2>
        <BeatLoader
          color="#F28C28"
          size={18}
        />
      </div>
    </PLBaseModal>
  )
}