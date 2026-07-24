<!-- Frontend/src/modules/ventas/views/pos/dialogs/DialogBuscarProducto.vue -->
<template>
  <Dialog v-model:visible="visible" modal :dismissableMask="true" :draggable="false" :closable="false"
    :style="{ width: 'min(52rem, 96vw)' }" :pt="{
      root: { class: 'farma-dialog-root farma-pos-dialog-root' },
      mask: { class: 'farma-dialog-mask farma-pos-dialog-mask' },
      header: { style: 'display:none' },
      content: { class: 'farma-dialog-content farma-pos-dialog-content' },
    }">
    <div class="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
          <i class="pi pi-search text-white"></i>
        </div>

        <div>
          <h2 class="text-base font-bold text-slate-900">Buscar producto</h2>
          <p class="text-xs text-slate-400">
            <template v-if="store.almacenSeleccionado">
              Mostrando existencias de {{ store.almacenSeleccionado.nombre }}
            </template>
            <template v-else>
              Busca por nombre, SKU o UPC
            </template>
          </p>
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

        <input ref="inputRef" v-model="busqueda" type="text" placeholder="SKU, UPC o nombre del producto..."
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
          autocomplete="off" @input="onInput" @keydown.enter.prevent="buscar" />
      </div>

      <div class="mt-3 flex flex-wrap gap-2">
        <span class="text-xs font-medium text-slate-400">Filtros:</span>

        <button v-for="f in filtrosRapidos" :key="f.value" type="button"
          class="rounded-full border px-3 py-1 text-xs font-medium transition" :class="filtroActivo === f.value
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600'
            " @click="onCambiarFiltro(f.value)">
          {{ f.label }}
        </button>
      </div>

      <div v-if="!store.almacenSeleccionado"
        class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
        Selecciona un almacén para ver únicamente las existencias disponibles en él.
      </div>

      <div v-if="mensajeError"
        class="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
        {{ mensajeError }}
      </div>
    </div>

    <div class="app-scroll max-h-[380px] overflow-y-auto bg-white">
      <div v-if="store.cargandoProductos" class="flex items-center justify-center py-12">
        <i class="pi pi-spin pi-spinner text-2xl text-blue-400"></i>
      </div>

      <div v-else-if="!productos.length" class="flex flex-col items-center justify-center py-12">
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <i class="pi pi-box text-2xl text-slate-300"></i>
        </div>

        <p class="text-sm font-medium text-slate-500">
          {{ mensajeSinResultados }}
        </p>
      </div>

      <div v-else class="divide-y divide-slate-50">
        <button v-for="producto in productos" :key="producto.producto_uuid ?? producto.productouuid" type="button"
          class="flex w-full items-center gap-4 px-6 py-3.5 text-left transition hover:bg-blue-50/50"
          @click="seleccionar(producto)">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img v-if="producto.url_imagen" :src="producto.url_imagen" :alt="producto.nombre"
              class="h-full w-full object-cover" />
            <i v-else class="pi pi-box text-slate-300"></i>
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-800">{{ producto.nombre }}</p>

            <div class="mt-0.5 flex flex-wrap items-center gap-2">
              <span class="font-mono text-[11px] text-slate-400">{{ producto.sku || 'Sin SKU' }}</span>

              <span v-if="producto.presentacion" class="text-[11px] text-slate-400">
                {{ producto.presentacion }}
              </span>

              <span v-if="producto.categoria" class="text-[11px] text-slate-400">
                {{ producto.categoria }}
              </span>

              <span v-if="producto.con_lote || producto.conlote"
                class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Con lote
              </span>
            </div>
          </div>

          <div class="shrink-0 text-right">
            <p class="text-sm font-bold text-slate-800">
              {{ obtenerStock(producto) }}
            </p>
            <p class="text-[10px] text-slate-400">en stock</p>
          </div>

          <div class="shrink-0 text-right">
            <p class="text-sm font-bold text-blue-600">
              {{ formatMoneda(producto.precio_venta ?? producto.precioventa ?? producto.precio_publico ??
                producto.preciopublico) }}
            </p>
          </div>

          <i class="pi pi-plus shrink-0 text-xs text-blue-400"></i>
        </button>
      </div>
    </div>

    <div
      class="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs text-slate-400">
        {{ store.totalProductos }} resultado(s)
        <span v-if="store.totalProductos">
          · Página {{ store.pageProductos }} de {{ store.totalPaginasProductos }}
        </span>
      </p>

      <div class="flex items-center justify-end gap-2">
        <select :value="store.limitProductos" :disabled="store.cargandoProductos"
          class="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 disabled:opacity-50"
          @change="onCambiarLimite($event.target.value)">
          <option :value="15">15 por página</option>
          <option :value="20">20 por página</option>
          <option :value="30">30 por página</option>
          <option :value="50">50 por página</option>
        </select>

        <button type="button" :disabled="store.cargandoProductos || store.pageProductos <= 1"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          @click="cambiarPagina(store.pageProductos - 1)">
          <i class="pi pi-chevron-left text-xs"></i>
        </button>

        <span class="min-w-16 text-center text-xs font-semibold text-slate-600">
          {{ store.pageProductos }} / {{ store.totalPaginasProductos }}
        </span>

        <button type="button" :disabled="store.cargandoProductos || store.pageProductos >= store.totalPaginasProductos"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          @click="cambiarPagina(store.pageProductos + 1)">
          <i class="pi pi-chevron-right text-xs"></i>
        </button>

        <button type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          @click="cerrar">
          Cerrar
        </button>
      </div>
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
  terminoInicial: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'seleccionar'])

