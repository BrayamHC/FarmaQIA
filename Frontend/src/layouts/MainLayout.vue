<template>
  <div class="min-h-screen bg-slate-100">
    <!-- ── Header ──────────────────────────────────────────────────── -->
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="flex h-16 items-center justify-between px-4 sm:px-6">
        <!-- Izquierda -->
        <div class="flex items-center gap-3">
          <button type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
            @click="sidebarOpen = !sidebarOpen">
            <i class="pi pi-bars"></i>
          </button>

          <div>
            <h1 class="text-base font-semibold text-slate-900">FarmaQ IA</h1>
            <p class="text-xs text-slate-500">Administración inteligente de farmacia</p>
          </div>
        </div>

        <!-- Derecha -->
        <div class="flex items-center gap-3">
          <!-- Selector sucursal -->
          <div class="relative" ref="sucursalRef">
            <button type="button"
              class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-700"
              @click="toggleSucursalMenu">
              <i class="pi pi-building text-sm text-slate-400"></i>
              <span class="hidden max-w-[120px] truncate sm:block">
                {{ authStore.sucursalActiva?.nombre ?? 'Sucursal' }}
              </span>
              <i :class="[
                sucursalMenuOpen
                  ? 'pi pi-chevron-up text-sky-600'
                  : 'pi pi-chevron-down text-slate-400',
                'text-xs transition',
              ]" />
            </button>

            <transition name="dropdown">
              <div v-if="sucursalMenuOpen"
                class="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <p
                  class="border-b border-slate-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Sucursales
                </p>

                <ul class="px-2 py-2">
                  <li v-for="s in authStore.sucursalesPermitidas" :key="s.sucursal_uuid">
                    <button type="button" :disabled="sucursalCambiandoUuid !== null"
                      class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition disabled:cursor-not-allowed"
                      :class="authStore.sucursalActiva?.sucursal_uuid === s.sucursal_uuid
                          ? 'bg-sky-50 font-semibold text-sky-700'
                          : 'text-slate-700 hover:bg-slate-50'
                        " @click="seleccionarSucursal(s)">
                      <!-- Icono edificio -->
                      <i class="pi pi-building text-xs shrink-0" :class="authStore.sucursalActiva?.sucursal_uuid === s.sucursal_uuid
                          ? 'text-sky-500'
                          : 'text-slate-400'
                        " />

                      <!-- Nombre -->
                      <span class="flex-1 truncate">{{ s.nombre }}</span>

                      <!-- Estado: loader solo en la que se está cambiando -->
                      <template v-if="sucursalCambiandoUuid === s.sucursal_uuid">
                        <i class="pi pi-spin pi-spinner ml-auto text-xs text-sky-400 shrink-0" />
                      </template>

                      <!-- Palomita solo en la activa (y no cargando) -->
                      <template v-else-if="
                        authStore.sucursalActiva?.sucursal_uuid === s.sucursal_uuid &&
                        sucursalCambiandoUuid === null
                      ">
                        <i class="pi pi-check ml-auto text-xs text-sky-500 shrink-0" />
                      </template>
                    </button>
                  </li>
                </ul>
              </div>
            </transition>
          </div>

          <!-- Usuario -->
          <div class="relative" ref="perfilRef">
            <button type="button"
              class="flex items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-3 transition hover:bg-slate-100"
              @click="togglePerfilMenu">
              <Avatar :label="inicialUsuario" shape="circle"
                class="!h-9 !w-9 !bg-sky-100 !font-semibold !text-sky-700 ring-2 ring-white" />

              <div class="hidden min-w-0 text-left sm:block">
                <p class="truncate text-sm font-semibold leading-tight text-slate-800">
                  {{ primerNombreUsuario }}
                </p>
                <p class="truncate text-[11px] leading-tight text-slate-400">
                  {{ authStore.rolNombre || 'Sistema' }}
                </p>
              </div>

              <i :class="[
                perfilMenuOpen
                  ? 'pi pi-chevron-up text-sky-600'
                  : 'pi pi-chevron-down text-slate-400',
                'text-xs transition',
              ]" />
            </button>

            <transition name="dropdown">
              <div v-if="perfilMenuOpen"
                class="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div class="flex items-center gap-3 px-4 py-4">
                  <Avatar :label="inicialUsuario" shape="circle"
                    class="!h-11 !w-11 !bg-sky-100 !font-semibold !text-sky-700 shrink-0" />
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-900">
                      {{ authStore.nombreCompleto || 'Usuario' }}
                    </p>
                    <p class="truncate text-xs text-slate-500">
                      {{ authStore.rolNombre || 'Sistema' }}
                    </p>
                  </div>
                </div>

                <div class="border-t border-slate-100 px-2 py-2">
                  <button type="button"
                    class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                    @click="goToProfile">
                    <i class="pi pi-user text-sm"></i>
                    <span>Ver perfil</span>
                  </button>

                  <button type="button"
                    class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    @click="handleLogout">
                    <i class="pi pi-sign-out text-sm"></i>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <!-- ── Sidebar ─────────────────────────────────────────────────── -->
    <aside :class="[
      'fixed left-0 top-16 z-40 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'w-24',
    ]" style="height: calc(100vh - 4rem)">
      <div class="flex h-full flex-col">
        <div class="border-b border-slate-200 px-3 py-3">
          <div class="flex flex-col items-center gap-2">
            <RouterLink :to="dashboardItem.to" @click="sidebarOpen = false">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-medium transition" :class="isActive(dashboardItem)
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                " v-tooltip.right="tooltipOptions(dashboardItem.label)">
                <i :class="[dashboardItem.icon, 'text-lg']"></i>
              </div>
            </RouterLink>

            <RouterLink :to="homeItem.to" @click="sidebarOpen = false">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-medium transition" :class="isActive(homeItem)
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                " v-tooltip.right="tooltipOptions(homeItem.label)">
                <i :class="[homeItem.icon, 'text-lg']"></i>
              </div>
            </RouterLink>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-5">
          <ul class="flex flex-col items-center gap-2">
            <li v-for="item in sidebarMenuItems" :key="item.to">
              <RouterLink :to="item.to" @click="sidebarOpen = false">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-medium transition"
                  :class="isActive(item)
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    " v-tooltip.right="tooltipOptions(item.label)">
                  <i :class="[item.icon, 'text-lg']"></i>
                </div>
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="border-t border-slate-200 bg-white px-3 py-4">
          <div class="flex flex-col items-center gap-2">
            <Button type="button" icon="pi pi-cog" severity="secondary" text aria-label="Configuración"
              class="!h-12 !w-12" v-tooltip.right="tooltipOptions('Configuración')"
              @click="router.push('/configuracion')" />
            <Button icon="pi pi-sign-out" severity="secondary" outlined aria-label="Cerrar sesión" class="!h-12 !w-12"
              v-tooltip.right="tooltipOptions('Cerrar sesión')" @click="handleLogout" />
          </div>
        </div>
      </div>
    </aside>

    <!-- ── Contenido principal ─────────────────────────────────────── -->
    <div class="lg:pl-24">
      <main class="px-4 py-6 sm:px-6">
        <RouterView />
      </main>
    </div>

    <!-- Overlay móvil sidebar -->
    <div v-if="sidebarOpen" class="fixed inset-x-0 bottom-0 top-16 z-[35] bg-slate-900/30 lg:hidden"
      @click="sidebarOpen = false" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import { useAuthStore } from '@/modules/auth/authStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// ── Estado UI ────────────────────────────────────────────────────────
