<template>
  <div class="relative min-h-screen overflow-hidden bg-white">
    <FarmaCanvasBackground class="pointer-events-none absolute inset-0 z-0" />

    <div
      class="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.10),transparent_28%)]">
    </div>
    <div class="absolute inset-0 z-[1] farma-grid-bg opacity-50"></div>

    <div class="relative z-10 grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
      <!-- Card izquierda -->
      <section class="flex items-start justify-center px-5 py-8 sm:px-8 lg:px-12 lg:pt-40">
        <div class="w-full max-w-md">
          <div
            class="rounded-[2rem] border border-white/70 bg-white/88 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-10">
            <div class="mb-8 flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-sm">
                <i class="pi pi-heart-fill text-sm"></i>
              </div>

              <div>
                <p class="app-logo-title">FarmaQ IA</p>
                <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Sistema farmacéutico inteligente
                </p>
              </div>
            </div>

            <div class="mb-8">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-sky-600">
                Acceso seguro
              </p>

              <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[2rem]"
                style="font-family: var(--font-title);">
                Iniciar Sesión
              </h2>

              <p class="mt-3 text-sm leading-6 text-slate-500">
                Sistema Inteligente de Gestión Farmacéutica
              </p>
            </div>

            <form class="space-y-5" @submit.prevent="handleLogin">
              <div class="space-y-2">
                <label for="email" class="input-label">Correo electrónico</label>
                <div
                  class="rounded-2xl border border-slate-200 bg-slate-50/80 px-1 py-1 transition-all duration-200 focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.10)]">
                  <InputText id="email" v-model.trim="form.email" type="email"
                    class="w-full !border-0 !bg-transparent !shadow-none" size="large" autocomplete="email"
                    :disabled="authStore.cargando" placeholder="usuario@farmaq.com" />
                </div>
              </div>

              <div class="space-y-2">
                <label for="password" class="input-label">Contraseña</label>
                <div
                  class="rounded-2xl border border-slate-200 bg-slate-50/80 px-1 py-1 transition-all duration-200 focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.10)]">
                  <Password inputId="password" v-model="form.password" class="w-full farma-password" fluid size="large"
                    :feedback="false" toggleMask :disabled="authStore.cargando" placeholder="••••••••"
                    :inputProps="{ autocomplete: 'current-password', class: 'w-full' }" />
                </div>
              </div>

              <div class="flex justify-center">
                <Button type="submit" :label="authStore.cargando ? 'Validando...' : 'Iniciar Sesión'"
                  :icon="authStore.cargando ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'" class="farma-login-btn"
                  size="large" :loading="authStore.cargando" :disabled="authStore.cargando" />
              </div>
            </form>

            <div class="mt-8 border-t border-slate-100 pt-5 text-center">
              <p class="text-xs text-slate-400">
                © {{ year }} FarmaQ IA — Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Info derecha -->
      <section class="hidden items-start px-24 py-12 lg:flex lg:pt-40 xl:px-32">
        <div class="max-w-xl">
          <div
            class="mb-10 inline-flex items-center gap-3 rounded-2xl border border-sky-100 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-md">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <i class="pi pi-heart-fill text-sm"></i>
            </div>
            <div>
              <p class="app-logo-title">FarmaQ IA</p>
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Sistema farmacéutico inteligente
              </p>
            </div>
          </div>

          <h1 class="text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-900 xl:text-6xl"
            style="font-family: var(--font-title);">
            Gestión farmacéutica moderna, clara y confiable.
          </h1>

          <p class="mt-6 max-w-lg text-base leading-8 text-slate-500">
            Inventario, ventas, compras, lotes y reportes en una sola plataforma impulsada por Inteligencia Artificial.
          </p>

          <div class="mt-10 flex flex-wrap gap-3">
            <span
              class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-4 py-2 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur-sm">
              <i class="pi pi-box text-xs"></i> Inventario inteligente
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
              <i class="pi pi-chart-bar text-xs"></i> Reportes en tiempo real
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur-sm">
              <i class="pi pi-sparkles text-xs"></i> Asistente IA
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

import { useAuthStore } from '../authStore';
import { useNotificacionesStore } from '@/stores/notificaciones.store';
import FarmaCanvasBackground from '@/components/FarmaCanvasBackground.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notificacionesStore = useNotificacionesStore();

const form = reactive({ email: '', password: '' });
const year = computed(() => new Date().getFullYear());

async function handleLogin() {
  // Evita múltiples clics o submits simultáneos
  if (authStore.cargando) return;

  if (!form.email?.trim() || !form.password?.trim()) {
    notificacionesStore.warning(
      'Por favor completa todos los campos.'
    );
    return;
  }

  const resultado = await authStore.login({
    email: form.email.trim(),
    password: form.password,
  });

  if (!resultado.exito) {
    notificacionesStore.error(
      resultado.error ||
      'Credenciales inválidas. Intenta nuevamente.'
    );
    return;
  }

  notificacionesStore.success('Bienvenido al sistema.');

  await router.push(
    route.query.redirect || '/dashboard'
  );
}
</script>

<style scoped>
:deep(.farma-password.p-password) {
  width: 100%;
  position: relative;
}

:deep(.farma-password .p-password-input) {
  width: 100%;
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  padding-right: 3.65rem !important;
}

:deep(.farma-password .p-password-toggle-mask-icon),
:deep(.farma-password .p-inputicon) {
  position: absolute !important;
  top: 50% !important;
  right: 0.85rem !important;
  transform: translateY(-50%) !important;
  color: #64748b !important;
  z-index: 2;
}

:deep(.farma-password .p-password-toggle-mask-icon) {
  display: flex !important;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.9);
  transition:
    background 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

:deep(.farma-password .p-password-toggle-mask-icon:hover) {
  background: rgba(241, 245, 249, 1);
  color: #334155 !important;
}

:deep(.p-inputtext) {
  color: var(--color-text);
}

:deep(.p-inputtext::placeholder) {
  color: #94a3b8;
}

.farma-login-btn {
  border: none !important;
  border-radius: 1rem !important;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: #fff !important;
  padding-top: 0.95rem !important;
  padding-bottom: 0.95rem !important;
  box-shadow: 0 14px 30px rgba(59, 130, 246, 0.28);
  min-width: 220px;
  transition:
    transform 180ms ease,
    box-shadow 220ms ease,
    filter 220ms ease;
}

.farma-login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(59, 130, 246, 0.34);
  filter: brightness(1.02);
}

.farma-login-btn:active {
  transform: translateY(0);
  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.24);
}

:deep(.farma-login-btn .p-button-label) {
  margin-left: 0.5rem;
}

:deep(.farma-login-btn .p-button-icon) {
  transition: transform 180ms ease;
}

.farma-login-btn:hover :deep(.p-button-icon) {
  transform: translateX(2px);
}
</style>
