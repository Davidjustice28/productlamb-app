import { Link, useLocation, useNavigate } from '@remix-run/react'
import { NavLink } from '~/types/base.types'
import { useEffect, useState } from 'react'
import { PLConfirmModal } from '../modals/confirm'
import { useClerk, useOrganizationList } from '@clerk/remix'
import { useSidebar } from '~/backend/providers/siderbar'

export const LoggedInNavbar = ({darkMode, setupComplete, internalPageAccess, isAdmin, hasToolConfigured}: {setupComplete: boolean, darkMode: boolean, applicationSelected: boolean, internalPageAccess: boolean, isAdmin: boolean, hasToolConfigured: boolean}) => {
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {infinite: true},
  })

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const { isExpanded, toggleSidebar} = useSidebar()
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const notSetupLinks: Array<NavLink> = [
    { iconClass: "ri-play-circle-line", absoluteHref: '/portal/setup', text: `Setup Account`, adminOnly: false},
  ]
  const links: Array<NavLink> = [
    { iconClass: "ri-dashboard-line", absoluteHref: '/portal/dashboard', text: 'Dashboard', adminOnly: false},
    { iconClass: "ri-bug-line", absoluteHref: '/portal/bugs', text: 'Bugs', adminOnly: false},
    { iconClass: "ri-feedback-line", absoluteHref: '/portal/feedback', text: 'Feedback', adminOnly: false},
    { iconClass: "ri-webhook-line", absoluteHref: '/portal/integrations', text: 'Integrations', adminOnly: false},
    { iconClass: "ri-window-line", absoluteHref: '/portal/applications', text: 'Applications', adminOnly: false},
    { iconClass: "ri-file-list-line", absoluteHref: '/portal/backlog', text: 'Backlog', adminOnly: false},
    { iconClass: "ri-file-pdf-2-line", absoluteHref: '/portal/documents', text: 'Documents', adminOnly: true},
    { iconClass: "ri-customer-service-line" , absoluteHref: '/portal/help', text: 'Help Desk', adminOnly: false},
    { iconClass: "ri-settings-3-line", absoluteHref: '/portal/settings', text: 'Account', adminOnly: true},
  ]

  if (internalPageAccess) links.push({ iconClass: "ri-dashboard-3-line", absoluteHref: '/portal/internal', text: 'Internal Portal'})
  if (hasToolConfigured) links.splice(1, 0, { iconClass: "ri-run-line", absoluteHref: '/portal/sprints', text: 'Sprints', adminOnly: false})
  const handleSigningOut = async () => {
    await signOut(() => {
      navigate('/')
    })
  } 

  useEffect(() => {
    if (isLoaded && userMemberships.data.length > 0) {
      const membership = userMemberships.data[0]
      setActive({organization: membership.organization.id})
    }
  }, [])

  return (
    <nav className={'h-screen px-5 bg-neutral-50 dark:bg-neutral-900 flex flex-col py-6 items-start' + (isExpanded ? ' w-80' : ' w-20')}>
      <div className='mb-10 w-full h-27 border-2 border-transparent overflow-hidden'>
        <img 
          src={(darkMode ? 'https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_white.svg' : 'https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_black.png')} 
          alt="Logo" 
          className={'h-auto max-w-40' + (!isExpanded ? ' ml-2' : '  ml-3 object-contain object-center ')}
        />
      </div>
      <NavOptionsComponent links={setupComplete ? links : notSetupLinks} menuExpanded={isExpanded} darkMode={darkMode} isAdmin={isAdmin} hasInternalAccess={internalPageAccess}/>
      
      <button 
        className='w-full py-2 px-0 flex justify-start items-center gap-2 rounded-md border-3 text-black dark:text-gray-500 dark:hover:text-white dark:hover:bg-neutral-800 hover:bg-[#f0f0f0]'
        onClick={() => setConfirmModalOpen(true)}
      >
        <i className={'ri-logout-box-line text-xl cursor-pointer' + (isExpanded ? " ml-3" : ' mx-auto')} style={{fontSize: '20px'}}></i>
        <span className={'text-18 font-bold inline-block ' + (isExpanded ? '' : 'hidden')}>Sign out</span>
      </button>
      <i 
        className={'ri-arrow-right-s-line text-xl absolute bottom-5 cursor-pointer text-black dark:text-white ' + (isExpanded ? 'left-5 rotate-180' : 'mx-auto')}
        onClick={toggleSidebar}
      ></i>
      <PLConfirmModal open={confirmModalOpen} setOpen={setConfirmModalOpen} message='Are you sure you would like to log out of your account?' onConfirm={handleSigningOut} size='xsm'/>
    </nav>
  )
}

const NavOptionsComponent = ({ links, menuExpanded, darkMode, isAdmin ,hasInternalAccess}: { links: Array<NavLink>, menuExpanded: boolean, darkMode: boolean, isAdmin?: boolean, hasInternalAccess: boolean}) => {
  const location = useLocation()
  const lightModeStyle = (url: string, linkLabel: string) => (location.pathname.includes(url) || (location.pathname.toLowerCase().includes('planning') &&  linkLabel.toLowerCase().includes('sprints')) ? 'text-white bg-[#F28C28]' : 'hover:bg-[#f0f0f0]') 
  const darkModeStyle = (url: string, linkLabel: string) => (location.pathname.includes(url) || (location.pathname.toLowerCase().includes('planning') &&  linkLabel.toLowerCase().includes('sprints')) ? 'text-white bg-neutral-800' : 'hover:bg-neutral-800 hover:text-white')

  const NavLinkComponent = ({data, enabled}:{data: NavLink, enabled: boolean}) => {
    if (enabled) {
      return (
        <li className='p-0 m-0 list-none'>
          <Link to={data.absoluteHref} className={'no-underline '  + (darkMode ? ' text-gray-500 ' : ' text-black ')} >
            <div className={'w-full py-2 px-0 flex justify-start items-center gap-2 rounded-md border-3 ' + ( darkMode ? darkModeStyle(data.absoluteHref, data.text) : lightModeStyle(data.absoluteHref, data.text))}>
              <i className={data.iconClass + (menuExpanded ? " ml-3" : ' mx-auto')} style={{fontSize: '20px'}}></i>
              <span className={'text-18 font-bold inline-block ' + (menuExpanded ? '' : 'hidden')}>{data.text}</span>
            </div>
          </Link>
        </li>
      )
    } else {
      return (
        <li className='p-0 m-0 list-none cursor-not-allowed'>
          <div className={'w-full py-2 px-0 flex justify-start items-center gap-2 rounded-md border-3 ' +  (darkMode ? ' text-gray-500 ' : ' text-black ') + ( darkMode ? darkModeStyle(data.absoluteHref, data.text) : lightModeStyle(data.absoluteHref, data.text))}>
            <i className={data.iconClass + (menuExpanded ? " ml-3" : ' mx-auto')} style={{fontSize: '20px'}}></i>
            <span className={'text-18 font-bold inline-block ' + (menuExpanded ? '' : 'hidden')}>{data.text}</span>
          </div>
        </li>
      )
    }
  }

  return (
    <ul className='p-0 m-0 list-none flex-col justify-evenly w-full'>
      {links.map((link, index) => {
        const enabled = (link?.adminOnly ? !!isAdmin : true)
        return <NavLinkComponent key={index} data={link} enabled={enabled}/>
      })}
    </ul>
  )
}