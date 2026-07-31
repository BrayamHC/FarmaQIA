<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <!-- ============================================================
         HEADER
    ============================================================ -->
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/inventario" class="transition hover:text-slate-600">Inventario</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Lotes</span>
      </nav>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-box text-base text-white"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Gestor de Lotes
            </h1>
            <p class="text-sm text-slate-500">
              Consulte lotes por almacén, producto y caducidad.
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- ============================================================
         FILTROS — Desktop completo / Mobile simplificado
    ============================================================ -->
    <div class="farma-filtros-bar">

      <!-- DESKTOP: todos los filtros -->
      <div class="hidden md:grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div class="xl:col-span-2">
          <label class="input-label">Búsqueda general</label>
          <div class="relative">
            <i class="pi pi-search farma-search-icon"></i>
            <input v-model="filtros.q" type="text" placeholder="Código de lote, producto o SKU..."
              class="farma-search-input" @input="onBuscarInput" />
          </div>
        </div>

        <div>
          <label class="input-label">Código lote</label>
          <input v-model="filtros.codigo_lote" type="text" placeholder="L-2026-01" class="farma-input"
            @input="onBuscarInput" />
        </div>

        <div>
          <label class="input-label">Almacén</label>
          <Dropdown v-model="filtros.almacen_uuid" :options="almacenesOptionsConTodos" optionLabel="label"
            optionValue="value" placeholder="Todos" class="farma-dropdown" panelClass="farma-dropdown-panel"
            appendTo="body" @change="onAlmacenChange">
            <template #value="slotProps">
              <div class="farma-dropdown-value-shell">
                <span class="farma-dropdown-value-icon">
                  <i class="pi pi-building"></i>
                </span>
                <span v-if="slotProps.value" class="farma-dropdown-value-text">
                  {{ obtenerNombreAlmacenSeleccionado(slotProps.value) }}
                </span>
                <span v-else class="farma-dropdown-placeholder-text">
                  Todos los almacenes
                </span>
              </div>
            </template>
            <template #option="slotProps">
              <div class="farma-dropdown-option-shell">
                <span class="farma-dropdown-option-icon" :class="slotProps.option.value ? 'is-almacen' : 'is-todos'">
                  <i :class="slotProps.option.value ? 'pi pi-building' : 'pi pi-box'"></i>
                </span>
                <div class="farma-dropdown-option-copy">
                  <span class="farma-dropdown-option-title">{{ slotProps.option.label }}</span>
                  <span class="farma-dropdown-option-subtitle">
                    {{ slotProps.option.value ? 'Filtrar por almacén específico' : 'Sin filtro de almacén' }}
                  </span>
                </div>
              </div>
            </template>
          </Dropdown>
        </div>

        <div>
          <label class="input-label">Status</label>
          <select v-model="filtros.status" class="farma-select-input" @change="aplicarFiltros">
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="eliminado">Eliminado</option>
          </select>
        </div>
      </div>

      <!-- MOBILE: solo búsqueda general -->
      <div class="md:hidden grid grid-cols-1 gap-3">
        <div>
          <label class="input-label">Búsqueda general</label>
          <div class="relative">
            <i class="pi pi-search farma-search-icon"></i>
            <input v-model="filtros.q" type="text" placeholder="Código, producto o SKU..." class="farma-search-input"
              @input="onBuscarInput" />
          </div>
        </div>
      </div>

      <!-- Acciones de filtro -->
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

    <!-- ============================================================
         CONTENIDO PRINCIPAL: tabla (desktop) + cards (mobile)
    ============================================================ -->
    <article class="card-base farma-table-shell flex min-h-0 flex-1 flex-col">

      <!-- ── DESKTOP: DataTable ── -->
      <div class="farma-table-content app-scroll flex-1 min-h-0 hidden md:flex md:flex-col">
        <DataTable :value="lotesTabla" scrollable scrollHeight="flex" dataKey="lote_uuid"
          :tableStyle="{ minWidth: '1250px' }" :loading="lotesStore.cargando" stripedRows class="lotes-table h-full">
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <i class="pi pi-box text-2xl text-slate-300"></i>
              </div>
              <p class="text-sm font-medium text-slate-500">
                {{ lotesStore.cargando ? 'Cargando lotes...' : 'No se encontraron lotes' }}
              </p>
              <p class="mt-1 text-xs text-slate-400">
                {{ lotesStore.cargando ? 'Espera un momento' : 'Intenta ajustar los filtros de búsqueda' }}
              </p>
            </div>
          </template>

          <!-- Lote -->
          <Column field="codigo_lote" header="Lote" style="width: 160px">
            <template #body="slotProps">
              <span class="text-sm font-semibold text-slate-800">
                {{ slotProps.data.codigo_lote || '—' }}
              </span>
            </template>
          </Column>

          <!-- Producto -->
          <Column field="producto_nombre" header="Producto" style="width: 260px">
            <template #body="slotProps">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-800 truncate">
                  {{ slotProps.data.producto_nombre || '—' }}
                </p>
                <p class="text-xs text-slate-400">
                  {{ slotProps.data.producto_sku || 'Sin SKU' }}
                </p>
              </div>
            </template>
          </Column>

          <!-- Almacén -->
          <Column field="almacen_nombre" header="Almacén" style="width: 220px">
            <template #body="slotProps">
              <span class="text-sm text-slate-600 truncate">
                {{ slotProps.data.almacen_nombre || '—' }}
              </span>
            </template>
          </Column>

          <!-- Cantidad -->
          <Column field="cantidad_actual" header="Cantidad" style="width: 120px">
            <template #body="slotProps">
              <span class="text-sm text-slate-600">
                {{ formatearNumero(slotProps.data.cantidad_actual) }}
              </span>
            </template>
          </Column>

          <!-- Caducidad -->
          <Column field="fecha_caducidad" header="Caducidad" style="width: 140px">
            <template #body="slotProps">
              <span class="text-xs font-medium" :class="caducidadClass(slotProps.data.fecha_caducidad)">
                {{ formatearFechaTexto(slotProps.data.fecha_caducidad) }}
              </span>
            </template>
          </Column>

          <!-- Status -->
          <Column field="status" header="Status" style="width: 120px">
            <template #body="slotProps">
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(slotProps.data.status)">
                {{ capitalizar(slotProps.data.status) }}
              </span>
            </template>
          </Column>

          <!-- Creación -->
          <Column field="fecha_creacion" header="Creación" style="width: 140px">
            <template #body="slotProps">
              <span class="text-xs text-slate-500">
                {{ formatearFechaTexto(slotProps.data.fecha_creacion) }}
              </span>
            </template>
          </Column>

          <!-- Acciones: menú de tres puntos -->
          <Column header="" style="width: 52px" :frozen="true" alignFrozen="right">
            <template #body="slotProps">
              <div class="flex justify-center">
                <button class="farma-menu-trigger" :aria-label="'Acciones para lote ' + slotProps.data.codigo_lote"
                  @click="abrirMenu($event, slotProps.data)">
                  <i class="pi pi-ellipsis-v text-sm"></i>
                </button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- ── MOBILE: Cards ── -->
      <div class="md:hidden flex-1 min-h-0 overflow-y-auto farma-mobile-list">
        <!-- Loading skeleton -->
        <template v-if="lotesStore.cargando">
          <div v-for="n in 5" :key="n" class="farma-lote-card animate-pulse">
            <div class="h-4 w-24 rounded bg-slate-200 mb-2"></div>
            <div class="h-3 w-40 rounded bg-slate-100 mb-1"></div>
            <div class="h-3 w-32 rounded bg-slate-100"></div>
          </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="!lotesTabla.length">
          <div class="flex flex-col items-center justify-center py-16 text-center px-6">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <i class="pi pi-box text-2xl text-slate-300"></i>
            </div>
            <p class="text-sm font-medium text-slate-500">No se encontraron lotes</p>
            <p class="mt-1 text-xs text-slate-400">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </template>

        <!-- Cards -->
        <template v-else>
          <div v-for="lote in lotesTabla" :key="lote.lote_uuid" class="farma-lote-card">
            <!-- Fila superior: código + botón acciones -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="min-w-0">
                <span class="text-sm font-bold text-slate-900 leading-tight block truncate">
                  {{ lote.codigo_lote || '—' }}
                </span>
                <span class="text-xs text-slate-500 truncate block">
                  {{ lote.producto_nombre || '—' }}
                </span>
              </div>
              <button class="farma-menu-trigger shrink-0" :aria-label="'Acciones para ' + lote.codigo_lote"
                @click="abrirMenu($event, lote)">
                <i class="pi pi-ellipsis-v text-sm"></i>
              </button>
            </div>

            <!-- Grid de datos del lote -->
            <div class="farma-lote-card-grid">
              <div class="farma-lote-card-field">
                <span class="farma-lote-card-label">SKU</span>
                <span class="farma-lote-card-value">{{ lote.producto_sku || '—' }}</span>
              </div>
              <div class="farma-lote-card-field">
                <span class="farma-lote-card-label">Almacén</span>
                <span class="farma-lote-card-value truncate">{{ lote.almacen_nombre || '—' }}</span>
              </div>
              <div class="farma-lote-card-field">
                <span class="farma-lote-card-label">Cantidad</span>
                <span class="farma-lote-card-value font-semibold text-slate-800">
                  {{ formatearNumero(lote.cantidad_actual) }}
                </span>
              </div>
              <div class="farma-lote-card-field">
                <span class="farma-lote-card-label">Caducidad</span>
                <span class="farma-lote-card-value font-medium" :class="caducidadClass(lote.fecha_caducidad)">
                  {{ formatearFechaTexto(lote.fecha_caducidad) }}
                </span>
              </div>
            </div>

            <!-- Footer: status -->
            <div class="mt-2.5 flex items-center justify-between">
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="statusClass(lote.status)">
                {{ capitalizar(lote.status) }}
              </span>
              <span class="text-[11px] text-slate-400">
                {{ formatearFechaTexto(lote.fecha_creacion) }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- ── Paginador ── -->
      <footer class="farma-paginator-wrap shrink-0">
        <Paginator :first="first" :rows="rows" :totalRecords="totalRegistros" :rowsPerPageOptions="[10, 20, 30]"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}" class="farma-paginator" @page="onPage" />
      </footer>
    </article>

    <!-- ============================================================
         MENÚ POPUP (PrimeVue Menu) — acciones contextuales
    ============================================================ -->
    <Menu ref="menuRef" :model="menuItems" popup class="farma-menu-popup" appendTo="body" />

    <!-- ============================================================
         DIALOG: Ver detalle del lote
    ============================================================ -->
    <Dialog v-model:visible="dialogs.detalle" :modal="true" :closable="true" :draggable="false" :dismissableMask="true"
      class="farma-dialog-root" appendTo="body" :style="{ width: 'clamp(320px, 95vw, 560px)' }">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-box text-sm text-white"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-900 leading-tight">
              {{ loteSeleccionado?.codigo_lote || 'Detalle del Lote' }}
            </p>
            <p class="text-xs text-slate-500">Información del lote</p>
          </div>
        </div>
      </template>

      <div v-if="loteSeleccionado" class="farma-dialog-content-shell">
        <div class="farma-detalle-grid">
          <div class="farma-detalle-field">
            <span class="farma-detalle-label">Código lote</span>
            <span class="farma-detalle-value font-semibold">{{ loteSeleccionado.codigo_lote || '—' }}</span>
          </div>
          <div class="farma-detalle-field">
            <span class="farma-detalle-label">Producto</span>
            <span class="farma-detalle-value">{{ loteSeleccionado.producto_nombre || '—' }}</span>
          </div>
          <div class="farma-detalle-field">
            <span class="farma-detalle-label">SKU</span>
            <span class="farma-detalle-value">{{ loteSeleccionado.producto_sku || '—' }}</span>
          </div>
          <div class="farma-detalle-field">
            <span class="farma-detalle-label">Almacén</span>
            <span class="farma-detalle-value">{{ loteSeleccionado.almacen_nombre || '—' }}</span>
          </div>
          <div class="farma-detalle-field">
            <span class="farma-detalle-label">Cantidad actual</span>
            <span class="farma-detalle-value font-semibold text-slate-800">
              {{ formatearNumero(loteSeleccionado.cantidad_actual) }}
            </span>
          </div>
          <div class="farma-detalle-field">
            <span class="farma-detalle-label">Fecha caducidad</span>
            <span class="farma-detalle-value font-medium" :class="caducidadClass(loteSeleccionado.fecha_caducidad)">
              {{ formatearFechaTexto(loteSeleccionado.fecha_caducidad) }}
            </span>
          </div>
          <div class="farma-detalle-field">
            <span class="farma-detalle-label">Status</span>
            <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="statusClass(loteSeleccionado.status)">
              {{ capitalizar(loteSeleccionado.status) }}
            </span>
          </div>
          <div class="farma-detalle-field">
            <span class="farma-detalle-label">Fecha creación</span>
            <span class="farma-detalle-value">{{ formatearFechaTexto(loteSeleccionado.fecha_creacion) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <button class="farma-btn-limpiar px-4 gap-2" @click="dialogs.detalle = false">
            <i class="pi pi-times text-sm"></i>
            <span class="text-sm font-medium">Cerrar</span>
          </button>
        </div>
      </template>
    </Dialog>

    <!-- ============================================================
         DIALOG: Cambiar status del lote
    ============================================================ -->
    <Dialog v-model:visible="dialogs.status" :modal="true" :closable="true" :draggable="false" :dismissableMask="true"
      class="farma-dialog-root" appendTo="body" :style="{ width: 'clamp(300px, 90vw, 420px)' }">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500">
            <i class="pi pi-sync text-sm text-white"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-900 leading-tight">Cambiar Status</p>
            <p class="text-xs text-slate-500">{{ loteSeleccionado?.codigo_lote }}</p>
          </div>
        </div>
      </template>

      <div class="farma-dialog-content-shell">
        <div>
          <label class="input-label">Nuevo status</label>
          <select v-model="formStatus.nuevo_status" class="farma-select-input">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="eliminado">Eliminado</option>
          </select>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button class="farma-btn-limpiar px-4 gap-2" @click="dialogs.status = false">
            <span class="text-sm font-medium">Cancelar</span>
          </button>
          <button class="farma-btn-buscar" :disabled="guardandoStatus" @click="confirmarCambioStatus">
            <i v-if="guardandoStatus" class="pi pi-spin pi-spinner text-sm"></i>
            <i v-else class="pi pi-check text-sm"></i>
            <span>{{ guardandoStatus ? 'Guardando...' : 'Confirmar' }}</span>
          </button>
        </div>
      </template>
    </Dialog>

  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import Dropdown from 'primevue/dropdown';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';
import { useLotesStore } from '../lotesStore';
import { useAlmacenesStore } from '@/modules/almacenes/almacenesStore';
import { useAuthStore } from '@/modules/auth/authStore';

// ── Stores ────────────────────────────────────────────────────────
const lotesStore = useLotesStore();
const almacenesStore = useAlmacenesStore();
const authStore = useAuthStore();

// ── Filtros ───────────────────────────────────────────────────────
const filtrosIniciales = () => ({
  q: '',
  codigo_lote: '',
  almacen_uuid: '',
  status: '',
});

const filtros = ref(filtrosIniciales());

// ── Paginación ────────────────────────────────────────────────────
const first = ref(0);
const rows = ref(10);
let busquedaTimeout = null;

// ── Estado de lote seleccionado ───────────────────────────────────
const loteSeleccionado = ref(null);

// ── Dialogs ───────────────────────────────────────────────────────
const dialogs = ref({
  detalle: false,
  status: false,
});

// ── Formulario cambio de status ───────────────────────────────────
const formStatus = ref({ nuevo_status: 'activo' });
const guardandoStatus = ref(false);

// ── Menú contextual ───────────────────────────────────────────────
const menuRef = ref(null);

const menuItems = computed(() => [
  {
    label: 'Ver detalle',
    icon: 'pi pi-eye',
    command: () => abrirDialogDetalle(),
  },
  {
    label: 'Cambiar status',
    icon: 'pi pi-sync',
    command: () => abrirDialogStatus(),
  },
  { separator: true },
  {
    label: 'Eliminar',
    icon: 'pi pi-trash',
    class: 'farma-menu-item-danger',
    command: () => confirmarEliminar(),
  },
]);

function abrirMenu(event, lote) {
  loteSeleccionado.value = lote;
  menuRef.value?.toggle(event);
}

// ── Acciones de menú ──────────────────────────────────────────────
function abrirDialogDetalle() {
  dialogs.value.detalle = true;
}

function abrirDialogStatus() {
  formStatus.value.nuevo_status = loteSeleccionado.value?.status || 'activo';
  dialogs.value.status = true;
}

async function confirmarCambioStatus() {
  if (!loteSeleccionado.value) return;
  guardandoStatus.value = true;
  try {
    await lotesStore.cambiarStatusLote({
      lote_uuid: loteSeleccionado.value.lote_uuid,
      status: formStatus.value.nuevo_status,
    });
    dialogs.value.status = false;
    await cargarLotes();
  } catch (error) {
    console.error('Error al cambiar status:', error);
  } finally {
    guardandoStatus.value = false;
  }
}

async function confirmarEliminar() {
  if (!loteSeleccionado.value) return;
  const confirmado = window.confirm(
    `¿Eliminar el lote "${loteSeleccionado.value.codigo_lote}"? Esta acción no se puede deshacer.`
  );
  if (!confirmado) return;
  try {
    await lotesStore.eliminarLote(loteSeleccionado.value.lote_uuid);
    await cargarLotes();
  } catch (error) {
    console.error('Error al eliminar lote:', error);
  }
}

// ── Computeds de datos ────────────────────────────────────────────
const totalRegistros = computed(() => Number(lotesStore.total || 0));
const paginaActual = computed(() => Math.floor(first.value / rows.value) + 1);
const lotesTabla = computed(() => (lotesStore.cargando ? [] : (lotesStore.lotes ?? [])));

// ── Almacenes ─────────────────────────────────────────────────────
const almacenesOptions = computed(() =>
  (almacenesStore.almacenes ?? []).map((almacen) => ({
    label: almacen?.nombre || 'Almacén',
    value: almacen?.almacen_uuid || '',
    esPrincipal: (almacen?.nombre || '').toLowerCase().includes('farmacia'),
  }))
);

const almacenesOptionsConTodos = computed(() => [
  { label: 'Todos', value: '' },
  ...almacenesOptions.value,
]);

// ── Helpers ───────────────────────────────────────────────────────
function obtenerNombreAlmacenSeleccionado(almacenUuid) {
  const encontrado = almacenesOptionsConTodos.value.find((item) => item.value === almacenUuid);
  return encontrado?.label || 'Todos los almacenes';
}

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

function caducidadClass(fechaCaducidad) {
  if (!fechaCaducidad) return 'text-slate-500';
  const hoy = new Date();
  const caducidad = new Date(fechaCaducidad);
  const diffDias = Math.floor((caducidad - hoy) / (1000 * 60 * 60 * 24));
  if (diffDias < 0) return 'text-rose-600';
  if (diffDias <= 30) return 'text-amber-600';
  if (diffDias <= 90) return 'text-yellow-600';
  return 'text-slate-500';
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

function formatearNumero(value) {
  return Number(value ?? 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function obtenerAlmacenPrincipalUuid() {
  const almacenPrincipal = almacenesStore.almacenes?.find((almacen) =>
    String(almacen?.nombre || '').toLowerCase().includes('farmacia')
  );
  return almacenPrincipal?.almacen_uuid || '';
}

// ── Consulta API ──────────────────────────────────────────────────
function construirParamsConsulta() {
  const params = {
    page: paginaActual.value,
    limit: rows.value,
  };
  if (filtros.value.q?.trim()) params.q = filtros.value.q.trim();
  if (filtros.value.codigo_lote?.trim()) params.codigo_lote = filtros.value.codigo_lote.trim();
  if (filtros.value.almacen_uuid) params.almacen_uuid = filtros.value.almacen_uuid;
  if (filtros.value.status) params.status = filtros.value.status;
  return params;
}

async function cargarAlmacenes() {
  await almacenesStore.obtenerAlmacenes({ page: 1, limit: 100, status: 'activo' });
  if (!filtros.value.almacen_uuid) {
    filtros.value.almacen_uuid = obtenerAlmacenPrincipalUuid();
  }
}

async function cargarLotes() {
  await lotesStore.obtenerLotes(construirParamsConsulta());
}

function onBuscarInput() {
  clearTimeout(busquedaTimeout);
  busquedaTimeout = setTimeout(() => aplicarFiltros(), 350);
}

async function aplicarFiltros() {
  first.value = 0;
  await cargarLotes();
}

async function limpiarTodo() {
  clearTimeout(busquedaTimeout);
  filtros.value = {
    ...filtrosIniciales(),
    almacen_uuid: obtenerAlmacenPrincipalUuid(),
  };
  first.value = 0;
  await cargarLotes();
}

async function onAlmacenChange() {
  await aplicarFiltros();
}

async function onPage(event) {
  first.value = event.first;
  rows.value = event.rows;
  await cargarLotes();
}

// ── Watchers ──────────────────────────────────────────────────────
watch(
  () => authStore.sucursalActiva?.sucursal_uuid,
  async (nueva, anterior) => {
    if (!nueva || nueva === anterior) return;
    first.value = 0;
    filtros.value = filtrosIniciales();
    await cargarAlmacenes();
    await cargarLotes();
  }
);

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(async () => {
  await cargarAlmacenes();
  await cargarLotes();
});

onBeforeUnmount(() => {
  clearTimeout(busquedaTimeout);
});
</script>

<style scoped>
/* ─── Filtros bar ─────────────────────────────────────────────── */
.farma-filtros-bar {
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 1rem;
  background: #ffffff;
  padding: 1rem;
}

/* ─── Table shell ─────────────────────────────────────────────── */
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

/* ─── DataTable estilos ──────────────────────────────────────── */
.lotes-table {
  height: 100%;
}

.lotes-table :deep(.p-datatable) {
  height: 100%;
}

.lotes-table :deep(.p-datatable-table-container) {
  height: 100%;
}

.lotes-table :deep(.p-datatable-wrapper) {
  height: 100%;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-secondary) transparent;
}

.lotes-table :deep(.p-datatable-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.lotes-table :deep(.p-datatable-wrapper::-webkit-scrollbar-track) {
  background: transparent;
  border-radius: 9999px;
}

.lotes-table :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: var(--color-secondary);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.lotes-table :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb:hover) {
  background: var(--color-primary);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.lotes-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.14);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 1;
}

.lotes-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.72rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.08);
}

.lotes-table :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

.lotes-table :deep(.p-datatable-tbody > tr:hover > td) {
  background: rgba(59, 130, 246, 0.03);
}

/* ─── Inputs ─────────────────────────────────────────────────── */
.farma-search-input,
.farma-select-input,
.farma-input {
  width: 100%;
  min-height: 42px;
  height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
  font-size: 0.875rem;
  line-height: 1.25rem;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  padding: 0.625rem 0.9rem;
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

/* ─── Dropdown almacén ───────────────────────────────────────── */
:deep(.farma-dropdown.p-dropdown) {
  width: 100%;
  min-height: 42px;
  height: 42px;
  border: 1px solid #dbe5f0;
  border-radius: 0.95rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

:deep(.farma-dropdown.p-dropdown:hover) {
  border-color: #bfdbfe;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.08);
}

:deep(.farma-dropdown.p-dropdown.p-focus) {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

:deep(.farma-dropdown .p-dropdown-label) {
  padding: 0;
  display: flex;
  align-items: center;
}

.farma-dropdown-value-shell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  min-width: 0;
  padding: 0.625rem 0.9rem;
}

.farma-dropdown-value-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 0.65rem;
  background: #eff6ff;
  color: #2563eb;
  flex-shrink: 0;
  font-size: 0.78rem;
}

.farma-dropdown-value-text {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 500;
}

.farma-dropdown-placeholder-text {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 400;
}

:deep(.farma-dropdown .p-dropdown-trigger) {
  width: 2.75rem;
  min-width: 2.75rem;
  color: #94a3b8;
  background: transparent;
}

:deep(.farma-dropdown-panel.p-dropdown-panel) {
  border: 1px solid #dbe5f0;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  margin-top: 0.35rem;
}

:deep(.farma-dropdown-panel .p-dropdown-items) {
  padding: 0.4rem;
}

:deep(.farma-dropdown-panel .p-dropdown-item) {
  border-radius: 0.85rem;
  padding: 0.65rem 0.75rem;
  color: #334155;
  transition: background-color 0.18s ease, color 0.18s ease;
}

:deep(.farma-dropdown-panel .p-dropdown-item:hover) {
  background: #f8fafc;
}

:deep(.farma-dropdown-panel .p-dropdown-item.p-highlight) {
  background: #eff6ff;
  color: #1d4ed8;
}

.farma-dropdown-option-shell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.farma-dropdown-option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.7rem;
  flex-shrink: 0;
  font-size: 0.82rem;
}

.farma-dropdown-option-icon.is-todos {
  background: #f1f5f9;
  color: #64748b;
}

.farma-dropdown-option-icon.is-almacen {
  background: #eff6ff;
  color: #2563eb;
}

.farma-dropdown-option-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.farma-dropdown-option-title {
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.1rem;
}

.farma-dropdown-option-subtitle {
  color: #94a3b8;
  font-size: 0.75rem;
  line-height: 1rem;
}

/* ─── Botón menú (tres puntos) ───────────────────────────────── */
.farma-menu-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.6rem;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
  flex-shrink: 0;
}

