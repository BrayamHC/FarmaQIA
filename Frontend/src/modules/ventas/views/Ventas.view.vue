<template>
  <section class="space-y-10">
    <!-- Header con breadcrumb -->
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Ventas</span>
      </nav>

      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <i class="pi pi-shopping-cart text-base text-white"></i>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
            Módulo de Ventas
          </h1>
          <p class="text-sm text-slate-500">
            Gestione ventas, pedidos y facturación de forma eficiente.
          </p>
        </div>
      </div>
    </header>

    <!-- Submódulos -->
    <section>
      <p class="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Submódulos operativos
      </p>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RouterLink v-for="sub in ventasStore.submodulos" :key="sub.titulo" :to="sub.ruta"
          class="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
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

    <!-- Ventas recientes + Acciones rápidas -->
    <section class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Tabla ventas recientes -->
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-900" style="font-family: var(--font-title)">
              Ventas recientes
            </h2>
            <p class="text-sm text-slate-500">Comprobantes emitidos en el turno actual.</p>
          </div>
          <RouterLink to="/ventas/notas-de-venta"
            class="text-xs font-medium text-blue-600 transition hover:text-blue-700">
            Ver todas →
          </RouterLink>
        </div>

        <div class="overflow-hidden rounded-xl border border-slate-100">
          <div class="ventas-scroll max-h-[300px] overflow-auto">
            <table class="w-full min-w-full text-sm">
              <thead class="sticky top-0 z-10 bg-white">
                <tr class="border-b border-slate-100">
                  <th class="pb-3 pl-4 pt-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Comprobante
                  </th>
                  <th class="px-4 pb-3 pt-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cliente
                  </th>
                  <th class="px-4 pb-3 pt-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Hora
                  </th>
                  <th
                    class="pb-3 pl-4 pr-4 pt-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Monto
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-50 bg-white">
                <tr v-for="venta in ventasStore.ventasRecientes" :key="venta.folio"
                  class="group transition hover:bg-slate-50/60">
                  <td class="py-3 pl-4 pr-4">
                    <span class="font-mono text-[13px] font-medium text-slate-700">{{ venta.folio }}</span>
                  </td>
                  <td class="px-4 py-3 text-slate-600">{{ venta.cliente }}</td>
                  <td class="px-4 py-3 text-slate-400">{{ venta.hora }}</td>
                  <td class="py-3 pl-4 pr-4 text-right font-semibold text-slate-900">{{ venta.monto }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </article>

      <!-- Acciones rápidas + Estado de caja -->
      <div class="flex flex-col gap-4">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-base font-semibold text-slate-900" style="font-family: var(--font-title)">
            Acciones rápidas
          </h2>
          <div class="flex flex-col gap-2">
            <RouterLink to="/ventas/punto-de-venta"
              class="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
              <i class="pi pi-plus-circle text-base text-slate-400"></i>
              <span>Nueva Venta</span>
            </RouterLink>

            <RouterLink to="/ventas/clientes"
              class="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
              <i class="pi pi-user-plus text-base text-slate-400"></i>
              <span>Registrar cliente</span>
            </RouterLink>

            <RouterLink to="/ventas/cajas"
              class="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
              <i class="pi pi-calculator text-base text-slate-400"></i>
              <span>Último arqueo</span>
            </RouterLink>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Estado de caja</p>
              <p class="mt-3 text-3xl font-bold text-slate-900" style="font-family: var(--font-title)">
                {{ ventasStore.estadoCaja.total }}
              </p>
              <p class="mt-1 text-xs text-slate-500">Ventas del turno</p>
            </div>

            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <i class="pi pi-wallet text-base text-blue-600"></i>
            </div>
          </div>

          <div class="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-blue-500 transition-all duration-700"
              :style="`width: ${ventasStore.estadoCaja.progreso}%`"></div>
          </div>

          <div class="mt-3 flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <p class="text-xs text-slate-500">{{ ventasStore.estadoCaja.estado }}</p>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useVentasStore } from '../ventasStore';

const ventasStore = useVentasStore();
</script>

<style scoped>
.ventas-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--color-secondary) transparent;
}

.ventas-scroll::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}

.ventas-scroll::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 9999px;
}

.ventas-scroll::-webkit-scrollbar-thumb {
  background: var(--color-secondary);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.ventas-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
  border: 2px solid transparent;
  background-clip: padding-box;
}
</style>
