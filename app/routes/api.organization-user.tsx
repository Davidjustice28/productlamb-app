import { LoaderFunction, redirect } from "@remix-run/node";
import { createClerkClient } from "@clerk/remix/api.server";
import { getAuth } from "@clerk/remix/ssr.server";

// export default function Welcome() {
//   const { userId } = useAuth();
//   const [searchParams] = useSearchParams();
//   const organizationId = searchParams.get("organizationId");

//   useEffect(() => {
//     async function assignUserToOrganization() {
//       await fetch("/api/assign-organization", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ userId, organizationId }),
//       });
//     }

//     assignUserToOrganization();
//   }, [userId, organizationId]);

//   return <div>Welcome to the organization!</div>;
// }


export let loader: LoaderFunction = async (args) => {
  const request = args.request;
  const url = new URL(request.url);
  const organization_id = url.searchParams.get("organizationId");
  if (!organization_id) {
    return redirect("/")
  }
  const {userId} = await getAuth(args)
  if (!userId) return redirect("/")
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY!})

  try {
    // Add the user to the organization
    await clerkClient.organizations.createOrganizationMembership({
      userId: userId,
      organizationId: organization_id,
      role: 'org:member'
    })
    console.log('user added to organization')
    return redirect("/portal/dashboard")
  } catch (error) {
    console.error('error occurred while add member to organization', error)
    return redirect("/");
  }
};