const sidebarOpen = ref(false);
const perfilMenuOpen = ref(false);
const sucursalMenuOpen = ref(false);

/**
 * UUID de la sucursal que está siendo procesada.
 * null  → ninguna cargando.
 * <uuid> → solo esa fila muestra spinner.
 */
const sucursalCambiandoUuid = ref(null);

// ── Refs para onClickOutside ─────────────────────────────────────────
const sucursalRef = ref(null);
const perfilRef = ref(null);

onClickOutside(sucursalRef, () => { sucursalMenuOpen.value = false; });
onClickOutside(perfilRef, () => { perfilMenuOpen.value = false; });

// ── Menú items ───────────────────────────────────────────────────────
const dashboardItem = { label: 'Dashboard', to: '/dashboard', icon: 'pi pi-th-large' };
const homeItem = { label: 'Inicio', to: '/home', icon: 'pi pi-home' };

const sidebarMenuItems = [
  { label: 'Ventas', to: '/ventas', icon: 'pi pi-shopping-cart' },
  { label: 'Compras', to: '/compras', icon: 'pi pi-wallet' },
  { label: 'Inventario', to: '/inventario', icon: 'pi pi-box' },
  { label: 'Reportes', to: '/reportes', icon: 'pi pi-chart-bar' },
  { label: 'Usuarios', to: '/usuarios', icon: 'pi pi-users' },
];

// ── Computeds ────────────────────────────────────────────────────────
const primerNombreUsuario = computed(() => {
  const nombre = (authStore.nombreCompleto ?? '').trim();
  return nombre ? nombre.split(/\s+/)[0] : 'Usuario';
});

const inicialUsuario = computed(() =>
  primerNombreUsuario.value.charAt(0).toUpperCase()
);

// ── Acciones ─────────────────────────────────────────────────────────
async function seleccionarSucursal(sucursal) {
  // Ya es la activa → solo cierra
  if (authStore.sucursalActiva?.sucursal_uuid === sucursal.sucursal_uuid) {
    sucursalMenuOpen.value = false;
    return;
  }

  // Alguna otra sucursal ya está cambiando → ignorar
  if (sucursalCambiandoUuid.value !== null) return;

  try {
    sucursalCambiandoUuid.value = sucursal.sucursal_uuid; // solo esta fila carga
    await authStore.cambiarSucursal(sucursal.sucursal_uuid);
    sucursalMenuOpen.value = false;
  } catch (error) {
    console.error('Error al cambiar sucursal:', error);
  } finally {
    sucursalCambiandoUuid.value = null;
  }
}

function isActive(item) {
  if (item.to === '/home') return route.path === '/home';
  return route.path.startsWith(item.to);
}

function togglePerfilMenu() {
  sucursalMenuOpen.value = false;
  perfilMenuOpen.value = !perfilMenuOpen.value;
}

function toggleSucursalMenu() {
  perfilMenuOpen.value = false;
  sucursalMenuOpen.value = !sucursalMenuOpen.value;
}

async function goToProfile() {
  perfilMenuOpen.value = false;
  await router.push('/perfil');
}

async function handleLogout() {
  perfilMenuOpen.value = false;
  sucursalMenuOpen.value = false;
  await authStore.logout();
  await router.push('/login');
}

function tooltipOptions(label) {
  return {
    value: label,
    pt: {
      text: '!bg-blue-500 !text-white !font-medium !text-xs !px-3 !py-2 !rounded-xl !shadow-lg',
      arrow: {
        style: {
          borderRightColor: '#3B82F6',
          borderLeftColor: '#3B82F6',
          borderTopColor: '#3B82F6',
          borderBottomColor: '#3B82F6',
        },
      },
    },
  };
}
</script>

<style scoped>
nav::-webkit-scrollbar {
  width: 8px;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.35);
  border-radius: 9999px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.18s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
