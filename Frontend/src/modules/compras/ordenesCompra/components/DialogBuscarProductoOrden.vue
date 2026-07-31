<!-- Frontend/src/modules/compras/ordenesCompra/components/DialogBuscarProductoOrden.vue -->
<template>
  <Dialog v-model:visible="visibleLocal" modal dismissableMask :draggable="false" :closable="false" blockScroll
    :style="{ width: 'min(58rem, 96vw)' }" :pt="{
      root: { class: 'farma-dialog-root farma-dialog-buscar-producto' },
      mask: { class: 'farma-dialog-mask' },
      header: { style: 'display:none' },
      content: { class: 'farma-dialog-content' },
    }">
    <div class="farma-dialog-shell">
      <div class="farma-dialog-header">
        <div class="farma-dialog-header__icon">
          <i class="pi pi-search text-lg text-blue-600"></i>
        </div>

        <div class="min-w-0 flex-1">
          <h2 class="text-base font-bold text-slate-900" style="font-family: var(--font-title)">
            Buscar producto
          </h2>
          <p class="mt-1 text-xs text-slate-400">
            Selecciona uno o varios productos para agregarlos como partidas de la orden.
          </p>
        </div>

        <button type="button" class="farma-icon-btn" @click="cerrar">
          <i class="pi pi-times text-sm"></i>
        </button>
      </div>

      <div class="farma-dialog-filters">
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>

          <input ref="inputRef" v-model="busqueda" type="text" placeholder="SKU o nombre del producto..."
            class="farma-search-input" autocomplete="off" @input="onInput" @keydown.enter.prevent="buscar" />
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium text-slate-400">Filtros:</span>

          <button v-for="f in filtrosRapidos" :key="f.value" type="button" class="farma-filter-chip"
            :class="filtroActivo === f.value ? 'farma-filter-chip--active' : ''" @click="onCambiarFiltro(f.value)">
            {{ f.label }}
          </button>

          <span v-if="seleccionadosLista.length"
            class="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {{ seleccionadosLista.length }} seleccionado(s)
          </span>
        </div>

        <div v-if="mensajeError"
          class="mt-3 inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700">
          <i class="pi pi-exclamation-circle mr-1.5 text-[10px]"></i>
          {{ mensajeError }}
        </div>
      </div>

      <div class="farma-dialog-body">
        <div v-if="cargandoBusqueda" class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-2xl text-blue-400"></i>
        </div>

        <div v-else-if="!productosFiltrados.length" class="flex flex-col items-center justify-center py-12">
          <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <i class="pi pi-box text-2xl text-slate-300"></i>
          </div>

          <p class="text-sm font-medium text-slate-500">
            {{ mensajeSinResultados }}
          </p>
        </div>

        <div v-else class="space-y-3">
          <button v-for="producto in productosFiltrados" :key="producto.uuid" type="button" class="farma-product-card"
            :class="estaSeleccionado(producto.uuid) ? 'farma-product-card--selected' : ''"
            @click="toggleSeleccion(producto)">
            <div class="flex w-full items-start gap-3">
              <div class="pt-1">
                <div class="flex h-5 w-5 items-center justify-center rounded-md border transition" :class="estaSeleccionado(producto.uuid)
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 bg-white text-transparent'">
                  <i class="pi pi-check text-[10px]"></i>
                </div>
              </div>

              <div class="farma-product-card__media">
                <img v-if="producto.url_imagen" :src="producto.url_imagen" :alt="producto.nombre"
                  class="h-full w-full object-cover" />
                <div v-else class="farma-product-card__placeholder">
                  <i class="pi pi-box text-slate-300"></i>
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-800">
                      {{ producto.nombre }}
                    </p>

                    <div class="mt-1 flex flex-wrap items-center gap-2">
                      <span class="font-mono text-[11px] text-slate-400">
                        {{ producto.sku || 'Sin SKU' }}
                      </span>

                      <span v-if="producto.presentacion" class="text-[11px] text-slate-400">
                        {{ producto.presentacion }}
                      </span>

                      <span v-if="producto.categoria" class="text-[11px] text-slate-400">
                        {{ producto.categoria }}
                      </span>

                      <span v-if="producto.proveedor" class="text-[11px] text-slate-400">
                        {{ producto.proveedor }}
                      </span>
                    </div>

                    <p v-if="producto.descripcion" class="mt-2 line-clamp-2 text-xs text-slate-500">
                      {{ producto.descripcion }}
                    </p>
                  </div>

                  <div class="shrink-0">
                    <span class="farma-stock-chip"
                      :class="producto.stock_total > 0 ? 'farma-stock-chip--emerald' : 'farma-stock-chip--slate'">
                      {{ producto.stock_total > 0 ? 'Con stock' : 'Sin stock' }}
                    </span>
                  </div>
                </div>

                <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <div class="farma-stock-mini-card">
                    <p class="farma-stock-mini-card__label">Stock total</p>
                    <p class="farma-stock-mini-card__value text-slate-800">
                      {{ formatStock(producto.stock_total) }}
                    </p>
                  </div>

                  <div class="farma-stock-mini-card">
                    <p class="farma-stock-mini-card__label">Costo compra</p>
                    <p class="farma-stock-mini-card__value text-blue-600">
                      {{ formatMoneda(producto.costo_compra) }}
                    </p>
                  </div>

                  <div class="farma-stock-mini-card">
                    <p class="farma-stock-mini-card__label">Precio público</p>
                    <p class="farma-stock-mini-card__value text-slate-700">
                      {{ formatMoneda(producto.precio_publico) }}
                    </p>
                  </div>

                  <div class="farma-stock-mini-card">
                    <p class="farma-stock-mini-card__label">Lotes activos</p>
                    <p class="farma-stock-mini-card__value text-slate-700">
                      {{ producto.total_lotes }}
                    </p>
                  </div>
                </div>

                <div v-if="producto.lotes_preview?.length"
                  class="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div class="mb-2 flex flex-wrap items-center gap-2">
                    <span class="farma-stock-chip farma-stock-chip--blue">Primeros lotes</span>
                    <span class="text-[11px] text-slate-400">
                      Se muestran hasta 2 lotes para referencia
                    </span>
                  </div>

                  <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div v-for="lote in producto.lotes_preview" :key="lote.lote_uuid"
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <div class="flex items-center justify-between gap-3">
                        <p class="text-xs font-semibold text-slate-700">
                          {{ lote.codigo_lote || 'Sin lote' }}
                        </p>
                        <span class="text-[11px] font-semibold text-slate-500">
                          {{ formatStock(lote.cantidad_actual) }} pzs
                        </span>
                      </div>

                      <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                        <span v-if="lote.almacen_nombre">Almacén: {{ lote.almacen_nombre }}</span>
                        <span v-if="lote.fecha_caducidad_texto">Caduca: {{ lote.fecha_caducidad_texto }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="hidden shrink-0 items-center self-center pl-2 md:flex">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl transition" :class="estaSeleccionado(producto.uuid)
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-blue-50 text-blue-500'">
                  <i :class="estaSeleccionado(producto.uuid) ? 'pi pi-check text-sm' : 'pi pi-plus text-sm'"></i>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div class="farma-dialog-footer">
        <p class="mr-auto text-xs text-slate-400">
          {{ totalProductos }} resultado(s)
          <span v-if="totalProductos">
            · Página {{ paginaActual }} de {{ totalPaginas }}
          </span>
        </p>

        <select :value="limiteActual" :disabled="cargandoBusqueda"
          class="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 disabled:opacity-50"
          @change="onCambiarLimite($event.target.value)">
          <option :value="15">15 por página</option>
          <option :value="20">20 por página</option>
          <option :value="30">30 por página</option>
          <option :value="50">50 por página</option>
        </select>

        <button type="button" :disabled="cargandoBusqueda || paginaActual <= 1" class="farma-page-btn"
          @click="cambiarPagina(paginaActual - 1)">
          <i class="pi pi-chevron-left text-xs"></i>
        </button>

        <span class="min-w-16 text-center text-xs font-semibold text-slate-600">
          {{ paginaActual }} / {{ totalPaginas }}
        </span>

        <button type="button" :disabled="cargandoBusqueda || paginaActual >= totalPaginas" class="farma-page-btn"
          @click="cambiarPagina(paginaActual + 1)">
          <i class="pi pi-chevron-right text-xs"></i>
        </button>

        <button type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          @click="cerrar">
          Cerrar
        </button>

        <button type="button" class="farma-btn farma-btn-primary" :disabled="!seleccionadosLista.length"
          @click="confirmarSeleccion">
          <i class="pi pi-check text-xs"></i>
          <span>Agregar seleccionados</span>
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import { useOrdenesCompraStore } from '../ordenesCompraStore'

const props = defineProps({
  visible: { type: Boolean, default: false },
  terminoInicial: { type: String, default: '' },
})

const emit = defineEmits(['update:visible', 'seleccionar'])

const store = useOrdenesCompraStore()

const visibleLocal = ref(props.visible)
const busqueda = ref('')
const inputRef = ref(null)
const filtroActivo = ref('todos')
const mensajeError = ref('')
const cargandoBusqueda = ref(false)

const paginaActual = ref(1)
const limiteActual = ref(15)
const totalProductos = ref(0)
const productosRaw = ref([])
const seleccionadosMap = ref({})

let inputTimeout = null

const filtrosRapidos = [
  { label: 'Todos', value: 'todos' },
  { label: 'Con stock', value: 'con_stock' },
]

const productosNormalizados = computed(() => {
  return (productosRaw.value ?? []).map((item) => {
    const lotes = Array.isArray(item.lotes) ? item.lotes : []
    const stockTotal = Number(item.stock_total ?? item.stock_actual ?? item.stock ?? 0)
    const costoCompra = Number(item.costo_unitario_compra ?? item.costo_compra ?? item.precio_compra ?? 0)
    const precioPublico = Number(item.precio_publico ?? item.precio_venta ?? 0)

    const lotesPreview = lotes.slice(0, 2).map((lote) => ({
      lote_uuid: lote.lote_uuid,
      codigo_lote: lote.codigo_lote,
      cantidad_actual: Number(lote.cantidad_actual ?? 0),
      fecha_caducidad: lote.fecha_caducidad ?? null,
      fecha_caducidad_texto: formatFecha(lote.fecha_caducidad),
      almacen_uuid: lote.almacen?.almacen_uuid ?? null,
      almacen_nombre: lote.almacen?.nombre ?? null,
    }))

    return {
      producto_id: item.producto_id ?? null,
      uuid: item.producto_uuid ?? item.uuid ?? null,
      producto_uuid: item.producto_uuid ?? item.uuid ?? null,
      sku: item.sku ?? '',
      upc: item.upc ?? '',
      nombre: item.nombre ?? '',
      descripcion: item.descripcion ?? '',
      status: item.status ?? 'activo',
      presentacion: item.presentacion ?? '',
      categoria: item.categoria ?? item.categoria_nombre ?? '',
      proveedor: item.proveedor ?? item.proveedor_nombre ?? '',
      url_imagen: item.url_imagen ?? '',
      unidad_medida: item.unidad_medida ?? '',
      clave_unidad_medida: item.clave_unidad_medida ?? '',
      con_lote: Boolean(item.con_lote),
      tags: Array.isArray(item.tags) ? item.tags : [],
      stock_total: stockTotal,
      stock_actual: stockTotal,
      costo_compra: costoCompra,
      precio_compra: costoCompra,
      precio_publico: precioPublico,
      precio_venta: precioPublico,
      total_lotes: lotes.length,
      lotes,
      lotes_preview: lotesPreview,
    }
  }).filter((item) => item.uuid)
})

const productosFiltrados = computed(() => {
  if (filtroActivo.value === 'con_stock') {
    return productosNormalizados.value.filter((p) => Number(p.stock_total) > 0)
  }
  return productosNormalizados.value
})

const seleccionadosLista = computed(() => Object.values(seleccionadosMap.value))

const totalPaginas = computed(() => {
  const total = Number(totalProductos.value || 0)
  const limit = Number(limiteActual.value || 1)
  return Math.max(1, Math.ceil(total / limit))
})

const mensajeSinResultados = computed(() => {
  if (!busqueda.value) {
    return filtroActivo.value === 'con_stock'
      ? 'No hay productos con stock disponible'
      : 'No hay productos disponibles'
  }

  return filtroActivo.value === 'con_stock'
    ? 'No se encontraron productos con stock para tu búsqueda'
    : 'Sin resultados para tu búsqueda'
})

watch(() => props.visible, (value) => {
  visibleLocal.value = value
})

watch(visibleLocal, async (value) => {
  emit('update:visible', value)
  if (!value) return

  busqueda.value = String(props.terminoInicial ?? '').trim()
  filtroActivo.value = 'todos'
  mensajeError.value = ''
  paginaActual.value = 1
  seleccionadosMap.value = {}

  await nextTick()
  inputRef.value?.focus()
  await buscar()
}, { flush: 'post' })

watch(() => props.terminoInicial, async (valor) => {
  if (!visibleLocal.value) return
  busqueda.value = String(valor ?? '').trim()
  paginaActual.value = 1
  await buscar()
})

function limpiarMensajeError() {
  mensajeError.value = ''
}

function normalizarMeta(respuesta) {
  const lista = respuesta?.productos ?? respuesta?.data?.productos ?? []
  productosRaw.value = Array.isArray(lista) ? lista : []

  totalProductos.value = Number(
    respuesta?.meta?.total ??
    respuesta?.total ??
    respuesta?.data?.total ??
    productosRaw.value.length ??
    0,
  )

  paginaActual.value = Number(
    respuesta?.meta?.page ??
    respuesta?.page ??
    respuesta?.data?.page ??
    paginaActual.value,
  )

  limiteActual.value = Number(
    respuesta?.meta?.limit ??
    respuesta?.limit ??
    respuesta?.data?.limit ??
    limiteActual.value,
  )
}

function onInput() {
  limpiarMensajeError()
  clearTimeout(inputTimeout)
  inputTimeout = setTimeout(() => buscar(), 350)
}

async function onCambiarFiltro(valor) {
  limpiarMensajeError()
  filtroActivo.value = valor
  paginaActual.value = 1
  await buscar()
}

async function buscar() {
  limpiarMensajeError()
  cargandoBusqueda.value = true

  try {
    const respuesta = await store.buscarProductos(String(busqueda.value ?? '').trim(), {
      page: paginaActual.value,
      limit: limiteActual.value,
    })
    normalizarMeta(respuesta)
  } catch (error) {
    productosRaw.value = []
    totalProductos.value = 0
    mensajeError.value = error?.response?.data?.message ?? 'No fue posible buscar productos.'
  } finally {
    cargandoBusqueda.value = false
  }
}

async function cambiarPagina(nuevaPagina) {
  if (nuevaPagina < 1 || nuevaPagina > totalPaginas.value) return
  limpiarMensajeError()
  paginaActual.value = nuevaPagina
  await buscar()
}

async function onCambiarLimite(nuevoLimite) {
  limpiarMensajeError()
  limiteActual.value = Number(nuevoLimite)
  paginaActual.value = 1
  await buscar()
}

function estaSeleccionado(uuid) {
  return Boolean(seleccionadosMap.value[uuid])
}

function toggleSeleccion(producto) {
  if (!producto?.uuid) return

  if (seleccionadosMap.value[producto.uuid]) {
    const copia = { ...seleccionadosMap.value }
    delete copia[producto.uuid]
    seleccionadosMap.value = copia
    return
  }

  seleccionadosMap.value = {
    ...seleccionadosMap.value,
    [producto.uuid]: {
      uuid: producto.uuid,
      producto_uuid: producto.producto_uuid,
      producto_id: producto.producto_id,
      sku: producto.sku,
      upc: producto.upc,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      presentacion: producto.presentacion,
      categoria: producto.categoria,
      proveedor: producto.proveedor,
      url_imagen: producto.url_imagen,
      unidad_medida: producto.unidad_medida,
      clave_unidad_medida: producto.clave_unidad_medida,
      stock_total: producto.stock_total,
      stock_actual: producto.stock_total,
      precio_compra: producto.costo_compra,
      costo_compra: producto.costo_compra,
      precio_publico: producto.precio_publico,
      precio_venta: producto.precio_publico,
      precio_referencia: producto.costo_compra || producto.precio_publico || 0,
      lotes: producto.lotes,
      total_lotes: producto.total_lotes,
      con_lote: producto.con_lote,
      tags: producto.tags,
    },
  }
}

function confirmarSeleccion() {
  const seleccionados = seleccionadosLista.value
  if (!seleccionados.length) return
  emit('seleccionar', seleccionados)
  cerrar()
}

function cerrar() {
  visibleLocal.value = false
  busqueda.value = ''
  filtroActivo.value = 'todos'
  mensajeError.value = ''
  paginaActual.value = 1
  totalProductos.value = 0
  productosRaw.value = []
  seleccionadosMap.value = {}
  clearTimeout(inputTimeout)
}

function formatMoneda(valor) {
  return Number(valor ?? 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}

function formatStock(valor) {
  return Number(valor ?? 0).toLocaleString('es-MX')
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<style scoped>
.farma-dialog-shell {
  display: flex;
  flex-direction: column;
  min-height: 72vh;
  max-height: 86vh;
  background: #fff;
}

.farma-dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 1) 100%);
  flex-shrink: 0;
}

