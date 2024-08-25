import { useState } from "react"
import { PLIconButton } from "../buttons/icon-button"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { PLTable } from "../common/table"
import { PLInviteMemberModal } from "../modals/account/invite-member"
import { PLConfirmModal } from "../modals/confirm"
import { PLLoadingModal } from "../modals/loading"
import React from "react"
import { TableColumn } from "~/types/base.types"
interface TeamMember {
  id: number
  organization_id: string
  clerk_member_id: string
  clerk_user_id: string
  role: string,
  imageUrl: string
  dateJoined: number
  dateLastActive: number
  email: string
}

export function TeamSettings() {
  const [editMode, setEditMode] = useState<boolean>(false)
  const { members: loadedMembers } = useLoaderData() as {members: TeamMember[]}
  const actionData = useActionData() as {teamMembers: TeamMember[]| undefined}
  const [members, setTeamMembers] = React.useState(actionData?.teamMembers ?? loadedMembers)
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false)
  const [removeMemberModalOpen, setRemoveMemberModalOpen] = React.useState(false)
  const formRef  = React.createRef<HTMLFormElement>()
  const actionRef = React.createRef<HTMLInputElement>()
  const dataRef = React.createRef<HTMLInputElement>()
  const [checked, setChecked] = React.useState([] as number[])
  const [adminId, setAdminId] = React.useState(members.filter(m => m.role === 'admin')[0].id)
  const [loading, setLoading] = React.useState(false)
  const [loadingModalText, setLoadingModalText] = React.useState<'Sending Invite...' | 'Removing Member Access...'>('Sending Invite...')

  async function handleInviteMember(email: string) {
    actionRef.current!.value = 'invite'
    dataRef.current!.value = email
    formRef.current?.submit()
    setInviteModalOpen(false)
    setLoadingModalText('Sending Invite...')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000);
  }

  async function handleRemovingMembers(email: string) {
    actionRef.current!.value = 'remove'
    const data:{ members: Array<TeamMember>} = {members: members.filter(m => checked.includes(m.id))}
    dataRef.current!.value = JSON.stringify(data)
    formRef.current?.submit()
    setRemoveMemberModalOpen(false)
    setLoadingModalText('Removing Member Access...')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000);
  }

  const handleCheck = (ids: number[]) => {
    const filteredMembers = members.filter(m => ids.includes(m.id))
    const memberIds = filteredMembers.map(m => m.id)
    setChecked(memberIds)
  }

  const columns: Array<TableColumn> = [
    {type: 'image', key: 'imageUrl'},
    {type: 'text', key: 'email'},
    {type: 'text', key: 'clerk_member_id', label: 'member id'},
    {type: 'status', key: 'role'},
    {type: 'date', key: 'dateLastActive', label: 'Last Session'},
  ]
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
        <div className="flex items-center w-full">
          <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex justify-center items-center text-lg"><i className="ri ri-notification-3-line"></i></div>
          <div className="flex flex-row justify-between items-center w-full">
            <h4 className="ml-2 font-semibold text-gray-700 dark:text-neutral-100">Provide & manager portal access and provide team member information.</h4>
            <div className="flex flex-row  gap-2">
              { (checked.length && !checked.includes(adminId)) ? <PLIconButton icon='ri-close-line' onClick={() => setRemoveMemberModalOpen(true)}/> : null}
                {/* TODO: Add editing user feature in future sprints */}
              {/* { checked.length === 1 && <PLIconButton icon="ri-equalizer-line" onClick={() => console.log('editing user')}/> } */}
              <PLIconButton icon='ri-mail-send-line' onClick={() => setInviteModalOpen(true)} disabled={members.length === 5}/>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="w-full flex flex-col">

          <Form method="post" ref={formRef}>
            <input type="hidden" name="type" value="team"/>
            <input type="hidden" name="action" ref={actionRef}/>
            <input type="hidden" name="data" ref={dataRef}/>
          </Form>

          <PLTable data={members} columns={columns} columnsVisible={true} checked={checked} actionsAvailable={members.length > 1} onCheck={handleCheck}/>
          <PLInviteMemberModal isOpen={inviteModalOpen} onSubmit={handleInviteMember} setIsOpen={setInviteModalOpen}/>
          <PLConfirmModal open={removeMemberModalOpen} setOpen={setRemoveMemberModalOpen} onConfirm={handleRemovingMembers} message="Are you sure you would like to remove access from the selected members?"/>
          <PLLoadingModal open={loading} setOpen={setLoading} title={loadingModalText}/>
        </div>
      </div>
    </>
  )
}