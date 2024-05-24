import { PLBaseModal } from "../base";

export function PLOnboardingFeedbackModal({ isOpen, onSubmit, setIsOpen}: { isOpen: boolean, onSubmit: () => void, setIsOpen: (isOpen: boolean) => void}) {
  return (
    <PLBaseModal open={isOpen} setOpen={setIsOpen} title="Onboarding Feedback Survey">
      <div>
        <p>Some content here</p>
      </div>
    </PLBaseModal>
  )
} 