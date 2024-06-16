import { ActionFunction } from "@remix-run/node";
import { Stripe } from "stripe";
const  stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc') as Stripe;

export const action: ActionFunction = async ({ request }) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  const sig = request.headers.get('stripe-signature');
  
  if (!sig) {
    return new Response('No signature', { status: 400 });
  }

  let event;
  
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, { status: 400 });
  }

  console.log(`Received event: ${event.id} Type: ${event.type}`);
  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      const customerSubscriptionCreated = event.data.object;
      // Then define and call a function to handle the event customer.subscription.created
      break;
    case 'customer.subscription.deleted':
      const customerSubscriptionDeleted = event.data.object;
      // Then define and call a function to handle the event customer.subscription.deleted
      break;
    case 'customer.subscription.updated':
      const customerSubscriptionUpdated = event.data.object;
      // Then define and call a function to handle the event customer.subscription.updated
      break;
    case 'invoice.payment_succeeded':
      const invoicePaymentSucceeded = event.data.object;
      // Then define and call a function to handle the event invoice.payment_succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  console.log(`Event data: ${event}`)
  // Return a 200 response to acknowledge receipt of the event
  return new Response('Webhook received');

}