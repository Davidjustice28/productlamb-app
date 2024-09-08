import { useNavigate } from "@remix-run/react"
import { PLBasicButton } from "../buttons/basic-button"

export function PLPrivacyPopupModal({ open, setOpen }: { onConfirm?: (...args:any[]) => any, open: boolean, setOpen: (open: boolean) => void, message: string }) {
  const navigate = useNavigate()

  const visitPolicy = () => {
    navigate('/privacy')
  }

  const acknowledgePrivacyPolicy = async () => {
    await fetch('/api/privacy', {
      method: 'POST',
    })
    setOpen(false)
  }

  const message = 'We use cookies for security, analytics purposes, and to personalize your experience.'

  return (
    <div className={"fixed bottom-0 my-6 w-[80%] ml-[10%] mx-auto"}>
      <div className={"border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white dark:bg-neutral-900 outline-none focus:outline-none"}>
        <div className="relative flex-auto rounded w-full overflow-y-auto scroll" style={{maxHeight: "600px"}}>
          <div className="relative min-h-20 flex flex-col gap-5 md:flex-row md:items-center justify-between rounded px-6  py-6 w-full font-semibold text-neutral-700 dark:text-neutral-300">
            <p>{message} <a className="underline font-bold"> Learn more</a></p>
            <div className="flex flex-row items-center gap-3">
              <PLBasicButton text="Review Policy" onClick={visitPolicy} rounded colorClasses="bg-neutral-600 text-white hover:bg-neutral-700" noDefaultDarkModeStyles={true}/>
              <PLBasicButton text="Acknowledge" onClick={acknowledgePrivacyPolicy} rounded colorClasses="bg-orange-500 text-white hover:bg-orange-500" noDefaultDarkModeStyles={true}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}