.farma-menu-trigger:hover {
  background: #f1f5f9;
  color: #334155;
}

.farma-menu-trigger:active {
  background: #e2e8f0;
}

/* ─── Menu popup ────────────────────────────────────────────── */
:deep(.farma-menu-popup.p-menu) {
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
  padding: 0.35rem;
  min-width: 180px;
}

:deep(.farma-menu-popup .p-menuitem-link) {
  border-radius: 0.65rem;
  padding: 0.55rem 0.75rem;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

:deep(.farma-menu-popup .p-menuitem-link:hover) {
  background: #f8fafc;
  color: #1e293b;
}

:deep(.farma-menu-popup .p-menuitem-link .p-menuitem-icon) {
  font-size: 0.8rem;
  color: #64748b;
}

:deep(.farma-menu-popup .p-menuitem.farma-menu-item-danger .p-menuitem-link) {
  color: #e11d48;
}

:deep(.farma-menu-popup .p-menuitem.farma-menu-item-danger .p-menuitem-link:hover) {
  background: #fff1f2;
  color: #be123c;
}

:deep(.farma-menu-popup .p-menuitem.farma-menu-item-danger .p-menuitem-link .p-menuitem-icon) {
  color: #e11d48;
}

:deep(.farma-menu-popup .p-menu-separator) {
  border-top: 1px solid #f1f5f9;
  margin: 0.3rem 0;
}

/* ─── Botones ────────────────────────────────────────────────── */
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
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
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
  border: none;
}

