<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <!-- Header -->
    <header class="flex flex-col gap-3">
      <nav v-if="breadcrumbs?.length" class="flex items-center gap-1.5 text-xs text-slate-400">
        <template v-for="(item, index) in breadcrumbs" :key="`${item.label}-${index}`">
          <RouterLink v-if="item.to && index < breadcrumbs.length - 1" :to="item.to"
            class="transition hover:text-slate-600">
            {{ item.label }}
          </RouterLink>

          <span v-else :class="index === breadcrumbs.length - 1 ? 'font-medium text-blue-600' : ''">
            {{ item.label }}
          </span>

          <i v-if="index < breadcrumbs.length - 1" class="pi pi-chevron-right text-[10px]"></i>
        </template>
      </nav>

      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i :class="icon" class="text-base text-white"></i>
          </div>

          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              {{ title }}
            </h1>
            <p class="text-sm text-slate-500">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <slot name="header-actions" />
      </div>
    </header>

    <!-- Filtros -->
    <div class="card-soft farma-gestor-filtros rounded-2xl px-5 py-4">
      <div class="farma-gestor-filtros-grid">
        <div class="farma-gestor-filtro-busqueda">
          <slot name="filtro-busqueda" />
        </div>

        <div class="farma-gestor-filtro-card">
          <slot name="filtro-fecha-inicio" />
        </div>

        <div class="farma-gestor-filtro-card">
          <slot name="filtro-fecha-fin" />
        </div>

        <slot name="filtros-extra" />
      </div>

      <slot name="filtros-activos" />
    </div>

    <slot />
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'pi pi-box',
  },
  breadcrumbs: {
    type: Array,
    default: () => [],
  },
});
</script>
