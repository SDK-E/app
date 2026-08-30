import "server-only";
import { getServerEnv } from "@platform/env";
import Stripe from "stripe";

let _stripe: null | Stripe = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getServerEnv().STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver);
  },
});
