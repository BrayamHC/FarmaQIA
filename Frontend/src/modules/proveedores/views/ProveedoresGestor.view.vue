<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/compras" class="transition hover:text-slate-600">Compras</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Proveedores</span>
      </nav>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-truck text-base text-white"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Gestor de Proveedores
            </h1>
            <p class="text-sm text-slate-500">
              Administre proveedores, datos comerciales y condiciones de crédito.
            </p>
          </div>
        </div>

        <button class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm
  font-medium text-white shadow-sm transition hover:bg-blue-700" @click="router.push({ name: 'CrearProveedor' })">
          <i class="pi pi-plus text-sm"></i>
          <span>Nuevo proveedor</span>
        </button>
      </div>
    </header>

    <div class="farma-filtros-bar">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div class="xl:col-span-2">
          <label class="input-label text-xs font-medium text-slate-500">Búsqueda general</label>
          <div class="relative">
            <i class="pi pi-search farma-search-icon"></i>
            <input v-model="filtros.q" type="text" placeholder="Nombre, comercial o RFC..." class="farma-search-input"
              @input="onBuscarInput" />
          </div>
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Nombre</label>
          <input v-model="filtros.nombre" type="text" placeholder="Proveedor" class="farma-input"
            @input="onBuscarInput" />
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Nombre comercial</label>
          <input v-model="filtros.nombre_comercial" type="text" placeholder="Nombre comercial" class="farma-input"
            @input="onBuscarInput" />
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">RFC</label>
          <input v-model="filtros.rfc" type="text" placeholder="RFC" class="farma-input" maxlength="13"
            @input="onBuscarInput" />
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Status</label>
          <select v-model="filtros.status" class="farma-select-input" @change="aplicarFiltros">
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="eliminado">Eliminado</option>
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
        <DataTable :value="proveedoresTabla" scrollable scrollHeight="flex" dataKey="proveedor_uuid"
          :tableStyle="{ minWidth: '1200px' }" :loading="proveedoresStore.cargando" stripedRows
          class="proveedores-table h-full">
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <i class="pi pi-truck text-2xl text-slate-300"></i>
              </div>
              <p class="text-sm font-medium text-slate-500">
                {{ proveedoresStore.cargando ? 'Cargando proveedores...' : 'No se encontraron proveedores' }}
              </p>
              <p class="mt-1 text-xs text-slate-400">
                {{ proveedoresStore.cargando ? 'Espera un momento' : 'Intenta ajustar los filtros de búsqueda' }}
              </p>
            </div>
          </template>

          <Column field="nombre" header="Proveedor" style="width: 240px">
            <template #body="slotProps">
              <div>
                <p class="text-sm font-semibold text-slate-800">{{ slotProps.data.nombre || '—' }}</p>
                <p class="text-xs text-slate-400">{{ slotProps.data.nombre_comercial || 'Sin nombre comercial' }}</p>
              </div>
            </template>
          </Column>

          <Column field="rfc" header="RFC" style="width: 150px">
            <template #body="slotProps">
              <span class="text-sm text-slate-600">{{ slotProps.data.rfc || '—' }}</span>
            </template>
          </Column>

          <Column field="contacto_nombre" header="Contacto" style="width: 200px">
            <template #body="slotProps">
              <div>
                <p class="text-sm text-slate-700">{{ slotProps.data.contacto_nombre || '—' }}</p>
                <p class="text-xs text-slate-400">{{ slotProps.data.contacto_email || 'Sin email' }}</p>
              </div>
            </template>
          </Column>

          <Column field="contacto_telefono" header="Teléfono" style="width: 150px">
            <template #body="slotProps">
              <span class="text-sm text-slate-600">{{ slotProps.data.contacto_telefono || '—' }}</span>
            </template>
          </Column>

          <Column field="dias_credito" header="Crédito" style="width: 120px">
            <template #body="slotProps">
              <span class="text-sm font-medium text-slate-700">
                {{ Number(slotProps.data.dias_credito || 0) }} días
              </span>
            </template>
          </Column>

          <Column field="status" header="Status" style="width: 120px">
            <template #body="slotProps">
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(slotProps.data.status)">
                {{ capitalizar(slotProps.data.status) }}
              </span>
            </template>
          </Column>

          <Column field="fecha_creacion" header="Creación" style="width: 140px">
            <template #body="slotProps">
              <span class="text-xs text-slate-500">
                {{ formatearFechaTexto(slotProps.data.fecha_creacion) }}
              </span>
            </template>
          </Column>

          <Column header="Acciones" style="width: 180px">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <RouterLink :to="`/proveedores/${slotProps.data.proveedor_uuid}/editar`"
                  class="farma-action-btn text-blue-600 hover:bg-blue-50" title="Editar proveedor">
                  <i class="pi pi-pencil"></i>
                </RouterLink>

                <button v-if="slotProps.data.status === 'activo'"
                  class="farma-action-btn text-amber-600 hover:bg-amber-50" title="Desactivar"
                  @click="confirmarCambioStatus(slotProps.data, 'inactivo')">
                  <i class="pi pi-ban"></i>
                </button>

                <button v-if="slotProps.data.status === 'inactivo'"
                  class="farma-action-btn text-emerald-600 hover:bg-emerald-50" title="Activar"
                  @click="confirmarCambioStatus(slotProps.data, 'activo')">
                  <i class="pi pi-check-circle"></i>
                </button>

                <button v-if="slotProps.data.status !== 'eliminado'"
                  class="farma-action-btn text-rose-600 hover:bg-rose-50" title="Eliminar"
                  @click="confirmarCambioStatus(slotProps.data, 'eliminado')">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import { useProveedoresStore } from '../proveedoresStore';

