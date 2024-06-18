import { SignInButton, useUser } from "@clerk/remix";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import React from "react";
import { useState } from "react";
import { PLBasicButton } from "~/components/buttons/basic-button";
import { PLDeveloperButton } from "~/components/buttons/label-button";
import ConfettiExplosion from 'react-confetti-explosion';
import { ToggleSwitch } from "~/components/forms/toggle-switch";
import { PLStatusBadge } from "~/components/common/status-badge";
import { Colors } from "~/types/base.types";

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
  return json({ isLocalHost })
}

export default function LandingPage() {
  const actionData = useActionData<typeof action>()
  const { isLocalHost } = useLoaderData<typeof loader>()
  const { isSignedIn } = useUser()
  const [showConfetti, setShowConfetti] = useState(actionData?.joined || false)
  const emailRef = React.createRef<HTMLInputElement>()
  const formRef = React.createRef<HTMLFormElement>()
  function joinWaitlist() {
    const email = emailRef.current?.value
    if (!email) return
    formRef.current?.submit()
  } 
  return (
    <div className="flex flex-col bg-white w-full py-2 md:px-16 px-5">
      <div className="relative flex flex-wrap items-center justify-between w-full bg-white group py-7 shrink-0">
        <div className="m-auto md:m-0">
          <img className="h-8" src="https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_black.png"/>
        </div>
        <div className="items-center justify-between hidden gap-12 text-black md:flex">
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#features">Features</a>
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#pricing">Pricing</a>
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#values">Values</a>
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#contact-us">Contact Us</a>
        </div>
        <div className="items-center hidden gap-8 md:flex">
         
          {/* <SignInButton mode="modal" forceRedirectUrl={'/portal/dashboard'}>
            <button className="flex items-center text-sm font-normal text-gray-800 hover:text-gray-900 transition duration-300">Log In</button>
          </SignInButton> */}

          {
            isLocalHost && 
            (<SignInButton mode="modal" forceRedirectUrl={'/portal/dashboard'}>
              <button className="flex items-center text-sm font-normal text-gray-800 hover:text-gray-900 transition duration-300">Log In</button>
            </SignInButton>)
          }
          
          {/* <SignUpButton mode="modal" forceRedirectUrl={'/portal/setup'}>
            <PLBasicButton text="Sign Up" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white" noDefaultDarkModeStyles={true}/>
          </SignUpButton> */}
          <PLBasicButton text="Coming July 2024" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-200 dark:hover:bg-orange-200 hover:text-orange-600 cursor-default" noDefaultDarkModeStyles/>
        </div>
      </div>
      <div className="flex w-full flex-col my-auto mb-8 md:flex-row xl:gap-14 md:gap-5">
        <div className="flex flex-col justify-center w-full md:w-1/2 text-center lg:text-start">
          <div className="flex items-center justify-center mb-2 md:mb-4 lg:justify-normal">
            <h4 className="text-sm invisible md:visible font-bold tracking-widest text-[#F28C28] uppercase">Explore the Benefits of Direction</h4>
          </div>
          <h1 className="-mt-6 md:-mt-0 mb-6 md:mb-8 text-3xl font-extrabold leading-tight lg:text-6xl text-black">Product Management<br/>for the Little Guys</h1>
          <p className="mb-0 md:mb-6 text-base font-normal leading-7 lg:w-3/4 text-black">
            Indiehacker or early startup? Enjoy many of the benefits that proper planning and organization bring through a dedicated AI powered product manager.
          </p>
          <div className="flex flex-col invisible md:visible items-center gap-4 lg:flex-row">
            <Form className="flex gap-2" ref={formRef} method="POST">
              <input 
              ref={emailRef}
              className="py-3 w-96 px-4 text-sm font-medium text-black border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring focus:ring-gray-300" 
              type="email" 
              placeholder="Enter your email"
              onChange={(e) => e.stopPropagation()}
              name="waitlist-email"
              />
              <button className="w-32 py-3 px-4 text-md font-bold text-white bg-[#F28C28] rounded-xl hover:bg-orange-500 focus:outline-none focus:ring focus:ring-orange-300" onClick={joinWaitlist}>Join Waitlist{showConfetti && <ConfettiExplosion onComplete={() => setShowConfetti(false)} width={1000} particleCount={80} force={0.6} duration={2600}/>}</button>
            </Form>
          </div>
        </div>
        <div className="items-center justify-end flex w-full md:w-1/2 md:flex">
          <img className="w-full md:w-4/5 rounded-md h-lg" src="https://storage.googleapis.com/productlamb_project_images/pl-header-img.png" alt="header image"/>
        </div>
      </div>
      <div className="w-full flex flex-col gap-10 mt-10 text-black items-center">
        <ProductSection />
        <FeaturesSection />
        <ValueSection />
        {/* <ValidationSection /> */}
        <PricingSection />
        <ContactUsSection />
      </div>
      <footer className="bg-white mt-20">
        <div className="container px-6 py-8 mx-auto">
          <div className="flex flex-col items-center text-center">
            <a href="#"><img className="w-auto h-7" src="https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_black.png" alt=""/></a>
            <p className="max-w-md mx-auto mt-4 text-gray-500 dark:text-gray-400">You code. We manage.</p>
            <div className="flex flex-col mt-4 sm:flex-row sm:items-center sm:justify-center">
              <Form className="flex gap-2" ref={formRef} method="POST">
                <input 
                ref={emailRef}
                className="py-3 w-62 px-4 text-sm font-medium text-black border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring focus:ring-gray-300" 
                type="email" 
                placeholder="Enter your email"
                onChange={(e) => e.stopPropagation()}
                name="waitlist-email"
                />
                <button className="w-32 py-3 px-4 text-md font-bold text-white bg-[#F28C28] rounded-xl hover:bg-orange-500 focus:outline-none focus:ring focus:ring-orange-300" onClick={joinWaitlist}>Join Waitlist{showConfetti && <ConfettiExplosion onComplete={() => setShowConfetti(false)} width={1000} particleCount={80} force={0.6} duration={2600}/>}</button>
              </Form>
            </div>
          </div>
          <hr className="my-10 border-gray-200 dark:border-gray-700" />
          <div className="flex flex-col items-center sm:flex-row sm:justify-between">
            <p className="text-sm text-gray-500">© Copyright 2024. All Rights Reserved.</p>
              <div className="flex mt-3 -mx-2 sm:mt-0">
                {/* <a href="#" className="mx-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-500 dark:hover:text-gray-300" aria-label="Reddit"> Teams </a>
                <a href="#" className="mx-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-500 dark:hover:text-gray-300" aria-label="Reddit"> Privacy </a>
                <a href="#" className="mx-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-500 dark:hover:text-gray-300" aria-label="Reddit"> Cookies </a> */}
              </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ProductSection() {
  return (
    <div className="w-full flex flex-col items-center gap-5" id="product">
      <h1 className="font-bold text-3xl text-center md:text-5xl mb-2">Build better projects with proper planning.</h1>
      <p className="font-regular w-full text-lg md:w-3/4 md:text-xl text-center mb-10">Let's be honest, developers love coding <span className="font-extrabold">not planning</span>. Leverage AI technology to properly plan out and manage 
        your personal project's workload so you can focus on what you do best.
      </p>
    </div>
  )
}

function FeaturesSection() {
  const imgs = [
    "https://storage.googleapis.com/productlamb_project_images/clickup_screenshot.png",
    "https://storage.googleapis.com/productlamb_project_images/apps_screenshot.png",
    "https://storage.googleapis.com/productlamb_project_images/dashboard_screenshot.png",
    "https://storage.googleapis.com/productlamb_project_images/integrations_screenshot.png",
    "https://storage.googleapis.com/productlamb_project_images/notes_screenshot.png",
  ]

  const featureHeaders = [
    "Sprints Automatically Generated",
    "Manage Multiple Projects",
    "Dashboard Analytics",
    "Third Party Integrations",
    "Proper Note Taking",
    // "Export Your Data At Any Time",
  ]

  const featureDescriptions = [
    "ProductLamb auto generates sprints in your preferred management tool by analyzing your goals, code repository issues, user feedback, self reported bugs, and more.",
    "Working on multiple things? ProductLamb can help plan sprints and tasks across all of your projects. Easily switch between projects and see your progress.",
    "Understand key metrics about your projects' development, like how many bugs were tackled, how many features were added, and how many tasks do you complete per sprint.",
    "Connect to your favorite tools to increase productivity. We support over 10+ integrations including Google Calendar, Slack, and Notion.",
    "Jot down notes anywhere in the app. Notes are saved and can be accessed at any time. Never forget that great idea you had.",
    // "Never feel locked in. Export your data at any time to CSV. ProductLamb is here to help you, not make things harder when you need to pivot."
  ]

  function changeFeatureDisplay(i: number) {
    if (index === i) return
    setIndex(i)
  }

  const [index, setIndex] = useState(0)
  return (
    <div className="w-full flex flex-col items-center border-neutral-200 border-2 rounded-3xl p-10 -mb-10" id="features">
      <h1 className="font-bold text-xl text-center md:text-2xl mb-3">{featureHeaders[index]}</h1>
      <p className="font-regular w-full md:w-4/5  text-lg md:text-xl text-left md:text-center mb-12">{featureDescriptions[index]}</p>
      <img className="w-full lg-h-[600px] md-h-[500px] object-cover border-2 sm-h-[300px] md:w-4/5" src={imgs[index]}/>
      <div className="flex gap-2 mt-10">
        {imgs.map((_, i) => {
          return (
            <button key={i} className={"border-2 p-1 bg-white rounded-full border-neutral-300"} onClick={() => changeFeatureDisplay(i)}>
              <div className={"w-3 h-3 rounded-full " + (index === i ? 'bg-orange-400' : 'bg-gray-400')}></div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ValidationSection() {
  return (
    <div className="flex flex-col items-center gap-5 mt-10">
      <h1 className="font-bold text-5xl mb-2">Don't take our word for it!</h1>
      <p className="font-regular w-3/4 text-xl text-center mb-10">Indiehackers, solopreneurs, and small dev teams around the world trust ProductLamb to manage their projects.</p>
      <div className="flex flex-col gap-5 items-center">
        <div className="flex gap-5">
          <PLDeveloperButton text={"Davidjustice28"} icon="ri-github-fill"/>
          <PLDeveloperButton text={"johnnyappleseed"} icon="ri-github-fill"/>
          <PLDeveloperButton text={"michalJenkins"} icon="ri-github-fill"/>
          <PLDeveloperButton text={"number1dev"} icon="ri-github-fill"/>
          <PLDeveloperButton text={"pythonisking"} icon="ri-github-fill"/>
        </div>
        <div className="flex gap-5">
          <PLDeveloperButton text={"pythonisking"} icon="ri-github-fill"/>
          <PLDeveloperButton text={"ailord"} icon="ri-github-fill"/>
          <PLDeveloperButton text={"adamsandler23"} icon="ri-github-fill"/>
          <PLDeveloperButton text={"__meganodonnel"} icon="ri-github-fill"/>
          <PLDeveloperButton text={"robocode"} icon="ri-github-fill"/>
          <PLDeveloperButton text={"letscode2024"} icon="ri-github-fill"/>
        </div>
      </div>
    </div>
  )

}

function PricingSection() {
  const offerings = [
    "Manage up to 10 projects",
    "2 sprints per month (bi-weekly)",
    "Connect to Github or Gitlab",
    "Export your data any time to CSV",
    "Integrate with several 3rd party tools",
    "Manually and bulk upload user feedback",
    "Dashboard access with analytics",
    "Dark mode"
  ]

  const [isMonthly, setIsMonthly] = useState(true)

  const toggleSubscription = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMonthly((prev) => !prev)
  }

  return (
    <div className="w-full" id="pricing">
      <div className="bg-white sm:pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-2xl text-center font-bold tracking-tight text-gray-900 sm:text-4xl">Simple pricing. One plan for all.</h2>
            <p className="mt-4 md:mt-6 text-lg leading-8 text-gray-600">Why discriminate on feature access. We make things simple. Choose between monthly or annual subscription and get access to everything.</p>
          </div>
          <div className="mx-auto mt-8 md:mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">Standard Subscription</h3>
              <p className="mt-6 text-base leading-7 text-gray-600">Power to the developer! Access all features so that you can build and manage better programs.</p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-[#F28C28]">What’s included</h4>
                <div className="h-px flex-auto bg-gray-100"></div>
              </div>
              <ul role="list" className="mt-8 grid grid-cols-1 gap-4 leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
                {offerings.map((offering, i) => {
                  return (
                    <li key={i} className="flex gap-x-3 items-center">
                      <i className="ri-check-fill text-xl text-green-600"/>
                      <span className="text-sm">{offering}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16 h-full">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-gray-600">Affordable pricing for all</p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2 mb-6">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">${isMonthly ? 10 : 75}</span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">USD</span>
                  </p>
                  {/* <PLBasicButton text="Coming July 2024" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-200 hover:text-orange-600"/> */}
                  <p className="mt-2 text-xs leading-5 text-gray-600">Enjoy the benefits of your own project manager.</p>
                  <div className="mt-3 mb-4 flex items-center justify-center gap-2 -ml-8">
                    <ToggleSwitch onChangeHandler={toggleSubscription} darkMode={!isMonthly} />
                    <PLStatusBadge text={isMonthly ? 'Monthly' : 'Annually'} color={(isMonthly ? Colors.PINK: Colors.PURPLE)}/>
                  </div>
                  <p className={"text-xs leading-5 font-semibold text-gray-600 visible " + (isMonthly ? 'invisible' : '')}>That's 30% off!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  )
}

function ContactUsSection() {
  return (
    <div className="w-full flex flex-col items-center gap-10 mt-20" id="contact-us">
      <h1 className="font-bold text-center text-3xl md:text-5xl">Get in touch with us</h1>
      <div className="container flex flex-col mx-auto bg-white">
        <div className="w-full">
          <div className="container flex flex-col items-center gap-16 mx-auto">
            <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center gap-3 px-8 py-10 bg-white rounded-3xl shadow-lg">
                <i className="ri-mail-fill text-3xl text-[#F28C28]"/>  
                <p className="text-2xl font-extrabold text-dark-grey-900">Email</p>
                <p className="text-base leading-7 text-dark-grey-600">Contact us for support</p>
                <a className="text-lg font-bold text-purple-blue-500" href="mailto:support@productlamb.com">support@productlamb.com</a>
                </div>
                <div className="flex flex-col items-center gap-3 px-8 py-10 bg-white rounded-3xl shadow-lg">
                <i className="ri-twitter-fill text-3xl text-[#F28C28]"/> 
                <p className="text-2xl font-extrabold text-dark-grey-900">Social Media</p>
                <p className="text-base text-center leading-7 text-dark-grey-600">Stay up to date with releases on Twitter/X</p>
                <p className="text-lg font-bold text-purple-blue-500">@productlamb</p>
                </div>
                <div className="flex flex-col items-center gap-3 px-8 py-10 bg-white rounded-3xl shadow-lg">
                <i className="ri-phone-fill text-3xl text-[#F28C28]"/> 
                <p className="text-2xl font-extrabold text-dark-grey-900">Sales</p>
                <p className="text-base leading-7 text-dark-grey-600">Schedule a 1-on-1 demo</p>
                <PLBasicButton text="Coming Soon" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white" noDefaultDarkModeStyles/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ValueSection() {
  return (
    <div className="w-full -mb-16 sm:-mb-32" id="values">
      <div className="bg-white py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 bo">
          <div className="sm:px-32">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 text-center">Simple. Powerful. Automated</h2>
            <p className="mt-2 text-left text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">What makes us different than tools like Jira and Trello?</p>
            <p className="mt-6 text-left text-md sm:text-lg leading-8 text-gray-600">We aren't looking to replace your favorite PM tools like Notion & ClickUp. We're here to relieve you of stress by managing them for you.</p>
            <p className="mt-6 text-left text-md sm:text-lg leading-8 text-gray-600">Project Managers are crucial personnel, especially in startups. But with an average salary cost of $70k - $120k, hiring one is just not an option. However, we do believe that all developers, who build projects, could benefit from someone or something
              that can keep them accountable, that really manages the lifecycle of new features, and plans a project's workload. So how do most people manage their projects? Either not at all or with a project management software with a kanban board. We decided to start here.</p>
            <p className="mt-6 text-md text-left sm:text-lg leading-8 text-gray-600">There are many great tools on the 
              market, but they are too complex and bloated. They are designed for big teams and big projects. ProductLamb is designed for you, the solo developer, the indiehacker, the small team. ProductLamb automates most of the things needed to keep your project on track to hit your goals,
              while providing the core features you care about, in the case that you want to get your hands dirty.</p>
            <p className="mt-6 text-md sm:text-lg leading-8 text-gray-600">We're here to help you get back to building your product, not managing it.</p>
          </div>
        </div>
      </div>
    </div>
  )
}