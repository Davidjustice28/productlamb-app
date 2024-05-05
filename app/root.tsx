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
import { theme } from './backend/cookies/dark-mode';
import { getSharedEnvs } from './utils/envs';
import { navbarState } from './backend/cookies/nav-bar-state';

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
  let previousPath = '/'
  if(!previousPathA && !previousPathB) {
    previousPath = '/'
  } else {
    if(previousPathA) { 
      const themeCookie = (await theme.parse(cookieHeader)) || {};
      themeCookie.darkMode = themeCookie.darkMode ? false : true;
      headers.append('Set-Cookie', await theme.serialize(themeCookie));
      previousPath = previousPathA.toString()
    }
    if(previousPathB) { 
      const navbarStateCookie = (await navbarState.parse(cookieHeader)) || {};
      navbarStateCookie.navBarMode = navbarStateCookie.navBarMode === undefined ? true : !navbarStateCookie.navBarMode;
      headers.append('Set-Cookie', await navbarState.serialize(navbarStateCookie));
      previousPath = previousPathB.toString()
    }
  }


  let redirectPath = previousPathB ? previousPathB.toString() : previousPathA ? previousPathA.toString() : ''

  return redirect(redirectPath, { headers })
}

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, async ({ request }) => {
    const cookieHeader = request.headers.get("Cookie");
    const themeCookie = (await theme.parse(cookieHeader) || {});  
    const navBarCookie = (await navbarState.parse(cookieHeader) || {});
    const { sessionId, userId } = request.auth
    const isPortalRoute = request.url.includes('/portal')
    if ((!userId )) {
      if (isPortalRoute) {
        return redirect('/')
      }
    } else {
      if( !isPortalRoute ) {
        return redirect('/portal/dashboard')
      }
    }
    return { darkMode: themeCookie.darkMode, ENV: getSharedEnvs(), navBarExpanded: navBarCookie.navBarMode};
  });
};
 
export function App() {
  const { ENV, darkMode } = useLoaderData<typeof loader>()
  return (
    <html lang="en" className={ (darkMode ? 'dark' : '') }>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={darkMode ? 'bg-neutral-800' : 'bg-white'}>
        <RootLayout/>
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