<!-- Frontend/src/modules/ventas/views/pos/dialogs/DialogSeleccionarLote.vue -->
<template>
  <Dialog v-model:visible="visible" modal :dismissableMask="true" :draggable="false" :closable="false"
    :style="{ width: 'min(44rem, 96vw)' }" :pt="{
      root: { class: 'farma-dialog-root farma-pos-dialog-root' },
      mask: { class: 'farma-dialog-mask farma-pos-dialog-mask' },
      header: { style: 'display:none' },
      content: { class: 'farma-dialog-content farma-pos-dialog-content' },
    }">
    <div class="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-sm">
          <i class="pi pi-box text-white"></i>
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900">Seleccionar lote</h2>
          <p class="text-xs text-slate-400">Elige el lote para continuar con la venta</p>
        </div>
      </div>

      <button type="button"
        class="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        @click="cerrar">
        <i class="pi pi-times text-sm"></i>
      </button>
    </div>

    <div class="space-y-4 bg-white px-6 py-5">
      <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div class="flex items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200">
            <img v-if="producto?.url_imagen" :src="producto.url_imagen" :alt="producto?.nombre"
              class="h-full w-full rounded-xl object-cover" />
            <i v-else class="pi pi-box text-slate-300"></i>
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-slate-900">
              {{ producto?.nombre || 'Producto' }}
            </p>

            <div class="mt-1 flex flex-wrap items-center gap-2">
              <span class="font-mono text-[11px] text-slate-400">
                {{ producto?.sku || 'Sin SKU' }}
              </span>

              <span v-if="producto?.presentacion" class="text-[11px] text-slate-400">
                {{ producto.presentacion }}
              </span>

              <span class="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                Stock total: {{ stockDisponible }}
              </span>
            </div>
          </div>

          <div class="text-right">
            <p class="text-sm font-bold text-blue-600">
              {{ formatMoneda(precioUnitario) }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="!lotes.length"
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10">
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200">
          <i class="pi pi-inbox text-2xl text-slate-300"></i>
        </div>
        <p class="text-sm font-semibold text-slate-500">No hay lotes disponibles</p>
        <p class="mt-1 text-xs text-slate-400">Este producto requiere lote, pero actualmente no tiene existencias por
          lote.</p>
      </div>

      <div v-else class="space-y-2">
        <button v-for="lote in lotes" :key="lote.lote_uuid" type="button"
          class="w-full rounded-2xl border p-4 text-left transition" :class="loteSeleccionado?.lote_uuid === lote.lote_uuid
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50'"
          @click="seleccionarLote(lote)">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-sm font-bold text-slate-800">
                  {{ lote.codigo_lote || 'Sin clave de lote' }}
                </p>

                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  Cantidad: {{ lote.cantidad_actual }}
                </span>
              </div>

              <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>
                  Caduca:
                  <strong class="font-semibold text-slate-600">
                    {{ formatFecha(lote.fecha_caducidad) }}
                  </strong>
                </span>

                <span v-if="lote.almacen">
                  Almacén:
                  <strong class="font-semibold text-slate-600">
                    {{ lote.almacen }}
                  </strong>
                </span>
              </div>
            </div>

            <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border" :class="loteSeleccionado?.lote_uuid === lote.lote_uuid
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white text-transparent'">
              <i class="pi pi-check text-[10px]"></i>
            </div>
          </div>
        </button>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
      <button type="button"
        class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        @click="cerrar">
        Cancelar
      </button>

      <button type="button" :disabled="!loteSeleccionado"
        class="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        @click="confirmar">
        <i class="pi pi-check mr-2 text-xs"></i>
        Confirmar lote
      </button>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import { useVentasStore } from '../../../ventasStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  producto: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'confirmar'])

const store = useVentasStore()

const visible = ref(props.modelValue)
const loteSeleccionado = ref(null)

watch(
  () => props.modelValue,
  (v) => {
    visible.value = v
  },
)

watch(visible, (v) => {
  emit('update:modelValue', v)

  if (v) {
    loteSeleccionado.value = lotes.value.length === 1 ? lotes.value[0] : null
  }
})

watch(
  () => props.producto,
  () => {
    loteSeleccionado.value = lotes.value.length === 1 ? lotes.value[0] : null
  },
  { deep: true },
)

const lotes = computed(() => {
  if (!props.producto) return []
  return store.normalizarLotes(props.producto)
})

const stockDisponible = computed(() => {
  if (!props.producto) return 0
  return store.obtenerStockDisponibleProducto(props.producto)
})

const precioUnitario = computed(() => {
  if (!props.producto) return 0
  return store.obtenerPrecioUnitario(props.producto)
})

function seleccionarLote(lote) {
  loteSeleccionado.value = lote
}

function confirmar() {
  if (!loteSeleccionado.value || !props.producto) return

  emit('confirmar', {
    producto: props.producto,
    lote: loteSeleccionado.value,
  })

  cerrar()
}

function cerrar() {
  visible.value = false
}

function formatMoneda(valor) {
  return Number(valor ?? 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}

function formatFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  return new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
</script>
