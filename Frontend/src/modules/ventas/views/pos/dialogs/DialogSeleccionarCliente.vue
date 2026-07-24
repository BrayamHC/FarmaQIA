<!-- Frontend/src/modules/ventas/views/pos/dialogs/DialogSeleccionarCliente.vue -->
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
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
          <i class="pi pi-users text-white"></i>
        </div>

        <div>
          <h2 class="text-base font-bold text-slate-900">Seleccionar cliente</h2>
          <p class="text-xs text-slate-400">Busca o deja sin cliente (público general)</p>
        </div>
      </div>

      <button type="button"
        class="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        @click="cerrar">
        <i class="pi pi-times text-sm"></i>
      </button>
    </div>

    <div class="border-b border-slate-100 bg-white px-6 py-4">
      <div class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>

        <input ref="inputRef" v-model="busqueda" type="text" placeholder="Nombre, RFC o teléfono..."
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
          autocomplete="off" @input="onInput" />
      </div>
    </div>

    <div class="app-scroll max-h-72 divide-y divide-slate-50 overflow-y-auto bg-white">
      <div v-if="store.cargandoClientes" class="flex items-center justify-center py-10">
        <i class="pi pi-spin pi-spinner text-xl text-blue-400"></i>
      </div>

      <div v-else-if="!clientes.length" class="flex flex-col items-center justify-center py-10">
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <i class="pi pi-users text-2xl text-slate-300"></i>
        </div>

        <p class="text-sm font-medium text-slate-500">
          {{ busqueda ? 'Sin resultados para la búsqueda' : 'Escribe para buscar clientes' }}
        </p>
      </div>

      <button v-for="cliente in clientes" :key="obtenerKeyCliente(cliente)" type="button"
        class="flex w-full items-center gap-4 px-6 py-3.5 text-left transition hover:bg-blue-50/50"
        @click="seleccionar(cliente)">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
          {{ iniciales(nombreCliente(cliente)) }}
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-slate-800">
            {{ nombreCliente(cliente) }}
          </p>
          <p class="text-xs text-slate-400">
            {{ detalleSecundario(cliente) }}
          </p>
        </div>

        <i class="pi pi-chevron-right text-xs text-slate-400"></i>
      </button>
    </div>

    <div class="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
      <button type="button"
        class="flex items-center gap-2 text-sm font-medium text-rose-500 transition hover:text-rose-600"
        @click="limpiar">
        <i class="pi pi-times-circle text-xs"></i>
        Quitar cliente
      </button>

      <button type="button"
        class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        @click="cerrar">
        Cancelar
      </button>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import { usePosStore } from '../posStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'seleccionar', 'limpiar'])

const store = usePosStore()

const visible = ref(props.modelValue)
const busqueda = ref('')
const inputRef = ref(null)
let inputTimeout = null

const clientes = computed(() => {
  return Array.isArray(store.clientes) ? store.clientes : []
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

  busqueda.value = ''
  store.limpiarBusquedaClientes()

  await nextTick()
  inputRef.value?.focus()

  await store.obtenerClientesPOS({
    page: 1,
    limit: 20,
  })
})

function onInput() {
  clearTimeout(inputTimeout)
  inputTimeout = setTimeout(() => {
    buscar()
  }, 350)
}

async function buscar() {
  const q = String(busqueda.value ?? '').trim()

  if (!q) {
    await store.obtenerClientesPOS({
      page: 1,
      limit: 20,
    })
    return
  }

  await store.buscarClientesPOS(q, {
    limit: 20,
  })
}

function seleccionar(cliente) {
  emit('seleccionar', cliente)
  cerrar()
}

function limpiar() {
  emit('limpiar')
  cerrar()
}

function cerrar() {
  visible.value = false
  busqueda.value = ''
  store.limpiarBusquedaClientes()
}

function nombreCliente(cliente) {
  return (
    cliente?.nombre_completo ||
    cliente?.nombre ||
    cliente?.razon_social ||
    'Cliente'
  )
}

function detalleSecundario(cliente) {
  return (
    cliente?.rfc ||
    cliente?.telefono ||
    cliente?.correo ||
    cliente?.email ||
    'Sin datos adicionales'
  )
}

function iniciales(nombre) {
  const texto = String(nombre ?? '').trim()
  if (!texto) return 'CL'

  const partes = texto.split(/\s+/).filter(Boolean)
  return partes.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('')
}

function obtenerKeyCliente(cliente) {
  return (
    cliente?.cliente_uuid ??
    cliente?.clienteuuid ??
    cliente?.id ??
    cliente?.rfc ??
    nombreCliente(cliente)
  )
}
</script>
