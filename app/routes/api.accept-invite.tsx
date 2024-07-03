import { SignUp } from '@clerk/clerk-react';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunction, json, redirect } from '@remix-run/node';
import { verifyInviteToken } from '~/utils/jwt';


export let loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return redirect("/")
  }

  const payload = verifyInviteToken(token) as { email: string; organizationId: string } | null;
  if (!payload) {
    return redirect("/invalid-invite");
  }

  return json({ email: payload.email, organizationId: payload.organizationId });
};

export default function AcceptInvite() {
  const { email } = useLoaderData() as { email: string; organizationId: string }

  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp
        path="/api/accept-invite"
        signInUrl="/sign-in"
        initialValues={{emailAddress: email}}
        forceRedirectUrl={`/portal/dashboard`}
      />
    </div>
  );
}
