import type { ActionFunction, LinksFunction, LoaderFunction } from '@remix-run/node'
import {
  Form,
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
import { ClerkApp } from '@clerk/remix'
import { getSharedEnvs } from './utils/envs';
import { preferences } from './backend/cookies/preferences';
import { account } from './backend/cookies/account';
import { AccountsClient } from './backend/database/accounts/client';
import { PrismaClient } from '@prisma/client';
import { useEffect, useState } from 'react';
import React from 'react';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: TailwindCSS },
    { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" }
  ]
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const { _navbarState: previousPath  } = Object.fromEntries(formData)
  const headers = new Headers();
  const cookieHeader = request.headers.get("Cookie");
  const preferencesCookie = (await preferences.parse(cookieHeader) || {});
  if (previousPath) { 
    preferencesCookie.navBarMode = preferencesCookie.navBarMode === undefined ? true : !preferencesCookie.navBarMode;
    headers.append('Set-Cookie', await preferences.serialize(preferencesCookie));
    let redirectPath = previousPath.toString()
    return redirect(redirectPath, { headers })
  } else {
    return json({})
  }
}

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, async ({ request }) => {
    const cookieHeader = request.headers.get("Cookie");
    const preferencesCookie = (await preferences.parse(cookieHeader) || {});  
    const accountCookie = (await account.parse(cookieHeader) || {});
    const { userId } = request.auth
    const isPortalRoute = request.url.includes('/portal')
    let darkMode: boolean = false
    if ((!userId )) {
      if (isPortalRoute) return redirect('/')
    } else {
      if (accountCookie.accountId) {
        const client = new PrismaClient()
        const accountClient = AccountsClient(client.account)
        const { data: accountData } = await accountClient.getAccountById(accountCookie.accountId)
        if (accountData) {
          darkMode = accountData.darkMode
        }
      }
      if((!accountCookie.setupIsComplete === undefined || accountCookie.setupIsComplete === null) && accountCookie.accountId) {
        const dbClient = new PrismaClient()
        const accountClient = AccountsClient(dbClient.account)
        const {data: accountData} = await accountClient.getAccountById(accountCookie.accountId)
        if (accountData) {
          accountCookie.setupIsComplete = accountData.isSetup
        } 
      
        if (!accountData || !accountData.isSetup) {
          return redirect("/portal/setup", { headers: { "Set-Cookie": await account.serialize(accountCookie) } })
        } 
      }

      if( !isPortalRoute ) {
        return redirect(accountCookie.setupIsComplete ? '/portal/dashboard' : '/portal/setup' , { headers: { "Set-Cookie": await account.serialize(accountCookie) } })
      }
    }
    return { darkMode: darkMode, ENV: getSharedEnvs(), navBarExpanded: preferencesCookie.navBarMode, selectedApplicationName: accountCookie.selectedApplicationName, setupIsComplete: accountCookie.setupIsComplete, account_id: accountCookie?.accountId || null};
  });
};
 
export function App() {
  const { ENV, selectedApplicationName, setupIsComplete, darkMode: loadedDarkMode, account_id} = useLoaderData<typeof loader>()
  const {darkMode: actionDarkMode} = useLoaderData<typeof action>() || {darkMode: null}
  const [ darkModeState, setDarkMode ] = useState<boolean>(actionDarkMode !== null ? actionDarkMode : loadedDarkMode)
  
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
      const response = await fetch(`/api/preferences/${account_id}`, {
        body: JSON.stringify({ darkMode: darkMode }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
    } catch (error) {
      console.error('Error caught updating account dark mode: ', error)
    }
  };

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
        <RootLayout appName={selectedApplicationName} setupIsComplete={setupIsComplete} toggleDarkMode={toggleDarkMode} darkMode={darkModeState}/>
        <ScrollRestoration />
        <Scripts />

        {/* Global Shared Envs. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />

        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}

export default ClerkApp(App);