import { updateAndStoreRates } from '../utils/rates';

interface Env {
  DB: KVNamespace;
}
// This file defines a handler for Cloudflare's Cron Triggers.
// It will be called automatically by Cloudflare on the schedule you define in their dashboard.
export default defineEventHandler(async (event) => {
  // Ensure this is only run in the correct environment
  if (event.context.cloudflare) {
    const env = event.context.cloudflare.env as Env;
    await updateAndStoreRates(env);
    return { status: 'ok' };
  }
  return { status: 'skipped', reason: 'Not in Cloudflare environment' };
});