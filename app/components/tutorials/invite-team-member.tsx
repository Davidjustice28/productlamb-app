import { PLTutorial } from "./tutorial";

export function InviteTeamMemberTutorial() {
  return (
    <PLTutorial title="Provide a team member access to portal">
      <div className="flex flex-col gap-6">
        <p>Plan on providing access to a few team members? Here's a quick guide to get your team onboarding in minutes.</p>

        <ol className='list-inside flex flex-col gap-4'>
          <li className='list-none'><span className="font-semibold">Step 1:</span> Log in with your admin account.</li>
          <code>Currently only the account creator has admin access. Admin access is required to invite users.</code>
          
          <li className='list-none'><span className="font-semibold">Step 2:</span> Click on team tab in sidebar.</li>

          <li className='list-none'><span className="font-semibold">Step 3:</span> Click on mail icon in top right corner.</li>

          <li className='list-none'><span className="font-semibold">Step 4:</span> Enter email address address of team member.</li>
          <code>Feature will be disabled if you have 4 invitations out. Only 5 members can have access to portal at this time.</code>

          <li className='list-none'><span className="font-semibold">Step 5:</span> 5. User checks inbox for email form productlamb and clicks the link provided.</li>
          <code>User will be redirected to register page.</code>

          <li className='list-none'><span className="font-semibold">Step 6:</span> Enter information and password. Then click submit button.</li>

          <li className='list-none'><span className="font-semibold">Step 7:</span> Log into account using your credentials.</li>
        </ol>

        <p>User is now registered and has access to the portal.</p>
      </div>
    </PLTutorial>
  )
}