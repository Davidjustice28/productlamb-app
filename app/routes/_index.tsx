import { SignInButton, useAuth, useUser } from "@clerk/remix";
import { ActionFunction, LinksFunction, LoaderFunction, MetaFunction, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { PLBasicButton } from "~/components/buttons/basic-button";

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
  return json({ isLocalHost }, { headers: {
    "Set-Cookie": 'account=; Max-Age=0; Path=/;'
  }})
}

export default function LandingPage() {
  const actionData = useActionData<typeof action>()
  const { isLocalHost } = useLoaderData<typeof loader>()
  const [showConfetti, setShowConfetti] = useState(actionData?.joined || false)
 
  return (
    <div className="flex flex-col bg-white w-full md:pt-2">
      <div className="relative flex flex-wrap items-center justify-between w-full bg-white group py-7 shrink-0 md:px-16 px-5">
        <div className="m-auto hidden md:block md:m-0">
          <img className="h-8" src="https://storage.googleapis.com/product-lamb-images/product_lamb_logo_full_black.png"/>
        </div>
        <div className="md:hidden flex flex-row justify-between items-center w-full border-b-2 pb-5">
          <img className="h-10" src="https://storage.googleapis.com/product-lamb-images/productlamb_logo_icon.png"/>
          <PLBasicButton text="Schedule Demo" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white" noDefaultDarkModeStyles={true} onClick={() => window.open('https://cal.com/productlamb/15min', '_blank')}/>
        </div>
        <div className="items-center justify-between hidden gap-12 text-black md:flex">
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#features">Features</a>
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#values">Value Proposition</a>
          <a className="text-sm font-normal text-dark-grey-700 hover:text-dark-grey-900" href="#contact-us">Contact Us</a>
        </div>
        <div className="items-center hidden gap-8 md:flex">
          
          <SignInButton mode="modal" forceRedirectUrl={'/portal/dashboard'} signUpForceRedirectUrl={null} signUpFallbackRedirectUrl={null}>
            <button className="flex items-center text-sm font-normal text-gray-800 hover:text-gray-900 transition duration-300">Log In</button>
          </SignInButton>
          
          {/* <SignUpButton mode="modal" forceRedirectUrl={'/portal/setup'}> */}
            <PLBasicButton text="Book Demo" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white" noDefaultDarkModeStyles={true} onClick={() => window.open('https://cal.com/productlamb/15min', '_blank')}/>
          {/* </SignUpButton> */}
        </div>
      </div>
      <div className="flex w-full flex-col my-auto mb-8 md:flex-row xl:gap-14 md:gap-5 md:px-16 px-5">
        <div className="flex flex-col justify-center w-full md:w-1/2 text-center lg:text-start">
          <div className="flex items-center justify-center mb-2 md:mb-4 lg:justify-normal">
            <h4 className="text-sm invisible md:visible font-bold tracking-widest text-[#F28C28] uppercase">Explore the Benefits of Direction</h4>
          </div>
          <h1 className="-mt-6 md:-mt-0 mb-6 md:mb-8 text-3xl font-extrabold leading-tight md:text-6xl text-black">Product Management<br/>for the Little Guys</h1>
          <p className="md:mb-6 text-base font-normal leading-7 mb-3 text-left md:mx-0 w-[90%] mx-auto md:w-3/4 text-black">
            Early-stage startup or small team? Enjoy many of the benefits that proper planning and organization bring through a dedicated AI powered product manager.
          </p>
          <div className="flex-row gap-5 items-center hidden md:flex">
            <p className="text-lg font-semibold text-black">Want to see how we can help your business?</p>
            <PLBasicButton text="Schedule Demo" icon="ri-calendar-line" rounded colorClasses="bg-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white" noDefaultDarkModeStyles={true} onClick={() => window.open('https://cal.com/productlamb/15min', '_blank')}/>
          </div>
        </div>
        <div className="items-center justify-end flex w-full md:w-1/2 md:flex mt-5 md:mt-0">
          <img className="w-full md:w-4/5 rounded-md h-lg" src="https://storage.googleapis.com/productlamb_project_images/pl-header-img.png" alt="header image"/>
        </div>
      </div>
      <div className="w-full flex flex-col text-black items-center">
        <div className="w-full flex flex-col text-black items-center gap-10 ">
          <div className="w-full flex flex-col items-center gap-5 -mb-14 py-10 bg-orange-200 mt-10 rounded-sm" id="product">
            <h1 className="font-bold text-xl w-3/4 text-center md:text-4xl mb-2 text-orange-600">How does <span className="text-black">ProductLamb</span> help you build <span className="text-black">better</span> software?</h1>
          </div>
          <FeaturesSection />
          <div className="w-full flex flex-col items-center gap-5 -mb-14 py-10 bg-orange-200 mt-10 rounded-sm" id="product">
            <h1 className="font-bold text-xl text-center md:text-4xl mb-2 text-orange-600">What makes us <span className="text-black">different</span>?<br className="md:hidden"/> What do we <span className="text-black">offer</span> ?</h1>
          </div>
          <ValueSection />
          {/* <ValidationSection /> */}
          <ContactUsSection />
        </div>
      </div>
    </div>
  )
}

