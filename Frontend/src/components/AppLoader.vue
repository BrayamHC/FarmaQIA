<template>
  <Transition name="loader-fade">
    <div v-if="visible" class="fixed inset-0 z-[9999] flex items-center justify-center"
      style="background: rgba(248, 250, 252, 0.82); backdrop-filter: blur(4px);" aria-live="polite"
      aria-label="Cargando">
      <div class="flex flex-col items-center gap-5">

        <!-- Cruz animada (ícono de farmacia) -->
        <div class="relative flex h-16 w-16 items-center justify-center">
          <!-- Pulso de fondo -->
          <span class="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-blue-100 opacity-60"></span>

          <!-- Cruz -->
          <div
            class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
            <!-- Barra vertical -->
            <span class="absolute h-8 w-2.5 rounded-full bg-blue-500"></span>
            <!-- Barra horizontal -->
            <span class="absolute h-2.5 w-8 rounded-full bg-blue-500"></span>
          </div>
        </div>

        <!-- Texto + puntos animados -->
        <div class="flex flex-col items-center gap-1.5">
          <p class="text-sm font-semibold text-slate-700" style="font-family: var(--font-title)">
            {{ mensaje }}
          </p>

          <!-- Dots -->
          <div class="flex items-center gap-1.5">
            <span v-for="i in 3" :key="i" class="h-1.5 w-1.5 rounded-full bg-blue-400"
              :style="`animation: loader-dot 1.2s ease-in-out ${(i - 1) * 0.2}s infinite`"></span>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  mensaje: {
    type: String,
    default: 'Cargando',
  },
});
</script>

<style scoped>
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.2s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}

@keyframes loader-dot {

  0%,
  80%,
  100% {
    opacity: 0.25;
    transform: scale(0.85);
  }

  40% {
    opacity: 1;
    transform: scale(1.15);
  }
}
</style>
