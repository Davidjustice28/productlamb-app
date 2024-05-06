import { PLBaseModal, PLModalFooter } from "./base";
import { useState } from "react";

const defaultMessage = "Are you sure you want to delete this item?"

export const PLConfirmModal = ({ onConfirm, open, setOpen, message=defaultMessage }: { onConfirm?: (...args:any[]) => any, open: boolean, setOpen: (open: boolean) => void, message?: string }) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <PLBaseModal title="Please Confirm" open={open} setOpen={setOpen}>
      <>
        <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full">
          <p className="text-neutral-700 dark:text-neutral-300">{message}</p>
        </div>
        <PLModalFooter submitText="Yes" closeText="No" onSubmit={handleConfirm} onClose={handleClose}/>
      </>
    </PLBaseModal>
  )
}