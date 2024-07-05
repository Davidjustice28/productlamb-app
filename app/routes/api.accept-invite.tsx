import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { ActionFunction, LoaderFunction, json, redirect } from '@remix-run/node';
import { verifyInviteToken } from '~/utils/jwt';
import { createClerkClient } from '@clerk/remix/api.server';
import React, { useEffect } from 'react';
import { PLErrorModal } from '~/components/modals/error';
import { PrismaClient } from '@prisma/client';
import { PLLoadingModal } from '~/components/modals/loading';
import { wrapEmailSdk } from '~/services/resend/email';

export let loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return json({ error: 'Invalid invite token. Please check your invite link.' }, { status: 400 });
  }

  const payload = verifyInviteToken(token) as { email: string; organizationId: string, accountId: string } | null;
  if (!payload) {
    return json({ error: 'Invalid invite token. Please check your invite link.' }, { status: 400 });
  }
  return json({ email: payload.email, organizationId: payload.organizationId, account_id: payload.accountId});
};


export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const data = Object.fromEntries(form) as unknown as { email: string; organizationId: string; password: string; firstName: string, lastName: string, accountId: string};
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY!})
  const { email, organizationId, password, firstName, lastName, accountId } = data;
  const dbClient = new PrismaClient()

  try {
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName,
    })
    const account = await dbClient.account.findUnique({ where: { id: Number(accountId) }})!
    await dbClient.accountUser.create({ data: { userId: user.id, accountId: Number(accountId)} })
    await clerkClient.organizations.createOrganizationMembership({organizationId, userId: user.id, role: 'org:member'}).then(async () => {
      const admin = (await clerkClient.organizations.getOrganizationMembershipList({organizationId: organizationId})).data.filter((member) => member.role === 'org:admin')
      if(admin.length) {
        const adminUserId = admin[0].publicUserData?.userId
        if (adminUserId) {
          const adminUserData = await clerkClient.users.getUser(adminUserId)
          const emailClient = wrapEmailSdk(process.env.RESEND_API_KEY!, process.env.PRODUCTLAMB_NOTIFICATIONS_EMAIL!)
          const deepLink = `${process.env.SERVER_ENVIRONMENT === 'production'?  process.env.PROD_HOST_URL : process.env.DEV_HOST_URL}/portal/team`
          const html = emailClient.getHTMLTemplate('new-team-member', deepLink, 'ProductLamb', `${firstName} ${lastName}`)
          await emailClient.sendEmail([adminUserData.emailAddresses[0].emailAddress], 'Team Member Accepted ProductLamb Invitiation', html)
        }
      }
    })
  } catch (error) {
    console.error(error);
    return json({ error: 'Internal error occurred. Try again later.' }, { status: 500 });
  }
  return redirect('/portal/dashboard')
}


export default function AcceptInvite() {
  const { email, organizationId, account_id } = useLoaderData() as { email: string; organizationId: string; account_id: string };
  const actionData = useActionData() as { error?: string }
  const formRef = React.useRef<HTMLFormElement>(null);
  const firstNameRef = React.useRef<HTMLInputElement>(null);
  const lastNameRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const confirmPasswordRef = React.useRef<HTMLInputElement>(null);
  const [isValid, setIsValid] = React.useState(false);
  const [passwordsMatch, setPasswordsMatch] = React.useState(true);
  const [errorModalOpen, setErrorModalOpen] = React.useState(!!actionData?.error ?? false);
  const [loading, setLoading] = React.useState(false);

  const checkIfPasswordsMatch = () => {
    if (!passwordRef.current?.value.length || !confirmPasswordRef.current?.value.length) {
      setPasswordsMatch(true)
      return
    }
    const doMatch =  passwordRef.current?.value === confirmPasswordRef.current?.value;
    setPasswordsMatch(doMatch);
    return
  }

  const formReady = () => {
    const hasFirstName = !!firstNameRef.current?.value.length;
    const hasLastName = !!lastNameRef.current?.value.length;
    const hasPassword = !!passwordRef.current?.value.length;
    const hasConfirmPassword = !!confirmPasswordRef.current?.value.length;
    const passwordsMatch = passwordRef.current?.value === confirmPasswordRef.current?.value;
    const valid = hasFirstName && hasLastName && hasPassword && hasConfirmPassword && passwordsMatch;
    setIsValid(valid);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    formRef.current?.submit();
  }
    
  useEffect(() => {
    console.log('email:', email, 'organizationId:', organizationId, 'account_id:', account_id)
  }, [])
  return (
    <div className="bg-grey-lighter min-h-screen flex flex-col bg-gradient-to-r from-yellow-400 to-orange-500">
      <div className="container w-4/5 md:2/3 lg:w-1/3 mx-auto flex-1 flex flex-col items-center justify-center px-2">
        <Form className="bg-white px-6 py-8 rounded shadow-md text-black w-full" method='post' onSubmit={handleSubmit} ref={formRef}>
          <img className="h-8 ml-auto mr-auto mb-5" src="https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_black.png"/>
          <p className="mb-5 text-center">Fill out this form to get access to your team's account.</p>
          <input 
            type="text"
            ref={firstNameRef}
            className="block border border-grey-light w-full p-3 rounded mb-4"
            name="firstName"
            placeholder="First Name" 
            onChange={formReady}
          />

          <input 
            type="text"
            ref={lastNameRef}
            className="block border border-grey-light w-full p-3 rounded mb-4"
            name="lastName"
            placeholder="Last Name" 
            onChange={formReady}
          />  

          <input 
            type="text"
            className="block border border-grey-light w-full p-3 rounded mb-4 text-gray-400"
            value={email}
            defaultValue={email}
            disabled
            placeholder="Email" 
          />

          <input 
            type="password"
            ref={passwordRef}
            className="block border border-grey-light w-full p-3 rounded mb-4"
            name="password"
            placeholder="Password"
            onChange={() => {
              formReady();
              checkIfPasswordsMatch()
            }} 
          />
          <input 
            type="password"
            ref={confirmPasswordRef}
            className={"block border border-grey-light w-full p-3 rounded mb-4 " + (passwordsMatch ? '' : 'border-red-500')}
            name="confirm_password"
            placeholder="Confirm Password" 
            onChange={() => {
              formReady();
              checkIfPasswordsMatch()
            }}
          />
          <input 
            type="hidden"
            name="organizationId"
            value={organizationId}
            onChange={formReady}
          />
          <input 
            type="hidden"
            name="email"
            value={email}
            defaultValue={email}
          />
          <input 
            type="hidden"
            name="accountId"
            value={account_id}
            defaultValue={account_id}
          />

          <button
            type="submit"
            className={"w-full text-center py-3 rounded bg-orange-400 text-white  " + (isValid ? '' : 'opacity-50 cursor-not-allowed hover:bg-orange-500 focus:outline-none')}
            disabled={!isValid}
          >
            Complete Registration
          </button>
        </Form>
      </div>
      <PLErrorModal setOpen={setErrorModalOpen} open={errorModalOpen} message={actionData?.error}/>
      <PLLoadingModal open={loading} setOpen={setLoading} title='Creating Account'/>

    </div>
  );
}
