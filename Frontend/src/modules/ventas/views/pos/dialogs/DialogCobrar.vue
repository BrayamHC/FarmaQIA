<!-- Frontend/src/modules/ventas/views/pos/dialogs/DialogCobrar.vue -->
<template>
  <Dialog v-model:visible="visible" modal :dismissableMask="true" :draggable="false" :closable="false"
    :style="{ width: 'min(36rem, 96vw)' }" :pt="{
      root: { class: 'farma-dialog-root farma-pos-dialog-root' },
      mask: { class: 'farma-dialog-mask farma-pos-dialog-mask' },
      header: { style: 'display:none' },
      content: { class: 'farma-dialog-content farma-pos-dialog-content' },
    }">
    <div class="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
          <i class="pi pi-credit-card text-white"></i>
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900">Cobrar venta</h2>
          <p class="text-xs text-slate-400">Selecciona método de pago</p>
        </div>
      </div>

      <button type="button"
        class="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        @click="cerrar">
        <i class="pi pi-times text-sm"></i>
      </button>
    </div>

    <div class="space-y-5 bg-white px-6 py-5">
      <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Resumen</p>

        <div class="space-y-1.5 text-sm">
          <div class="flex justify-between text-slate-600">
            <span>Cliente</span>
            <span class="font-medium text-slate-800">{{ nombreCliente }}</span>
          </div>

          <div class="flex justify-between text-slate-600">
            <span>Artículos</span>
            <span class="font-medium text-slate-800">{{ totalArticulos }}</span>
          </div>

          <div class="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span class="font-medium text-slate-800">{{ formatMoneda(subtotal) }}</span>
          </div>

          <div class="mt-2 flex justify-between border-t border-dashed border-slate-200 pt-2">
            <span class="font-bold text-slate-900">Total</span>
            <span class="text-xl font-extrabold text-blue-600">{{ formatMoneda(total) }}</span>
          </div>
        </div>
      </div>

      <div>
        <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Método de pago</p>

        <div class="grid grid-cols-3 gap-2">
          <button v-for="m in metodosPago" :key="m.value" type="button"
            class="flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition" :class="metodoPago === m.value
              ? 'border-blue-400 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40'"
            @click="metodoPago = m.value">
            <i :class="[m.icon, 'text-xl']"></i>
            <span class="text-xs font-semibold">{{ m.label }}</span>
          </button>
        </div>
      </div>

      <div v-if="metodoPago === 'efectivo'">
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Monto recibido</label>

        <input ref="montoInputRef" v-model.number="montoRecibido" type="number" min="0" step="0.01"
          class="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
          placeholder="$0.00" />

        <div v-if="montoRecibido >= total"
          class="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-2.5">
          <span class="text-sm text-emerald-700">Cambio</span>
          <span class="text-base font-extrabold text-emerald-700">
            {{ formatMoneda(cambio) }}
          </span>
        </div>

        <p v-else class="mt-2 text-xs font-medium text-rose-500">
          El monto recibido debe cubrir el total.
        </p>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
      <button type="button"
        class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        @click="cerrar">
        Cancelar
      </button>

      <button type="button" :disabled="!puedeConfirmar"
        class="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        @click="confirmar">
        <i class="pi pi-check mr-2 text-xs"></i>
        Confirmar cobro
      </button>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  carrito: {
    type: Array,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  totalArticulos: {
    type: Number,
    default: 0,
  },
  cliente: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'confirmar'])

const visible = ref(props.modelValue)
const metodoPago = ref('efectivo')
const montoRecibido = ref(0)
const montoInputRef = ref(null)

const metodosPago = [
  { value: 'efectivo', label: 'Efectivo', icon: 'pi pi-wallet' },
  { value: 'tarjeta', label: 'Tarjeta', icon: 'pi pi-credit-card' },
  { value: 'transferencia', label: 'Transferencia', icon: 'pi pi-send' },
]

watch(
  () => props.modelValue,
  (v) => {
    visible.value = v
  },
)

watch(visible, async (v) => {
  emit('update:modelValue', v)

  if (v) {
    metodoPago.value = 'efectivo'
    montoRecibido.value = Number(props.total ?? 0)

    await nextTick()
    montoInputRef.value?.focus?.()
    montoInputRef.value?.select?.()
  }
})

const nombreCliente = computed(() => {
  return (
    props.cliente?.nombre_completo ||
    props.cliente?.nombre ||
    props.cliente?.razon_social ||
    'Público en general'
  )
})

const cambio = computed(() => {
  return Number(montoRecibido.value ?? 0) - Number(props.total ?? 0)
})

const puedeConfirmar = computed(() => {
  if (!props.carrito?.length) return false
  if (!metodoPago.value) return false

  if (metodoPago.value === 'efectivo') {
    return Number(montoRecibido.value ?? 0) >= Number(props.total ?? 0)
  }

  return true
})

function confirmar() {
  if (!puedeConfirmar.value) return

  emit('confirmar', {
    metodo_pago: metodoPago.value,
    monto_recibido: metodoPago.value === 'efectivo' ? Number(montoRecibido.value ?? 0) : Number(props.total ?? 0),
    cambio: metodoPago.value === 'efectivo' ? Number(cambio.value ?? 0) : 0,
    total: Number(props.total ?? 0),
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
</script>
