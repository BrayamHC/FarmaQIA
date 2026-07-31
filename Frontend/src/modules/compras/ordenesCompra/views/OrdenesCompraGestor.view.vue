<!-- Frontend/src/modules/compras/ordenesCompra/views/OrdenesCompraGestor.view.vue -->
<template>
  <section class="flex min-h-[calc(100vh-8rem)] flex-col gap-5">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/compras" class="transition hover:text-slate-600">Compras</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Órdenes de Compra</span>
      </nav>

      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-file-edit text-base text-white"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Gestor de Órdenes de Compra
            </h1>
            <p class="text-sm text-slate-500">
              Consulta, filtrado y seguimiento de órdenes de compra registradas.
            </p>
          </div>
        </div>

        <div>
          <button
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            @click="router.push('/compras/ordenes/nueva')">
            <i class="pi pi-plus text-sm"></i>
            <span>Nueva orden</span>
          </button>
        </div>
      </div>
    </header>

    <article class="mb-6">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-slate-900">Filtros de búsqueda</h2>
          <p class="mt-1 text-xs text-slate-500">
            Busca por folio, proveedor o status.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-3">
        <div class="w-60">
          <label class="input-label text-xs font-medium text-slate-500">
            Folio
          </label>
          <input v-model="filtros.folio" type="text" placeholder="OC-PUE-000001" class="farma-input"
            @input="onBuscarInput" />
        </div>

        <div class="w-80">
          <label class="input-label text-xs font-medium text-slate-500">
            Proveedor
          </label>
          <Select v-model="filtros.proveedor_uuid" :options="proveedoresOptions" optionLabel="label" optionValue="value"
            placeholder="Todos" showClear filter appendTo="self" class="farma-select-field w-full" :pt="selectPt"
            @before-show="cargarProveedoresLista" @focus="cargarProveedoresLista" @change="aplicarFiltros" />
        </div>

        <div class="w-52">
          <label class="input-label text-xs font-medium text-slate-500">
            Status
          </label>
          <Select v-model="filtros.status" :options="statusOptions" optionLabel="label" optionValue="value"
            placeholder="Todos" showClear appendTo="self" class="farma-select-field w-full" :pt="selectPt"
            @change="aplicarFiltros" />
        </div>

        <button type="button" class="farma-btn farma-btn-ghost h-[42px] px-4" @click="limpiarTodo">
          <i class="pi pi-filter-slash text-sm"></i>
          <span>Limpiar</span>
        </button>

        <button type="button" class="farma-btn farma-btn-primary h-[42px] px-5" @click="aplicarFiltros">
          <i class="pi pi-search text-sm"></i>
          <span>Buscar</span>
        </button>
      </div>
    </article>

    <article class="card-base farma-table-shell flex min-h-0 flex-1 flex-col overflow-hidden">

      <div class="farma-table-content app-scroll flex-1 min-h-0">
        <DataTable :value="ordenesTabla" scrollable scrollHeight="flex" dataKey="uuid"
          :tableStyle="{ minWidth: '1080px' }" :loading="store.cargandoOrdenes" stripedRows
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
                {{ store.cargandoOrdenes ? 'Espera un momento' : 'Intenta ajustar los filtros aplicados' }}
              </p>
            </div>
          </template>

          <Column field="folio_display" header="Folio" style="width: 190px">
            <template #body="{ data }">
              <RouterLink :to="`/compras/ordenes/${data.uuid}`" class="folio-trigger">
                <p class="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                  {{ data.folio_display || '—' }}
                </p>
                <p class="mt-0.5 text-xs text-slate-400">
                  {{ formatFecha(data.fecha_orden) }}
                </p>
              </RouterLink>
            </template>
          </Column>

          <Column field="proveedor_nombre" header="Proveedor" style="width: 240px">
            <template #body="{ data }">
              <div>
                <p class="text-sm font-medium text-slate-700">{{ data.proveedor_nombre || '—' }}</p>
                <p class="mt-0.5 text-xs text-slate-400">RFC: {{ data.proveedor_rfc || '—' }}</p>
              </div>
            </template>
          </Column>

          <Column field="almacen_nombre" header="Almacén" style="width: 190px">
            <template #body="{ data }">
              <span class="text-sm text-slate-600">{{ data.almacen_nombre || '—' }}</span>
            </template>
          </Column>

          <Column field="fecha_entrega_estimada" header="Entrega est." style="width: 140px">
            <template #body="{ data }">
              <span class="text-xs font-medium text-slate-500">
                {{ formatFecha(data.fecha_entrega_estimada) }}
              </span>
            </template>
          </Column>

          <Column field="total_partidas" header="Partidas" style="width: 110px">
            <template #body="{ data }">
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {{ data.total_partidas ?? 0 }}
              </span>
            </template>
          </Column>

          <Column field="total_estimado" header="Total est." style="width: 150px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-emerald-700">
                {{ formatMoneda(data.total_estimado) }}
              </span>
            </template>
          </Column>

          <Column field="status" header="Status" style="width: 140px">
            <template #body="{ data }">
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(data.status)">
                <span class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="statusDot(data.status)"></span>
                {{ capitalizar(data.status) }}
              </span>
            </template>
          </Column>

          <Column header="" style="width: 70px; text-align: center">
            <template #body="{ data }">
              <button type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-600"
                @click="abrirMenu($event, data)">
                <i class="pi pi-ellipsis-v text-sm"></i>
              </button>
            </template>
          </Column>
        </DataTable>
      </div>

      <footer class="farma-paginator-wrap shrink-0 border-t border-slate-200 bg-white">
        <Paginator :first="first" :rows="rows" :totalRecords="totalRegistros" :rowsPerPageOptions="[10, 20, 30]"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}" class="farma-paginator" @page="onPage" />
      </footer>
    </article>

    <Menu ref="menuRef" :model="accionesMenuItems" popup :pt="{
      root: { class: 'farma-menu-popup' },
      list: { class: 'p-1' },
      item: { class: 'rounded-xl overflow-hidden' },
      itemLink: { class: '!p-0' },
      itemLabel: { class: 'sr-only' },
      separator: { class: 'farma-menu-separator' },
    }">
      <template #item="{ item }">
        <button v-if="!item.separator" type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
          :class="item.itemClass" :disabled="item.disabled" @click="item.command">
          <i :class="[item.icon, 'text-sm shrink-0', item.iconClass]"></i>
          <span>{{ item.label }}</span>
        </button>
      </template>
    </Menu>

    <Dialog v-model:visible="dialogAutorizarVisible" modal :closable="!store.guardando" :style="{ width: '28rem' }" :pt="{
      root: { class: 'farma-dialog-root' },
      mask: { class: 'farma-dialog-mask' },
      header: { style: 'display:none' },
      content: { class: 'farma-dialog-content' },
      footer: { style: 'display:none' },
    }">
      <div class="flex items-start gap-4 p-6 pb-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
          <i class="pi pi-check-circle text-xl text-emerald-600"></i>
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-bold text-slate-900">Autorizar orden</h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-500">
            La orden quedará autorizada y lista para proceder con la recepción de mercancía.
          </p>
        </div>
      </div>

      <div class="mx-6 mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Orden</p>
        <p class="mt-1 text-sm font-semibold text-slate-800">{{ ordenSeleccionada?.folio_display || '—' }}</p>
        <p class="mt-0.5 text-xs text-slate-500">{{ ordenSeleccionada?.proveedor_nombre || 'Sin proveedor' }}</p>
      </div>

      <div class="flex items-center justify-end gap-4 border-t border-slate-100 px-6 py-4">
        <Button label="Cancelar" :disabled="store.guardando"
          class="!rounded-lg !bg-slate-100 !border !border-slate-300 !text-slate-700 hover:!bg-slate-200 !px-4 !py-2 !text-sm"
          @click="dialogAutorizarVisible = false" />
        <Button :label="store.guardando ? 'Autorizando...' : 'Autorizar'" :loading="store.guardando"
          class="!rounded-lg !px-4 !py-2 !text-sm !text-white !bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
          @click="confirmarAutorizar" />
      </div>
    </Dialog>

    <Dialog v-model:visible="dialogRechazarVisible" modal :closable="!store.guardando" :style="{ width: '28rem' }" :pt="{
      root: { class: 'farma-dialog-root' },
      mask: { class: 'farma-dialog-mask' },
      header: { style: 'display:none' },
      content: { class: 'farma-dialog-content' },
      footer: { style: 'display:none' },
    }">
      <div class="flex items-start gap-4 p-6 pb-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100">
          <i class="pi pi-times-circle text-xl text-rose-600"></i>
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-bold text-slate-900">Rechazar orden</h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-500">
            Indica el motivo por el que se rechaza esta orden. No podrá ser procesada hasta una nueva revisión.
          </p>
        </div>
      </div>

      <div class="mx-6 mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-rose-500">Orden a rechazar</p>
        <p class="mt-1 text-sm font-semibold text-rose-900">{{ ordenSeleccionada?.folio_display || '—' }}</p>
        <p class="mt-0.5 text-xs text-rose-600">{{ ordenSeleccionada?.proveedor_nombre || 'Sin proveedor' }}</p>
      </div>

      <div class="mx-6 mb-5">
        <label class="mb-1.5 block text-xs font-medium text-slate-500">
          Motivo de rechazo <span class="text-rose-500">*</span>
        </label>
        <textarea v-model="motivoRechazo" rows="3" placeholder="Describe el motivo del rechazo..."
          class="farma-textarea farma-input-editing" :disabled="store.guardando" />
        <p v-if="motivoRechazo.trim() && motivoRechazo.trim().length < 10" class="mt-2 text-xs text-rose-500">
          El motivo debe contener al menos 10 caracteres.
        </p>
      </div>

      <div class="flex items-center justify-end gap-4 border-t border-slate-100 px-6 py-4">
        <Button label="Cancelar" :disabled="store.guardando"
          class="!rounded-lg !bg-slate-100 !border !border-slate-300 !text-slate-700 hover:!bg-slate-200 !px-4 !py-2 !text-sm"
          @click="dialogRechazarVisible = false" />
        <Button :label="store.guardando ? 'Rechazando...' : 'Rechazar'" :loading="store.guardando"
          :disabled="motivoRechazo.trim().length < 10"
          class="!rounded-lg !px-4 !py-2 !text-sm !text-white !bg-rose-600 !border-rose-600 hover:!bg-rose-700"
          @click="confirmarRechazar" />
      </div>
    </Dialog>

    <Dialog v-model:visible="dialogCancelarVisible" modal :closable="!store.guardando" :style="{ width: '28rem' }" :pt="{
      root: { class: 'farma-dialog-root' },
      mask: { class: 'farma-dialog-mask' },
      header: { style: 'display:none' },
      content: { class: 'farma-dialog-content' },
      footer: { style: 'display:none' },
    }">
      <div class="flex items-start gap-4 p-6 pb-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
          <i class="pi pi-ban text-xl text-amber-600"></i>
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-bold text-slate-900">Cancelar orden</h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-500">
            Esta acción cancelará la orden de compra. Indica el motivo de cancelación.
          </p>
        </div>
      </div>

      <div class="mx-6 mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">Orden a cancelar</p>
        <p class="mt-1 text-sm font-semibold text-amber-900">{{ ordenSeleccionada?.folio_display || '—' }}</p>
        <p class="mt-0.5 text-xs text-amber-700">{{ ordenSeleccionada?.proveedor_nombre || 'Sin proveedor' }}</p>
      </div>

      <div class="mx-6 mb-5">
        <label class="mb-1.5 block text-xs font-medium text-slate-500">
          Motivo de cancelación <span class="text-amber-500">*</span>
        </label>
        <textarea v-model="motivoCancelacion" rows="3" placeholder="Describe el motivo de la cancelación..."
          class="farma-textarea farma-input-editing" :disabled="store.guardando" />
        <p v-if="motivoCancelacion.trim() && motivoCancelacion.trim().length < 10" class="mt-2 text-xs text-amber-600">
          El motivo debe contener al menos 10 caracteres.
        </p>
      </div>

      <div class="flex items-center justify-end gap-4 border-t border-slate-100 px-6 py-4">
        <Button label="Volver" :disabled="store.guardando"
          class="!rounded-lg !bg-slate-100 !border !border-slate-300 !text-slate-700 hover:!bg-slate-200 !px-4 !py-2 !text-sm"
          @click="dialogCancelarVisible = false" />
        <Button :label="store.guardando ? 'Cancelando...' : 'Cancelar orden'" :loading="store.guardando"
          :disabled="motivoCancelacion.trim().length < 10"
          class="!rounded-lg !px-4 !py-2 !text-sm !text-white !bg-amber-500 !border-amber-500 hover:!bg-amber-600"
          @click="confirmarCancelar" />
      </div>
    </Dialog>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Paginator from 'primevue/paginator'
