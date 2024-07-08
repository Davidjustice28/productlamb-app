import { ExampleTutorial } from "./example";
import { PLTutorial } from "./tutorial";

export function SprintBasicsTutorial() {
  return (
    <PLTutorial title="">
      <div className="flex flex-col gap-6">
        <p>ProductLamb helps make your </p>

        <ol className='list-inside flex flex-col gap-4'>
          <li className='list-none'><span className="font-semibold">Step 1:</span> Go to sprints page. If your current sprint is ready for planning, the sprint will have a "Start Planning" Button. Click it.</li>
          
          <li className='list-none'><span className="font-semibold">Step 2:</span> Select one of the three provided sprint initiatives. These are overall objects for a sprint and dictate what tasks are suggested.</li>

          <li className='list-none'><span className="font-semibold">Step 3:</span> Select the tasks you would like to pull into this sprint from the list of suggestions, then click "Go to Next Step" button.</li>

          <li className='list-none'><span className="font-semibold">Step 4:</span> Select tasks from you backlog that you would like to pull into this sprint, then click "Go to Next Step" button.</li>

          <li className='list-none'><span className="font-semibold">Step 5:</span> If you have any other work you would like to do, manually add tasks via the "Add Task" button.</li>
          <code>User will be redirected to register page.</code>

          <li className='list-none'><span className="font-semibold">Step 6:</span> Lastly, select any tasks that were suggested, but not chosen for this sprint, to be saved to your backlog for later work.</li>

          <li className='list-none'><span className="font-semibold">Step 7:</span> Click "Start Sprint" button.</li>
        </ol>

        <p>That's it! Sprint planning session is over and productlamb will create these tasks in your preferred product management tool. Now your team can just do their assign work as normal.</p>
      </div>
    </PLTutorial>
  )
}