.farma-btn-buscar:hover {
  background: #1d4ed8;
}

.farma-btn-buscar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ─── Mobile list / cards ────────────────────────────────────── */
.farma-mobile-list {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.farma-lote-card {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 0.95rem;
  padding: 0.875rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  transition: box-shadow 0.2s ease;
}

.farma-lote-card:hover {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.farma-lote-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
}

.farma-lote-card-field {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.farma-lote-card-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.farma-lote-card-value {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── Dialogs ────────────────────────────────────────────────── */
:deep(.farma-dialog-root .p-dialog) {
  border-radius: 1.25rem;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.16);
  border: 1px solid rgba(226, 232, 240, 0.8);
  overflow: hidden;
}

:deep(.farma-dialog-root .p-dialog-header) {
  padding: 1.25rem 1.5rem 0.75rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  background: #f8fafc;
}

:deep(.farma-dialog-root .p-dialog-content) {
  padding: 0;
  overflow: visible;
}

:deep(.farma-dialog-root .p-dialog-footer) {
  padding: 0.875rem 1.5rem;
  border-top: 1px solid rgba(226, 232, 240, 0.7);
  background: #f8fafc;
}

.farma-dialog-content-shell {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: visible;
}

/* ─── Detalle grid ───────────────────────────────────────────── */
.farma-detalle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1.25rem;
}

@media (max-width: 480px) {
  .farma-detalle-grid {
    grid-template-columns: 1fr;
  }
}

.farma-detalle-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.farma-detalle-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.farma-detalle-value {
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.3;
}

/* ─── Paginador ──────────────────────────────────────────────── */
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
