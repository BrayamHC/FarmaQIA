<!-- src/modules/ventas/components/DialogCancelarVenta.vue -->
<template>
  <Dialog :visible="visible" @update:visible="onUpdateVisible" modal appendTo="body" :closable="!procesando"
    :dismissableMask="!procesando" :draggable="false" :style="{ width: 'min(30rem, 92vw)' }" :pt="{
      // reutilizamos la misma máscara y root del detalle
      mask: { class: 'venta-detalle-mask' },
      root: { class: 'venta-detalle-root farma-confirm-root' },
      header: { class: 'farma-dialog-header-shell' },
      content: { class: 'venta-detalle-content farma-dialog-content-shell' },
      closeButton: { class: 'farma-dialog-close-btn' },
      closeButtonIcon: { class: 'farma-dialog-close-icon' },
    }">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-600">
          <i class="pi pi-times-circle text-white"></i>
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-slate-900" style="font-family: var(--font-title)">
            Cancelar venta
          </h2>
          <p class="text-sm text-slate-500">
            Confirme la cancelación y devolución de esta venta.
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <p class="text-sm text-slate-600">
          ¿Deseas cancelar esta venta? Se revertirá el stock, los lotes afectados y el status
          cambiará a <strong>cancelada</strong>. Esta acción no se puede deshacer.
        </p>

        <div v-if="venta" class="mt-3 rounded-xl border border-white/70 bg-white/90 p-3">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Venta</p>
          <p class="mt-1 text-sm font-semibold text-slate-900">{{ venta.folio || 'Sin folio' }}</p>
          <p class="mt-0.5 text-xs text-slate-500">
            {{ venta?.cliente?.nombre || venta?.cliente_nombre || 'Público general' }} —
            {{ formatearMoneda(venta.total) }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-slate-200/80 pt-4">
        <button type="button" class="farma-btn-secundario" :disabled="procesando" @click="cerrar">
          Cancelar
        </button>

        <button type="button" class="farma-btn-confirmar farma-btn-danger" :disabled="procesando" @click="confirmar">
          <i v-if="procesando" class="pi pi-spin pi-spinner text-sm"></i>
          <i v-else class="pi pi-times-circle text-white"></i>
          <span>{{ procesando ? 'Procesando...' : 'Sí, cancelar venta' }}</span>
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'

const props = defineProps({
  visible: { type: Boolean, default: false },
  venta: { type: Object, default: null },
  procesando: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'confirm'])

function formatearMoneda(valor) {
  const numero = Number(valor || 0)
  return numero.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function cerrar() {
  if (props.procesando) return
  emit('update:visible', false)
}

function onUpdateVisible(value) {
  if (!value) cerrar()
}

function confirmar() {
  emit('confirm', props.venta)
}
</script>

<style scoped>
/* No metemos estilos nuevos: reutilizamos los de venta-detalle-* que ya están en DialogVentaDetalle.
   Si quieres un ajuste fino para este dialog únicamente, podríamos añadir aquí algo como: */

/*
:global(.farma-confirm-root) {
  max-width: 30rem;
}
*/
</style>