const store = usePosStore()

const visible = ref(props.modelValue)
const busqueda = ref('')
const inputRef = ref(null)
const filtroActivo = ref('todos')
const mensajeError = ref('')
let inputTimeout = null

const filtrosRapidos = [
  { label: 'Todos', value: 'todos' },
  { label: 'Con lote', value: 'con_lote' },
]

// Usamos el listado ya filtrado por el store: si hay un almacén seleccionado,
// sólo trae productos que traen lotes con stock EN ESE ALMACÉN. Así nunca se
// puede seleccionar un producto cuyo lote pertenece a otro almacén.
const productos = computed(() => store.productosDisponiblesVenta)

const mensajeSinResultados = computed(() => {
  if (!busqueda.value) {
    return store.almacenSeleccionado
      ? 'No hay productos con existencias en este almacén'
      : 'No hay productos disponibles'
  }
  return store.almacenSeleccionado
    ? 'Sin resultados con existencias en este almacén'
    : 'Sin resultados para tu búsqueda'
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

  busqueda.value = String(props.terminoInicial ?? '').trim()
  filtroActivo.value = 'todos'
  mensajeError.value = ''
  store.limpiarBusquedaProductos()

  await nextTick()
  inputRef.value?.focus()

  if (busqueda.value) {
    await buscar()
  } else {
    await store.obtenerProductosPOS({
      page: 1,
      limit: store.limitProductos,
      status: 'activo',
    })
  }
})

watch(
  () => props.terminoInicial,
  async (valor) => {
    if (!visible.value) return

    busqueda.value = String(valor ?? '').trim()

    if (busqueda.value) {
      await buscar()
    } else {
      await store.obtenerProductosPOS({
        page: 1,
        limit: store.limitProductos,
        status: 'activo',
        conlote: filtroActivo.value === 'con_lote' ? true : undefined,
      })
    }
  },
)

function limpiarMensajeError() {
  mensajeError.value = ''
}

function onInput() {
  limpiarMensajeError()
  clearTimeout(inputTimeout)
  inputTimeout = setTimeout(() => {
    buscar()
  }, 350)
}

async function onCambiarFiltro(valor) {
  limpiarMensajeError()
  filtroActivo.value = valor
  await buscar()
}

async function buscar() {
  limpiarMensajeError()

  const q = String(busqueda.value ?? '').trim()
  const conlote = filtroActivo.value === 'con_lote' ? true : undefined

  if (!q) {
    await store.obtenerProductosPOS({
      page: 1,
      limit: store.limitProductos,
      status: 'activo',
      conlote,
    })
    return
  }

  await store.buscarProductosPOS(q, {
    limit: store.limitProductos,
    status: 'activo',
    conlote,
  })
}

async function cambiarPagina(nuevaPagina) {
  limpiarMensajeError()
  await store.cambiarPaginaProductos(nuevaPagina)
}

async function onCambiarLimite(nuevoLimite) {
  limpiarMensajeError()
  await store.cambiarLimiteProductos(Number(nuevoLimite))
}

function obtenerStock(producto) {
  return store.obtenerStockDisponibleProducto(producto)
}

function tieneStock(producto) {
  return obtenerStock(producto) > 0
}

function seleccionar(producto) {
  limpiarMensajeError()

  if (!tieneStock(producto)) {
    mensajeError.value = `"${producto.nombre}" no tiene existencias disponibles en este almacén y no puede agregarse a la venta.`
    return
  }

  emit('seleccionar', producto)
  cerrar()
}

function cerrar() {
  visible.value = false
  busqueda.value = ''
  filtroActivo.value = 'todos'
  mensajeError.value = ''
  store.limpiarBusquedaProductos()
}
function formatMoneda(valor) {
  return Number(valor ?? 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}
</script>