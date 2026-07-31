<!-- Frontend/src/modules/compras/ordenesCompra/views/OrdenesCompraGestor.view.vue -->
<template>
  <section class="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/compras" class="transition hover:text-slate-600">Compras</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Órdenes de Compra</span>
      </nav>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200/70">
            <i class="pi pi-file-edit text-base text-white"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Órdenes de Compra
            </h1>
            <p class="text-sm text-slate-500">
              Crea y da seguimiento a tus órdenes de compra con proveedores.
            </p>
          </div>
        </div>

        <RouterLink to="/compras/ordenes/nueva" class="farma-btn farma-btn-primary self-start lg:self-auto">
          <i class="pi pi-plus text-xs"></i>
          <span>Nueva orden</span>
        </RouterLink>
      </div>
    </header>

    <div class="farma-filtros-bar">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label class="input-label text-xs font-medium text-slate-500">Folio</label>
          <input v-model="filtros.folio" type="text" placeholder="OC-PUE-000001" class="farma-input"
            @input="onBuscarInput" />
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Proveedor</label>
          <select v-model="filtros.proveedor_uuid" class="farma-select-input" @focus="cargarProveedoresLista"
            @change="aplicarFiltros">
            <option value="">Todos</option>
            <option v-for="p in store.proveedores" :key="p.uuid" :value="p.uuid">
              {{ p.nombre }}
            </option>
          </select>
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Status</label>
          <select v-model="filtros.status" class="farma-select-input" @change="aplicarFiltros">
            <option value="">Todos</option>
            <option value="borrador">Borrador</option>
            <option value="pendiente">Pendiente</option>
            <option value="autorizada">Autorizada</option>
            <option value="rechazada">Rechazada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Fecha inicio</label>
          <input v-model="filtros.fecha_inicio" type="date" class="farma-input" @change="aplicarFiltros" />
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Fecha fin</label>
          <input v-model="filtros.fecha_fin" type="date" class="farma-input" @change="aplicarFiltros" />
        </div>
      </div>

      <div class="mt-3 flex items-center justify-end gap-2">
        <button type="button" class="farma-btn-limpiar" title="Limpiar filtros" @click="limpiarTodo">
          <i class="pi pi-filter-slash text-sm"></i>
        </button>

        <button type="button" class="farma-btn-buscar" @click="aplicarFiltros">
          <i class="pi pi-search text-sm"></i>
          <span>Buscar</span>
        </button>
      </div>
    </div>

    <article class="card-base farma-table-shell flex min-h-0 flex-1 flex-col">
      <div class="farma-table-content app-scroll flex-1 min-h-0">
        <DataTable :value="ordenesTabla" scrollable scrollHeight="flex" dataKey="uuid"
          :tableStyle="{ minWidth: '1000px' }" :loading="store.cargandoOrdenes" stripedRows
          class="ordenes-table h-full">
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <i class="pi pi-file-edit text-2xl text-slate-300"></i>
              </div>
              <p class="text-sm font-medium text-slate-500">
                {{ store.cargandoOrdenes ? 'Cargando órdenes...' : 'No se encontraron órdenes' }}
              </p>
              <p class="mt-1 text-xs text-slate-400">
                {{ store.cargandoOrdenes ? 'Espera un momento' : 'Intenta ajustar los filtros' }}
              </p>
            </div>
          </template>

          <Column field="folio_display" header="Folio" style="width: 180px">
            <template #body="{ data }">
              <RouterLink :to="`/compras/ordenes/${data.uuid}`" class="folio-trigger">
                <p class="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                  {{ data.folio_display || '—' }}
                </p>
                <p class="text-xs text-slate-400">
                  {{ formatFecha(data.fecha_orden) }}
                </p>
              </RouterLink>
            </template>
          </Column>

          <Column field="proveedor_nombre" header="Proveedor" style="width: 220px">
            <template #body="{ data }">
              <div>
                <p class="text-sm text-slate-700">{{ data.proveedor_nombre || '—' }}</p>
                <p class="text-xs text-slate-400">RFC: {{ data.proveedor_rfc || '—' }}</p>
              </div>
            </template>
          </Column>

          <Column field="almacen_nombre" header="Almacén" style="width: 180px">
            <template #body="{ data }">
              <span class="text-sm text-slate-600">{{ data.almacen_nombre || '—' }}</span>
            </template>
          </Column>

          <Column field="fecha_entrega_estimada" header="Entrega est." style="width: 140px">
            <template #body="{ data }">
              <span class="text-xs text-slate-500">
                {{ formatFecha(data.fecha_entrega_estimada) }}
              </span>
            </template>
          </Column>

          <Column field="total_partidas" header="Partidas" style="width: 100px">
            <template #body="{ data }">
              <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {{ data.total_partidas ?? 0 }}
              </span>
            </template>
          </Column>

          <Column field="total_estimado" header="Total est." style="width: 140px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-emerald-700">
                {{ formatMoneda(data.total_estimado) }}
              </span>
            </template>
          </Column>

          <Column field="status" header="Status" style="width: 130px">
            <template #body="{ data }">
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(data.status)">
                <span class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="statusDot(data.status)"></span>
                {{ capitalizar(data.status) }}
              </span>
            </template>
          </Column>

          <Column header="" style="width: 60px; text-align: center">
            <template #body="{ data }">
              <button type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                @click="abrirMenu($event, data)">
                <i class="pi pi-ellipsis-v text-sm"></i>
              </button>
            </template>
          </Column>
        </DataTable>
      </div>

      <footer class="farma-paginator-wrap shrink-0">
        <Paginator :first="first" :rows="rows" :totalRecords="totalRegistros" :rowsPerPageOptions="[10, 20, 30]"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}" class="farma-paginator" @page="onPage" />
      </footer>
    </article>

    <Menu ref="menuRef" :model="menuItems" popup />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Paginator from 'primevue/paginator'
