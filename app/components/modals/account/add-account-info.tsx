import { PLBaseModal } from "../base";

export function PLAddAccountInfoModal({ isOpen, onSubmit, setIsOpen}: { isOpen: boolean, onSubmit: () => void, setIsOpen: (isOpen: boolean) => void}) {
  return (
    <PLBaseModal open={isOpen} setOpen={setIsOpen} title="Add Account Info">
      <div>
        <p>Some content here</p>
      </div>
    </PLBaseModal>
  )
} 