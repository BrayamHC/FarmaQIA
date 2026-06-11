<template>
  <section class="space-y-8">

    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold text-slate-900">Menú Principal</h1>
      <p class="text-sm text-slate-500">
        Seleccione un módulo para comenzar.
      </p>
    </header>

    <div class="mx-auto w-full max-w-[97rem] px-6 sm:px-8 xl:px-10">

      <article class="relative mt-8 overflow-hidden rounded-2xl bg-[#1e2d5a] px-8 py-7 shadow-sm sm:px-10 xl:px-12">
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div class="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/5"></div>
          <div class="absolute -bottom-6 right-20 h-32 w-32 rounded-full bg-white/5"></div>
          <div class="absolute right-52 top-3 h-16 w-16 rounded-full bg-white/5"></div>
        </div>

        <div class="relative flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div class="max-w-2xl">
            <p class="text-xs font-semibold uppercase tracking-widest text-blue-300">FarmaQ IA</p>
            <h2 class="mt-1 text-lg font-semibold" style="font-family: var(--font-title); color: #ffffff;">
              Sistema de gestión farmacéutica
            </h2>
            <p class="mt-1 text-sm text-slate-300/80">
              Gestión de inventario, ventas y operación integral de tu farmacia.
            </p>
          </div>

          <div class="mt-4 flex shrink-0 items-center gap-2 sm:mt-0">
            <span class="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Sistema activo
            </span>
          </div>
        </div>
      </article>

      <section class="mt-8 space-y-6">

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          <RouterLink v-for="modulo in homeStore.modulos" :key="modulo.titulo" :to="modulo.ruta"
            class="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <i :class="[modulo.icono, 'text-lg text-blue-600']"></i>
            </div>

            <h3 class="text-[15px] font-semibold text-slate-900" style="font-family: var(--font-title)">
              {{ modulo.titulo }}
            </h3>

            <p class="mt-2 text-sm leading-relaxed text-slate-500">
              {{ modulo.descripcion }}
            </p>

            <div class="mt-5 flex flex-wrap gap-1.5">
              <span v-for="sub in modulo.submodulos" :key="sub"
                class="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-600">
                {{ sub }}
              </span>
            </div>

            <div
              class="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 transition group-hover:bg-blue-100">
              <i class="pi pi-arrow-right text-[11px] text-slate-400 transition group-hover:text-blue-600"></i>
            </div>
          </RouterLink>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/modules/auth/authStore';
import { useHomeStore } from '../homeStore';

const authStore = useAuthStore();
const homeStore = useHomeStore();

const primerNombre = computed(() => {
  const nombre = (authStore.nombreCompleto ?? '').trim();
  return nombre ? nombre.split(/\s+/)[0] : 'Usuario';
});
</script>
