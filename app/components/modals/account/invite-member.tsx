import React, { useEffect } from "react";
import { PLBaseModal, PLModalFooter } from "../base";
import { useOrganization } from "@clerk/remix";
  
export function PLInviteMemberModal({ isOpen, onSubmit, setIsOpen}: { isOpen: boolean, onSubmit: (email: string) => void, setIsOpen: (isOpen: boolean) => void}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { organization } = useOrganization()
  const [emailsUsed, setEmailsUsed] = React.useState<string[]>([])
  const handleAdd = () => {
    const value = inputRef.current?.value
    if (!value) return
    onSubmit(value)
  }
  const [invitations, setInvitations] = React.useState<{date_sent: Date, email: string}[]>()
  const onClose = () => {
    inputRef.current!.value = ''
    setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen && organization) {
      organization?.getInvitations().then((invites) => {
        const tempEmails: string[] = []
        setInvitations(invites.data.reduce((invites, invite) => {
          if (!tempEmails.includes(invite.emailAddress)) {
            tempEmails.push(invite.emailAddress)
            return[...invites, {date_sent: invite.createdAt, email: invite.emailAddress}]
          } else {
            return invites
          }
        }, [] as {date_sent: Date, email: string}[]))
        setEmailsUsed(tempEmails)
      })
    } else {
      setEmailsUsed([])
    }
  }, [isOpen])

  return (
    <PLBaseModal open={isOpen} setOpen={setIsOpen} title="Invite Team Member" onClose={onClose}>
      <div className="relative p-6 flex-auto rounded px-8 pt-6 w-full flex flex-col gap-2">
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Email Address</label>
        <input 
          ref={inputRef}
          type="email"
          placeholder="elonmusk@email.com" 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 invalid:border-red-600 invalid:border-2"
        />
        <p className="font-bold text-neutral-800 dark:text-neutral-200 mt-5">Invitations</p>
        { invitations?.length && <div className="w-full flex flex-col gap-2 border-t-2 border-gray-300 dark:bg-transparent dark:border-neutral-70 m-h-28 pt-2 overflow-scroll">
          {invitations.map((invite, index) => {
            const { date_sent, email } = invite
            return (
              <div key={index} className="flex justify-between rounded text-neutral-500 dark:text-neutral-200">
                <p className="font-semibold">{email}</p>
                <p className="opacity-75">{date_sent.getMonth() + 1}/{date_sent.getDate() + 1}/{date_sent.getFullYear()}</p>
              </div>
            )
          })}
        </div>}
        {emailsUsed.length === 4 && <p className="text-red-500 dark:text-red-400 text-sm mt-2">You can invite up to 4 team members</p>}
      </div>
      <PLModalFooter onSubmit={handleAdd} submitText="Send" onClose={onClose} submitDisabled={emailsUsed.length === 4}/>
    </PLBaseModal>
  )
} 