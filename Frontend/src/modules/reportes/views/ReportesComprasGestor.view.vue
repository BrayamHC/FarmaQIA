<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/reportes" class="transition hover:text-slate-600">Reportes</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Compras</span>
      </nav>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200/70">
            <i class="pi pi-shopping-cart text-base text-white"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Reporte de Compras
            </h1>
            <p class="text-sm text-slate-500">
              Consulte órdenes de compra, proveedores y partidas registradas por período.
            </p>
          </div>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Órdenes</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ resumen.total_ordenes || 0 }}</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Subtotal</p>
        <p class="mt-2 text-xl font-bold text-slate-900">{{ formatearMoneda(resumen.subtotal) }}</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">IVA</p>
        <p class="mt-2 text-xl font-bold text-slate-900">{{ formatearMoneda(resumen.iva) }}</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Total estimado</p>
        <p class="mt-2 text-xl font-bold text-emerald-700">{{ formatearMoneda(resumen.total_estimado) }}</p>
      </article>
    </div>

    <div class="farma-filtros-bar">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div class="farma-filtro-principal">
          <label class="input-label text-xs font-medium text-slate-500">Fecha inicio</label>
          <DatePicker v-model="filtros.fecha_inicio" showIcon iconDisplay="input" dateFormat="yy-mm-dd"
            class="farma-prime-control w-full" :manualInput="false" />
        </div>

        <div class="farma-filtro-principal">
          <label class="input-label text-xs font-medium text-slate-500">Fecha fin</label>
          <DatePicker v-model="filtros.fecha_fin" showIcon iconDisplay="input" dateFormat="yy-mm-dd"
            class="farma-prime-control w-full" :manualInput="false" />
        </div>

        <div class="farma-filtro-principal">
          <label class="input-label text-xs font-medium text-slate-500">Almacén</label>
          <Select v-model="filtros.almacen_id" :options="almacenesNormalizados" optionLabel="nombre"
            optionValue="almacen_id" placeholder="Todos" class="farma-prime-control w-full"
            :disabled="reportesStore.cargandoAlmacenes" :showClear="true" />
        </div>

        <div class="farma-filtro-principal">
          <label class="input-label text-xs font-medium text-slate-500">Exportación</label>
          <div class="flex gap-2">
            <button class="farma-btn-export farma-btn-excel" :disabled="reportesStore.exportando"
              @click="exportar('excel')">
              <i class="pi pi-file-excel text-sm"></i>
              <span>Excel</span>
            </button>

            <button class="farma-btn-export farma-btn-pdf" :disabled="reportesStore.exportando"
              @click="exportar('pdf')">
              <i class="pi pi-file-pdf text-sm"></i>
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-end gap-2 farma-filtros-acciones">
        <button class="farma-btn-limpiar" title="Limpiar filtros" @click="limpiarTodo">
          <i class="pi pi-filter-slash text-sm"></i>
        </button>
        <button class="farma-btn-buscar" @click="aplicarFiltros">
          <i class="pi pi-search text-sm"></i>
          <span>Buscar</span>
        </button>
      </div>
    </div>

    <article class="card-base farma-table-shell flex min-h-0 flex-1 flex-col">
      <div v-if="isMobile" class="farma-mobile app-scroll flex-1 min-h-0">
        <div v-if="reportesStore.cargando" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <i class="pi pi-shopping-cart text-2xl text-slate-300"></i>
          </div>
          <p class="text-sm font-medium text-slate-500">Cargando reporte...</p>
        </div>

        <div v-else-if="!registrosPaginados.length" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <i class="pi pi-shopping-cart text-2xl text-slate-300"></i>
          </div>
          <p class="text-sm font-medium text-slate-500">No se encontraron compras</p>
        </div>

        <div v-else class="farma-mobile-list">
          <article v-for="item in registrosPaginados" :key="item.orden_compra_uuid" class="farma-mobile-card">
            <div class="farma-mobile-card__head">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-blue-600">{{ item.folio_display }}</p>
                <p class="text-xs text-slate-400">{{ formatearFecha(item.fecha_orden) }}</p>
              </div>

              <span
                class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {{ item.status || '—' }}
              </span>
            </div>

            <div class="farma-mobile-card__body">
              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Proveedor</span>
                <span class="farma-mobile-card__value">{{ item.proveedor_nombre || '—' }}</span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Almacén</span>
                <span class="farma-mobile-card__value">{{ item.almacen_nombre || '—' }}</span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Moneda</span>
                <span class="farma-mobile-card__value">{{ item.moneda || '—' }}</span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Total</span>
                <span class="farma-mobile-card__value farma-mobile-card__value--success">
                  {{ formatearMoneda(item.total_estimado) }}
                </span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Partidas</span>
                <span class="farma-mobile-card__value">{{ item.detalles?.length || 0 }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div v-else class="farma-table-content app-scroll flex-1 min-h-0">
        <DataTable :value="registrosPaginados" scrollable scrollHeight="flex" dataKey="orden_compra_uuid"
          :tableStyle="{ minWidth: '1020px' }" :loading="reportesStore.cargando" stripedRows
          class="reportes-table h-full">
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <i class="pi pi-shopping-cart text-2xl text-slate-300"></i>
              </div>
              <p class="text-sm font-medium text-slate-500">No se encontraron compras</p>
            </div>
          </template>

          <Column field="folio_display" header="Folio" style="width: 180px" />
          <Column field="fecha_orden" header="Fecha" style="width: 140px">
            <template #body="{ data }">{{ formatearFecha(data.fecha_orden) }}</template>
          </Column>
          <Column field="proveedor_nombre" header="Proveedor" style="width: 240px">
            <template #body="{ data }">{{ data.proveedor_nombre || '—' }}</template>
          </Column>
          <Column field="almacen_nombre" header="Almacén" style="width: 180px">
            <template #body="{ data }">{{ data.almacen_nombre || '—' }}</template>
          </Column>
          <Column field="status" header="Status" style="width: 140px" />
          <Column field="subtotal_estimado" header="Subtotal" style="width: 140px">
            <template #body="{ data }">{{ formatearMoneda(data.subtotal_estimado) }}</template>
          </Column>
          <Column field="iva_estimado" header="IVA" style="width: 120px">
            <template #body="{ data }">{{ formatearMoneda(data.iva_estimado) }}</template>
          </Column>
          <Column field="total_estimado" header="Total" style="width: 140px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-emerald-700">
                {{ formatearMoneda(data.total_estimado) }}
              </span>
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
  fecha_inicio: parseFecha(reportesStore.filtrosCompras.fecha_inicio),
  fecha_fin: parseFecha(reportesStore.filtrosCompras.fecha_fin),
  almacen_id: reportesStore.filtrosCompras.almacen_id ?? null,
});

