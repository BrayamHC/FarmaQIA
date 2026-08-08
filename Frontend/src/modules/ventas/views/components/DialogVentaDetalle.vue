<!-- src/modules/ventas/components/DialogVentaDetalle.vue -->
<template>
  <Dialog :visible="visible" modal :closable="true" :draggable="false" :style="{ width: 'min(1100px, 96vw)' }" :pt="{
    root: { class: 'venta-detalle-root' },
    mask: { class: 'venta-detalle-mask' },
    content: { class: 'venta-detalle-content' },
  }" @update:visible="emit('update:visible', $event)" @hide="onHide">
    <!-- HEADER -->
    <template #header>
      <div class="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div class="flex min-w-0 items-start gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-sm shadow-blue-200/70">
            <i class="pi pi-receipt text-base text-white"></i>
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="truncate text-lg font-bold text-slate-900" style="font-family: var(--font-title)">
                Detalle de venta
              </h3>

              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(venta?.status)">
                {{ capitalizar(venta?.status) }}
              </span>
            </div>

            <p class="mt-0.5 text-sm text-slate-500">
              {{ venta?.folio || 'Sin folio' }}
            </p>
          </div>
        </div>

        <button v-if="venta && accionesMenuItems.length" type="button"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-600"
          @click="abrirMenu">
          <i class="pi pi-ellipsis-v text-sm"></i>
        </button>
      </div>
    </template>

    <!-- MENÚ DE ACCIONES -->
    <Menu ref="menuRef" :model="accionesMenuItems" popup :pt="{
      root: { class: 'ventas-acciones-menu' },
      list: { class: 'p-1' },
      item: { class: 'rounded-xl overflow-hidden' },
      itemLink: { class: '!p-0' },
      itemLabel: { class: 'sr-only' },
      separator: { class: 'ventas-acciones-menu__separator' },
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

    <!-- CONTENIDO -->
    <section v-if="cargando" class="flex items-center justify-center py-16">
      <div class="text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <i class="pi pi-spin pi-spinner text-xl text-slate-400"></i>
        </div>
        <p class="text-sm font-medium text-slate-500">Cargando detalle de venta...</p>
      </div>
    </section>

    <section v-else-if="venta" class="venta-detalle-scroll flex flex-col gap-4">
      <!-- KPIs -->
      <article class="dialog-hero">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div class="venta-kpi">
            <span class="venta-kpi__label">Total</span>
            <strong class="venta-kpi__value text-emerald-700">
              {{ formatearMoneda(venta.total) }}
            </strong>
          </div>

          <div class="venta-kpi">
            <span class="venta-kpi__label">Método de pago</span>
            <strong class="venta-kpi__value">
              {{ capitalizar(venta.metodo_pago) }}
            </strong>
          </div>

          <div class="venta-kpi">
            <span class="venta-kpi__label">Monto recibido</span>
            <strong class="venta-kpi__value">
              {{ formatearMoneda(venta.monto_recibido) }}
            </strong>
          </div>

          <div class="venta-kpi">
            <span class="venta-kpi__label">Cambio</span>
            <strong class="venta-kpi__value">
              {{ formatearMoneda(venta.cambio) }}
            </strong>
          </div>
        </div>
      </article>

      <!-- Información general + cliente -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article class="card-detalle lg:col-span-2">
          <div class="card-detalle__header">
            <div class="flex items-center gap-2">
              <i class="pi pi-info-circle text-sm text-blue-600"></i>
              <h4 class="card-detalle__title">Información general</h4>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div class="info-item">
              <span class="info-item__label">Folio</span>
              <span class="info-item__value">{{ venta.folio || '—' }}</span>
            </div>

            <div class="info-item">
              <span class="info-item__label">Fecha de venta</span>
              <span class="info-item__value">{{ formatearFechaHora(venta.fecha_venta) }}</span>
            </div>

            <div class="info-item">
              <span class="info-item__label">Fecha de creación</span>
              <span class="info-item__value">{{ formatearFechaHora(venta.fecha_creacion) }}</span>
            </div>

            <div class="info-item">
              <span class="info-item__label">Status</span>
              <span class="info-item__value">{{ capitalizar(venta.status) }}</span>
            </div>

            <div v-if="venta.status === 'cancelada'" class="info-item md:col-span-2">
              <span class="info-item__label">Fecha de cancelación</span>
              <span class="info-item__value">{{ formatearFechaHora(venta.fecha_cancelacion) }}</span>
            </div>
          </div>
        </article>

        <article class="card-detalle">
          <div class="card-detalle__header">
            <div class="flex items-center gap-2">
              <i class="pi pi-user text-sm text-blue-600"></i>
              <h4 class="card-detalle__title">Cliente</h4>
            </div>
          </div>

          <div class="space-y-2">
            <div class="info-item">
              <span class="info-item__label">Nombre</span>
              <span class="info-item__value">{{ venta?.cliente?.nombre || 'Público general' }}</span>
            </div>

            <div class="info-item">
              <span class="info-item__label">Folio Cliente</span>
              <span class="info-item__value break-all">{{ venta?.cliente?.cliente_uuid || '—' }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- Almacén + resumen financiero -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article class="card-detalle lg:col-span-1">
          <div class="card-detalle__header">
            <div class="flex items-center gap-2">
              <i class="pi pi-warehouse text-sm text-blue-600"></i>
              <h4 class="card-detalle__title">Almacén</h4>
            </div>
          </div>

          <div class="space-y-2">
            <div class="info-item">
              <span class="info-item__label">Nombre</span>
              <span class="info-item__value">{{ venta?.almacen?.nombre || '—' }}</span>
            </div>
          </div>
        </article>

        <article class="card-detalle lg:col-span-2">
          <div class="card-detalle__header">
            <div class="flex items-center gap-2">
              <i class="pi pi-calculator text-sm text-blue-600"></i>
              <h4 class="card-detalle__title">Resumen financiero</h4>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div class="resumen-box">
              <span class="resumen-box__label">Subtotal</span>
              <strong>{{ formatearMoneda(venta.subtotal) }}</strong>
            </div>
            <div class="resumen-box">
              <span class="resumen-box__label">Descuento</span>
              <strong>{{ formatearMoneda(venta.descuento_total) }}</strong>
            </div>
            <div class="resumen-box">
              <span class="resumen-box__label">Impuesto</span>
              <strong>{{ formatearMoneda(venta.impuesto_total) }}</strong>
            </div>
            <div class="resumen-box">
              <span class="resumen-box__label">Total</span>
              <strong class="text-emerald-700">{{ formatearMoneda(venta.total) }}</strong>
            </div>
          </div>
        </article>
      </div>

      <!-- Partidas -->
      <article class="card-detalle">
        <div class="card-detalle__header">
          <div class="flex items-center gap-2">
            <i class="pi pi-list text-sm text-blue-600"></i>
            <h4 class="card-detalle__title">Partidas</h4>
          </div>

          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {{ venta.partidas?.length || 0 }} artículos
          </span>
        </div>

        <div class="partidas-table-wrap">
          <DataTable :value="venta.partidas || []" responsiveLayout="scroll" stripedRows class="ventas-partidas-table"
            :tableStyle="{ minWidth: '880px' }">
            <template #empty>
              <div class="py-10 text-center text-sm text-slate-500">
                No hay partidas registradas.
              </div>
            </template>

            <Column field="producto.nombre" header="Producto" style="width: 280px">
              <template #body="{ data }">
                <div>
                  <p class="text-sm font-semibold text-slate-800">
                    {{ data?.producto?.nombre || '—' }}
                  </p>
                  <p class="text-xs text-slate-400">
                    SKU: {{ data?.producto?.sku || '—' }}
                  </p>
                </div>
              </template>
            </Column>

            <Column field="almacen.nombre" header="Almacén" style="width: 180px">
              <template #body="{ data }">
                <span class="text-sm text-slate-600">
                  {{ data?.almacen?.nombre || '—' }}
                </span>
              </template>
            </Column>

            <Column field="lote.codigo_lote" header="Lote" style="width: 180px">
              <template #body="{ data }">
                <div v-if="data?.lote">
                  <p class="text-sm font-medium text-slate-700">
                    {{ data.lote.codigo_lote || '—' }}
                  </p>
                  <p class="text-xs text-amber-600">
                    Caduca: {{ formatearFechaTexto(data.lote.fecha_caducidad) }}
                  </p>
                </div>
                <span v-else class="text-sm text-slate-400">Sin lote</span>
              </template>
            </Column>

            <Column field="cantidad" header="Cantidad" style="width: 110px">
              <template #body="{ data }">
                <span class="text-sm font-medium text-slate-700">
                  {{ formatearNumero(data.cantidad) }}
                </span>
              </template>
            </Column>

            <Column field="precio_unitario" header="P. unitario" style="width: 130px">
              <template #body="{ data }">
                <span class="text-sm text-slate-600">
                  {{ formatearMoneda(data.precio_unitario) }}
                </span>
              </template>
            </Column>

            <Column field="subtotal" header="Subtotal" style="width: 130px">
              <template #body="{ data }">
                <span class="text-sm text-slate-600">
                  {{ formatearMoneda(data.subtotal) }}
                </span>
              </template>
            </Column>

            <Column field="total" header="Total" style="width: 130px">
              <template #body="{ data }">
                <span class="text-sm font-semibold text-emerald-700">
                  {{ formatearMoneda(data.total) }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </article>
    </section>

    <section v-else class="flex items-center justify-center py-16">
      <div class="text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
          <i class="pi pi-exclamation-circle text-xl text-rose-400"></i>
        </div>
        <p class="text-sm font-medium text-slate-500">No fue posible cargar el detalle de la venta.</p>
      </div>
    </section>
  </Dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Menu from 'primevue/menu'

const props = defineProps({
  visible: { type: Boolean, default: false },
  venta: { type: Object, default: null },
  cargando: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'hide', 'cancelar'])

const menuRef = ref(null)

const accionesMenuItems = computed(() => {
  const v = props.venta
  if (!v) return []

  const items = []

  if (v.status === 'cobrada') {
    items.push({
      label: 'Cancelar venta',
      icon: 'pi pi-times-circle',
      iconClass: 'text-rose-500',
      itemClass: 'text-black font-bold hover:bg-rose-50',
      command: () => {
        cerrarMenu()
        // Solo notificamos al padre: la confirmación real la maneja
        // el único diálogo de confirmación (DialogCancelarVenta) en Ventas.view.vue.
        // No abrir un segundo diálogo de confirmación aquí para evitar duplicidad.
        emit('cancelar', v)
      },
    })
  }

  return items
})

function abrirMenu(event) {
  menuRef.value?.toggle(event)
}

function cerrarMenu() {
  menuRef.value?.hide()
}

function onHide() {
  emit('hide')
}

function capitalizar(valor) {
  if (!valor) return '—'
  return String(valor).charAt(0).toUpperCase() + String(valor).slice(1)
}

function statusClass(status) {
  if (status === 'cobrada') return 'bg-emerald-50 text-emerald-700'
  if (status === 'cancelada') return 'bg-rose-50 text-rose-700'
  if (status === 'pendiente') return 'bg-amber-50 text-amber-700'
  return 'bg-slate-100 text-slate-600'
}

function formatearMoneda(valor) {
  const numero = Number(valor || 0)
  return numero.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}

function formatearNumero(valor) {
  return Number(valor || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function formatearFechaTexto(value) {
  if (!value) return '—'
  const fecha = new Date(value)
  if (Number.isNaN(fecha.getTime())) return value
  return fecha.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatearFechaHora(value) {
  if (!value) return '—'
  const fecha = new Date(value)
  if (Number.isNaN(fecha.getTime())) return value
  return fecha.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
:global(.venta-detalle-mask) {
  background: rgba(15, 23, 42, 0.42) !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
}

:global(.venta-detalle-root) {
  border-radius: 1.25rem !important;
  border: 1px solid rgba(226, 232, 240, 0.95) !important;
  background: #ffffff !important;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18) !important;
  overflow: hidden !important;
  max-height: min(90vh, 900px) !important;
  display: flex !important;
  flex-direction: column !important;
}

:global(.venta-detalle-root .p-dialog-header) {
  padding: 1rem 1.25rem 0.75rem 1.25rem !important;
  background: #ffffff !important;
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  flex-shrink: 0 !important;
}

:global(.venta-detalle-content) {
  padding: 1rem 1.25rem 1.25rem 1.25rem !important;
  background: #f8fafc !important;
  overflow: hidden !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}

.venta-detalle-scroll {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
}

.venta-detalle-scroll::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.venta-detalle-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.venta-detalle-scroll::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 9999px;
}

.venta-detalle-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.65);
}

.dialog-hero {
  border: 1px solid rgba(191, 219, 254, 0.9);
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
  border-radius: 1rem;
  padding: 1rem;
}

.card-detalle {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 1rem;
  background: #fff;
  padding: 1rem;
}

.card-detalle__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.card-detalle__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.venta-kpi {
  border: 1px solid rgba(191, 219, 254, 0.55);
  background: #ffffff;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
}

.venta-kpi__label,
.info-item__label,
.resumen-box__label {
  display: block;
  font-size: 0.74rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.3rem;
}

.venta-kpi__value,
.info-item__value,
.resumen-box strong {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.info-item {
  padding: 0.8rem 0.9rem;
  border-radius: 0.9rem;
  background: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.resumen-box {
  padding: 0.9rem;
  border-radius: 0.9rem;
  background: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.partidas-table-wrap {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
}

.partidas-table-wrap::-webkit-scrollbar {
  height: 7px;
}

.partidas-table-wrap::-webkit-scrollbar-track {
  background: transparent;
}

.partidas-table-wrap::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 9999px;
}

.ventas-partidas-table :deep(.p-datatable) {
  background: #fff;
}

.ventas-partidas-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.ventas-partidas-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  background: #fff;
}

.ventas-partidas-table :deep(.p-datatable-tbody > tr:hover > td) {
  background: rgba(59, 130, 246, 0.03);
}

/* MENÚ DE ACCIONES */
:global(.ventas-acciones-menu) {
  min-width: 13rem !important;
  background: #ffffff !important;
  border: 1px solid rgba(226, 232, 240, 0.95) !important;
  border-radius: 1rem !important;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.14) !important;
  overflow: hidden !important;
  padding: 0.375rem !important;
  z-index: 9999 !important;
}

:global(.ventas-acciones-menu .p-menu-list) {
  padding: 0 !important;
  background: #ffffff !important;
}

:global(.ventas-acciones-menu .p-menuitem) {
  border-radius: 0.75rem !important;
  overflow: hidden !important;
}

:global(.ventas-acciones-menu .p-menuitem-link) {
  padding: 0 !important;
  background: transparent !important;
}

:global(.ventas-acciones-menu .p-menuitem-link:hover) {
  background: transparent !important;
}

:global(.ventas-acciones-menu__separator) {
  margin: 0.25rem 0.5rem;
  border-top: 1px solid rgba(226, 232, 240, 1);
}
</style>
