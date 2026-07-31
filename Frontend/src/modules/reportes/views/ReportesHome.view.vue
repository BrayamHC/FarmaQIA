<template>
  <section class="space-y-10">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Reportes</span>
      </nav>

      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <i class="pi pi-chart-bar text-base text-white"></i>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
            Módulo de Reportes
          </h1>
          <p class="text-sm text-slate-500">
            Consulte información operativa y exporte reportes en PDF o Excel.
          </p>
        </div>
      </div>
    </header>

    <section>
      <p class="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Secciones disponibles
      </p>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RouterLink v-for="sub in reportesStore.submodulos" :key="sub.titulo" :to="sub.ruta"
          class="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
          <div
            class="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 transition group-hover:bg-blue-100">
            <i class="pi pi-arrow-right text-[11px] text-slate-400 transition group-hover:text-blue-600"></i>
          </div>

          <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <i :class="[sub.icono, 'text-lg text-blue-600']"></i>
          </div>

          <h3 class="text-[15px] font-semibold text-slate-900" style="font-family: var(--font-title)">
            {{ sub.titulo }}
          </h3>

          <p class="mt-1.5 text-sm leading-relaxed text-slate-500">
            {{ sub.descripcion }}
          </p>

          <div class="mt-4 flex flex-wrap gap-1.5">
            <span v-for="tag in sub.tags" :key="tag"
              class="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-600">
              {{ tag }}
            </span>
          </div>
        </RouterLink>
      </div>
    </section>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useReportesStore } from '../reportesStore';

const reportesStore = useReportesStore();
</script>
