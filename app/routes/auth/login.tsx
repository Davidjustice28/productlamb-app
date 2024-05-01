import { SignIn } from "@clerk/remix";

export default function WaitlistPage() {
  return (
    <div>
      <SignIn path="/auth/login" forceRedirectUrl={'/portal/dashboard'} afterSignOutUrl={'/'}/>
    </div>
  );
}
