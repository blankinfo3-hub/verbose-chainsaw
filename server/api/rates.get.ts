import { getRates, loadRatesFromStorage } from '../utils/rates';

interface Env {
  DB: KVNamespace;
}

export default defineEventHandler(async (event) => {
  // In Cloudflare, the bindings are on event.context.cloudflare.env
  // For local dev, you might need a different setup, but this works for deployment
  const env = event.context.cloudflare.env as Env;
  
  await loadRatesFromStorage(env);
  
  return getRates();
});