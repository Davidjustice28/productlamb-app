import { PLTutorial } from "./tutorial";

export function UploadFeedbackTutorial() {
  return (
    <PLTutorial title="Bulk upload user feedback with a csv file">
      <div className="flex flex-col gap-6">
        <p>Have a lot of feedback written down or in a csv file? Follow this walkthrough to uploading all of your stored feedback at once!</p>

        <ol className='list-inside flex flex-col gap-4'>
          <li className='list-none'><span className="font-semibold">Step 1:</span> Go to feedback page</li>
          
          <li className='list-none'><span className="font-semibold">Step 2:</span> Click CSV option.</li>

          <li className='list-none'><span className="font-semibold">Step 3:</span> Choose a CSV file from your file directory</li>
          <code>Use the template snippet as an example of the expected structure your csv file needs to follow.</code>

          <li className='list-none'><span className="font-semibold">Step 4:</span> Click upload button.</li>
        </ol>

        <p>You now see your feedback listed on the page.</p>
      </div>    
    </PLTutorial>
  )
}