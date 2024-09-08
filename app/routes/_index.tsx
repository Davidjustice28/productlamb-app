import { SignInButton } from "@clerk/remix";
import { ActionFunction, LinksFunction, LoaderFunction, MetaFunction, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { preferences } from "~/backend/cookies/preferences";
import { PLBasicButton } from "~/components/buttons/basic-button";
import { PLStatusBadge } from "~/components/common/status-badge";
import { ToggleSwitch } from "~/components/forms/toggle-switch";
import { PLPrivacyPopupModal } from "~/components/modals/privacy-popup";
import { Colors } from "~/types/base.types";

export const links: LinksFunction = () => {
  return [
    {
      rel: "icon",
      href: "https://storage.googleapis.com/product-lamb-images/productlamb_logo_icon.png",
      type: "image/png",
    },
  ]
}


export const meta: MetaFunction = () => {
  return [
    { title: "Product Management for Startups" },
    {
      property: "og:title",
      content: "Product Management for Startups",
    },
    {
      name: "description",
      content: "This web platform provides an ai powered product manager for early-stage startups and small teams.",
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const data = Object.fromEntries(form)
  if (!data["waitlist-email"]) return json({ joined: false }, { status: 400 })
  try {
    const emailInput = data["waitlist-email"]
    const alreadySignedUp = await fetch(`https://api.getwaitlist.com/api/v1/signup?waitlist_id=16560&email=${emailInput}`)
    if (alreadySignedUp.ok) return json({ message: 'success' }, { status: 200 })
    const response = await fetch("https://api.getwaitlist.com/api/v1/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        waitlist_id: 16560,
        email: emailInput,
      }),
    })
  } catch (e) {
    return json({ joined: false }, { status: 500 })
  }
  return json({ joined: true }, { status: 200 })
}

export const loader: LoaderFunction = async ({ request }) => {
  const isLocalHost = process.env.SERVER_ENVIRONMENT !== 'production'
  const cookies = request.headers.get('Cookie')
  const preferecnes = await preferences.parse(cookies)
  const privacyPolicyAck = preferecnes?.privacyPolicyAck ? true : false

  return json({ isLocalHost, privacyPolicyAck }, { headers: {
    // set cookie for privacy acknowledgement
    "Set-Cookie": 'account=; Max-Age=0; Path=/;',
  }})
}

