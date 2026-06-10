<template>
  <Transition name="banner-fade">
    <div v-if="store.visible" class="pointer-events-none fixed inset-x-0 top-5 z-[9999] flex justify-center px-4">
      <div class="farma-banner pointer-events-auto flex w-full max-w-lg items-center justify-between gap-4"
        :class="[`farma-banner--${store.tipo || 'info'}`]">
        <div class="flex min-w-0 items-center gap-3">
          <div class="farma-banner__icon-wrap">
            <i :class="iconClass"></i>
          </div>

          <div class="min-w-0">
            <p class="farma-banner__title">
              {{ titleText }}
            </p>
            <p class="farma-banner__subtitle">
              {{ subtitleText }}
            </p>
          </div>
        </div>

        <button type="button" class="farma-banner__close" aria-label="Cerrar notificación" @click="store.cerrar()">
          <i class="pi pi-times text-sm"></i>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from 'vue';
import { useNotificacionesStore } from '@/stores/notificaciones.store';

const store = useNotificacionesStore();

let timer = null;

const iconClass = computed(() => {
  if (store.tipo === 'error') return 'pi pi-times-circle';
  if (store.tipo === 'success') return 'pi pi-check-circle';
  if (store.tipo === 'warning') return 'pi pi-exclamation-triangle';
  return 'pi pi-info-circle';
});

const titleText = computed(() => {
  if (store.tipo === 'error') return store.mensaje || 'Ocurrió un error';
  if (store.tipo === 'success') return store.mensaje || 'Operación realizada correctamente';
  if (store.tipo === 'warning') return store.mensaje || 'Atención';
  return store.mensaje || 'Notificación del sistema';
});

const subtitleText = computed(() => {
  if (store.tipo === 'error') return 'Revisa la información e inténtalo nuevamente.';
  if (store.tipo === 'success') return 'FarmaQ IA';
  if (store.tipo === 'warning') return 'Verifica este dato antes de continuar.';
  return 'FarmaQ IA';
});

watch(
  () => store.visible,
  (visible) => {
    if (timer) clearTimeout(timer);

    if (visible) {
      timer = setTimeout(() => {
        store.cerrar();
      }, store.duracion || 3500);
    }
  }
);

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<style scoped>
.farma-banner {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.94);
  color: var(--color-text);
  border-radius: 1.25rem;
  padding: 0.85rem 0.95rem 0.85rem 0.9rem;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(14px);
}

.farma-banner__icon-wrap {
  width: 2.25rem;
  height: 2.25rem;
  min-width: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid transparent;
  background: white;
  font-size: 0.95rem;
}

.farma-banner__title {
  margin: 0;
  font-family: var(--font-title);
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--color-text);
}

.farma-banner__subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.78rem;
  line-height: 1.35;
  color: var(--color-text-secondary);
}

.farma-banner__close {
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-secondary);
  transition:
    background 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.farma-banner__close:hover {
  background: rgba(15, 23, 42, 0.05);
  color: var(--color-text);
  transform: scale(1.03);
}

.farma-banner--error {
  border-color: color-mix(in srgb, var(--color-error) 18%, white);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 247, 247, 0.98) 100%);
}

.farma-banner--error .farma-banner__icon-wrap {
  color: var(--color-error);
  border-color: color-mix(in srgb, var(--color-error) 20%, white);
  background: color-mix(in srgb, var(--color-error) 8%, white);
}

.farma-banner--success {
  border-color: color-mix(in srgb, var(--color-success) 18%, white);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(246, 255, 251, 0.98) 100%);
}

.farma-banner--success .farma-banner__icon-wrap {
  color: var(--color-success);
  border-color: color-mix(in srgb, var(--color-success) 20%, white);
  background: color-mix(in srgb, var(--color-success) 8%, white);
}

.farma-banner--warning {
  border-color: color-mix(in srgb, var(--color-warning) 18%, white);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 251, 245, 0.98) 100%);
}

.farma-banner--warning .farma-banner__icon-wrap {
  color: var(--color-warning);
  border-color: color-mix(in srgb, var(--color-warning) 22%, white);
  background: color-mix(in srgb, var(--color-warning) 10%, white);
}

.farma-banner--info .farma-banner__icon-wrap {
  color: var(--color-primary);
  border-color: color-mix(in srgb, var(--color-primary) 20%, white);
  background: color-mix(in srgb, var(--color-primary) 8%, white);
}

.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: all 180ms ease;
}

.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.985);
}
</style>
