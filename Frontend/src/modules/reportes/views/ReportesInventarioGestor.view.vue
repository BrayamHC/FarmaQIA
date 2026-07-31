<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/reportes" class="transition hover:text-slate-600">Reportes</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Inventario</span>
      </nav>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200/70">
            <i class="pi pi-box text-base text-white"></i>
          </div>

          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Reporte de Inventario
            </h1>
            <p class="text-sm text-slate-500">
              Consulte existencias, lotes activos y stock por almacén.
            </p>
          </div>
        </div>
      </div>
    </header>

    <div v-if="!isMobile" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Productos</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ resumen.total_productos || 0 }}</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Valor costo</p>
        <p class="mt-2 text-xl font-bold text-slate-900">
          {{ formatearMoneda(resumen.valor_inventario_costo) }}
        </p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Valor venta</p>
        <p class="mt-2 text-xl font-bold text-slate-900">
          {{ formatearMoneda(resumen.valor_inventario_venta) }}
        </p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Por caducar</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">
          {{ resumen.lotes_por_caducar_30dias || 0 }}
        </p>
      </article>
    </div>

    <div class="farma-filtros-bar rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
        <div class="farma-filtro-principal">
          <label class="input-label text-xs font-medium text-slate-500">Fecha inicio</label>
          <DatePicker v-model="filtros.fecha_inicio" showIcon iconDisplay="input" dateFormat="yy-mm-dd"
            class="farma-prime-control w-full" :manualInput="false" @date-select="aplicarFiltros"
            @clear-click="aplicarFiltros" />
        </div>

        <div class="farma-filtro-principal">
          <label class="input-label text-xs font-medium text-slate-500">Fecha fin</label>
          <DatePicker v-model="filtros.fecha_fin" showIcon iconDisplay="input" dateFormat="yy-mm-dd"
            class="farma-prime-control w-full" :manualInput="false" @date-select="aplicarFiltros"
            @clear-click="aplicarFiltros" />
        </div>

        <div class="farma-filtro-principal">
          <label class="input-label text-xs font-medium text-slate-500">Almacén</label>
          <Select v-model="filtros.almacen_id" :options="almacenesNormalizados" optionLabel="nombre"
            optionValue="almacen_id" placeholder="Todos los almacenes" class="farma-prime-control w-full"
            :disabled="reportesStore.cargandoAlmacenes" :showClear="true" @change="aplicarFiltros" />
        </div>

        <div class="farma-filtro-export">
          <label class="input-label text-xs font-medium text-slate-500">Exportar</label>
          <div class="flex gap-2">
            <button class="farma-btn-export farma-btn-excel"
              :disabled="reportesStore.exportando || reportesStore.cargando" @click="exportar('excel')">
              <i class="pi pi-file-excel text-sm"></i>
              <span>{{ reportesStore.exportando ? 'Procesando...' : 'Excel' }}</span>
            </button>

            <button class="farma-btn-export farma-btn-pdf"
              :disabled="reportesStore.exportando || reportesStore.cargando" @click="exportar('pdf')">
              <i class="pi pi-file-pdf text-sm"></i>
              <span>{{ reportesStore.exportando ? 'Procesando...' : 'PDF' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="!isMobile" class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span class="rounded-full bg-slate-100 px-3 py-1">
            {{ fechaInicioTexto }}
          </span>
          <span class="rounded-full bg-slate-100 px-3 py-1">
            {{ fechaFinTexto }}
          </span>
          <span class="rounded-full bg-slate-100 px-3 py-1">
            {{ nombreAlmacenSeleccionado }}
          </span>
        </div>

        <div class="farma-filtros-acciones">
          <button class="farma-btn-limpiar" title="Restablecer filtros" @click="limpiarTodo">
            <i class="pi pi-filter-slash text-sm"></i>
          </button>

          <button class="farma-btn-buscar" :disabled="reportesStore.cargando" @click="aplicarFiltros">
            <i class="pi pi-search text-sm"></i>
            <span>{{ reportesStore.cargando ? 'Consultando...' : 'Actualizar' }}</span>
          </button>
        </div>
      </div>

      <div v-else class="mt-3 flex items-center gap-2">
        <button class="farma-btn-limpiar" title="Restablecer filtros" @click="limpiarTodo">
          <i class="pi pi-filter-slash text-sm"></i>
        </button>

        <button class="farma-btn-buscar flex-1" :disabled="reportesStore.cargando" @click="aplicarFiltros">
          <i class="pi pi-search text-sm"></i>
          <span>{{ reportesStore.cargando ? 'Consultando...' : 'Actualizar' }}</span>
        </button>
      </div>
    </div>

    <article class="card-base farma-table-shell flex min-h-0 flex-1 flex-col">
      <div v-if="isMobile" class="farma-mobile app-scroll flex-1 min-h-0">
        <div v-if="reportesStore.cargando" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <i class="pi pi-box text-2xl text-slate-300"></i>
          </div>
          <p class="text-sm font-medium text-slate-500">Cargando reporte...</p>
          <p class="mt-1 text-xs text-slate-400">Espera un momento</p>
        </div>

        <div v-else-if="!registrosPaginados.length" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <i class="pi pi-box text-2xl text-slate-300"></i>
          </div>
          <p class="text-sm font-medium text-slate-500">No se encontraron registros</p>
          <p class="mt-1 text-xs text-slate-400">Intenta ajustar los filtros</p>
        </div>

        <div v-else class="farma-mobile-list">
          <article v-for="item in registrosPaginados" :key="item.producto_uuid" class="farma-mobile-card">
            <div class="farma-mobile-card__head">
              <div class="min-w-0 flex-1">
                <button class="folio-trigger" @click="abrirDetalle(item)">
                  <p class="truncate text-sm font-semibold text-blue-600">{{ item.sku }}</p>
                  <p class="text-xs text-slate-400">{{ item.nombre }}</p>
                </button>
              </div>

              <span
                class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Stock: {{ item.stock_total }}
              </span>
            </div>

            <div class="farma-mobile-card__body">
              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Categoría</span>
                <span class="farma-mobile-card__value">{{ item.categoria || '—' }}</span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Presentación</span>
                <span class="farma-mobile-card__value">{{ item.presentacion || '—' }}</span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Costo</span>
                <span class="farma-mobile-card__value">{{ formatearMoneda(item.costo_compra) }}</span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Precio</span>
                <span class="farma-mobile-card__value farma-mobile-card__value--success">
                  {{ formatearMoneda(item.precio_publico) }}
                </span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Lotes</span>
                <span class="farma-mobile-card__value">{{ item.lotes?.length || 0 }}</span>
              </div>
            </div>

            <div class="farma-mobile-card__footer">
              <button class="farma-mobile-card__action" @click="abrirDetalle(item)">
                <i class="pi pi-eye text-xs"></i>
                <span>Ver detalle</span>
              </button>
            </div>
          </article>
        </div>
      </div>

      <div v-else class="farma-table-content app-scroll flex-1 min-h-0">
        <DataTable :value="registrosPaginados" scrollable scrollHeight="flex" dataKey="producto_uuid"
          :tableStyle="{ minWidth: '1020px' }" :loading="reportesStore.cargando" stripedRows
          class="reportes-table h-full">
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <i class="pi pi-box text-2xl text-slate-300"></i>
              </div>
              <p class="text-sm font-medium text-slate-500">
                {{ reportesStore.cargando ? 'Cargando reporte...' : 'No se encontraron registros' }}
              </p>
              <p class="mt-1 text-xs text-slate-400">
                {{ reportesStore.cargando ? 'Espera un momento' : 'Intenta ajustar los filtros' }}
              </p>
            </div>
          </template>

          <Column field="sku" header="SKU" style="width: 150px" />

          <Column field="nombre" header="Producto" style="width: 260px">
            <template #body="{ data }">
              <button class="folio-trigger" @click="abrirDetalle(data)">
                <p class="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                  {{ data.nombre }}
                </p>
                <p class="text-xs text-slate-400">{{ data.sku }}</p>
              </button>
            </template>
          </Column>

          <Column field="categoria" header="Categoría" style="width: 180px">
            <template #body="{ data }">{{ data.categoria || '—' }}</template>
          </Column>

          <Column field="presentacion" header="Presentación" style="width: 160px">
            <template #body="{ data }">{{ data.presentacion || '—' }}</template>
          </Column>

          <Column field="stock_total" header="Stock" style="width: 120px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-slate-800">{{ data.stock_total }}</span>
            </template>
          </Column>

          <Column field="costo_compra" header="Costo" style="width: 140px">
            <template #body="{ data }">{{ formatearMoneda(data.costo_compra) }}</template>
          </Column>

          <Column field="precio_publico" header="Precio" style="width: 140px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-emerald-700">
                {{ formatearMoneda(data.precio_publico) }}
              </span>
            </template>
          </Column>

          <Column field="lotes" header="Lotes" style="width: 100px">
            <template #body="{ data }">{{ data.lotes?.length || 0 }}</template>
          </Column>
        </DataTable>
      </div>

      <footer class="farma-paginator-wrap shrink-0">
        <Paginator :first="first" :rows="rows" :totalRecords="totalRegistros" :rowsPerPageOptions="[10, 20, 30]"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}" class="farma-paginator" @page="onPage" />
      </footer>
    </article>

    <DialogReporteInventarioDetalle v-model:visible="mostrarDetalle" :inventario="inventarioDetalle"
      @hide="cerrarDetalle" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useIsMobile } from '@/composables/useIsMobile';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import { useReportesStore } from '../reportesStore';
