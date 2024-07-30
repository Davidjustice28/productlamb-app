import { useOrganization } from "@clerk/remix";
import { createClerkClient } from "@clerk/remix/api.server";
import { OrganizationMembership, getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import { PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction, MetaFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import React, { useEffect } from "react";
import { account } from "~/backend/cookies/account";
import { PLBasicButton } from "~/components/buttons/basic-button";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLTable } from "~/components/common/table";
import { PLInviteMemberModal } from "~/components/modals/account/invite-member";
import { PLConfirmModal } from "~/components/modals/confirm";
import { PLLoadingModal } from "~/components/modals/loading";
import { TableColumn } from "~/types/base.types";
import { generateInviteToken } from "~/utils/jwt";


export const meta: MetaFunction = () => {
  return [
    { title: "ProductLamb | Team" },
    {
      property: "og:title",
      content: "ProductLamb | Team",
    },
  ];
};

interface TeamMember {
  id: number
  organization_id: string
  clerk_member_id: string
  clerk_user_id: string
  name: string,
  role: string,
  imageUrl: string
  dateJoined: number
  dateLastActive: number
}

export const action: ActionFunction = async (args) => {
  const request = args.request
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies) || {})
  const account_id = accountCookie.accountId
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY!})
  const form = await request.formData()
  const data = Object.fromEntries(form) as unknown as { action: 'invite' | 'remove', data: string }  
  const { action, data: actionData } = data
  const { orgId, userId } = await getAuth(args)
  if (!userId || !orgId) {
    console.log('No orgId or userId', {orgId, userId})
    return json({success: false})
  }
  if (action === 'invite') {
    const url = process.env.SERVER_ENVIRONMENT === 'production' ? 'https://productlamb.com' : 'http://localhost:3000'
    try {
      const token = generateInviteToken(actionData, orgId, account_id)
      await clerkClient.organizations.createOrganizationInvitation({ 
        organizationId: orgId, 
        emailAddress: actionData, 
        inviterUserId: userId, 
        role: 'org:member', 
        redirectUrl: `${url}/api/accept-invite?token=${token}` ,
      })
      
      return json({ success: true });
    } catch (error) {
      console.error(error);
      return json({ success: false });
    }
  }

  if (action === 'remove') {
    const { members } = JSON.parse(actionData) as { members: Array<TeamMember>}
    const dbClient = new PrismaClient()
    if (!members.length) return json({success: false})
    try {
      await dbClient.accountUser.deleteMany({ where: { id: { in: members.map(m => m.id)}}})
      await Promise.all(members.map(async member => {
        await clerkClient.users.deleteUser(member.clerk_user_id)
        await clerkClient.organizations.deleteOrganizationMembership({organizationId: member.organization_id, userId: member.clerk_user_id})
      }))
      const {data: updatedMembers} = await clerkClient.organizations.getOrganizationMembershipList({organizationId: orgId})
      const {data: clerkUsers} = await clerkClient.users.getUserList({ userId: updatedMembers.map(member => member.publicUserData!.userId)})
      const users = await dbClient.accountUser.findMany({ where: {accountId: account_id}})
      const teamMembers: Array<TeamMember> = updatedMembers.reduce((acc: Array<TeamMember>, member) => {
        const dbUser = users.find(user => user.userId === member.publicUserData?.userId)
        const clerkUserData = clerkUsers.find(user => user.id === member.publicUserData?.userId)
        if (dbUser && clerkUserData) {
          const {fullName, imageUrl} = clerkUserData
          const role = member.role.split(':')[1]
          const data: TeamMember = {
            id: dbUser.id,
            organization_id: orgId,
            clerk_member_id: member.id,
            clerk_user_id: member.publicUserData?.userId || '',
            name: fullName?.length ? fullName : 'No Name',
            role: role,
            imageUrl,
            dateJoined: clerkUserData.createdAt,
            dateLastActive: clerkUserData?.lastActiveAt || 0

          }
          acc.push(data)
        }
        return acc
      }, [] as any)
      return json({success: true, teamMembers})
    } catch (e) {
      console.error(e)
      return json({error: 'Internal error occurred. Try again later.'}, {status: 500})
    }
  }

  return json({success: false})
}

export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => {
    const cookies = request.headers.get('Cookie')
    const accountCookie = (await account.parse(cookies) || {})
    const accountId = accountCookie.accountId
    const { orgId } = request.auth
    if (!orgId) return redirect('/portal/dashboard')
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY!})
    const prismaClient = new PrismaClient()

    const {data: members} = await clerkClient.organizations.getOrganizationMembershipList({organizationId: orgId})
    const {data: clerkUsers} = await clerkClient.users.getUserList({ userId: members.map(member => member.publicUserData!.userId)})
    const users = await prismaClient.accountUser.findMany({ where: {accountId: accountId}})
    const teamMembers: Array<TeamMember> = members.reduce((acc: Array<TeamMember>, member) => {
      const dbUser = users.find(user => user.userId === member.publicUserData?.userId)
      const clerkUserData = clerkUsers.find(user => user.id === member.publicUserData?.userId)
      if (dbUser && clerkUserData) {
        const { publicMetadata } = member
        const {fullName, imageUrl} = clerkUserData
        const role = member.role.split(':')[1]
        const data: TeamMember = {
          id: dbUser.id,
          organization_id: orgId,
          clerk_member_id: member.id,
          clerk_user_id: member.publicUserData?.userId || '',
          name: fullName?.length ? fullName : 'No Name',
          role: role,
          imageUrl,
          dateJoined: clerkUserData.createdAt,
          dateLastActive: clerkUserData?.lastActiveAt || 0

        }
        acc.push(data)
      }
      return acc
    }, [] as any)
    return {members: teamMembers}
   })
}
export default function OrganizationProfilePage() {
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
    {type: 'text', key: 'name'},
    {type: 'text', key: 'clerk_member_id', label: 'member id'},
    {type: 'status', key: 'role'},
    {type: 'date', key: 'dateLastActive', label: 'Last Session'},
  ]

  return ( 
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between w-full mb-5">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Manage your team. Invite up 4 team members</p>
        <div className="flex flex-row  gap-2">
          { (checked.length && !checked.includes(adminId)) ? <PLIconButton icon='ri-close-line' onClick={() => setRemoveMemberModalOpen(true)}/> : null}
            {/* TODO: Add editing user feature in future sprints */}
          {/* { checked.length === 1 && <PLIconButton icon="ri-equalizer-line" onClick={() => console.log('editing user')}/> } */}
          <PLIconButton icon='ri-mail-send-line' onClick={() => setInviteModalOpen(true)} disabled={members.length === 5}/>
        </div>
      </div>

      <Form method="post" ref={formRef}>
        <input type="hidden" name="action" ref={actionRef}/>
        <input type="hidden" name="data" ref={dataRef}/>
      </Form>

      <PLTable data={members} columns={columns} columnsVisible={true} checked={checked} actionsAvailable={members.length > 1} onCheck={handleCheck}/>
      <PLInviteMemberModal isOpen={inviteModalOpen} onSubmit={handleInviteMember} setIsOpen={setInviteModalOpen}/>
      <PLConfirmModal open={removeMemberModalOpen} setOpen={setRemoveMemberModalOpen} onConfirm={handleRemovingMembers} message="Are you sure you would like to remove access from the selected members?"/>
      <PLLoadingModal open={loading} setOpen={setLoading} title={loadingModalText}/>

    </div>
  )
}