import { SignUp } from '@clerk/remix';

export default function RegisterPage() {
  return (
    <div
      style={{display: 'flex', justifyContent: 'center', margin: '60px auto'}}
    >
      <SignUp path='/auth/register' forceRedirectUrl="/auth/onboarding"/>
    </div>
  )
}