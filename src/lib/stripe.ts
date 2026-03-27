import Stripe from 'stripe';

/**
 * Stripe instance initialized with secret key for server-side operations
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});
