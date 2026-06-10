<template>
  <div class="min-h-screen bg-slate-100">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="flex h-16 items-center justify-between px-4 sm:px-6">
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

        <div class="relative z-50 flex items-center gap-3">
          <button type="button"
            class="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50 hover:shadow-md"
            @click="togglePerfilMenu">
            <Avatar :label="inicialUsuario" shape="circle"
              class="!h-10 !w-10 !bg-sky-100 !font-semibold !text-sky-700 ring-2 ring-white" />

            <div class="hidden min-w-0 text-left sm:block">
              <p class="truncate text-sm font-semibold text-slate-800">
                {{ primerNombreUsuario }}
              </p>
            </div>

            <i :class="[
              perfilMenuOpen ? 'pi pi-chevron-up text-sky-600' : 'pi pi-chevron-down text-slate-400',
              'text-xs transition',
            ]"></i>
          </button>

          <transition name="perfil-dropdown">
            <div v-if="perfilMenuOpen"
              class="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div class="flex items-center gap-3 px-4 py-4">
                <Avatar :label="inicialUsuario" shape="circle"
                  class="!h-11 !w-11 !bg-sky-100 !font-semibold !text-sky-700" />

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
              </div>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <aside :class="[
      'fixed left-0 top-16 z-40 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'w-24',
    ]" style="height: calc(100vh - 4rem);">
      <div class="flex h-full flex-col">
        <div class="flex flex-1 flex-col">
          <div class="border-b border-slate-200 px-3 py-3">
            <div class="flex flex-col items-center gap-2">
              <RouterLink to="/dashboard" @click="sidebarOpen = false">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-medium transition"
                  :class="[
                    isActive(dashboardItem)
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ]" v-tooltip.right="tooltipOptions(dashboardItem.label)">
                  <i :class="[dashboardItem.icon, 'text-lg']"></i>
                </div>
              </RouterLink>

              <RouterLink to="/" @click="sidebarOpen = false">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-medium transition"
                  :class="[
                    isActive(homeItem)
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ]" v-tooltip.right="tooltipOptions(homeItem.label)">
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
                    :class="[
                      isActive(item)
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    ]" v-tooltip.right="tooltipOptions(item.label)">
                    <i :class="[item.icon, 'text-lg']"></i>
                  </div>
                </RouterLink>
              </li>
            </ul>
          </nav>
        </div>

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

    <div class="lg:pl-24">
      <main class="px-4 py-6 sm:px-6">
        <RouterView />
      </main>
    </div>

    <div v-if="sidebarOpen" class="fixed inset-x-0 bottom-0 top-16 z-20 bg-slate-900/30 lg:hidden"
      @click="sidebarOpen = false"></div>

    <div v-if="perfilMenuOpen" class="fixed inset-0 z-40" @click="perfilMenuOpen = false"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';

import { useAuthStore } from '@/modules/auth/authStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const sidebarOpen = ref(false);
const perfilMenuOpen = ref(false);

const dashboardItem = { label: 'Dashboard', to: '/dashboard', icon: 'pi pi-th-large' };
const homeItem = { label: 'Home', to: '/', icon: 'pi pi-home' };

const sidebarMenuItems = [
  { label: 'Compras', to: '/compras', icon: 'pi pi-shopping-cart' },
  { label: 'Ventas', to: '/ventas', icon: 'pi pi-wallet' },
  { label: 'Inventario', to: '/inventario', icon: 'pi pi-box' },
  { label: 'Proveedores', to: '/proveedores', icon: 'pi pi-truck' },
  { label: 'Administrador', to: '/administrador', icon: 'pi pi-users' },
  { label: 'Reportes', to: '/reportes', icon: 'pi pi-chart-bar' },
];

const nombreCompletoUsuario = computed(() => authStore.nombreCompleto || 'Usuario');

const primerNombreUsuario = computed(() => {
  const nombre = nombreCompletoUsuario.value.trim();
  if (!nombre) return 'Usuario';
  return nombre.split(/\s+/)[0];
});

const inicialUsuario = computed(() => {
  return primerNombreUsuario.value.charAt(0).toUpperCase();
});

function isActive(item) {
  if (item.to === '/') return route.path === '/';
  return route.path.startsWith(item.to);
}

function togglePerfilMenu() {
  perfilMenuOpen.value = !perfilMenuOpen.value;
}

async function goToProfile() {
  perfilMenuOpen.value = false;
  await router.push('/perfil');
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

async function handleLogout() {
  perfilMenuOpen.value = false;
  await authStore.logout();
  await router.push('/login');
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

.perfil-dropdown-enter-active,
.perfil-dropdown-leave-active {
  transition: all 0.18s ease;
}

.perfil-dropdown-enter-from,
.perfil-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.perfil-dropdown-enter-to,
.perfil-dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
