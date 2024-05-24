import { useState } from "react";
import { PLBaseModal } from "../../base";
import { PLSelectorModalOption } from "~/types/component.types";
import { FeedbackToolSelector } from "./feedback-tool-selector";
import { CsvUploadComponent } from "./csv-upload";

export function PLBulkUploadFeedbackModal({open, onClose, setOpen}: {open: boolean, onClose?: () => void, setOpen: (open: boolean) => void}) {
  const [selectedTool, setSelectedTool] = useState<PLSelectorModalOption | null>(null)
  const handleOptionClick = (option: PLSelectorModalOption) => {
    if ( selectedTool?.value !== option.value) {
      setSelectedTool(option)
    }
  }

  const closeModal = () => {
    setSelectedTool(null)
    if (onClose) {
      onClose()
    }
  }

  return (
    <PLBaseModal open={open} onClose={closeModal} setOpen={setOpen} size="md" title="Bulk upload feedback">
      <div className="p-5 flex flex-col gap-3 text-black dark:text-white">
        {
          !selectedTool ? <FeedbackToolSelector onClick={handleOptionClick}/> :
          selectedTool.name === 'CSV' ? <CsvUploadComponent/> :
          selectedTool.name === 'Typeform' ? <p>Typeform Integration</p> :
          <p>Not available</p>
        }
      </div>
    </PLBaseModal>
  );
}
