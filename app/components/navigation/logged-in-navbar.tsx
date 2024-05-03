import { Form, Link, useLoaderData, useLocation } from '@remix-run/react'
import { NavLink } from '~/types/base.types'
import { MouseEventHandler, useRef, useState } from 'react'


export const LoggedInNavbar = ({darkMode, expanded}: {darkMode: boolean, expanded: boolean}) => {
  const location = useLocation()
  const links: Array<NavLink> = [
    // user routes
    { iconClass: "ri-dashboard-line", absoluteHref: '/portal/dashboard', text: 'Dashboard', adminOnly: false},
    { iconClass: "ri-file-list-line", absoluteHref: '/portal/sprints', text: 'Sprints', adminOnly: false},
    { iconClass: "ri-bug-line", absoluteHref: '/portal/bugs', text: 'Bugs', adminOnly: false},
    { iconClass: "ri-feedback-line", absoluteHref: '/portal/feedback', text: 'Feedback', adminOnly: false},
    { iconClass: "ri-webhook-line", absoluteHref: '/portal/integrations', text: 'Integrations', adminOnly: true},
    { iconClass: "ri-window-line", absoluteHref: '/portal/applications', text: 'Applications', adminOnly: true},
    { iconClass: "ri-settings-3-line", absoluteHref: '/portal/settings', text: 'Settings', adminOnly: false},
    { iconClass: "ri-file-text-line" , absoluteHref: '/portal/documentation', text: 'Documentation', adminOnly: false},
  ]

  const formRef = useRef<HTMLFormElement>(null)
  const handleNavCookieUpdate: MouseEventHandler<HTMLElement> = (e: any) => {
    e.preventDefault()
    formRef.current?.submit()
  }

  return (
    <nav className={'h-screen px-5 bg-neutral-50 dark:bg-neutral-900 items-center flex flex-col py-6' + (expanded ? ' w-80' : ' w-20')}>
      <div className='mb-10 w-full h-27'>
        <img 
          src={expanded ? (darkMode ? 'https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_white.svg' : 'https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_black.png') : 'https://storage.googleapis.com/product-lamb-images/productlamb_logo_icon.png'} 
          alt="Logo" 
          className={'h-auto object-contain object-center ml-3' + (!expanded ? ' max-w-5' : ' max-w-40')}
        />
      </div>
      <NavOptionsComponent links={links} menuExpanded={expanded}/>

      <Form method="post" ref={formRef}>
        <input type="hidden" name="_navbarState" value={location.pathname} />
      </Form>

      <i 
        className={'ri-arrow-left-s-line text-xl absolute bottom-5 cursor-pointer text-black dark:text-white ' + (expanded ? 'left-5 rotate-180' : 'mx-auto')}
        onClick={handleNavCookieUpdate}
      ></i>
    </nav>
  )
}

const NavOptionsComponent = ({ links, menuExpanded }: { links: Array<NavLink>, menuExpanded: boolean}) => {
  const { darkMode } = useLoaderData<{darkMode: boolean|undefined}>()
  const location = useLocation()
  const lightModeStyle = (url: string) => (location.pathname.includes(url) ? 'text-white bg-[#F28C28]' : 'hover:bg-[#f0f0f0]') 
  const darkModeStyle = (url: string) => (location.pathname.includes(url) ? 'text-white bg-neutral-800' : 'hover:bg-neutral-800 hover:text-white')
  return(
    <ul className='p-0 m-0 list-none flex-col justify-evenly w-full'>
      {links.map((link, index) => {
        return (
          <li key={index} className='p-0 m-0 list-none'>
            <Link to={link.absoluteHref} className={'no-underline ' + (darkMode ? 'text-gray-500' : 'text-black')}>
              <div className={'w-full py-2 px-0 flex justify-start items-center gap-2 rounded-md border-3 ' + ( darkMode ? darkModeStyle(link.absoluteHref) : lightModeStyle(link.absoluteHref))}>
                <i className={link.iconClass + (menuExpanded ? " ml-3" : ' mx-auto')} style={{fontSize: '20px'}}></i>
                <span className={'text-18 font-bold inline-block ' + (menuExpanded ? '' : 'hidden')}>{link.text}</span>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}