import type { ActionFunction, LinksFunction, LoaderFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  json,
  redirect,
  useLoaderData,
} from '@remix-run/react'
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import TailwindCSS from './root.css'
import { RootLayout } from './components/layouts/root-layout'
import { ClerkApp, useAuth } from '@clerk/remix'
import { getSharedEnvs } from './utils/envs';
import { account } from './backend/cookies/account';
import { AccountsClient } from './backend/database/accounts/client';
import { Account, PrismaClient } from '@prisma/client';
import { useEffect, useState } from 'react';
import React from 'react';
import { ApplicationsClient } from './backend/database/applications/client';
import { createClerkClient } from '@clerk/remix/api.server';


export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: TailwindCSS },
    { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" }
  ]
}

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, async ({ request }) => {
    const cookieHeader = request.headers.get("Cookie");
    const accountCookie = (await account.parse(cookieHeader) || {});
    const { userId, orgId } = request.auth;
    const isPortalRoute = request.url.includes('/portal');
    let darkMode: boolean = false;
    if (!userId) {
      if (isPortalRoute) {
        return redirect('/')
      };
      return json({});
    }

    const dbClient = new PrismaClient();
    let user = await dbClient.accountUser.findFirst({ where: { userId: userId }});
    const accountClient = AccountsClient(dbClient.account);
    if (!user) {
      return redirect('/portal/setup');
    }

    darkMode = user.darkMode;
    let organizationAccount: Account | null = null;
    if (accountCookie.accountId) {
      if (!user?.accountId) {
        user = await dbClient.accountUser.update({ where: { id: user.id }, data: { accountId: accountCookie.accountId }});
      }
      if (accountCookie.setupIsComplete === undefined || accountCookie.setupIsComplete === null) {
        const { data: accountData } = await accountClient.getAccountById(accountCookie.accountId);
        if (accountData) accountCookie.setupIsComplete = accountData.isSetup;
      }

      if (!accountCookie.setupIsComplete && (!request.url.includes('/portal/setup') || !request.url.includes('/portal'))) {
        return redirect("/portal/setup", { headers: { "Set-Cookie": await account.serialize(accountCookie) } });
      }
      if (!isPortalRoute) {
        return redirect('/portal/dashboard', { headers: { "Set-Cookie": await account.serialize(accountCookie) } });
      } else {
        if (!accountCookie.selectedApplicationId) {
          const appClient = ApplicationsClient(dbClient.accountApplication);
          const { data: apps } = await appClient.getAccountApplications(accountCookie.accountId);
          if (apps && apps.length) {
            accountCookie.selectedApplicationId = apps[0].id;
            accountCookie.selectedApplicationName = apps[0].name;
          }  
          
          if ((!apps || !apps.length) && !request.url.includes('/portal/setup')){
            return redirect('/portal/setup', { headers: { "Set-Cookie": await account.serialize(accountCookie) } });
          }
        }
        const internal_account_id = process.env.INTERNAL_ACCOUNT_ID ? parseInt(process.env.INTERNAL_ACCOUNT_ID) : null;
        return json({ darkMode: darkMode, ENV: getSharedEnvs(), selectedApplicationName: accountCookie.selectedApplicationName, setupIsComplete: accountCookie.setupIsComplete, account_id: accountCookie?.accountId || null, selectedApplicationId: accountCookie.selectedApplicationId, internal_account_id },
          { headers: { "Set-Cookie": await account.serialize(accountCookie) } }
        );
      }
    } else {
      const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
      const organizations = (await clerkClient.users.getOrganizationMembershipList({ userId: userId! })).data;
      organizationAccount = await dbClient.account.findFirst({ where: { organization_id: organizations[0].organization.id }});
      if (!user?.accountId && organizationAccount) {
        user = await dbClient.accountUser.update({ where: { id: user.id }, data: { accountId: organizationAccount.id }});
        accountCookie.accountId = organizationAccount.id;
      } else if (!user?.accountId && !organizationAccount) {
        return redirect('/portal/setup');
      } else {
        accountCookie.accountId = user?.accountId!;
      }
      if ((!accountCookie.setupIsComplete === undefined || accountCookie.setupIsComplete === null) && organizationAccount) {
        accountCookie.setupIsComplete = organizationAccount.isSetup;
      }

      if (!accountCookie.setupIsComplete) {
        return redirect("/portal/setup", { headers: { "Set-Cookie": await account.serialize(accountCookie) } });
      }
      if (!isPortalRoute) {
        return redirect('/portal/dashboard', { headers: { "Set-Cookie": await account.serialize(accountCookie) } });
      } else {
        if (!accountCookie.selectedApplicationId) {
          const appClient = ApplicationsClient(dbClient.accountApplication);
          const { data: apps } = await appClient.getAccountApplications(accountCookie.accountId);
          if (apps && apps.length) {
            accountCookie.selectedApplicationId = apps[0].id;
            accountCookie.selectedApplicationName = apps[0].name;
          } else {
            return redirect('/portal/setup', { headers: { "Set-Cookie": await account.serialize(accountCookie) } });
          }
        }
        const internal_account_id = process.env.INTERNAL_ACCOUNT_ID ? parseInt(process.env.INTERNAL_ACCOUNT_ID) : null;
        return json({ darkMode: darkMode, ENV: getSharedEnvs(), selectedApplicationName: accountCookie.selectedApplicationName, setupIsComplete: accountCookie.setupIsComplete, account_id: accountCookie?.accountId || null, selectedApplicationId: accountCookie.selectedApplicationId, internal_account_id },
          { headers: { "Set-Cookie": await account.serialize(accountCookie) } }
        );
      }
    }
  });
};

 
export function App() {
  const { ENV, selectedApplicationName, setupIsComplete, darkMode: loadedDarkMode, selectedApplicationId, account_id, internal_account_id} = useLoaderData<typeof loader>()
  const [ darkModeState, setDarkMode ] = useState<boolean>(loadedDarkMode)
  const {userId} = useAuth()
  const darkmodeFormRef = React.useRef<HTMLFormElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const toggleDarkMode = () => {
    const updatedDarkMode = !darkModeState
    setDarkMode(updatedDarkMode)
    inputRef.current!.value = updatedDarkMode ? 'true' : 'false'
    handleFormSubmit()
  }

  const handleFormSubmit = async () => {
    const darkMode = inputRef.current?.value === 'true' ? true : false
    try {
      const response = await fetch(`/api/preferences/${userId!}`, {
        body: JSON.stringify({ darkMode: darkMode }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Error caught updating account dark mode: ', error)
    }
  };
  const isInternalAccount = account_id && internal_account_id ? internal_account_id === account_id : false;
  return (
    <html lang="en" className={ (darkModeState ? 'dark' : '') }>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className='dark:bg-neutral-800 bg-white'>
        <form ref={darkmodeFormRef}>
          <input type="hidden" name="_darkMode" ref={inputRef}/>
        </form>
        <RootLayout appData={{selectedApplicationName, selectedApplicationId}} setupIsComplete={setupIsComplete} toggleDarkMode={toggleDarkMode} darkMode={darkModeState} isInternal={isInternalAccount}/>
        <ScrollRestoration />
        <Scripts />

        {/* Global Shared Envs. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}

export default ClerkApp(App);