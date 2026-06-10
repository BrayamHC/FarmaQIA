<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p class="text-sm text-slate-500">
        Bienvenido,
        <span class="font-medium text-slate-700">
          {{ authStore.nombreCompleto || 'Usuario' }}
        </span>
        — resumen general de la operación.
      </p>
    </header>

    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="item in dashboardStore.metricas" :key="item.titulo"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-500">{{ item.titulo }}</p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">{{ item.valor }}</p>
            <p class="mt-2 text-xs font-medium text-emerald-600">{{ item.cambio }}</p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl" :class="iconBgClass(item.color)">
            <i :class="[item.icono, iconTextClass(item.color), 'text-lg']"></i>
          </div>
        </div>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Ventas -->
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Ventas</h2>
            <p class="text-sm text-slate-500">Comportamiento de ventas de la semana.</p>
          </div>

          <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Actualizado hoy
          </span>
        </div>

        <div class="h-[320px]">
          <Chart type="line" :data="ventasChartData" :options="lineChartOptions" class="h-full w-full" />
        </div>
      </article>

      <!-- Inventario por categoría -->
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5">
          <h2 class="text-lg font-semibold text-slate-900">Inventario</h2>
          <p class="text-sm text-slate-500">Distribución por categoría.</p>
        </div>

        <div class="h-[320px]">
          <Chart type="doughnut" :data="inventarioChartData" :options="doughnutChartOptions" class="h-full w-full" />
        </div>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Caducidades -->
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Caducidades próximas</h2>
            <p class="text-sm text-slate-500">Medicamentos que requieren atención prioritaria.</p>
          </div>

          <span class="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
            FEFO activo
          </span>
        </div>

        <div class="h-[320px]">
          <Chart type="bar" :data="caducidadesChartData" :options="barChartOptions" class="h-full w-full" />
        </div>
      </article>

      <!-- Accesos rápidos -->
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Accesos rápidos</h2>
        <p class="mt-1 text-sm text-slate-500">Navegación directa a módulos clave.</p>

        <div class="mt-5 space-y-3">
          <RouterLink v-for="accion in dashboardStore.accesosRapidos" :key="accion.titulo" :to="accion.ruta"
            class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
            <div class="flex items-center gap-3">
              <i :class="[accion.icono, 'text-base']"></i>
              <span class="font-medium">{{ accion.titulo }}</span>
            </div>
            <i class="pi pi-arrow-right text-xs"></i>
          </RouterLink>
        </div>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Movimiento de inventario -->
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Movimiento de inventario</h2>
            <p class="text-sm text-slate-500">Entradas y salidas registradas por día.</p>
          </div>

          <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Operación semanal
          </span>
        </div>

        <div class="h-[320px]">
          <Chart type="bar" :data="movimientosChartData" :options="stackedBarOptions" class="h-full w-full" />
        </div>
      </article>

      <!-- Actividad reciente -->
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5">
          <h2 class="text-lg font-semibold text-slate-900">Actividad reciente</h2>
          <p class="text-sm text-slate-500">Eventos recientes del sistema.</p>
        </div>

        <div class="space-y-3">
          <div v-for="evento in dashboardStore.actividadReciente" :key="evento.titulo"
            class="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
              <i :class="[evento.icono, 'text-sm']"></i>
            </div>

            <div>
              <p class="text-sm font-medium text-slate-800">{{ evento.titulo }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ evento.detalle }}</p>
            </div>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/modules/auth/authStore';
import { useDashboardStore } from '../dashboardStore';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const commonChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#475569',
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#ffffff',
      bodyColor: '#e2e8f0',
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
    },
  },
}));

const lineChartOptions = computed(() => ({
  ...commonChartOptions.value,
  plugins: {
    ...commonChartOptions.value.plugins,
    legend: {
      display: true,
      labels: {
        color: '#475569',
        usePointStyle: true,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#e2e8f0',
      },
      ticks: {
        color: '#64748b',
      },
    },
  },
}));

const barChartOptions = computed(() => ({
  ...commonChartOptions.value,
  plugins: {
    ...commonChartOptions.value.plugins,
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#e2e8f0',
      },
      ticks: {
        color: '#64748b',
      },
    },
  },
}));

const stackedBarOptions = computed(() => ({
  ...commonChartOptions.value,
  scales: {
    x: {
      stacked: false,
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#e2e8f0',
      },
      ticks: {
        color: '#64748b',
      },
    },
  },
}));

const doughnutChartOptions = computed(() => ({
  ...commonChartOptions.value,
  cutout: '68%',
  plugins: {
    ...commonChartOptions.value.plugins,
    legend: {
      position: 'bottom',
      labels: {
        color: '#475569',
        usePointStyle: true,
        padding: 16,
      },
    },
  },
}));

const ventasChartData = computed(() => ({
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'Ventas',
      data: [12500, 14800, 13600, 17200, 19400, 22100, 20800],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.14)',
      fill: true,
      tension: 0.38,
      pointBackgroundColor: '#3B82F6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
    },
  ],
}));

const inventarioChartData = computed(() => ({
  labels: ['Analgésicos', 'Antibióticos', 'Vitaminas', 'Dermatológicos', 'Otros'],
  datasets: [
    {
      data: [320, 210, 180, 140, 90],
      backgroundColor: [
        '#1D4ED8', // blue-700 — el más oscuro/saturado
        '#3B82F6', // blue-500 — tu --color-primary
        '#60A5FA', // blue-400 — tu --color-secondary
        '#93C5FD', // blue-300 — tono claro
        '#BFDBFE', // blue-200 — el más claro
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 6,
    },
  ],
}));

const caducidadesChartData = computed(() => ({
  labels: ['7 días', '15 días', '30 días', '60 días', '90 días'],
  datasets: [
    {
      label: 'Productos por caducar',
      data: [12, 18, 27, 39, 54],
      backgroundColor: ['#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
      borderRadius: 10,
      maxBarThickness: 42,
    },
  ],
}));

const movimientosChartData = computed(() => ({
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'Entradas',
      data: [42, 38, 51, 47, 56, 34, 29],
      backgroundColor: '#3B82F6',
      borderRadius: 8,
      maxBarThickness: 28,
    },
    {
      label: 'Salidas',
      data: [31, 29, 36, 41, 44, 33, 26],
      backgroundColor: '#93C5FD',
      borderRadius: 8,
      maxBarThickness: 28,
    },
  ],
}));

function iconBgClass(color) {
  const map = {
    emerald: 'bg-emerald-100',
    blue: 'bg-blue-100',
    amber: 'bg-amber-100',
    rose: 'bg-rose-100',
  };

  return map[color] || 'bg-slate-100';
}

function iconTextClass(color) {
  const map = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
  };

  return map[color] || 'text-slate-600';
}
</script>
