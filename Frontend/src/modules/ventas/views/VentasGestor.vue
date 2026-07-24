
<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Ventas</span>
      </nav>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200/70">
            <i class="pi pi-shopping-bag text-base text-white"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Gestor de Ventas
            </h1>
            <p class="text-sm text-slate-500">
              Consulte ventas registradas, método de pago, almacén y detalle de partidas.
            </p>
          </div>
        </div>
      </div>
    </header>

    <div class="farma-filtros-bar">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div>
          <label class="input-label text-xs font-medium text-slate-500">Folio</label>
          <input
            v-model="filtros.folio"
            type="text"
            placeholder="VTA-PUE-000001"
            class="farma-input"
            @input="onBuscarInput"
          />
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Método de pago</label>
          <select v-model="filtros.metodo_pago" class="farma-select-input" @change="aplicarFiltros">
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Status</label>
          <select v-model="filtros.status" class="farma-select-input" @change="aplicarFiltros">
            <option value="">Todos</option>
            <option value="cobrada">Cobrada</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Fecha inicio</label>
          <input
            v-model="filtros.fecha_inicio"
            type="date"
            class="farma-input"
            @change="aplicarFiltros"
          />
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Fecha fin</label>
          <input
            v-model="filtros.fecha_fin"
            type="date"
            class="farma-input"
            @change="aplicarFiltros"
          />
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Orden</label>
          <select v-model="filtros.sort" class="farma-select-input" @change="aplicarFiltros">
            <option value="fecha_creacion:desc">Más recientes</option>
            <option value="fecha_creacion:asc">Más antiguas</option>
            <option value="folio:asc">Folio A-Z</option>
            <option value="folio:desc">Folio Z-A</option>
            <option value="total:desc">Mayor total</option>
            <option value="total:asc">Menor total</option>
          </select>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-end gap-2">
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
      <div class="farma-table-content app-scroll flex-1 min-h-0">
        <DataTable
          :value="ventasTabla"
          scrollable
          scrollHeight="flex"
          dataKey="venta_uuid"
          :tableStyle="{ minWidth: '960px' }"
          :loading="ventasStore.cargando"
          stripedRows
          class="ventas-table h-full"
        >
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <i class="pi pi-shopping-bag text-2xl text-slate-300"></i>
              </div>
              <p class="text-sm font-medium text-slate-500">
                {{ ventasStore.cargando ? 'Cargando ventas...' : 'No se encontraron ventas' }}
              </p>
              <p class="mt-1 text-xs text-slate-400">
                {{ ventasStore.cargando ? 'Espera un momento' : 'Intenta ajustar los filtros de búsqueda' }}
              </p>
            </div>
          </template>

          <Column field="folio" header="Folio" style="width: 180px">
            <template #body="{ data }">
              <button class="folio-trigger" @click="abrirDetalle(data.venta_uuid)">
                <p class="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                  {{ data.folio || '—' }}
                </p>
                <p class="text-xs text-slate-400">
                  {{ formatearFechaTexto(data.fecha_venta) }}
                </p>
              </button>
            </template>
          </Column>

          <Column field="cliente_nombre" header="Cliente" style="width: 220px">
            <template #body="{ data }">
              <div>
                <p class="text-sm text-slate-700">
                  {{ data.cliente_nombre || 'Público general' }}
                </p>
                <p class="text-xs text-slate-400">
                  {{ data.cliente_uuid || 'Sin cliente asociado' }}
                </p>
              </div>
            </template>
          </Column>

          <Column field="almacen_nombre" header="Almacén" style="width: 180px">
            <template #body="{ data }">
              <span class="text-sm text-slate-600">{{ data.almacen_nombre || '—' }}</span>
            </template>
          </Column>

          <Column field="metodo_pago" header="Método de pago" style="width: 150px">
            <template #body="{ data }">
              <span class="text-sm font-medium text-slate-700">
                {{ capitalizar(data.metodo_pago) }}
              </span>
            </template>
          </Column>

          <Column field="total" header="Total" style="width: 140px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-emerald-700">
                {{ formatearMoneda(data.total) }}
              </span>
            </template>
          </Column>

          <Column field="status" header="Status" style="width: 120px">
            <template #body="{ data }">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(data.status)"
              >
                {{ capitalizar(data.status) }}
              </span>
            </template>
          </Column>

          <Column field="fecha_creacion" header="Creación" style="width: 150px">
            <template #body="{ data }">
              <span class="text-xs text-slate-500">
                {{ formatearFechaHora(data.fecha_creacion) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>

      <footer class="farma-paginator-wrap shrink-0">
        <Paginator
          :first="first"
          :rows="rows"
          :totalRecords="totalRegistros"
          :rowsPerPageOptions="[10, 20, 30]"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}"
          class="farma-paginator"
          @page="onPage"
        />
      </footer>
    </article>

    <DialogVentaDetalle
      v-model:visible="mostrarDialogDetalle"
      :venta="ventasStore.ventaDetalle"
      :cargando="ventasStore.cargandoDetalle"
      @hide="onCerrarDetalle"
    />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import { useVentasStore } from '../ventasStore';
import DialogVentaDetalle from './components/DialogVentaDetalle.vue';

const ventasStore = useVentasStore();

const filtros = ref({
  folio: '',
  metodo_pago: '',
  status: '',
  fecha_inicio: '',
  fecha_fin: '',
  sort: 'fecha_creacion:desc',
});

const first = ref(0);
const rows = ref(10);
const mostrarDialogDetalle = ref(false);
let busquedaTimeout = null;

const totalRegistros = computed(() => Number(ventasStore.total || 0));
const paginaActual = computed(() => Math.floor(first.value / rows.value) + 1);
const ventasTabla = computed(() => (ventasStore.cargando ? [] : (ventasStore.ventas ?? [])));

async function cargarVentas() {
  await ventasStore.obtenerVentas({
    page: paginaActual.value,
    limit: rows.value,
    folio: filtros.value.folio || undefined,
    metodo_pago: filtros.value.metodo_pago || undefined,
    status: filtros.value.status || undefined,
    fecha_inicio: filtros.value.fecha_inicio || undefined,
    fecha_fin: filtros.value.fecha_fin || undefined,
    sort: filtros.value.sort || undefined,
  });
}

function onBuscarInput() {
  clearTimeout(busquedaTimeout);
  busquedaTimeout = setTimeout(() => aplicarFiltros(), 350);
}

async function aplicarFiltros() {
  first.value = 0;
  await cargarVentas();
}

async function limpiarTodo() {
  filtros.value = {
    folio: '',
    metodo_pago: '',
    status: '',
    fecha_inicio: '',
    fecha_fin: '',
    sort: 'fecha_creacion:desc',
  };
  first.value = 0;
  await cargarVentas();
}

async function onPage(event) {
  first.value = event.first;
  rows.value = event.rows;
  await cargarVentas();
}

async function abrirDetalle(uuid) {
  if (!uuid) return;
  mostrarDialogDetalle.value = true;
  await ventasStore.obtenerVentaPorUuid(uuid);
}

function onCerrarDetalle() {
  ventasStore.limpiarDetalleVenta();
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
  const numero = Number(valor || 0);
  return numero.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

function formatearFechaTexto(value) {
  if (!value) return '—';
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return value;
  return fecha.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatearFechaHora(value) {
  if (!value) return '—';
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return value;
  return fecha.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(async () => await cargarVentas());
onBeforeUnmount(() => clearTimeout(busquedaTimeout));
</script>


<style scoped>
.farma-table-shell {
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 1rem;
  background: #ffffff;
  overflow: hidden;
}

.farma-table-content {
  min-height: 0;
  overflow: hidden;
}

.ventas-table {
  height: 100%;
}

.ventas-table :deep(.p-datatable) {
  height: 100%;
}

.ventas-table :deep(.p-datatable-table-container) {
  height: 100%;
}

.ventas-table :deep(.p-datatable-wrapper) {
  height: 100%;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-secondary) transparent;
}

.ventas-table :deep(.p-datatable-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.ventas-table :deep(.p-datatable-wrapper::-webkit-scrollbar-track) {
  background: transparent;
  border-radius: 9999px;
}

.ventas-table :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: var(--color-secondary);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.ventas-table :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb:hover) {
  background: var(--color-primary);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.ventas-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.14);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 1;
}

.ventas-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.72rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.08);
}