const first = ref(0);
const rows = ref(10);

const almacenes = computed(() => reportesStore.almacenesOptions);
const registros = computed(() => reportesStore.reporteCompras?.items ?? []);
const resumen = computed(() => reportesStore.reporteCompras?.totales ?? {});
const totalRegistros = computed(() => registros.value.length);

const almacenesNormalizados = computed(() =>
  (almacenes.value ?? []).map((almacen) => ({
    ...almacen,
    almacen_id: Number(almacen.almacen_id),
    nombre: almacen.nombre,
  })),
);

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
  await reportesStore.obtenerCompras(payloadFiltros());
}

async function aplicarFiltros() {
  first.value = 0;
  await cargarDatos();
}

async function limpiarTodo() {
  filtros.value = {
    fecha_inicio: null,
    fecha_fin: null,
    almacen_id: null,
  };

  first.value = 0;
  await cargarDatos();
}

async function exportar(formato) {
  await reportesStore.exportarCompras(formato, payloadFiltros());
}

function onPage(event) {
  first.value = event.first;
  rows.value = event.rows;
}

function formatearMoneda(valor) {
  return Number(valor || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

function formatearFecha(valor) {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString('es-MX');
}

onMounted(async () => {
  await reportesStore.cargarAlmacenes();
  await cargarDatos();
});
</script>

<style scoped>
@import './shared-reportes.css';

.farma-prime-control {
  width: 100%;
}

.farma-prime-control :deep(.p-datepicker),
.farma-prime-control :deep(.p-select) {
  width: 100%;
}

.farma-prime-control :deep(.p-inputtext),
.farma-prime-control :deep(.p-datepicker-input),
.farma-prime-control :deep(.p-select),
.farma-prime-control :deep(.p-select-label),
.farma-prime-control :deep(.p-select-dropdown) {
  font-size: 0.875rem;
}

.farma-prime-control :deep(.p-datepicker-input),
.farma-prime-control :deep(.p-select) {
  width: 100%;
  min-height: 42px;
  border: 1px solid #dbe4f0;
  border-radius: 0.85rem;
  background: #ffffff;
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

.farma-prime-control :deep(.p-select-dropdown),
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
</style>
