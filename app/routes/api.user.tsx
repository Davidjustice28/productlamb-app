import { ActionFunction, json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { AccountsClient } from "~/backend/database/accounts/client";

export const action: ActionFunction = async ({ request }) => {
  const client = AccountsClient(new PrismaClient().account)
  const body: ClerkUserCreateResponse = await request.json();
  const result = await client.createAccount(body.data.id, "free")
  if (result.errors.length > 0) return json({ success: false, error: result.errors });
  return json({ success: true, errors: []});
}

export interface ClerkUserCreateResponse {
  data: {
    birthday: string,
    created_at: number,
    email_adresses: [
      {
        "email_address": string,
        "id": string,
        "linked_to": Array<any>,
        "object": string,
        "verification": {
          "status": string,
          "strategy": string
        }
      }
    ],
    external_accounts?: Array<any>,
    external_id: string,
    "first_name": string,
    "gender": string,
    "id": string,
    "image_url": string,
    "last_name": string,
    "last_sign_in_at": number,
    "object": string,
    "password_enabled": boolean,
    "phone_numbers"?: Array<any>,
    "primary_email_address_id": string,
    "primary_phone_number_id": string|null,
    "primary_web3_wallet_id": string|null,
    "private_metadata": any,
    "profile_image_url": string,
    "public_metadata": any,
    "two_factor_enabled": boolean,
    "unsafe_metadata": any,
    "updated_at": number,
    "username": string|null,
    "web3_wallets"?: Array<any>
  },
  "object": string,
  "type": string | "user.created"
}