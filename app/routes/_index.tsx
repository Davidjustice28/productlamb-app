import { SignInButton, SignUpButton } from "@clerk/remix";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { PLBasicButton } from "~/components/buttons/basic-button";
import { PLDeveloperButton } from "~/components/buttons/label-button";


export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white w-full py-2 px-16">
      <div className="relative flex flex-wrap items-center justify-between w-full bg-white group py-7 shrink-0">
        <div>
          <img className="h-8" src="https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_black.png"/>
        </div>
        <div className="items-center justify-between hidden gap-12 text-black md:flex">
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#features">Purpose</a>
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#features">Features</a>
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#pricing">Pricing</a>
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#contact-us">Contact Us</a>
        </div>
        <div className="items-center hidden gap-8 md:flex">
          <SignInButton mode="modal" forceRedirectUrl={'/portal/dashboard'}>
            <button className="flex items-center text-sm font-normal text-gray-800 hover:text-gray-900 transition duration-300">Log In</button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl={'/portal/dashboard'}>
            <PLBasicButton text="Sign Up" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white"/>
          </SignUpButton>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 my-auto mt-12 mb-8 md:grid-cols-2 xl:gap-14 md:gap-5">
        <div className="flex flex-col justify-center col-span-1 text-center lg:text-start">
          <div className="flex items-center justify-center mb-4 lg:justify-normal">
            <h4 className="text-sm font-bold tracking-widest text-[#F28C28] uppercase">Explore the Benefits of Direction</h4>
          </div>
          <h1 className="mb-8 text-4xl font-extrabold leading-tight lg:text-6xl text-black">Product Management for the Little Guys</h1>
          <p className="mb-6 text-base font-normal leading-7 lg:w-3/4 text-black">
            Indiehacker or Small Dev Team? Enjoy many of the benefits that proper planning and organization bring through a dedicated AI powered product manager.
          </p>
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <PLBasicButton text="Get started now" rounded colorClasses="bg-orange-500 text-white py-3 px-4"/>
            <button className="flex items-center py-4 text-sm font-medium px-7 text-black hover:text-dark-grey-900 transition duration-300 rounded-2xl">
              <i className="ri-phone-fill text-lg mr-2"></i>
              Book a demo
            </button>
          </div>
        </div>
        <div className="items-center justify-end hidden col-span-1 md:flex">
          <img className="w-4/5 rounded-md h-lg" src="https://storage.googleapis.com/product-lamb-images/pl-header-img-3.png" alt="header image"/>
        </div>
      </div>
      <div className="w-full flex flex-col gap-10 mt-10 text-black items-center">
        <ProductSection />
        <FeaturesSection />
        <ValidationSection />
        <PricingSection />
        <ContactUsSection />
      </div>
      <footer className="bg-white dark:bg-gray-900 mt-20">
        <div className="container px-6 py-8 mx-auto">
          <div className="flex flex-col items-center text-center">
            <a href="#"><img className="w-auto h-7" src="https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_black.png" alt=""/></a>
            <p className="max-w-md mx-auto mt-4 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <div className="flex flex-col mt-4 sm:flex-row sm:items-center sm:justify-center">
              <button className="flex items-center justify-center order-1 w-full px-2 py-2 mt-3 text-sm tracking-wide text-gray-600 capitalize transition-colors duration-300 transform border rounded-md sm:mx-2 dark:border-gray-400 dark:text-gray-300 sm:mt-0 sm:w-auto hover:bg-gray-50 focus:outline-none focus:ring dark:hover:bg-gray-800 focus:ring-gray-300 focus:ring-opacity-40">
                <i className="ri-play-circle-line text-xl"></i>
                <span className="mx-1">View Demo</span>
              </button>

              <PLBasicButton text="Get started" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white"/>
            </div>
          </div>
          <hr className="my-10 border-gray-200 dark:border-gray-700" />
          <div className="flex flex-col items-center sm:flex-row sm:justify-between">
            <p className="text-sm text-gray-500">© Copyright 2021. All Rights Reserved.</p>
              <div className="flex mt-3 -mx-2 sm:mt-0">
                <a href="#" className="mx-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-500 dark:hover:text-gray-300" aria-label="Reddit"> Teams </a>
                <a href="#" className="mx-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-500 dark:hover:text-gray-300" aria-label="Reddit"> Privacy </a>
                <a href="#" className="mx-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-500 dark:hover:text-gray-300" aria-label="Reddit"> Cookies </a>
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
      <h1 className="font-bold text-5xl mb-2">Build better projects with proper planning.</h1>
      <p className="font-regular w-3/4 text-xl text-center mb-10">Let's be honest, developers love coding <span className="font-extrabold">not planning</span>. Leverage AI technology to properly plan out and manage 
        your personal project's workload so you can focus on what you do best.
      </p>
    </div>
  )
}