const router = useRouter();
const proveedoresStore = useProveedoresStore();

const filtros = ref({
  q: '',
  nombre: '',
  nombre_comercial: '',
  rfc: '',
  status: '',
});

const first = ref(0);
const rows = ref(10);
let busquedaTimeout = null;

const totalRegistros = computed(() => Number(proveedoresStore.total || 0));
const paginaActual = computed(() => Math.floor(first.value / rows.value) + 1);
const proveedoresTabla = computed(() =>
  proveedoresStore.cargando ? [] : (proveedoresStore.proveedores ?? [])
);

function capitalizar(valor) {
  if (!valor) return '—';
  return String(valor).charAt(0).toUpperCase() + String(valor).slice(1);
}

function statusClass(status) {
  if (status === 'activo') return 'bg-blue-50 text-blue-700';
  if (status === 'inactivo') return 'bg-slate-100 text-slate-600';
  if (status === 'eliminado') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
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

async function cargarProveedores() {
  await proveedoresStore.obtenerProveedores({
    page: paginaActual.value,
    limit: rows.value,
    q: filtros.value.q || undefined,
    nombre: filtros.value.nombre || undefined,
    nombre_comercial: filtros.value.nombre_comercial || undefined,
    rfc: filtros.value.rfc || undefined,
    status: filtros.value.status || undefined,
  });
}

function onBuscarInput() {
  clearTimeout(busquedaTimeout);
  busquedaTimeout = setTimeout(() => {
    aplicarFiltros();
  }, 350);
}

async function aplicarFiltros() {
  first.value = 0;
  await cargarProveedores();
}

async function limpiarTodo() {
  filtros.value = {
    q: '',
    nombre: '',
    nombre_comercial: '',
    rfc: '',
    status: '',
  };
  first.value = 0;
  await cargarProveedores();
}

async function onPage(event) {
  first.value = event.first;
  rows.value = event.rows;
  await cargarProveedores();
}

async function confirmarCambioStatus(proveedor, status) {
  const etiquetas = {
    activo: 'activar',
    inactivo: 'desactivar',
    eliminado: 'eliminar',
  };

  const confirmado = window.confirm(
    `¿Deseas ${etiquetas[status]} el proveedor "${proveedor.nombre}"?`
  );

  if (!confirmado) return;

  try {
    await proveedoresStore.cambiarStatusProveedor(proveedor.proveedor_uuid, status);
    await cargarProveedores();
  } catch (_error) { }
}

onMounted(async () => {
  await cargarProveedores();
});

onBeforeUnmount(() => {
  clearTimeout(busquedaTimeout);
});
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

.proveedores-table {
  height: 100%;
}

.proveedores-table :deep(.p-datatable) {
  height: 100%;
}

.proveedores-table :deep(.p-datatable-table-container) {
  height: 100%;
}

.proveedores-table :deep(.p-datatable-wrapper) {
  height: 100%;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-secondary) transparent;
}

.proveedores-table :deep(.p-datatable-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.proveedores-table :deep(.p-datatable-wrapper::-webkit-scrollbar-track) {
  background: transparent;
  border-radius: 9999px;
}

.proveedores-table :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: var(--color-secondary);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.proveedores-table :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb:hover) {
  background: var(--color-primary);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.proveedores-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.14);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 1;
}

.proveedores-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.72rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.08);
}

.proveedores-table :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

.proveedores-table :deep(.p-datatable-tbody > tr:hover > td) {
  background: rgba(59, 130, 246, 0.03);
}

.farma-search-input,
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

.farma-search-input {
  padding-left: 2.4rem;
}

.farma-search-input:focus,
.farma-select-input:focus,
.farma-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.farma-search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
}

.input-label {
  display: block;
  margin-bottom: 0.45rem;
}

.farma-btn-limpiar,
.farma-btn-buscar,
.farma-action-btn {
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

.farma-action-btn {
  width: 34px;
  height: 34px;
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

@media (max-width: 768px) {
  .farma-paginator-wrap {
    padding: 0.75rem;
  }

  .farma-paginator :deep(.p-paginator) {
    justify-content: center;
    row-gap: 0.5rem;
  }

  .farma-paginator :deep(.p-paginator-current) {
    width: 100%;
    text-align: center;
    order: -1;
    margin: 0 0 0.25rem 0;
  }
}
</style>
