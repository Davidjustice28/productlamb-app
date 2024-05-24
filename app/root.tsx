import type { ActionFunction, LinksFunction, LoaderFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
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

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: TailwindCSS },
    { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" }
  ]
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const { _darkMode: previousPathA, _navbarState: previousPathB  } = Object.fromEntries(formData)
  const headers = new Headers();
  const cookieHeader = request.headers.get("Cookie");
  const preferencesCookie = (await preferences.parse(cookieHeader) || {});
  let previousPath = '/'
  if(!previousPathA && !previousPathB) {
    previousPath = '/'
  } else {
    if(previousPathA) { 
      preferencesCookie.darkMode = preferencesCookie.darkMode ? false : true;
      headers.append('Set-Cookie', await preferences.serialize(preferencesCookie));
      previousPath = previousPathA.toString()
    }
    if(previousPathB) { 
      preferencesCookie.navBarMode = preferencesCookie.navBarMode === undefined ? true : !preferencesCookie.navBarMode;
      headers.append('Set-Cookie', await preferences.serialize(preferencesCookie));
      previousPath = previousPathB.toString()
    }
  }


  let redirectPath = previousPathB ? previousPathB.toString() : previousPathA ? previousPathA.toString() : ''

  return redirect(redirectPath, { headers })
}

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, async ({ request }) => {
    const cookieHeader = request.headers.get("Cookie");
    const preferencesCookie = (await preferences.parse(cookieHeader) || {});  
    const accountCookie = (await account.parse(cookieHeader) || {});
    const { userId } = request.auth
    const isPortalRoute = request.url.includes('/portal')
    console.log('isPortalRoute', isPortalRoute, 'userId', userId)
    if ((!userId )) {
      if (isPortalRoute) {
        return redirect('/')
      }
    } else {
      if( !isPortalRoute ) {
        return redirect(accountCookie.setupIsComplete ? '/portal/dashboard' : '/portal/setup')
      }
    }
    return { darkMode: preferencesCookie.darkMode, ENV: getSharedEnvs(), navBarExpanded: preferencesCookie.navBarMode, selectedApplicationName: accountCookie.selectedApplicationName, setupIsComplete: accountCookie.setupIsComplete};
  });
};
 
export function App() {
  const { ENV, darkMode, selectedApplicationName, setupIsComplete} = useLoaderData<typeof loader>()
  return (
    <html lang="en" className={ (darkMode ? 'dark' : '') }>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={darkMode ? 'bg-neutral-800' : 'bg-white'}>
        <RootLayout appName={selectedApplicationName} setupIsComplete={setupIsComplete}/>
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