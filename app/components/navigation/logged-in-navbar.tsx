import { Link, useLocation, useNavigate } from '@remix-run/react'
import { NavLink } from '~/types/base.types'
import { useEffect, useState } from 'react'
import { PLConfirmModal } from '../modals/confirm'
import { useClerk, useOrganizationList } from '@clerk/remix'
import { useSidebar } from '~/backend/providers/siderbar'

export const LoggedInNavbar = ({darkMode, setupComplete, internalPageAccess, isAdmin}: {setupComplete: boolean, darkMode: boolean, applicationSelected: boolean, internalPageAccess: boolean, isAdmin: boolean}) => {
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
    { iconClass: "ri-file-list-line", absoluteHref: '/portal/sprints', text: 'Sprints', adminOnly: false},
    { iconClass: "ri-bug-line", absoluteHref: '/portal/bugs', text: 'Bugs', adminOnly: false},
    { iconClass: "ri-feedback-line", absoluteHref: '/portal/feedback', text: 'Feedback', adminOnly: false},
    { iconClass: "ri-webhook-line", absoluteHref: '/portal/integrations', text: 'Integrations', adminOnly: false},
    { iconClass: "ri-window-line", absoluteHref: '/portal/applications', text: 'Applications', adminOnly: false},
    { iconClass: "ri-file-list-line", absoluteHref: '/portal/backlog', text: 'Backlog', adminOnly: false},
    { iconClass: "ri-organization-chart", absoluteHref: '/portal/team', text: 'Organization', adminOnly: true},
    { iconClass: "ri-settings-3-line", absoluteHref: '/portal/settings', text: 'Account', adminOnly: true},
    { iconClass: "ri-booklet-line" , absoluteHref: '/portal/documentation', text: 'Documentation', adminOnly: false},
  ]
  
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
      <div className='mb-10 w-full h-27'>
        <img 
          src={isExpanded ? (darkMode ? 'https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_white.svg' : 'https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_black.png') : 'https://storage.googleapis.com/product-lamb-images/productlamb_logo_icon.png'} 
          alt="Logo" 
          className={'h-auto object-contain object-center ml-3' + (!isExpanded ? ' max-w-5' : ' max-w-40')}
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
  const enabledLinks = (isAdmin ? links : links.filter(link => !link.adminOnly)).concat({ iconClass: "ri-contacts-line", absoluteHref: '/portal/internal', text: 'Internal Portal', internalOnly: true},)
  return(
    <ul className='p-0 m-0 list-none flex-col justify-evenly w-full'>
      {enabledLinks.map((link, index) => {
        return (
          <li key={index} className='p-0 m-0 list-none'>
            <Link to={link.absoluteHref} className={'no-underline '  + (darkMode ? ' text-gray-500 ' : ' text-black ')}>
              <div className={'w-full py-2 px-0 flex justify-start items-center gap-2 rounded-md border-3 ' + ( darkMode ? darkModeStyle(link.absoluteHref, link.text) : lightModeStyle(link.absoluteHref, link.text))}>
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