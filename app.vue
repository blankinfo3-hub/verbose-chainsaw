<template>
  <div class="min-h-screen w-full p-0 md:p-8 font-sans antialiased flex items-center justify-center">
    <div class="max-w-7xl mx-auto w-full">

      <!-- ===================================================== -->
      <!-- MOBILE & TABLET VIEW (Single Card) -->
      <!-- ===================================================== -->
      <div class="lg:hidden">
        <main class="p-4">
          <GlassCard>
            <div class="text-center">

              <!-- Header -->
              <header class="mb-8">
                <h1 class="text-4xl font-bold text-gray-100">paralelo.us</h1>
                <p class="text-lg text-gray-400 mt-2">
                  El dólar paralelo en Venezuela, en tiempo real.
                </p>
              </header>

              <!-- Main Rate Display -->
              <section class="mb-8" v-if="rates">
                <p class="text-gray-500 text-sm">Tasa de Referencia (Binance)</p>
                <p class="text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-green-400 my-1">
                  {{ rates.binance.toFixed(2) }}
                </p>
                <p v-if="rates.binancePrev > 0" class="text-sm" :class="rateChangeColor">
                  {{ rateChangeSign }}{{ Math.abs(rates.binanceDiff).toFixed(2) }} ({{ rates.binancePrev.toFixed(2) }} → {{ rates.binance.toFixed(2) }})
                </p>
              </section>

              <!-- Separator -->
              <div class="w-full h-px bg-green-400/20 my-8"></div>
              
              <!-- Rates List -->
              <section v-if="rates" class="mb-8 text-left">
                <h2 class="text-2xl font-semibold mb-4 text-center text-gray-200">Otras Tasas</h2>
                <ul class="space-y-3">
                  <li v-for="(rate, key) in displayRates" :key="key" class="flex justify-between items-center border-b border-green-400/10 pb-3">
                    <span class="font-semibold uppercase text-gray-400">{{ key.replace('_', '-') }}</span>
                    <span class="font-mono text-gray-200 text-lg">{{ rate.toFixed(2) }} Bs</span>
                  </li>
                </ul>
              </section>

              <!-- Separator -->
              <div class="w-full h-px bg-green-400/20 my-8"></div>

              <!-- Calculator -->
              <section v-if="rates" class="mb-8 text-left">
                <h2 class="text-2xl font-semibold mb-4 text-center text-gray-200">Calculadora</h2>
                <div class="space-y-4">
                  <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div>
                      <label class="block text-sm font-medium text-gray-400 mb-1">{{ sourceCurrencyLabel }}</label>
                      <input v-model.number="sourceAmount" type="number" min="1" class="w-full bg-gray-900/50 border border-green-400/20 rounded-lg py-2 px-3 text-white focus:ring-green-400">
                    </div>
                    <div class="mt-6">
                      <button @click="swapConversion" class="p-2 rounded-full hover:bg-green-400/20 transition-colors">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                      </button>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-400 mb-1">{{ targetCurrencyLabel }}</label>
                      <div class="w-full bg-black/40 border border-gray-800 rounded-lg py-2 px-3 text-white font-mono text-lg h-[42px] flex items-center justify-center">
                        {{ targetAmount.toFixed(2) }}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Tasa</label>
                    <select v-model="selectedRateKey" class="w-full bg-gray-900/50 border border-green-400/20 rounded-lg py-2 px-3 text-white focus:ring-green-400 appearance-none bg-no-repeat bg-right pr-8">
                        <option v-for="(rate, key) in displayRates" :key="key" :value="key">{{ key.replace('_', '-').toUpperCase() }}</option>
                    </select>
                  </div>
                </div>
              </section>
              
              <!-- Separator -->
              <div class="w-full h-px bg-green-400/20 my-8"></div>

              <!-- Chart -->
              <section v-if="rates?.chartData" class="text-left">
                <h2 class="text-2xl font-semibold mb-4 text-center text-gray-200">Historial de Precios</h2>
                <div class="h-48">
                  <PriceChart :chartData="rates.chartData" />
                </div>
              </section>

            </div>
          </GlassCard>
        </main>
      </div>

      <!-- ===================================================== -->
      <!-- DESKTOP VIEW (Multi-Card Grid) -->
      <!-- ===================================================== -->
      <div class="hidden lg:block">
        
        <!-- Header Card -->
        <header class="mb-8">
          <GlassCard>
            <div class="text-center">
              <h1 class="text-5xl font-bold text-gray-100">paralelo.us</h1>
              <p class="text-lg text-gray-400 mt-2">
                El dólar paralelo en Venezuela, en tiempo real.
              </p>
            </div>
          </GlassCard>
        </header>

        <!-- Main Content Grid -->
        <main class="grid grid-cols-2 gap-8">
          
          <!-- Left Column -->
          <div class="flex flex-col gap-8">
            <!-- Main Rate Card -->
            <GlassCard>
              <section v-if="rates" class="flex flex-col justify-center items-center text-center h-full">
                <h2 class="text-2xl font-semibold mb-4 text-gray-200">
                  Tasa de Referencia (Binance)
                </h2>
                <p class="text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-green-400 my-4">
                  {{ rates.binance.toFixed(2) }}
                </p>
                <p v-if="rates.binancePrev > 0" class="text-base" :class="rateChangeColor">
                  {{ rateChangeSign }}{{ Math.abs(rates.binanceDiff).toFixed(2) }} ({{ rates.binancePrev.toFixed(2) }} → {{ rates.binance.toFixed(2) }})
                </p>
              </section>
            </GlassCard>

            <!-- Calculator Card -->
            <GlassCard>
              <section v-if="rates" class="text-left h-full">
                <h2 class="text-2xl font-semibold mb-6 text-center text-gray-200">Calculadora</h2>
                <div class="space-y-4">
                  <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-400 mb-1">{{ sourceCurrencyLabel }}</label>
                      <input v-model.number="sourceAmount" type="number" min="1" class="w-full bg-gray-900/50 border border-green-400/20 rounded-lg py-2 px-3 text-white">
                    </div>
                    <div class="mt-6">
                      <button @click="swapConversion" class="p-2 rounded-full hover:bg-green-400/20">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                      </button>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-400 mb-1">{{ targetCurrencyLabel }}</label>
                      <div class="w-full bg-black/40 border border-gray-800 rounded-lg py-2 px-3 text-white font-mono text-lg h-[42px] flex items-center justify-center">
                        {{ targetAmount.toFixed(2) }}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Tasa</label>
                    <select v-model="selectedRateKey" class="w-full bg-gray-900/50 border border-green-400/20 rounded-lg py-2 px-3 text-white appearance-none bg-no-repeat bg-right pr-8">
                        <option v-for="(rate, key) in displayRates" :key="key" :value="key">{{ key.replace('_', '-').toUpperCase() }}</option>
                    </select>
                  </div>
                </div>
              </section>
            </GlassCard>
          </div>

          <!-- Right Column -->
          <div class="flex flex-col gap-8">
            <!-- Rates List Card -->
            <GlassCard>
              <section v-if="rates" class="text-left h-full">
                <h2 class="text-2xl font-semibold mb-6 text-center text-gray-200">Otras Tasas</h2>
                <ul class="space-y-4">
                  <li v-for="(rate, key) in displayRates" :key="key" class="flex justify-between items-center border-b border-green-400/10 pb-3">
                    <span class="font-semibold uppercase text-gray-400">{{ key.replace('_', '-') }}</span>
                    <span class="font-mono text-gray-200 text-xl">{{ rate.toFixed(2) }} Bs</span>
                  </li>
                </ul>
              </section>
            </GlassCard>

            <!-- Chart Card -->
            <GlassCard>
              <section v-if="rates?.chartData" class="text-left h-full flex flex-col">
                <h2 class="text-2xl font-semibold mb-6 text-center text-gray-200">Historial de Precios</h2>
                <div class="flex-grow min-h-[250px]">
                  <PriceChart :chartData="rates.chartData" />
                </div>
              </section>
            </GlassCard>
          </div>

        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import GlassCard from '~/components/GlassCard.vue';
