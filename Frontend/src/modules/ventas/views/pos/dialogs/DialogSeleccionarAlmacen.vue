<!-- Frontend/src/modules/ventas/views/pos/dialogs/DialogSeleccionarAlmacen.vue -->
<template>
  <Dialog v-model:visible="visible" modal :dismissableMask="true" :draggable="false" :closable="false"
    :style="{ width: 'min(42rem, 96vw)' }" :pt="{
      root: { class: 'farma-dialog-root farma-pos-dialog-root' },
      mask: { class: 'farma-dialog-mask farma-pos-dialog-mask' },
      header: { style: 'display:none' },
      content: { class: 'farma-dialog-content farma-pos-dialog-content' },
    }">
    <div class="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200/70">
          <i class="pi pi-building text-sm text-white"></i>
        </div>

        <div>
          <h2 class="text-base font-bold text-slate-900">Seleccionar almacén</h2>
          <p class="text-xs text-slate-400">Elige el almacén activo para esta venta</p>
        </div>
      </div>

      <button type="button"
        class="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        @click="cerrar">
        <i class="pi pi-times text-sm"></i>
      </button>
    </div>

    <div class="space-y-4 bg-white px-6 py-5">
      <div v-if="store.cargandoAlmacenes" class="flex items-center justify-center py-12">
        <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
      </div>

      <div v-else-if="!almacenes.length"
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10">
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <i class="pi pi-inbox text-2xl text-slate-300"></i>
        </div>

        <p class="text-sm font-semibold text-slate-500">No hay almacenes disponibles</p>
        <p class="mt-1 text-xs text-slate-400">Debes cargar la lista de almacenes para operar el POS.</p>
      </div>

      <div v-else class="space-y-2">
        <button v-for="almacen in almacenes" :key="obtenerKeyAlmacen(almacen)" type="button"
          class="w-full rounded-2xl border p-4 text-left transition" :class="esAlmacenSeleccionado(almacen)
              ? 'border-blue-300 bg-blue-50'
              : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
            " @click="seleccionar(almacen)">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="truncate text-sm font-bold text-slate-800">
                  {{ almacen.nombre || 'Almacén sin nombre' }}
                </p>

                <span v-if="esAlmacenActivoStore(almacen)"
                  class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Activo
                </span>
              </div>

              <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span v-if="almacen.clave" class="font-mono">{{ almacen.clave }}</span>

                <span v-if="almacen.sucursal?.nombre">
                  Sucursal:
                  <strong class="font-semibold text-slate-600">{{ almacen.sucursal.nombre }}</strong>
                </span>

                <span v-if="obtenerIdAlmacen(almacen)" class="text-slate-300">
                  · ID {{ obtenerIdAlmacen(almacen) }}
                </span>
              </div>
            </div>

            <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border" :class="esAlmacenSeleccionado(almacen)
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-slate-300 bg-white text-transparent'
              ">
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

      <button type="button" :disabled="!almacenSeleccionadoLocal"
        class="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        @click="confirmar">
        <i class="pi pi-check mr-2 text-xs"></i>
        Confirmar almacén
      </button>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import { usePosStore } from '../posStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  producto: {
    type: Object,
    default: null,
  },
  lote: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'confirmar'])

const store = usePosStore()

const visible = ref(props.modelValue)
const almacenSeleccionadoLocal = ref(null)

const almacenes = computed(() => {
  return Array.isArray(store.almacenesPOS) ? store.almacenesPOS : []
})

watch(
  () => props.modelValue,
  (v) => {
    visible.value = v
  },
)

watch(visible, async (v) => {
  emit('update:modelValue', v)

  if (!v) return

  if (!Array.isArray(store.almacenesPOS) || !store.almacenesPOS.length) {
    await store.obtenerAlmacenesPOS({
      page: 1,
      limit: 100,
      status: 'activo',
    })
  }

  almacenSeleccionadoLocal.value = store.almacenSeleccionado
    ? store.normalizarAlmacen(store.almacenSeleccionado)
    : null
})

function obtenerKeyAlmacen(almacen) {
  return (
    almacen?.almacenuuid ??
    almacen?.almacen_uuid ??
    almacen?.almacenid ??
    almacen?.almacen_id ??
    almacen?.id ??
    almacen?.clave ??
    'almacen-sin-key'
  )
}

function obtenerUuidAlmacen(almacen) {
  return almacen?.almacenuuid ?? almacen?.almacen_uuid ?? almacen?.uuid ?? null
}

function obtenerIdAlmacen(almacen) {
  const id = Number(
    almacen?.almacenid ??
    almacen?.almacen_id ??
    almacen?.id ??
    0,
  )

  return Number.isInteger(id) && id > 0 ? id : null
}

function esMismoAlmacen(a, b) {
  if (!a || !b) return false

  const uuidA = obtenerUuidAlmacen(a)
  const uuidB = obtenerUuidAlmacen(b)

  if (uuidA && uuidB) {
    return uuidA === uuidB
  }

  const idA = obtenerIdAlmacen(a)
  const idB = obtenerIdAlmacen(b)

  if (idA && idB) {
    return idA === idB
  }

  return false
}

function esAlmacenSeleccionado(almacen) {
  return esMismoAlmacen(almacenSeleccionadoLocal.value, almacen)
}

function esAlmacenActivoStore(almacen) {
  return esMismoAlmacen(store.almacenSeleccionado, almacen)
}

function seleccionar(almacen) {
  almacenSeleccionadoLocal.value = store.normalizarAlmacen(almacen)
}

function confirmar() {
  if (!almacenSeleccionadoLocal.value) return

  emit('confirmar', {
    producto: props.producto ?? null,
    lote: props.lote ?? null,
    almacen: almacenSeleccionadoLocal.value,
  })

  cerrar()
}

function cerrar() {
  visible.value = false
}
</script>
