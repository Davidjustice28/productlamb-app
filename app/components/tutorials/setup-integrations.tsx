import { PLTutorial } from "./tutorial";

export function SetupIntegrationTutorial() {
  return (
    <PLTutorial title="Connect preferred cloud repository hosting platform">
      <div className="flex flex-col gap-6">
        <p>This walkthrough shows you how to connect your github repository to productlamb so that we can pull in github issues reported.</p>

        <ol className='list-inside flex flex-col gap-4'>
          <li className='list-none'><span className="font-semibold">Step 1:</span> Switch to the application you want to have access to the integration.</li>
          {/* <code>This page list all of your applications configured, allows you to edit them, and switch between the active application you are updating on the platform.</code> */}
          
          <li className='list-none'><span className="font-semibold">Step 2:</span> Go to integrations page and plus button at the top right corner.</li>

          <li className='list-none'><span className="font-semibold">Step 3:</span> Select GitHub Integration in the modal. We only display integrations not configured yet. If you don't see it, then you have already set it up.</li>

          <li className='list-none'><span className="font-semibold">Step 4:</span> Add your github token which must have read access. Also add the repository owner which will either be your username or organization name. Then add your repositories name.</li>

          <li className='list-none'><span className="font-semibold">Step 5:</span> Click "Enabled Integration" button.</li>

        </ol>

        <p>Now when it comes to sprint suggestions, ProductLamb will have access to Github issues data.</p>
      </div>
    </PLTutorial>
  )
}