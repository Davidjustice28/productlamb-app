import { PLBaseModal, PLModalFooter } from "./base";
import { useState } from "react";

export const PLConfirmModal = ({ onConfirm, open, setOpen }: { onConfirm: () => any, open: boolean, setOpen: (open: boolean) => void }) => {
  return (
    <PLBaseModal title="Confirm" open={open} setOpen={setOpen}>
      <>
        <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-8 w-full">
          <p className="text-neutral-700 dark:text-neutral-300">Are you sure you want to delete this item?</p>
        </div>
        <PLModalFooter submitText="Yes" closeText="No" onSubmit={onConfirm} onClose={() => setOpen(false)}/>
      </>
    </PLBaseModal>
  )
}