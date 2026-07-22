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
          <p class="text-xs text-slate-400">Busca por nombre, SKU o UPC</p>
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
            : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600'"
          @click="onCambiarFiltro(f.value)">
          {{ f.label }}
        </button>
      </div>
    </div>

    <div class="app-scroll max-h-[380px] overflow-y-auto bg-white">
      <div v-if="store.cargandoProductos" class="flex items-center justify-center py-12">
        <i class="pi pi-spin pi-spinner text-2xl text-blue-400"></i>
      </div>

      <div v-else-if="!store.productos.length" class="flex flex-col items-center justify-center py-12">
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <i class="pi pi-box text-2xl text-slate-300"></i>
        </div>
        <p class="text-sm font-medium text-slate-500">
          {{ busqueda ? 'Sin resultados para tu búsqueda' : 'No hay productos disponibles' }}
        </p>
      </div>

      <div v-else class="divide-y divide-slate-50">
        <button v-for="producto in store.productos" :key="producto.producto_uuid" type="button"
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

              <span v-if="producto.con_lote"
                class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Con lote
              </span>
            </div>
          </div>

          <div class="shrink-0 text-right">
            <template v-if="store.obtenerStockLista(producto) !== null">
              <p class="text-sm font-bold text-slate-800">{{ store.obtenerStockLista(producto) }}</p>
              <p class="text-[10px] text-slate-400">en stock</p>
            </template>

            <template v-else>
              <p class="text-xs font-medium text-slate-400">Stock no disponible</p>
            </template>
          </div>

          <div class="shrink-0 text-right">
            <p class="text-sm font-bold text-blue-600">
              {{ formatMoneda(producto.precio_venta ?? producto.precio_publico) }}
            </p>
          </div>

          <i class="pi pi-plus shrink-0 text-xs text-blue-400"></i>
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-3">
      <p class="text-xs text-slate-400">
        {{ store.totalProductos }} resultado(s)
      </p>

      <button type="button"
        class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        @click="cerrar">
        Cerrar
      </button>
    </div>
  </Dialog>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import { useVentasStore } from '../../../ventasStore'

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

const store = useVentasStore()

const visible = ref(props.modelValue)
const busqueda = ref('')
const inputRef = ref(null)
const filtroActivo = ref('todos')

let inputTimeout = null

const filtrosRapidos = [
  { label: 'Todos', value: 'todos' },
  { label: 'Con lote', value: 'con_lote' },
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
    busqueda.value = String(props.terminoInicial ?? '').trim()
    filtroActivo.value = 'todos'
    store.limpiarBusquedaProductos()

    await nextTick()
    inputRef.value?.focus()

    if (busqueda.value) {
      await buscar()
    } else {
      await store.obtenerProductosPOS({
        page: 1,
        limit: 20,
        status: 'activo',
      })
    }
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
        limit: 20,
        status: 'activo',
        con_lote: filtroActivo.value === 'con_lote' ? true : undefined,
      })
    }
  },
)

function onInput() {
  clearTimeout(inputTimeout)
  inputTimeout = setTimeout(() => {
    buscar()
  }, 350)
}

async function onCambiarFiltro(valor) {
  filtroActivo.value = valor
  await buscar()
}

async function buscar() {
  const q = String(busqueda.value ?? '').trim()
  const conLote = filtroActivo.value === 'con_lote' ? true : undefined

  if (!q) {
    await store.obtenerProductosPOS({
      page: 1,
      limit: 20,
      status: 'activo',
      con_lote: conLote,
    })
    return
  }

  await store.buscarProductosPOS(q, {
    limit: 20,
    status: 'activo',
    con_lote: conLote,
  })
}

async function seleccionar(productoBase) {
  const producto = await store.seleccionarProducto(productoBase)
  emit('seleccionar', producto)
  cerrar()
}

function cerrar() {
  visible.value = false
  busqueda.value = ''
  filtroActivo.value = 'todos'
  store.limpiarBusquedaProductos()
}

function formatMoneda(valor) {
  return Number(valor ?? 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}
</script>