export default function LandingPage() {
  const { isLocalHost, privacyPolicyAck } = useLoaderData<typeof loader>()
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [playButtonVisible, setPlayButtonVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playButtonRef = useRef<HTMLButtonElement>(null)

  const playVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.muted) {
        videoRef.current.currentTime = 0; // Reset video to the start
      }
      videoRef.current.muted = false
      videoRef.current.play()
      videoRef.current.controls = true
      setPlayButtonVisible(false)
      videoRef.current.addEventListener('ended', () => {
        setPlayButtonVisible(true)
      })

      videoRef.current.addEventListener('pause', () => {
        setPlayButtonVisible(true)
      })

      videoRef.current.addEventListener('click', () => {
        setPlayButtonVisible(false)
      })

      videoRef.current.addEventListener('play', () => {
        setPlayButtonVisible(false)
      })
    }
  }

  useEffect(() => {
    if (privacyPolicyAck) return
    setTimeout(() => {
      setPrivacyModalOpen(true)
    }, 2500);
  }, [])
 
  return (
    <div className="flex flex-col bg-neutral-100 w-full">
      <div className="flex flex-wrap items-center justify-between w-full bg-white group py-6 md:py-8 shrink-0 md:px-16 px-5 sticky top-0 z-10">
        <div className="m-auto hidden md:block md:m-0">
          <img className="h-8" src="https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_black.png"/>
        </div>
        <div className="md:hidden flex flex-row justify-between items-center w-full md:border-b-2 md:pb-5">
          <img className="h-10" src="https://storage.googleapis.com/product-lamb-images/productlamb_logo_icon.png"/>
          <PLBasicButton text="Schedule Demo" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white" noDefaultDarkModeStyles={true} onClick={() => window.open('https://cal.com/productlamb/15min', '_blank')}/>
        </div>
        <div className="items-center hidden gap-8 md:flex">
          <SignInButton mode="modal" forceRedirectUrl={'/portal/dashboard'} signUpForceRedirectUrl={'/portal/setup'} signUpFallbackRedirectUrl={null}>
            <button className="flex items-center text-md font-[500] text-gray-800 hover:text-gray-900 transition duration-300">Sign In</button>
          </SignInButton>
          
          {/* <SignUpButton mode="modal" forceRedirectUrl={'/portal/setup'}> */}
            <PLBasicButton text="Book Demo" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white" noDefaultDarkModeStyles={true} onClick={() => window.open('https://cal.com/productlamb/15min', '_blank')}/>
          {/* </SignUpButton> */}
        </div>
      </div>
      {/* -mt-6 md:-mt-0 mb-6 md:mb-8 leading-tight */}
      <div className="flex w-full flex-col my-auto md:px-16 px-5 bg-orange-200 pt-20 pb-24 md:pb-32 md:pt-28 gap-5 shadow-lg">
        <h1 className="w-[90%] mx-auto md:mx-0 md:w-full text-4xl font-bold md:text-6xl text-orange-800 text-left md:text-center">Product managers, for the little guys</h1>
        <p className="font-[500] text-left md:text-center text-xl md:text-[25px] mx-auto w-[90%] md:w-3/5 text-orange-600 leading-normal">
          Supercharge your product development process with an AI powered product manager waiting to assist you.
          {/* Early-stage startup or small team? Enjoy many of the benefits that proper planning and organization bring through a dedicated AI powered product manager. */}
        </p>
        {/* my button */}
        <div className="group ml-4 mr-auto md:mx-auto mb-7 mt-3 p-2 rounded-full bg-orange-300 hover:shadow-2xl hover:scale-105 delay-100">
          <button 
            onClick={() => window.open('https://cal.com/productlamb/15min', '_blank')}
            ref={playButtonRef}
            className="cursor-pointer font-bold py-4 px-14 md:py-8 md:px-28 text-sm md:text-2xl inline-flex items-center rounded-full bg-[#FF5F1F] text-neutral-50 group-hover:bg-orange-600"
          >
            {/* <i className="ri-calendar-line mr-2 "></i> */}
            <span className="tracking-wider">Schedule Demo</span>
          </button>
        </div>
        <div className="relative">
          <video src="https://storage.googleapis.com/productlamb_project_images/pl_demo_5.MP4" className="w-[90%] mx-auto md:w-4/5 md:mx-auto h-lg rounded-3xl md:rounded-[50px] shadow-xl shadow-black" autoPlay muted ref={videoRef}/>
          <div className="absolute w-full top-[40%] flex flex-row justify-center">
           {playButtonVisible && (<button 
              onClick={playVideo}
              className={'flex flex-row justify-center items-center gap-2 rounded-full p-4 w-16 h-16 md:w-28 md:h-28 cursor-pointer bg-orange-600 hover:bg-orange-500 text-gray-800'}
            >
              <i className='ri-arrow-right-s-fill inline-block text-[40px] md:text-[80px] text-white'></i>
            </button>)}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col text-black items-center">
        <div className="w-full flex flex-col text-black items-center gap-10 ">
          <div className="flex flex-col items-center justify-center gap-7 -mb-28 md:-mb-14 py-10 mt-10 lg:justify-normal">
            <h4 className="w-[80%] md:w-full text-2xl md:text-5xl text-orange-800 md:text-center font-extrabold tracking-widest">Develop better software while saving time</h4>
            <p className="text-lg md:text-2xl text-center font-[500] text-neutral-800">Make requests. Offload tedious work. Plan better.</p>
          </div>
          {/* <div className="w-full flex flex-col items-center gap-5 -mb-14 py-10 mt-10 rounded-sm" id="product">
            <h1 className="font-bold text-xl w-3/4 text-center md:text-4xl mb-2 text-orange-600">How does <span className="text-black">ProductLamb</span> help you build <span className="text-black">better</span> software?</h1>
          </div> */}
          <FeaturesSection />
          <PricingSection />
          {/* <ValidationSection /> */}
          <ContactUsSection />
        </div>
      </div>
      {privacyModalOpen ? <PLPrivacyPopupModal open={privacyModalOpen} setOpen={setPrivacyModalOpen} message="We coolect personal information to improve your experience. Please read our Privacy Policy to learn more about how we handle your data."/> : null}
    </div>
  )
}