.farma-dialog-header__icon {
  display: flex;
  height: 3rem;
  width: 3rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  background: #dbeafe;
  box-shadow: inset 0 0 0 1px rgba(147, 197, 253, 0.35);
}

.farma-icon-btn {
  display: inline-flex;
  height: 2.25rem;
  width: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  color: #94a3b8;
  transition: all 0.2s ease;
}

.farma-icon-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.farma-dialog-filters {
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
  padding: 1rem 1.5rem;
  flex-shrink: 0;
}

.farma-search-input {
  width: 100%;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 0.9rem;
  padding: 0.7rem 1rem 0.7rem 2.3rem;
  font-size: 0.875rem;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.farma-search-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.farma-filter-chip {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  border-radius: 9999px;
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.farma-filter-chip:hover {
  border-color: #bfdbfe;
  color: #2563eb;
}

.farma-filter-chip--active {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.farma-dialog-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem 1.5rem 1.5rem;
  background: #fff;
}

.farma-dialog-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid #e2e8f0;
  background: #fff;
  padding: 1rem 1.5rem;
  flex-shrink: 0;
}

.farma-product-card {
  width: 100%;
  text-align: left;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 1rem;
  background: #fff;
  padding: 1rem;
  transition: all 0.2s ease;
}

.farma-product-card:hover {
  transform: translateY(-1px);
  border-color: #bfdbfe;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.08);
}

.farma-product-card--selected {
  border-color: #93c5fd;
  background: rgba(239, 246, 255, 0.6);
  box-shadow: 0 0 0 2px rgba(191, 219, 254, 0.8);
}

.farma-product-card__media {
  display: flex;
  height: 4.75rem;
  width: 4.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.farma-product-card__placeholder {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.farma-stock-mini-card {
  border-radius: 0.95rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.88);
  padding: 0.8rem 0.9rem;
}

.farma-stock-mini-card__label {
  font-size: 0.6875rem;
  line-height: 1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
}

.farma-stock-mini-card__value {
  margin-top: 0.35rem;
  font-size: 0.9rem;
  line-height: 1.2rem;
  font-weight: 700;
}

.farma-stock-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.6875rem;
  font-weight: 700;
}

.farma-stock-chip--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.farma-stock-chip--emerald {
  background: #dcfce7;
  color: #15803d;
}

.farma-stock-chip--slate {
  background: #f1f5f9;
  color: #475569;
}

.farma-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 0.85rem;
  padding: 0.62rem 0.95rem;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
  transition: all 0.2s ease;
  cursor: pointer;
}