import DialogReporteInventarioDetalle from './components/DialogReporteInventarioDetalle.vue';

const { isMobile } = useIsMobile();
const reportesStore = useReportesStore();

function parseFecha(valor) {
  if (!valor) return null;

  const [year, month, day] = String(valor).split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function formatearFechaApi(valor) {
  if (!valor) return undefined;

  const year = valor.getFullYear();
  const month = `${valor.getMonth() + 1}`.padStart(2, '0');
  const day = `${valor.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const filtros = ref({
  fecha_inicio: parseFecha(reportesStore.filtrosInventario.fecha_inicio),
  fecha_fin: parseFecha(reportesStore.filtrosInventario.fecha_fin),
  almacen_id: reportesStore.filtrosInventario.almacen_id ?? null,
});

const first = ref(0);
const rows = ref(10);
const mostrarDetalle = ref(false);
const inventarioDetalle = ref(null);

const almacenes = computed(() => reportesStore.almacenesOptions);
const registros = computed(() => reportesStore.reporteInventario?.items ?? []);
const resumen = computed(() => reportesStore.reporteInventario?.totales ?? {});
const totalRegistros = computed(() => registros.value.length);

const almacenesNormalizados = computed(() =>
  (almacenes.value ?? []).map((almacen) => ({
    ...almacen,
    almacen_id: Number(almacen.almacen_id),
    nombre: almacen.nombre,
  })),
);

const nombreAlmacenSeleccionado = computed(() => {
  if (!filtros.value.almacen_id) return 'Todos los almacenes';

  const encontrado = almacenesNormalizados.value.find(
    (item) => Number(item.almacen_id) === Number(filtros.value.almacen_id),
  );

  return encontrado?.nombre || 'Almacén seleccionado';
});

const fechaInicioTexto = computed(() => formatearFechaApi(filtros.value.fecha_inicio) || 'Sin fecha inicio');
const fechaFinTexto = computed(() => formatearFechaApi(filtros.value.fecha_fin) || 'Sin fecha fin');

const registrosPaginados = computed(() => {
  const inicio = first.value;
  const fin = first.value + rows.value;
  return registros.value.slice(inicio, fin);
});

function payloadFiltros() {
  return {
    fecha_inicio: formatearFechaApi(filtros.value.fecha_inicio),
    fecha_fin: formatearFechaApi(filtros.value.fecha_fin),
    almacen_id: filtros.value.almacen_id ?? undefined,
  };
}

async function cargarDatos() {
  await reportesStore.obtenerInventario(payloadFiltros());
}

async function aplicarFiltros() {
  first.value = 0;
  await cargarDatos();
}

async function limpiarTodo() {
  reportesStore.resetFiltrosInventario();

  filtros.value = {
    fecha_inicio: parseFecha(reportesStore.filtrosInventario.fecha_inicio),
    fecha_fin: parseFecha(reportesStore.filtrosInventario.fecha_fin),
    almacen_id: reportesStore.filtrosInventario.almacen_id,
  };

  first.value = 0;
  await reportesStore.obtenerInventario();
}

async function exportar(formato) {
  await reportesStore.exportarInventario(formato, payloadFiltros());
}

function onPage(event) {
  first.value = event.first;
  rows.value = event.rows;
}

function abrirDetalle(item) {
  inventarioDetalle.value = item;
  mostrarDetalle.value = true;
}

function cerrarDetalle() {
  inventarioDetalle.value = null;
}

function formatearMoneda(valor) {
  return Number(valor || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

onMounted(async () => {
  await reportesStore.cargarAlmacenes();
  await reportesStore.obtenerInventario(reportesStore.filtrosInventario);

  filtros.value = {
    fecha_inicio: parseFecha(reportesStore.filtrosInventario.fecha_inicio),
    fecha_fin: parseFecha(reportesStore.filtrosInventario.fecha_fin),
    almacen_id: reportesStore.filtrosInventario.almacen_id,
  };
});
</script>

<style scoped>
.farma-table-shell,
.card-base {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.farma-table-shell {
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 1rem;
  background: #ffffff;
  overflow: hidden;
  min-width: 0;
}

.farma-table-content {
  min-height: 0;
  overflow: hidden;
  min-width: 0;
}

.reportes-table {
  height: 100%;
}

.reportes-table :deep(.p-datatable),
.reportes-table :deep(.p-datatable-wrapper),
.reportes-table :deep(.p-datatable-table-container) {
  height: 100%;
}

.reportes-table :deep(.p-datatable-wrapper) {
  overflow: auto;
}

.reportes-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.14);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 1;
}

.reportes-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.72rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.08);
}

.reportes-table :deep(.p-datatable-tbody > tr:hover > td) {
  background: rgba(59, 130, 246, 0.03);
}

.farma-filtros-bar {
  min-width: 0;
}

.input-label {
  display: block;
  margin-bottom: 0.45rem;
}

.farma-prime-control {
  width: 100%;
}

.farma-prime-control :deep(.p-inputtext),
.farma-prime-control :deep(.p-select-label),
.farma-prime-control :deep(.p-select-dropdown),
.farma-prime-control :deep(.p-datepicker-input) {
  font-size: 0.875rem;
}

.farma-prime-control :deep(.p-datepicker),
.farma-prime-control :deep(.p-select) {
  width: 100%;
}

.farma-prime-control :deep(.p-datepicker-input),
.farma-prime-control :deep(.p-select),
.farma-prime-control :deep(.p-inputtext) {
  width: 100%;
  min-height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
  box-shadow: none;
}

.farma-prime-control :deep(.p-datepicker-input) {
  padding-left: 0.9rem;
  padding-right: 2.5rem;
}

.farma-prime-control :deep(.p-select-label) {
  padding: 0.625rem 0.9rem;
  color: #0f172a;
}

.farma-prime-control :deep(.p-select-dropdown) {
  width: 2.75rem;
  color: #64748b;
}

.farma-prime-control :deep(.p-datepicker-dropdown),
.farma-prime-control :deep(.p-datepicker-input-icon-container) {
  color: #64748b;
}

.farma-prime-control :deep(.p-focus),
.farma-prime-control :deep(.p-datepicker-input:focus),
.farma-prime-control :deep(.p-select:focus),
.farma-prime-control :deep(.p-inputtext:focus) {
  outline: none;
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
}

.farma-prime-control :deep(.p-select.p-disabled),
.farma-prime-control :deep(.p-datepicker.p-disabled) {
  opacity: 0.7;
}

.farma-filtro-export {
  min-width: 0;
}

.farma-btn-limpiar,
.farma-btn-buscar,
.farma-btn-export {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.85rem;
  transition: all 0.18s ease;
}

.farma-btn-limpiar {
  width: 42px;
  height: 42px;
  border: 1px solid #e2e8f0;
  color: #64748b;
  background: #fff;
}

.farma-btn-limpiar:hover {
  background: #f8fafc;
  color: #334155;
}

.farma-btn-buscar {
  min-height: 42px;
  padding: 0 1rem;
  background: #2563eb;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
}

.farma-btn-buscar:hover {
  background: #1d4ed8;
}

.farma-btn-export {
  min-height: 42px;
  padding: 0 0.9rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.farma-btn-export:disabled,
.farma-btn-buscar:disabled,
.farma-btn-limpiar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.farma-btn-excel {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.farma-btn-excel:hover {
  background: #d1fae5;
}

.farma-btn-pdf {
  background: #fff1f2;
  color: #be123c;
  border-color: #fecdd3;
}

.farma-btn-pdf:hover {
  background: #ffe4e6;
}

.farma-filtros-acciones {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.farma-paginator-wrap {
  flex-shrink: 0;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: #fff;
  padding: 0.75rem 1rem;
}

.farma-paginator :deep(.p-paginator) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
}

.folio-trigger {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.farma-mobile {
  padding: 0.9rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.farma-mobile-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.farma-mobile-card {
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 1rem;
  background: #fff;
  padding: 0.95rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.farma-mobile-card__head,
.farma-mobile-card__row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.farma-mobile-card__head {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.farma-mobile-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-top: 0.8rem;
}

.farma-mobile-card__label {
  flex: 0 0 6.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.farma-mobile-card__value {
  flex: 1;
  text-align: right;
  font-size: 0.875rem;
  color: #0f172a;
}

.farma-mobile-card__value--success {
  font-weight: 700;
  color: #047857;
}

.farma-mobile-card__footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.85rem;
  margin-top: 0.85rem;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.farma-mobile-card__action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 0.85rem;
  padding: 0.65rem 0.9rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  transition: all 0.18s ease;
}

.farma-mobile-card__action:hover {
  background: rgba(37, 99, 235, 0.12);
}

@media (max-width: 900px) {
  .farma-filtros-acciones {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .farma-filtros-acciones {
    justify-content: stretch;
  }

  .farma-filtros-acciones>*:not(.farma-btn-limpiar) {
    flex: 1 1 auto;
  }

  .farma-btn-export {
    flex: 1 1 0;
  }
}

@media (max-width: 520px) {
  .farma-mobile-card {
    padding: 0.85rem;
  }

  .farma-mobile-card__row {
    flex-direction: column;
    gap: 0.2rem;
  }

  .farma-mobile-card__label,
  .farma-mobile-card__value {
    text-align: left;
  }

  .farma-mobile-card__label {
    flex: none;
  }

  .farma-mobile-card__footer {
    justify-content: stretch;
  }

  .farma-mobile-card__action {
    width: 100%;
    justify-content: center;
  }
}
</style>