.ventas-table :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

.ventas-table :deep(.p-datatable-tbody > tr:hover > td) {
  background: rgba(59, 130, 246, 0.03);
}

.folio-trigger {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  transition: all 0.18s ease;
}

.folio-trigger:hover {
  opacity: 0.95;
}

.farma-select-input,
.farma-input {
  width: 100%;
  min-height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
  padding: 0.625rem 0.9rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.farma-select-input:focus,
.farma-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.input-label {
  display: block;
  margin-bottom: 0.45rem;
}

.farma-btn-limpiar,
.farma-btn-buscar {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.farma-paginator :deep(.p-paginator-page),
.farma-paginator :deep(.p-paginator-first),
.farma-paginator :deep(.p-paginator-prev),
.farma-paginator :deep(.p-paginator-next),
.farma-paginator :deep(.p-paginator-last) {
  min-width: 2rem;
  height: 2rem;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0.65rem;
  color: #64748b;
  background: transparent;
}

.farma-paginator :deep(.p-paginator-page:hover),
.farma-paginator :deep(.p-paginator-first:hover),
.farma-paginator :deep(.p-paginator-prev:hover),
.farma-paginator :deep(.p-paginator-next:hover),
.farma-paginator :deep(.p-paginator-last:hover) {
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
}

.farma-paginator :deep(.p-paginator-page.p-highlight) {
  background: #2563eb !important;
  color: #fff !important;
  font-weight: 600;
}

.farma-paginator :deep(.p-paginator-current) {
  margin: 0 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}
</style>