function FeaturesSection() {
  const imgs = [
    "https://storage.googleapis.com/productlamb_project_images/clickup_screenshot.png",
    "https://storage.googleapis.com/productlamb_project_images/dashboard_screenshot.png",
    'https://storage.googleapis.com/productlamb_project_images/screely-1720575351485.png',
    "https://storage.googleapis.com/productlamb_project_images/screely-1720590712501.png",
    "https://storage.googleapis.com/productlamb_project_images/apps_screenshot.png",
  ]

  const featureHeaders = [
    "Automate 60-80% of your sprint planning process",
    "Make better planning decisions with key metrics",
    "Keep your team focused",
    "Automate more with your favorite third party integrations",
    "Properly plan development across multiple projects",
    // "Never feel locked in again",
  ]

  const featureDescriptions = [
    "ProductLamb auto generates sprints in your preferred management tool by analyzing your goals, code repository issues, user feedback, self reported bugs, and more.",
    "Most startups care about a few core metrics. Understand these key metrics about your project's development, like how many points per sprint does your team average and what type of work is being prioritized.",
    "Through email and integrations like slack, ProductLamb can notify your team of recent updates, remind them of deadlines, and keep them focused on the work that matters.",
    "Connect to ProductLamb with tools you're already using to do automate more like tracking repository issues, scheduling meetings, and notifying the team of updates.",
    "Most production software has multiple code repositories. Many companies have multiple products. ProductLamb can help plan and manage work for all of your applications individually.",
    // "Never feel locked in. Export your data at any time to CSV. ProductLamb is here to help you, not make things harder when you need to pivot."
  ]

  return (
    <div className="w-full flex flex-col items-center py-16 -mb-10 gap-20 md:gap-24 md:px-16 px-8" id="features">
      {imgs.map((photo, i) => {
        return (
          <div className={"mt-10 gap-16 w-full items-start md:items-center justify-between flex" + (i % 2 === 0 ? ' flex-col md:flex-row' : ' flex-col md:flex-row-reverse')} key={i}>
            <div className="md:w-1/2 w-full flex flex-col gap-8">
              <h2 className="font-bold text-4xl md:text-4xl">{featureHeaders[i]}</h2>
              <p className="font-regular text-lg md:text-xl">{featureDescriptions[i]}</p>
              {i === 0 && (
                <div className="flex flex-row gap-5 items-center">
                  <p className="text-black font-semibold -mr-2">Tools Supported</p>
                  <div className="flex items-center gap-4">
                    <img className="md:h-10 w-10" src="https://storage.googleapis.com/productlamb_project_images/clickup.png"/>
                    <img className="h-7 w-7" src="https://storage.googleapis.com/productlamb_project_images/notion.246x256.png"/>
                    <img className="h-5 w-5" src="https://storage.googleapis.com/productlamb_project_images/jira.256x256.png"/>
                  </div>
                </div>
              )}
              {i === 1 && (
                <div className="flex flex-col gap-7">
                  <p className="text-lg text-orange-500 md:text-xl italic">"We've been using ProductLamb internally and it has brought so much insight on what work we need to prioritize."</p>
                  <div className="flex flex-row gap-4 items-center">
                    <img className="h-12 w-12 rounded-full" src="https://storage.googleapis.com/productlamb_project_images/IMG_7841.jpg"/>
                    <div className="flex flex-col">
                      <p className="font-semibold text-sm text-black">David Justice</p>
                      <p className="font-regular text-xs text-black">Co-Founder</p>
                    </div>
                  </div>
                </div>
              )}
              {i === 2 && (
                <div className="flex flex-col gap-7">
                  <p className="text-lg text-orange-500 md:text-xl italic">"ProductLamb will keep your team accountable and on track to hit your productivity goals just like a tradional Product Manager."</p>
                  <div className="flex flex-row gap-4 items-center">
                    <img className="h-12 w-12 rounded-full" src="https://storage.googleapis.com/productlamb_project_images/IMG_1467.png"/>
                    <div className="flex flex-col">
                      <p className="font-semibold text-sm text-black">Nicholas LePore</p>
                      <p className="font-regular text-xs text-black">Co-Founder</p>
                    </div>
                  </div>
                </div>
              )}
              
              {i === 3 && (
                <div className="flex flex-row gap-5 items-center">
                  {/* <p className="text-black font-semibold">Support for</p> */}
                  <div className="flex items-center gap-4">
                    <img className="h-7 w-7" src="https://storage.googleapis.com/productlamb_project_images/github.256x244.png"/>
                    <img className="h-7 w-7" src="https://storage.googleapis.com/productlamb_project_images/gitlab.256x236.png"/>
                    <img className="h-5 w-5" src="https://storage.googleapis.com/productlamb_project_images/slack-icon.256x255.png"/>
                    <img className="h-10 w-10 -ml-2" src="https://storage.googleapis.com/productlamb_project_images/google-calendar.256x256.png"/>
                    <p className="text-black font-semibold -ml-2">and more...</p>
                  </div>
                </div>
              )}
              {i === 4 && (
                <div className="flex flex-col gap-7">
                  <p className="text-lg text-orange-500 md:text-xl italic">"No service, product, or application should be a second thought. Make sure every portion of your product is well thought out."</p>
                  <div className="flex flex-row gap-4 items-center">
                    <img className="h-12 w-12 rounded-full" src="https://storage.googleapis.com/productlamb_project_images/IMG_7841.jpg"/>
                    <div className="flex flex-col">
                      <p className="font-semibold text-sm text-black">David Justice</p>
                      <p className="font-regular text-xs text-black">Co-Founder</p>
                    </div>
                  </div>
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
    <div className="w-full flex flex-col items-center gap-10 mt-20 border-2 bg-orange-200 pt-14" id="contact-us">
      <h1 className="font-bold text-center text-orange-600 text-3xl md:text-5xl">Get in touch with us</h1>
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
          <hr className="my-10 border-white" />
          <div className="flex flex-col items-center sm:flex-row sm:justify-between">
            <p className="text-sm text-orange-600">© ProductLamb 2024. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ValueSection() {
  return (
    <div className="w-full -mb-16 sm:-mb-32" id="values">
      <div className="bg-white py-12 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 bo">
          <div className="sm:px-32">
            <p className="mt-2 text-left text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">We automate as much of the planning process as possible so that you can focus your time on building and growing your business.</p>
            <p className="mt-6 text-left text-md sm:text-lg leading-8 text-gray-600">Project Managers are crucial personnel, especially in startups. But with an average salary cost of $70k - $120k, hiring one is just not an option. However, we do believe that all tech companies, whether large or small, could benefit from someone or something
              that can keep them accountable, that really manages the lifecycle of new features, and plans a project's workload. So how do most early-staged startups manage their product's development? By winging it or with a project management software with a kanban board. We decided to start here.</p>
            <p className="mt-6 text-md text-left sm:text-lg leading-8 text-gray-600">There are many great tools on the 
              market, but they are too complex and bloated. They are designed for big teams and big projects. ProductLamb is designed for you, the small team with a lot to do. We're not looking to replace your favorite tool, but to manage it for you. ProductLamb automates most of the things needed to keep your project on track to hit your goals,
              while providing the core features you care about, in the case that you want to get your hands dirty.</p>
            <p className="mt-6 text-md text-left sm:text-lg leading-8 text-gray-600">Our platform gives you more time back and enables you to make data driven decisions when choosing what work to prioritize next.
              We're here to help you spend more time building your product rather than losing time planning it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}