.farma-btn-primary {
  background: #2563eb;
  color: #ffffff;
  border: none;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.16);
}

.farma-btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.farma-btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.farma-page-btn {
  display: flex;
  height: 2.25rem;
  width: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  transition: all 0.2s ease;
}

.farma-page-btn:hover:not(:disabled) {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.farma-page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

:global(.farma-dialog-mask) {
  background: rgba(15, 23, 42, 0.5) !important;
  backdrop-filter: blur(3px) !important;
}

:global(.farma-dialog-root) {
  border-radius: 1.25rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.18) !important;
  overflow: hidden !important;
  background: #ffffff !important;
}

:global(.farma-dialog-content) {
  padding: 0 !important;
  background: #ffffff !important;
}

:global(.farma-dialog-buscar-producto) {
  width: min(58rem, 96vw) !important;
  max-width: 96vw !important;
  max-height: 86vh !important;
  overflow: hidden !important;
}

:global(.farma-dialog-buscar-producto .p-dialog-content) {
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

@media (max-width: 768px) {

  .farma-dialog-header,
  .farma-dialog-filters,
  .farma-dialog-body,
  .farma-dialog-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .farma-dialog-shell {
    min-height: 78vh;
    max-height: 90vh;
  }

  :global(.farma-dialog-buscar-producto) {
    width: 96vw !important;
    max-height: 90vh !important;
    border-radius: 1rem !important;
  }
}
</style>
