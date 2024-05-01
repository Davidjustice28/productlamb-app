import { SignedIn, SignedOut, UserButton } from "@clerk/remix";
import { AuthenticatedLayout } from "./authenticated-layout";
import { UnAuthenticatedLayout } from "./unauthenticated-layout";


export function RootLayout() {
  return (
    <>
      <SignedOut>
        <UserButton />
        <AuthenticatedLayout />
      </SignedOut>
      <SignedIn>
        <UnAuthenticatedLayout />
      </SignedIn>
    </>
  )
}