// No longer need fs or path
// import { promises as fs } from 'fs';
// import path from 'path';

// --- Type Definitions ---
interface BinanceApiResponse { success: boolean; data?: { adv: { price: string } }[] }
interface DolarVzlaApiResponse { current?: { usd: number; eur: number } }
interface PriceHistoryEntry {
  timestamp: string;
  bcv: number;
  bcv_eur: number;
  binance: number;
}

// --- State Management ---
interface ExchangeRates {
  bcv: number;
  bcv_eur: number;
  binance: number;
  binancePrev: number;
  binanceDiff: number;
  binancePercent: number;
  chartData: {
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
  lastUpdated: string | null;
}

const state: ExchangeRates = {
  bcv: 0, bcv_eur: 0, binance: 0, binancePrev: 0, binanceDiff: 0, binancePercent: 0,
  chartData: { labels: [], datasets: [] },
  lastUpdated: null,
};

// --- Database (Cloudflare KV) Logic ---
const HISTORY_KEY = "price_history";
const MAX_HISTORY = 96;

// This `env` object will be provided by the Cloudflare environment
// We define a type for it to help with TypeScript
interface Env {
  DB: KVNamespace;
}

async function readHistory(env: Env): Promise<PriceHistoryEntry[]> {
  try {
    const data = await env.DB.get(HISTORY_KEY, 'json');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error reading from KV:", error);
    return [];
  }
}

async function writeHistory(env: Env, history: PriceHistoryEntry[]): Promise<void> {
  try {
    await env.DB.put(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to write price history to KV:', error);
  }
}

// --- API Fetching Logic ---
async function fetchBinanceRate(): Promise<number | null> {
  const url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
  const body = { page: 1, rows: 20, payTypes: ["Bancamiga", "Banesco", "PagoMovil"], asset: "USDT", tradeType: "BUY", fiat: "VES", merchantCheck: false };
  try {
    const res = await $fetch<BinanceApiResponse>(url, { method: 'POST', body });
    if (!res.success || !res.data?.length) return null;
    const prices = res.data.map(item => parseFloat(item.adv.price));
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  } catch (e) { console.error('Error fetching Binance:', e); return null; }
}

async function fetchBcvRates(): Promise<{ usd: number; eur: number } | null> {
  try {
    const res = await $fetch<DolarVzlaApiResponse>("https://api.dolarvzla.com/public/exchange-rate");
    return res.current ? { usd: res.current.usd, eur: res.current.eur } : null;
  } catch (e) { console.error('Error fetching BCV:', e); return null; }
}

// --- Core Logic ---
function formatHistoryForChart(history: PriceHistoryEntry[]) {
  const labels = history.map(entry => entry.timestamp);
  const bcvData = history.map(entry => entry.bcv);
  const bcvEurData = history.map(entry => entry.bcv_eur);
  const binanceData = history.map(entry => entry.binance);
  
  state.chartData = {
    labels,
    datasets: [
      { label: 'BCV-EUR', data: bcvEurData },
      { label: 'BCV', data: bcvData },
      { label: 'Binance', data: binanceData },
    ]
  };
}

// updateRates and initializeState are no longer needed here, as this logic will move to the API endpoint itself.
// We will create a new file for the cron job.

export const getRates = () => state;

// We need to define the function that will be called by the cron job
export async function updateAndStoreRates(env: Env) {
  console.log('Updating and storing rates...');
  const [binanceResult, bcvResult] = await Promise.all([fetchBinanceRate(), fetchBcvRates()]);
  const history = await readHistory(env);
  const lastEntry = history[history.length - 1] || { bcv: 0, bcv_eur: 0, binance: 0 };

  const newEntry: PriceHistoryEntry = {
    timestamp: new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas', hour12: true, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    bcv: bcvResult?.usd ?? lastEntry.bcv,
    bcv_eur: bcvResult?.eur ?? lastEntry.bcv_eur,
    binance: binanceResult ?? lastEntry.binance,
  };

  if (!binanceResult && !bcvResult) {
    console.log('All API fetches failed. Skipping update.');
    return;
  }

  history.push(newEntry);
  const trimmedHistory = history.slice(-MAX_HISTORY);
  await writeHistory(env, trimmedHistory);
  console.log('Rates updated in KV store successfully.');
}

// The API endpoint now needs to read from KV
export async function loadRatesFromStorage(env: Env) {
    const history = await readHistory(env);
    if (history.length === 0) {
        // If KV is empty, run an initial fetch
        await updateAndStoreRates(env);
        const newHistory = await readHistory(env);
        formatHistoryForChart(newHistory);
    } else {
        formatHistoryForChart(history);
    }

    const lastEntry = history[history.length - 1] || {};
    const prevEntry = history[history.length - 2] || lastEntry;

    state.bcv = lastEntry.bcv;
    state.bcv_eur = lastEntry.bcv_eur;
    state.binance = lastEntry.binance;
    state.binancePrev = prevEntry.binance;
    if (state.binancePrev > 0) {
        state.binanceDiff = state.binance - state.binancePrev;
        state.binancePercent = (state.binanceDiff / state.binancePrev) * 100;
    }
    state.lastUpdated = new Date().toISOString();
}