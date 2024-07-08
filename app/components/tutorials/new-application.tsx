import { PLTutorial } from "./tutorial";

export function NewApplicationTutorial() {
  return (
    <PLTutorial title="Setup a new application">
      <div className="flex flex-col gap-6">
        <p>This walkthrough shows you how to configure a new application to be managed by productlamb.</p>

        <ol className='list-inside flex flex-col gap-4'>
          <li className='list-none'><span className="font-semibold">Step 1:</span> Go to application page</li>
          {/* <code>This page list all of your applications configured, allows you to edit them, and switch between the active application you are updating on the platform.</code> */}
          
          <li className='list-none'><span className="font-semibold">Step 2:</span> Click "+" icon button at the top right of the page.</li>

          <li className='list-none'><span className="font-semibold">Step 3:</span> Add basic details like name and summary.</li>

          <li className='list-none'><span className="font-semibold">Step 4:</span> Choose your preferred project management tool that you would like us to manage when distrubing work.</li>

          <li className='list-none'><span className="font-semibold">Step 5:</span> Add 1-3 long term and short term goals.</li>

          <li className='list-none'><span className="font-semibold">Step 6:</span> Click Add button</li>
        </ol>

        <p>Congratulations you have now setup a new application!</p>
      </div>
    </PLTutorial>
  )
}