import Menu from 'primevue/menu'
import { useOrdenesCompraStore } from '../ordenesCompraStore'

const store = useOrdenesCompraStore()
const router = useRouter()

const menuRef = ref(null)
const ordenMenu = ref(null)

const filtros = ref({
  folio: '',
  proveedor_uuid: '',
  status: '',
  fecha_inicio: '',
  fecha_fin: '',
  sort: 'fecha_creacion:desc',
})

const first = ref(0)
const rows = ref(20)
let busquedaTimeout = null

const totalRegistros = computed(() => Number(store.totalOrdenes || 0))
const paginaActual = computed(() => Math.floor(first.value / rows.value) + 1)
const ordenesTabla = computed(() => (store.cargandoOrdenes ? [] : (store.ordenes ?? [])))

const menuItems = computed(() => {
  const o = ordenMenu.value
  if (!o) return []

  const items = [
    {
      label: 'Ver detalle',
      icon: 'pi pi-eye',
      command: () => router.push(`/compras/ordenes/${o.uuid}`),
    },
  ]

  if (['borrador', 'pendiente'].includes(o.status)) {
    items.push({
      label: 'Autorizar',
      icon: 'pi pi-check-circle',
      command: () => accionAutorizar(o.uuid),
    })
    items.push({
      label: 'Rechazar',
      icon: 'pi pi-times-circle',
      command: () => accionRechazar(o.uuid),
    })
  }

  if (o.status !== 'cancelada') {
    items.push({ separator: true })
    items.push({
      label: 'Cancelar orden',
      icon: 'pi pi-ban',
      command: () => accionCancelar(o.uuid),
    })
  }

  return items
})

function abrirMenu(event, orden) {
  ordenMenu.value = orden
  if (menuRef.value) {
    menuRef.value.toggle(event)
  }
}

async function cargarOrdenes() {
  await store.obtenerOrdenes({
    page: paginaActual.value,
    limit: rows.value,
    folio: filtros.value.folio || undefined,
    proveedor_uuid: filtros.value.proveedor_uuid || undefined,
    status: filtros.value.status || undefined,
    fecha_inicio: filtros.value.fecha_inicio || undefined,
    fecha_fin: filtros.value.fecha_fin || undefined,
    sort: filtros.value.sort || undefined,
  })
}

function cargarProveedoresLista() {
  if (!store.proveedores.length) {
    store.cargarProveedores()
  }
}

function onBuscarInput() {
  clearTimeout(busquedaTimeout)
  busquedaTimeout = setTimeout(() => {
    aplicarFiltros()
  }, 350)
}

async function aplicarFiltros() {
  first.value = 0
  await cargarOrdenes()
}

async function limpiarTodo() {
  filtros.value = {
    folio: '',
    proveedor_uuid: '',
    status: '',
    fecha_inicio: '',
    fecha_fin: '',
    sort: 'fecha_creacion:desc',
  }
  first.value = 0
  await cargarOrdenes()
}

async function onPage(event) {
  first.value = event.first
  rows.value = event.rows
  await cargarOrdenes()
}

async function accionAutorizar(uuid) {
  try {
    await store.autorizarOrden(uuid)
    await cargarOrdenes()
  } catch { }
}

async function accionRechazar(uuid) {
  const motivo = window.prompt('Motivo de rechazo:')
  if (!motivo) return

  try {
    await store.rechazarOrden(uuid, motivo)
    await cargarOrdenes()
  } catch { }
}

async function accionCancelar(uuid) {
  const confirmado = window.confirm('¿Cancelar esta orden de compra?')
  if (!confirmado) return

  try {
    await store.cancelarOrden(uuid)
    await cargarOrdenes()
  } catch { }
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatMoneda(valor) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(valor ?? 0))
}

function capitalizar(valor) {
  if (!valor) return '—'
  const texto = String(valor)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function statusClass(status) {
  const map = {
    borrador: 'bg-slate-100 text-slate-500',
    pendiente: 'bg-amber-50 text-amber-600',
    autorizada: 'bg-emerald-50 text-emerald-600',
    rechazada: 'bg-rose-50 text-rose-600',
    cancelada: 'bg-slate-100 text-slate-400',
  }
  return map[status] ?? 'bg-slate-100 text-slate-500'
}

function statusDot(status) {
  const map = {
    borrador: 'bg-slate-400',
    pendiente: 'bg-amber-400',
    autorizada: 'bg-emerald-500',
    rechazada: 'bg-rose-500',
    cancelada: 'bg-slate-300',
  }
  return map[status] ?? 'bg-slate-400'
}

onMounted(() => {
  cargarOrdenes()
})

onBeforeUnmount(() => {
  clearTimeout(busquedaTimeout)
})
</script>

<style scoped>
.folio-trigger {
  display: block;
  text-align: left;
}
</style>