import PriceChart from '~/components/PriceChart.vue';
import { ref, computed, watch } from 'vue';

// Fetch data from our server API
const { data: rates, error } = await useFetch('/api/rates');

// --- Calculator Logic ---
const sourceAmount = ref(1);
const selectedRateKey = ref('bcv');
const conversionDirection = ref('usdToBs');

watch(sourceAmount, (newValue) => {
  if (newValue < 1) sourceAmount.value = 1;
});

// Price Change Logic
const rateChangeSign = computed(() => (!rates.value || rates.value.binanceDiff >= 0 ? '+ ' : '- '));
const rateChangeColor = computed(() => {
  if (!rates.value || rates.value.binanceDiff === 0) return 'text-gray-500';
  return rates.value.binanceDiff > 0 ? 'text-green-500' : 'text-red-500';
});

const displayRates = computed(() => {
  if (!rates.value) return {};
  return {
    bcv: rates.value.bcv,
    bcv_eur: rates.value.bcv_eur,
    binance: rates.value.binance,
  };
});

const sourceCurrencyLabel = computed(() => (conversionDirection.value === 'usdToBs' ? 'Monto en USD' : 'Monto en Bs'));
const targetCurrencyLabel = computed(() => (conversionDirection.value === 'usdToBs' ? 'Equivalente en Bs' : 'Equivalente en USD'));

const targetAmount = computed(() => {
  if (!rates.value || !selectedRateKey.value || sourceAmount.value < 1) return 0;
  const rate = displayRates.value[selectedRateKey.value];
  if (rate === 0) return 0;
  return conversionDirection.value === 'usdToBs' ? sourceAmount.value * rate : sourceAmount.value / rate;
});

const swapConversion = () => {
  const currentTarget = targetAmount.value;
  conversionDirection.value = conversionDirection.value === 'usdToBs' ? 'bsToUsd' : 'usdToBs';
  sourceAmount.value = parseFloat(currentTarget.toFixed(2));
};

</script>