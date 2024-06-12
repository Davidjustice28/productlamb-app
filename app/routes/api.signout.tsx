import { ActionFunction, redirect } from "@remix-run/node";
import { account } from "~/backend/cookies/account";

export const action: ActionFunction = async ({ request }) => {
  const cookies = request.headers.get("Cookie")
  const accountCookie = await account.parse(cookies)
  return redirect('/', {
    // clear account cookie when logged out
    headers: {
      "Set-Cookie": 'account=; Max-Age=0; Path=/;'
    }
  })
}