function FeaturesSection() {
  const imgs = [
    "https://storage.googleapis.com/product-lamb-images/screely-1714683109927.png",
    "https://storage.googleapis.com/product-lamb-images/screely-1714683026541.png",
    "https://storage.googleapis.com/product-lamb-images/screely-1714692729134.png",
    "https://storage.googleapis.com/product-lamb-images/screely-1714683222909.png",
    "https://storage.googleapis.com/product-lamb-images/screely-1714683109927.png"
  ]

  const featureHeaders = [
    "Sprints Automatically Planned & Generated",
    "Track Bugs From All Sources",
    "Integrations For Days",
    "Manage Multiple Projects",
    "Export Your Data At Any Time",
  ]

  const featureDescriptions = [
    "ProductLamb auto generates sprints in your preferred management tool by analyzing your goals, code repository issues, user feedback, self reported bugs, and more.",
    "See all reported bugs in one place. ProductLamb will automatically track and categorize bugs reported by users, your team, and from your code repository.",
    "Connect to your favorite tools to increase productivity. We support over 10+ integrations including Google Calendar, Slack, Notion, and more.",
    "Working on multiple things? ProductLamb can help plan sprints and tasks across all of your projects. Easily switch between projects and see your progress.",
    "Never feel locked in. Export all of your task data at any time. ProductLamb is here to help you, not lock you in."
  ]

  function changeFeatureDisplay(i: number) {
    if (index === i) return
    setIndex(i)
  }

  const [index, setIndex] = useState(0)
  return (
    <div className="w-full flex flex-col items-center border-neutral-200 border-2 rounded-3xl p-10" id="features">
      <h1 className="font-bold text-2xl mb-3">{featureHeaders[index]}</h1>
      <p className="font-regular w-4/5 text-xl text-center mb-12">{featureDescriptions[index]}</p>
      <img className="w-4/5" src={imgs[index]}/>
      <div className="flex gap-2 mt-10">
        {imgs.map((_, i) => {
          return (
            <button className={"border-2 p-1 bg-white rounded-full border-neutral-300"} onClick={() => changeFeatureDisplay(i)}>
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
    "Integrate with 10+ 3rd party tools",
    "Manually bulk upload bugs and user feedback",
    "Up to 5 team members",
    "Dashboard access with analytics",
  ]
  return (
    <div className="w-full" id="pricing">
      <div className="bg-white sm:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple pricing. One plan for all.</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">Why discriminate on feature access. We make things simple. Choose between monthly or annual subscription and get access to everything.</p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
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
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">$20</span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">USD</span>
                  </p>
                  <a href="#" className="mt-10 block w-full rounded-md bg-[#F28C28] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">Get access</a>
                  <p className="mt-6 text-xs leading-5 text-gray-600">Invoices and receipts available for easy company reimbursement through stripe</p>
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
      <h1 className="font-bold text-5xl">Get in touch with us</h1>
      <div className="container flex flex-col mx-auto bg-white">
        <div className="w-full">
          <div className="container flex flex-col items-center gap-16 mx-auto">
            <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center gap-3 px-8 py-10 bg-white rounded-3xl shadow-lg">
                <i className="ri-mail-fill text-3xl text-[#F28C28]"/>  
                <p className="text-2xl font-extrabold text-dark-grey-900">Email</p>
                <p className="text-base leading-7 text-dark-grey-600">Contact us for support</p>
                <a className="text-lg font-bold text-purple-blue-500" href = "mailto: hello@loopple.com">info@productlamb.com</a>
                </div>
                <div className="flex flex-col items-center gap-3 px-8 py-10 bg-white rounded-3xl shadow-lg">
                <i className="ri-twitter-fill text-3xl text-[#F28C28]"/> 
                <p className="text-2xl font-extrabold text-dark-grey-900">Twitter/X</p>
                <p className="text-base leading-7 text-dark-grey-600">Stay up to date with releases and news</p>
                <a className="text-lg font-bold text-purple-blue-500" href="tel:+516-486-5135">@productlamb</a>
                </div>
                <div className="flex flex-col items-center gap-3 px-8 py-10 bg-white rounded-3xl shadow-lg">
                <i className="ri-phone-fill text-3xl text-[#F28C28]"/> 
                <p className="text-2xl font-extrabold text-dark-grey-900">Sales</p>
                <p className="text-base leading-7 text-dark-grey-600">Schedule a 1-on-1 demo</p>
                <PLBasicButton text="Book a demo" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}