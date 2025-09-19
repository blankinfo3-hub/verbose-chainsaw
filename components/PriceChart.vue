<template>
  <div>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  }
});

const colorMapping = {
  'BCV-EUR': '#38bdf8', // sky-400
  Binance: '#4ade80',    // green-400
  BCV: '#facc15',        // yellow-400
};

const chartData = computed(() => ({
  labels: props.chartData.labels,
  datasets: props.chartData.datasets.map(dataset => ({
    ...dataset,
    backgroundColor: colorMapping[dataset.label] || '#a0aec0',
    borderColor: colorMapping[dataset.label] || '#a0aec0',
    tension: 0.01, // Reduced from 0.4 for sharper lines
    pointRadius: 0,
    pointHoverRadius: 6,
    pointHitRadius: 10,
    pointBorderColor: 'white',
    pointHoverBorderWidth: 2,
  })),
}));

const chartOptions = computed(() => {
  // Calculate a stable Y-axis range
  const allData = props.chartData.datasets.flatMap(ds => ds.data).filter(val => val > 0);
  let suggestedMin = 150;
  let suggestedMax = 300;

  if (allData.length > 0) {
    const dataMin = Math.min(...allData);
    const dataMax = Math.max(...allData);
    const midPoint = (dataMax + dataMin) / 2;
    
    // Create a fixed window of 60 units around the midpoint
    suggestedMin = Math.floor(midPoint - 30);
    suggestedMax = Math.ceil(midPoint + 30);
  }
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1f2937', // gray-800
        titleColor: '#e5e7eb', // gray-200
        bodyColor: '#d1d5db', // gray-300
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            // Use the full timestamp for the tooltip title
            return context[0].label;
          },
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          // Hide the labels on the x-axis by default
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#a0aec0', // gray-400
        },
        position: 'right',
        // Set the calculated min and max for a stable scale
        suggestedMin: suggestedMin,
        suggestedMax: suggestedMax,
      },
    },
  };
});
</script>