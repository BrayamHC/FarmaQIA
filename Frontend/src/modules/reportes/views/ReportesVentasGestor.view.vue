<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/reportes" class="transition hover:text-slate-600">Reportes</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Ventas</span>
      </nav>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200/70">
            <i class="pi pi-chart-line text-base text-white"></i>
          </div>

          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Reporte de Ventas
            </h1>
            <p class="text-sm text-slate-500">
              Consulte tickets, ingresos y detalle de ventas por período.
            </p>
          </div>
        </div>
      </div>
    </header>

    <div v-if="!isMobile" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Ventas</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ resumen.total_ventas || 0 }}</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Ingresos</p>
        <p class="mt-2 text-xl font-bold text-emerald-700">
          {{ formatearMoneda(resumen.total_ingresos) }}
        </p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Ticket promedio</p>
        <p class="mt-2 text-xl font-bold text-slate-900">
          {{ formatearMoneda(resumen.ticket_promedio) }}
        </p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Productos vendidos</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ resumen.productos_vendidos || 0 }}</p>
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
            <i class="pi pi-chart-line text-2xl text-slate-300"></i>
          </div>
          <p class="text-sm font-medium text-slate-500">Cargando reporte...</p>
          <p class="mt-1 text-xs text-slate-400">Espera un momento</p>
        </div>

        <div v-else-if="!registrosPaginados.length" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <i class="pi pi-chart-line text-2xl text-slate-300"></i>
          </div>
          <p class="text-sm font-medium text-slate-500">No se encontraron ventas</p>
          <p class="mt-1 text-xs text-slate-400">Intenta ajustar los filtros</p>
        </div>

        <div v-else class="farma-mobile-list">
          <article v-for="item in registrosPaginados" :key="item.venta_uuid" class="farma-mobile-card">
            <div class="farma-mobile-card__head">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-blue-600">{{ item.folio }}</p>
                <p class="text-xs text-slate-400">{{ formatearFecha(item.fecha_venta) }}</p>
              </div>

              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(item.status)">
                {{ capitalizar(item.status) }}
              </span>
            </div>

            <div class="farma-mobile-card__body">
              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Cliente</span>
                <span class="farma-mobile-card__value">{{ item.cliente_nombre || 'Público general' }}</span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Método</span>
                <span class="farma-mobile-card__value">{{ capitalizar(item.metodo_pago) }}</span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Subtotal</span>
                <span class="farma-mobile-card__value">{{ formatearMoneda(item.subtotal) }}</span>
              </div>

              <div class="farma-mobile-card__row">
                <span class="farma-mobile-card__label">Total</span>
                <span class="farma-mobile-card__value farma-mobile-card__value--success">
                  {{ formatearMoneda(item.total) }}
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
        <DataTable :value="registrosPaginados" scrollable scrollHeight="flex" dataKey="venta_uuid"
          :tableStyle="{ minWidth: '980px' }" :loading="reportesStore.cargando" stripedRows
          class="reportes-table h-full">
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <i class="pi pi-chart-line text-2xl text-slate-300"></i>
              </div>
              <p class="text-sm font-medium text-slate-500">No se encontraron ventas</p>
              <p class="mt-1 text-xs text-slate-400">
                {{ reportesStore.cargando ? 'Espera un momento' : 'Intenta ajustar los filtros' }}
              </p>
            </div>
          </template>

          <Column field="folio" header="Folio" style="width: 170px" />
          <Column field="fecha_venta" header="Fecha" style="width: 150px">
            <template #body="{ data }">{{ formatearFecha(data.fecha_venta) }}</template>
          </Column>
          <Column field="cliente_nombre" header="Cliente" style="width: 220px">
            <template #body="{ data }">{{ data.cliente_nombre || 'Público general' }}</template>
          </Column>
          <Column field="metodo_pago" header="Método" style="width: 140px">
            <template #body="{ data }">{{ capitalizar(data.metodo_pago) }}</template>
          </Column>
          <Column field="status" header="Status" style="width: 130px">
            <template #body="{ data }">
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(data.status)">
                {{ capitalizar(data.status) }}
              </span>
            </template>
          </Column>
          <Column field="subtotal" header="Subtotal" style="width: 140px">
            <template #body="{ data }">{{ formatearMoneda(data.subtotal) }}</template>
          </Column>
          <Column field="total" header="Total" style="width: 140px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-emerald-700">
                {{ formatearMoneda(data.total) }}
              </span>
            </template>
          </Column>
          <Column field="detalles" header="Partidas" style="width: 100px">
            <template #body="{ data }">{{ data.detalles?.length || 0 }}</template>
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
  fecha_inicio: parseFecha(reportesStore.filtrosVentas.fecha_inicio),
  fecha_fin: parseFecha(reportesStore.filtrosVentas.fecha_fin),
  almacen_id: reportesStore.filtrosVentas.almacen_id ?? null,
});

const first = ref(0);
const rows = ref(10);

const almacenes = computed(() => reportesStore.almacenesOptions);
const registros = computed(() => reportesStore.reporteVentas?.items ?? []);
const resumen = computed(() => reportesStore.reporteVentas?.totales ?? {});
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
  await reportesStore.obtenerVentas(payloadFiltros());
}

async function aplicarFiltros() {
  first.value = 0;
  await cargarDatos();
}

async function limpiarTodo() {
  filtros.value = {
    fecha_inicio: parseFecha(reportesStore.filtrosVentas.fecha_inicio),
    fecha_fin: parseFecha(reportesStore.filtrosVentas.fecha_fin),
    almacen_id: null,
  };

  reportesStore.filtrosVentas.fecha_inicio = '';
  reportesStore.filtrosVentas.fecha_fin = '';
  reportesStore.filtrosVentas.almacen_id = null;

  first.value = 0;
  await reportesStore.obtenerVentas();
}

async function exportar(formato) {
  await reportesStore.exportarVentas(formato, payloadFiltros());
}

function onPage(event) {
  first.value = event.first;
  rows.value = event.rows;
}

function capitalizar(valor) {
  if (!valor) return '—';
  return String(valor).charAt(0).toUpperCase() + String(valor).slice(1);
}

function statusClass(status) {
  if (status === 'cobrada') return 'bg-emerald-50 text-emerald-700';
  if (status === 'cancelada') return 'bg-rose-50 text-rose-700';
  if (status === 'pendiente') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
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
  await reportesStore.obtenerVentas(reportesStore.filtrosVentas);

  filtros.value = {
    fecha_inicio: parseFecha(reportesStore.filtrosVentas.fecha_inicio),
    fecha_fin: parseFecha(reportesStore.filtrosVentas.fecha_fin),
    almacen_id: reportesStore.filtrosVentas.almacen_id ?? null,
  };
});
</script>

<style scoped>
@import './shared-reportes.css';
</style>