import Menu from 'primevue/menu'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { useOrdenesCompraStore } from '../ordenesCompraStore'

const store = useOrdenesCompraStore()
const router = useRouter()

const menuRef = ref(null)
const ordenSeleccionada = ref(null)

const dialogAutorizarVisible = ref(false)
const dialogRechazarVisible = ref(false)
const dialogCancelarVisible = ref(false)
const motivoRechazo = ref('')
const motivoCancelacion = ref('')

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

const proveedoresOptions = computed(() =>
  (store.proveedores ?? []).map((item) => ({
    label: item.nombre,
    value: item.uuid,
  })),
)

const statusOptions = [
  { label: 'Borrador', value: 'borrador' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Autorizada', value: 'autorizada' },
  { label: 'Rechazada', value: 'rechazada' },
  { label: 'Cancelada', value: 'cancelada' },
]

const selectPt = {
  root: { class: 'w-full' },
  overlay: { class: 'farma-prime-select-overlay' },
}

const accionesMenuItems = computed(() => {
  const o = ordenSeleccionada.value
  if (!o) return []

  const items = [
    {
      label: 'Ver detalle',
      icon: 'pi pi-eye',
      iconClass: 'text-blue-500',
      itemClass: 'text-black font-bold hover:bg-blue-50',
      command: () => {
        cerrarMenu()
        router.push(`/compras/ordenes/${o.uuid}`)
      },
    },
  ]

  if (['borrador', 'pendiente'].includes(o.status)) {
    items.push({
      label: 'Autorizar',
      icon: 'pi pi-check-circle',
      iconClass: 'text-emerald-500',
      itemClass: 'text-black font-bold hover:bg-emerald-50',
      command: () => {
        cerrarMenu()
        dialogAutorizarVisible.value = true
      },
    })

    items.push({
      label: 'Rechazar',
      icon: 'pi pi-times-circle',
      iconClass: 'text-rose-500',
      itemClass: 'text-black font-bold hover:bg-rose-50',
      command: () => {
        cerrarMenu()
        motivoRechazo.value = ''
        dialogRechazarVisible.value = true
      },
    })
  }

  if (o.status !== 'cancelada') {
    items.push({ separator: true })
    items.push({
      label: 'Cancelar orden',
      icon: 'pi pi-ban',
      iconClass: 'text-amber-500',
      itemClass: 'text-black font-bold hover:bg-amber-50',
      command: () => {
        cerrarMenu()
        motivoCancelacion.value = ''
        dialogCancelarVisible.value = true
      },
    })
  }

  return items
})

function abrirMenu(event, orden) {
  ordenSeleccionada.value = orden
  menuRef.value?.toggle(event)
}

function cerrarMenu() {
  menuRef.value?.hide()
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

async function confirmarAutorizar() {
  const uuid = ordenSeleccionada.value?.uuid
  if (!uuid) return

  try {
    await store.autorizarOrden(uuid)
    await cargarOrdenes()
    dialogAutorizarVisible.value = false
  } catch (error) {
    console.error('Error al autorizar la orden:', error)
  }
}

async function confirmarRechazar() {
  const uuid = ordenSeleccionada.value?.uuid
  const motivo = motivoRechazo.value.trim()
  if (!uuid || motivo.length < 10) return

  try {
    await store.rechazarOrden(uuid, motivo)
    await cargarOrdenes()
    dialogRechazarVisible.value = false
    motivoRechazo.value = ''
  } catch (error) {
    console.error('Error al rechazar la orden:', error)
  }
}

async function confirmarCancelar() {
  const uuid = ordenSeleccionada.value?.uuid
  const motivo = motivoCancelacion.value.trim()
  if (!uuid || motivo.length < 10) return

  try {
    await store.cancelarOrden(uuid, motivo)
    await cargarOrdenes()
    dialogCancelarVisible.value = false
    motivoCancelacion.value = ''
  } catch (error) {
    console.error('Error al cancelar la orden:', error)
  }
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
.card-base {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.folio-trigger {
  display: block;
  text-align: left;
}

.farma-input,
.farma-textarea {
  width: 100%;
  border-radius: 0.9rem;
  font-size: 0.875rem;
  padding: 0.72rem 0.95rem;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  min-height: 44px;
  border: 1px solid #dbe3ee;
  background: #ffffff;
  color: #0f172a;
}

.farma-input:focus,
.farma-textarea:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.farma-textarea {
  min-height: 96px;
  resize: vertical;
}

.farma-input-editing {
  background: #ffffff !important;
  border: 1px solid #93c5fd !important;
  color: #0f172a !important;
}

.farma-input-editing:focus {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
  outline: none !important;
}

.farma-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 0.9rem;
  padding: 0.68rem 1rem;
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
  box-shadow: 0 8px 22px rgba(37, 99, 235, 0.18);
}

.farma-btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.farma-btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.farma-btn-ghost {
  background: #ffffff;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.farma-btn-ghost:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.farma-table-shell {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 1.5rem;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.farma-table-content {
  min-height: 0;
  overflow: hidden;
}

:global(.ordenes-table .p-datatable-thead > tr > th) {
  background: #f8fafc !important;
  color: #94a3b8 !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 0.9rem 1rem !important;
}

:global(.ordenes-table .p-datatable-tbody > tr > td) {
  padding: 1rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
}

:global(.ordenes-table .p-datatable-tbody > tr:hover) {
  background: #f8fbff !important;
}

:global(.farma-select-field.p-select) {
  min-height: 44px;
  border-radius: 0.9rem !important;
  border: 1px solid #dbe3ee !important;
  background: #ffffff !important;
  box-shadow: none !important;
}

:global(.farma-select-field.p-select:hover) {
  border-color: #60a5fa !important;
}

:global(.farma-select-field.p-select.p-focus) {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
}

:global(.farma-select-field .p-select-label) {
  padding: 0.72rem 0.95rem !important;
  font-size: 0.875rem !important;
  color: #0f172a !important;
}

:global(.farma-select-field .p-placeholder) {
  color: #94a3b8 !important;
}

:global(.farma-select-field .p-select-dropdown) {
  width: 2.75rem !important;
  color: #64748b !important;
}

:global(.farma-prime-select-overlay) {
  border-radius: 1rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.14) !important;
  overflow: hidden !important;
  background: #ffffff !important;
}

:global(.farma-prime-select-overlay .p-select-list) {
  padding: 0.4rem !important;
}

:global(.farma-prime-select-overlay .p-select-option) {
  border-radius: 0.75rem !important;
  font-size: 0.875rem !important;
}

:global(.farma-prime-select-overlay .p-select-option.p-focus) {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
}

:global(.farma-prime-select-overlay .p-select-option.p-select-option-selected) {
  background: #dbeafe !important;
  color: #1e3a8a !important;
  font-weight: 600 !important;
}

:global(.farma-menu-popup) {
  border-radius: 1rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.14) !important;
  overflow: hidden !important;
  padding: 0.375rem !important;
  min-width: 12rem !important;
  background: #ffffff !important;
  z-index: 1200 !important;
}

:global(.farma-menu-popup .p-menu-list) {
  padding: 0 !important;
}

:global(.farma-menu-popup .p-menuitem) {
  border-radius: 0.75rem !important;
  overflow: hidden !important;
}

:global(.farma-menu-popup .p-menuitem-link) {
  padding: 0 !important;
  background: transparent !important;
}

:global(.farma-menu-popup .p-menuitem-link:hover) {
  background: transparent !important;
}

:global(.farma-menu-separator) {
  margin: 0.25rem 0.5rem;
  border-top: 1px solid #e2e8f0;
}

:global(.farma-dialog-root) {
  border-radius: 1.25rem !important;
  overflow: hidden !important;
}

:global(.farma-dialog-mask) {
  background: rgba(15, 23, 42, 0.45) !important;
  backdrop-filter: blur(2px);
}

:global(.farma-dialog-content) {
  padding: 0 !important;
}

:global(.farma-paginator) {
  border: 0 !important;
  background: transparent !important;
  padding: 0.85rem 1rem !important;
}

@media (max-width: 768px) {

  :global(.ordenes-table .p-datatable-tbody > tr > td),
  :global(.ordenes-table .p-datatable-thead > tr > th) {
    padding-left: 0.8rem !important;
    padding-right: 0.8rem !important;
  }
}
</style>
