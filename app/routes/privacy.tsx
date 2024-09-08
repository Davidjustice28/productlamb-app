import { SignInButton } from "@clerk/remix"
import { json, LoaderFunction } from "@remix-run/node"
import { PLBasicButton } from "~/components/buttons/basic-button"

export default function PrivacyNotice() {
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
      
      <div className="w-4/5 mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Privacy Notice</h1>

        <section className="mb-6">
          <p className="text-gray-600 mb-4">
            Our website uses cookies, scripts, and third-party services to enhance your browsing experience and to analyze how our site is used. 
            Cookies are small text files stored on your device that help us remember your preferences and understand how you interact with our site. 
            By using our website, you consent to the use of these technologies in accordance with this Privacy Notice.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">
            Third-Party Services We Use
          </h2>
          
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Plausible Analytics
          </h3>
          <p className="text-gray-600 mb-4">
            We use Plausible Analytics to collect and analyze data about how our website is used. Plausible is a privacy-focused analytics tool that 
            helps us understand visitor behavior without tracking personal data or using cookies. The data collected helps us improve your experience on 
            our site. For more information, please visit their <a href="https://plausible.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">website</a>.
          </p>

          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Clerk Authentication
          </h3>
          <p className="text-gray-600 mb-4">
            To ensure a secure and seamless authentication process, we use Clerk for managing user sign-ups and log-ins. Clerk handles user authentication 
            and sessions while maintaining the security of your data. For details on how Clerk manages your information, please visit their <a href="https://clerk.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">website</a>.
          </p>

          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Lemon Squeezy Payments
          </h3>
          <p className="text-gray-600 mb-4">
            We use Lemon Squeezy for processing payments on our site. When you make a purchase, Lemon Squeezy securely handles all payment details. 
            We do not store your payment information; it is processed directly by Lemon Squeezy, ensuring that your payment data is kept confidential and encrypted. 
            For more information on how Lemon Squeezy protects your data, visit their <a href="https://lemonsqueezy.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">website</a>.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">
            Data Retention
          </h2>
          <p className="text-gray-600 mb-4">
            We retain your data only for as long as necessary to fulfill the purposes outlined in this privacy notice, including for the duration of 
            any legal or regulatory requirements. Data collected through analytics tools like Plausible may be retained for a limited period to analyze 
            website usage trends. Data related to authentication and payment transactions is retained in accordance with the policies of our third-party 
            service providers. After an account is closed or deleted, we ensure that all associated data is removed from our systems in a timely manner. 
            If you have any questions about specific data retention periods or account data removal, please contact us.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-600 mb-4">
            If you have any questions or concerns about our privacy practices, please contact us at <a href="mailto:support@productlamb.com" className="text-blue-500 hover:underline">support@productlamb.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">
            Last Updated
          </h2>
          <p className="text-gray-600">
            This privacy notice was last updated on September 8, 2024.
          </p>
        </section>
      </div>
    </div>
  )
}