'use client'

import { SignInButton, SignUpButton } from "@clerk/remix";

export function PublicNavBar() {

  return (
    <div style={{border: "1px solid red"}}>
      <SignInButton />
      <SignUpButton />
    </div>
  )
}