function FeaturesSection() {
  const imgs = [
    "https://storage.googleapis.com/productlamb_project_images/manager_screenshot.png",
    "https://storage.googleapis.com/productlamb_project_images/clickup_screenshot.png",
    "https://storage.googleapis.com/productlamb_project_images/analytics_screenshot.png",
    // "https://storage.googleapis.com/productlamb_project_images/screely-1720590712501.png",
  ]

  const featureHeaders = [
    "Work with your AI product manager like a regular team member",
    "Automate 60-80% of your sprint planning process",
    "Make better planning decisions with key metrics",
    // "Automate more with your favorite third party integrations",
  ]

  const featureDescriptions = [
    "Through natural language, ask your product manager to do things on your behalf like add tasks to your backlog, schedule meetings, or follow up on developers progress.",
    "ProductLamb auto generates sprints in your preferred management tool by analyzing your goals, code repository issues, user feedback, self reported bugs, and more.",
    "Most startups care about a few core metrics. Understand these key metrics about your project's development, like how many points per sprint does your team average and what type of work is being prioritized.",
    // "Connect to ProductLamb with tools you're already using to do automate more like tracking repository issues, scheduling meetings, and notifying the team of updates.",
  ]

  return (
    <div className="w-full flex flex-col items-center pt-16 -mb-10 gap-20 md:gap-24 md:px-16 px-8" id="features">
      {imgs.map((photo, i) => {
        return (
          <div className={"mt-10 gap-16 w-full items-start md:items-center justify-between flex px-20 py-28 rounded-3xl" + (i % 2 === 0 ? ' flex-col md:flex-row bg-orange-500' : ' bg-[#ffcc99] flex-col md:flex-row-reverse')} key={i}>
            <div className="md:w-1/2 w-full flex flex-col gap-8">
              <h2 className={"font-bold text-4xl md:text-4xl " + (i % 2 === 0 ? 'text-orange-900' : 'text-orange-700')}>{featureHeaders[i]}</h2>
              <p className={"font-[500] text-lg md:text-xl " + (i % 2 === 0 ? 'text-orange-900' : 'text-orange-600')}>{featureDescriptions[i]}</p>
              {i === 0 && (
                <div className="flex flex-col gap-7">
                  <PLBasicButton text="Get Access" rounded colorClasses="bg-orange-800 text-orange-200 hover:bg-orange-800 hover:text-white" noDefaultDarkModeStyles={true} onClick={() => window.open('https://cal.com/productlamb/15min', '_blank')} useStaticWidth/>
                </div>
              )}
              {i === 1 && (
                <div className="flex flex-row gap-5 items-center">
                  <p className="text-black font-semibold -mr-2">Tools Supported</p>
                  <div className="flex items-center gap-4">
                    <img className="md:h-10 w-10" src="https://storage.googleapis.com/productlamb_project_images/clickup.png"/>
                    <img className="h-7 w-7" src="https://storage.googleapis.com/productlamb_project_images/notion.246x256.png"/>
                    <img className="h-5 w-5" src="https://storage.googleapis.com/productlamb_project_images/jira.256x256.png"/>
                  </div>
                </div>
              )}
              {i === 2 && (
                <div className="flex flex-col gap-7">
                  <PLBasicButton text="Get Access" rounded colorClasses="bg-orange-800 text-orange-200 hover:bg-orange-800 hover:text-white" noDefaultDarkModeStyles={true} onClick={() => window.open('https://cal.com/productlamb/15min', '_blank')} useStaticWidth/>
                </div>
              )}
            </div>
            <div className="md:w-2/3 w-full md:h-[450px] 2xl:w-[33%] object-contain border-2 rounded-lg">
              <img className="w-full h-full md:h-full object-fill shadow-2xl shadow-neutral-700" src={photo} alt="feature image"/>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ContactUsSection() {
  return (
    <div className="w-full flex flex-col items-center gap-10 border-2 bg-orange-200 pt-14" id="contact-us">
      <h1 className="font-bold text-center text-orange-700 text-3xl md:text-5xl">Get in touch with us</h1>
      <div className="container flex flex-col mx-auto">
        <div className="w-full">
          <div className="container flex flex-col items-center gap-16 mx-auto">
            <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center gap-3 w-3/4 md:w-full mx-auto  px-8 py-10 bg-white rounded-3xl shadow-lg">
                <i className="ri-mail-fill text-3xl text-[#F28C28]"/>  
                <p className="text-2xl font-extrabold text-dark-grey-900">Email</p>
                <p className="text-base leading-7 text-dark-grey-600">Contact us for support</p>
                <a className="text-lg font-bold text-purple-blue-500" href="mailto:support@productlamb.com">support@productlamb.com</a>
              </div>
              <div className="flex flex-col items-center w-3/4 md:w-full mx-auto  gap-3 px-8 py-10 bg-white rounded-3xl shadow-lg">
                <i className="ri-twitter-fill text-3xl text-[#F28C28]"/> 
                <p className="text-2xl font-extrabold text-dark-grey-900">Social Media</p>
                <p className="text-base text-center leading-7 text-dark-grey-600">Stay up to date with releases on Twitter/X</p>
                <p className="text-lg font-bold text-purple-blue-500">@productlamb</p>
              </div>
              <div className="flex flex-col w-3/4 md:w-full mx-auto items-center gap-3 px-8 py-10 bg-white rounded-3xl shadow-lg">
                <i className="ri-phone-fill text-3xl text-[#F28C28]"/> 
                <p className="text-2xl font-extrabold text-dark-grey-900">Sales</p>
                <p className="text-base leading-7 text-dark-grey-600">Schedule a 1-on-1 demo</p>
                <PLBasicButton text="Schedule Demo" icon="ri-calendar-line" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white" noDefaultDarkModeStyles  onClick={() => window.open('https://cal.com/productlamb/15min', '_blank')}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="w-full">
        <div className="container px-6 mx-auto pb-8">
          <hr className="my-10 border-orange-700" />
          <div className="flex flex-col items-center sm:flex-row sm:justify-between">
            <p className="text-sm text-orange-600">© ProductLamb 2024. All Rights Reserved.</p>
            <a className="text-sm text-orange-600 underline" href="/privacy">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PricingSection() {
  const offerings = [
    "Communicate with your manager via audio and Slack. (email coming soon)",
    "Spring planning automation for your Project Management tools. (ClickUp, Notion, Jira)",
    "Manage up to 10 applications",
    "Key analytics and metric summaries",
    "Agile tools like point estimators",
    "Integrate with several 3rd party tools",
    "Manually and bulk upload user feedback",
    "Invite up to 4 team members",
    "Dark mode for late night work",
    "Discord access for support",
  ]

  const [isMonthly, setIsMonthly] = useState(true)

  const toggleSubscription = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMonthly((prev) => !prev)
  }

  return (
    <div className="w-full mb-20" id="pricing">
      <div className=" sm:pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center mt-14 mb-14 md:my-0">
            <h2 className="text-2xl text-center font-bold tracking-tight text-orange-800 sm:text-4xl decoration-orange-800 ">Simple pricing. One plan for all.</h2>
            <p className="w-5/6 md:w-full mx-auto md:mx-0 mt-4 md:mt-6 text-lg leading-8 font-[500] text-black">Why discriminate on feature access. We make things simple. Choose between monthly or annual subscription and get access to everything.</p>
          </div>
          <div className="mx-auto mt-8 md:mt-16 max-w-2xl rounded-3xl ring-4 ring-orange-800 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none ">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-orange-900">Standard Subscription</h3>
              <p className="mt-6 text-base leading-7 text-orange-600 font-semibold">Access all features so that you can build and manage better software products.</p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-orange-700">What’s included</h4>
                <div className="h-px flex-auto bg-gray-100"></div>
              </div>
              <ul role="list" className="mt-8 grid grid-cols-1 gap-4 leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
                {offerings.map((offering, i) => {
                  return (
                    <li key={i} className="flex gap-x-3 items-center">
                      <i className="ri-check-fill text-xl text-green-600"/>
                      <span className="text-sm font-[500] text-orange-900">{offering}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-4 ring-inset ring-orange-800 lg:flex lg:flex-col lg:justify-center lg:py-16 h-full">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-orange-900">Affordable pricing for all</p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2 mb-6">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">${isMonthly ? 20 : 180}</span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">USD</span>
                  </p>
                  {/* <PLBasicButton text="Coming July 2024" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-200 hover:text-orange-600"/> */}
                  <p className="mt-2 text-xs leading-5 text-orange-900">For the first 20 users</p>
                  <div className="mt-3 mb-4 flex items-center justify-center gap-2 -ml-8">
                    <ToggleSwitch onChangeHandler={toggleSubscription} darkMode={!isMonthly} />
                    <PLStatusBadge text={isMonthly ? 'Monthly' : 'Annually'} color={(isMonthly ? Colors.PINK: Colors.PURPLE)}/>
                  </div>
                  <p className={"text-xs leading-5 font-semibold text-orange-900 visible " + (isMonthly ? 'invisible' : '')}>That's 25% off!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  )
}
