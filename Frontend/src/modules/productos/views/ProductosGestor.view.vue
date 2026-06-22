<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <!-- Header -->
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/inventario" class="transition hover:text-slate-600">Inventario</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Productos</span>
      </nav>

      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-box text-base text-white"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Gestor de Productos
            </h1>
            <p class="text-sm text-slate-500">
              Consulta, filtrado y detalle de productos del inventario.
            </p>
          </div>
        </div>

        <button
          class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
          <i class="pi pi-plus text-sm"></i>
          <span>Nuevo producto</span>
        </button>
      </div>
    </header>

    <!-- Filtros -->
    <div class="farma-filtros-bar">
      <!-- Búsqueda -->
      <div class="farma-filtros-busqueda">
        <label class="input-label text-xs font-medium text-slate-500">Buscar</label>
        <div class="relative">
          <i class="pi pi-search farma-search-icon"></i>
          <input v-model="filtros.busqueda" type="text" placeholder="SKU, UPC o nombre..." class="farma-search-input"
            @input="aplicarFiltros" />
        </div>
      </div>

      <!-- Fecha inicio -->
      <div class="farma-filtros-fecha">
        <label class="input-label text-xs font-medium text-slate-500">Fecha inicio</label>
        <div class="farma-datepicker-click" @click="abrirCalendario(fechaInicioRef)">
          <DatePicker ref="fechaInicioRef" v-model="filtros.fechaInicio" placeholder="YYYY-MM-DD" dateFormat="yy-mm-dd"
            showIcon iconDisplay="input" manualInput showOnFocus inputClass="farma-datepicker-input"
            class="w-full farma-datepicker" @date-select="aplicarFiltros"
            @update:modelValue="sincronizarInput(fechaInicioRef, filtros.fechaInicio)" />
        </div>
      </div>

      <!-- Fecha fin -->
      <div class="farma-filtros-fecha">
        <label class="input-label text-xs font-medium text-slate-500">Fecha fin</label>
        <div class="farma-datepicker-click" @click="abrirCalendario(fechaFinRef)">
          <DatePicker ref="fechaFinRef" v-model="filtros.fechaFin" placeholder="YYYY-MM-DD" dateFormat="yy-mm-dd"
            showIcon iconDisplay="input" manualInput showOnFocus inputClass="farma-datepicker-input"
            class="w-full farma-datepicker" @date-select="aplicarFiltros"
            @update:modelValue="sincronizarInput(fechaFinRef, filtros.fechaFin)" />
        </div>
      </div>

      <!-- Acciones -->
      <div class="farma-filtros-acciones">
        <button @click="limpiarTodo" title="Limpiar filtros" class="farma-btn-limpiar">
          <i class="pi pi-filter-slash text-sm"></i>
        </button>

        <button @click="aplicarFiltros" class="farma-btn-buscar">
          <i class="pi pi-search text-sm"></i>
          <span>Buscar</span>
        </button>
      </div>
    </div>

    <!-- Chips -->
    <div class="farma-filtros-activos-reserva">
      <div v-if="hayFiltrosActivos" class="flex flex-wrap items-center gap-1.5">
        <span class="text-xs font-medium text-slate-400">Filtros activos:</span>

        <span v-if="filtros.busqueda"
          class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <i class="pi pi-search text-[10px]"></i>
          {{ filtros.busqueda }}
          <button @click="limpiarFiltro('busqueda')" class="ml-0.5 hover:text-blue-900">
            <i class="pi pi-times text-[10px]"></i>
          </button>
        </span>

        <span v-if="filtros.fechaInicio"
          class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <i class="pi pi-calendar text-[10px]"></i>
          Desde {{ formatearFecha(filtros.fechaInicio) }}
          <button @click="limpiarFiltro('fechaInicio')" class="ml-0.5 hover:text-blue-900">
            <i class="pi pi-times text-[10px]"></i>
          </button>
        </span>

        <span v-if="filtros.fechaFin"
          class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <i class="pi pi-calendar text-[10px]"></i>
          Hasta {{ formatearFecha(filtros.fechaFin) }}
          <button @click="limpiarFiltro('fechaFin')" class="ml-0.5 hover:text-blue-900">
            <i class="pi pi-times text-[10px]"></i>
          </button>
        </span>
      </div>
    </div>

    <!-- Tabla -->
    <article class="card-base farma-table-shell flex min-h-0 flex-1 flex-col overflow-hidden">
      <DataTable :value="productosPaginados" scrollable scrollHeight="flex" dataKey="producto_uuid"
        tableStyle="min-width: 100%" :loading="productosStore.cargando" stripedRows
        class="productos-table app-scroll flex-1">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <i class="pi pi-box text-2xl text-slate-300"></i>
            </div>
            <p class="text-sm font-medium text-slate-500">No se encontraron productos</p>
            <p class="mt-1 text-xs text-slate-400">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </template>

        <Column field="sku" header="SKU" style="width: 140px">
          <template #body="slotProps">
            <button
              class="font-mono text-[13px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              @click="abrirDetalle(slotProps.data)">
              {{ slotProps.data.sku }}
            </button>
          </template>
        </Column>

        <Column field="upc" header="UPC" style="width: 160px" />
        <Column field="nombre" header="Nombre" style="width: 220px" />

        <Column field="descripcion" header="Descripción">
          <template #body="slotProps">
            <span class="line-clamp-1 text-sm text-slate-500">
              {{ slotProps.data.descripcion }}
            </span>
          </template>
        </Column>

        <Column field="categoria_nombre" header="Categoría" style="width: 170px" />

        <Column field="fecha_creacion" header="Creación" style="width: 140px">
          <template #body="slotProps">
            <span class="text-xs text-slate-500">
              {{ slotProps.data.fecha_creacion?.slice(0, 10) ?? '—' }}
            </span>
          </template>
        </Column>

        <Column field="status" header="Status" style="width: 110px">
          <template #body="slotProps">
            <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" :class="slotProps.data.status === 'Activo'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-slate-100 text-slate-600'">
              {{ slotProps.data.status }}
            </span>
          </template>
        </Column>
      </DataTable>

      <div class="farma-paginator-wrap">
        <Paginator v-model:first="first" v-model:rows="rows" :totalRecords="productosFiltrados.length"
          :rowsPerPageOptions="[10, 20, 30]"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          class="farma-paginator" />
      </div>
    </article>

    <!-- Overlay backdrop -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="detalleVisible" class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
          @click="detalleVisible = false" />
      </Transition>
    </Teleport>

    <!-- Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <aside v-if="detalleVisible" class="fixed inset-y-0 right-0 z-50 flex flex-col bg-white"
          style="width: min(46rem, 92vw); box-shadow: var(--shadow-lg);">
          <div
            class="flex items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                <i class="pi pi-box text-white"></i>
              </div>
              <div>
                <h2 class="text-xl font-bold text-slate-900" style="font-family: var(--font-title)">
                  Detalle del producto
                </h2>
                <p class="text-sm text-slate-500">Información general y técnica del catálogo.</p>
              </div>
            </div>

            <button
              class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              @click="detalleVisible = false">
              <i class="pi pi-times text-base"></i>
            </button>
          </div>

          <div class="app-scroll flex-1 overflow-y-auto px-6 py-6">
            <div v-if="productoSeleccionado" class="space-y-6">
              <section class="rounded-2xl border border-blue-100/60 bg-gradient-to-br from-blue-50 to-white p-6">
                <div class="flex items-start gap-4">
                  <div
                    class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm">
                    <i class="pi pi-image text-2xl text-blue-200"></i>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-semibold uppercase tracking-widest text-blue-600">
                      {{ productoSeleccionado.sku }}
                    </p>
                    <h3 class="mt-1 text-xl font-bold text-slate-900">
                      {{ productoSeleccionado.nombre }}
                    </h3>
                    <p class="mt-1 text-sm leading-relaxed text-slate-600">
                      {{ productoSeleccionado.descripcion }}
                    </p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {{ productoSeleccionado.categoria_nombre }}
                      </span>
                      <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="productoSeleccionado.status === 'Activo'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'">
                        {{ productoSeleccionado.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Información principal
                </p>
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">UPC</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">{{ productoSeleccionado.upc }}</p>
                  </div>
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Presentación</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ productoSeleccionado.presentacion }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-blue-400">Precio público</p>
                    <p class="mt-1.5 text-sm font-bold text-blue-600">
                      ${{ productoSeleccionado.precio_publico }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Costo compra</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      ${{ productoSeleccionado.costo_compra }}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Información técnica
                </p>
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Registro sanitario
                    </p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ productoSeleccionado.numero_registro_sanitario }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Temperatura</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ productoSeleccionado.temperatura }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Con lote</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ productoSeleccionado.con_lote ? 'Sí' : 'No' }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Con impuestos</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ productoSeleccionado.con_impuestos ? 'Sí' : 'No' }}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Unidades y medidas
                </p>
                <div class="grid grid-cols-3 gap-3">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Peso</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ productoSeleccionado.peso_valor }} {{ productoSeleccionado.peso_unidad }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Volumen</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ productoSeleccionado.volumen_valor }} {{ productoSeleccionado.volumen_unidad }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Factor</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ productoSeleccionado.factor_unidades }}
                    </p>
                  </div>
                </div>
              </section>

              <section v-if="productoSeleccionado.tags">
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Tags</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in productoSeleccionado.tags.split(',')" :key="tag"
                    class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {{ tag.trim() }}
                  </span>
                </div>
              </section>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import Paginator from 'primevue/paginator';
import { useProductosStore } from '../productosStore';

const productosStore = useProductosStore();
const detalleVisible = ref(false);
const productoSeleccionado = ref(null);

const fechaInicioRef = ref(null);
const fechaFinRef = ref(null);

const filtros = ref({
  busqueda: '',
  fechaInicio: null,
  fechaFin: null,
});

const first = ref(0);
const rows = ref(10);

const getInput = (pickerRef) =>
  pickerRef?.value?.$el?.querySelector('input') ||
  pickerRef?.value?.$el?.querySelector('.p-inputtext');

const formatearFecha = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parsearFecha = (value) => {
  const limpio = String(value || '').replace(/\D/g, '').slice(0, 8);
  if (limpio.length !== 8) return null;

  const y = Number(limpio.slice(0, 4));
  const m = Number(limpio.slice(4, 6));
  const d = Number(limpio.slice(6, 8));
  const fecha = new Date(y, m - 1, d);

  return fecha.getFullYear() === y && fecha.getMonth() === m - 1 && fecha.getDate() === d
    ? fecha
    : null;
};

const enmascararFecha = (value) => {
  const limpio = String(value || '').replace(/\D/g, '').slice(0, 8);
  if (limpio.length <= 4) return limpio;
  if (limpio.length <= 6) return `${limpio.slice(0, 4)}-${limpio.slice(4)}`;
  return `${limpio.slice(0, 4)}-${limpio.slice(4, 6)}-${limpio.slice(6, 8)}`;
};

const sincronizarInput = async (pickerRef, valor) => {
  await nextTick();
  const input = getInput(pickerRef);
  if (input) input.value = formatearFecha(valor);
};

const configurarInputFecha = async (pickerRef, campo) => {
  await nextTick();
  const input = getInput(pickerRef);
  if (!input || input.dataset.masked === 'true') return;

  input.dataset.masked = 'true';
  input.setAttribute('placeholder', 'YYYY-MM-DD');
  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('maxlength', '10');
  input.autocomplete = 'off';
  input.spellcheck = false;

  input.addEventListener('keydown', (e) => {
    if (
      e.ctrlKey ||
      e.metaKey ||
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) ||
      /^\d$/.test(e.key)
    ) {
      return;
    }
    e.preventDefault();
  });

  input.addEventListener('input', (e) => {
    const masked = enmascararFecha(e.target.value);
    e.target.value = masked;
    filtros.value[campo] = parsearFecha(masked);
    aplicarFiltros();
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text') ?? '';
    const masked = enmascararFecha(text);
    input.value = masked;
    filtros.value[campo] = parsearFecha(masked);
    aplicarFiltros();
  });

  input.addEventListener('blur', () => sincronizarInput(pickerRef, filtros.value[campo]));
};

const abrirCalendario = async (pickerRef) => {
  pickerRef?.value?.showOverlay?.();
  await nextTick();
  getInput(pickerRef)?.focus();
};

const productosFiltrados = computed(() => {
  let lista = productosStore.productos ?? [];
  const q = filtros.value.busqueda.trim().toLowerCase();

  if (q) {
    lista = lista.filter(
      (p) =>
        p.sku?.toLowerCase().includes(q) ||
        p.upc?.toLowerCase().includes(q) ||
        p.nombre?.toLowerCase().includes(q),
    );
  }

  if (filtros.value.fechaInicio) {
    const desde = new Date(filtros.value.fechaInicio);
    desde.setHours(0, 0, 0, 0);
    lista = lista.filter((p) => p.fecha_creacion && new Date(p.fecha_creacion) >= desde);
  }

  if (filtros.value.fechaFin) {
    const hasta = new Date(filtros.value.fechaFin);
    hasta.setHours(23, 59, 59, 999);
    lista = lista.filter((p) => p.fecha_creacion && new Date(p.fecha_creacion) <= hasta);
  }

  return lista;
});

const productosPaginados = computed(() =>
  productosFiltrados.value.slice(first.value, first.value + rows.value),
);

const hayFiltrosActivos = computed(
  () => filtros.value.busqueda || filtros.value.fechaInicio || filtros.value.fechaFin,
);

const aplicarFiltros = () => {
  first.value = 0;
};

const limpiarFiltro = (campo) => {
  filtros.value[campo] = campo === 'busqueda' ? '' : null;
  first.value = 0;

  if (campo === 'fechaInicio') sincronizarInput(fechaInicioRef, filtros.value.fechaInicio);
  if (campo === 'fechaFin') sincronizarInput(fechaFinRef, filtros.value.fechaFin);
};

const limpiarTodo = () => {
  filtros.value = {
    busqueda: '',
    fechaInicio: null,
    fechaFin: null,
  };
  first.value = 0;
  sincronizarInput(fechaInicioRef, null);
  sincronizarInput(fechaFinRef, null);
};

watch(rows, () => {
  first.value = 0;
});

watch(() => filtros.value.fechaInicio, () => sincronizarInput(fechaInicioRef, filtros.value.fechaInicio));
watch(() => filtros.value.fechaFin, () => sincronizarInput(fechaFinRef, filtros.value.fechaFin));

onMounted(async () => {
  productosStore.obtenerProductos();
  await configurarInputFecha(fechaInicioRef, 'fechaInicio');
  await configurarInputFecha(fechaFinRef, 'fechaFin');
  await sincronizarInput(fechaInicioRef, filtros.value.fechaInicio);
  await sincronizarInput(fechaFinRef, filtros.value.fechaFin);
});

const abrirDetalle = (producto) => {
  productoSeleccionado.value = producto;
  detalleVisible.value = true;
};
</script>

<style scoped>
.productos-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.14);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 1;
}

.productos-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.72rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.08);
}

.productos-table :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

.productos-table :deep(.p-datatable-tbody > tr:hover > td) {
  background: rgba(59, 130, 246, 0.03);
}

.farma-table-shell {
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 1rem;
  background: #ffffff;
}

.farma-filtros-activos-reserva {
  min-height: 1rem;
}

.farma-datepicker-click {
  width: 100%;
  cursor: text;
}

.farma-datepicker :deep(.p-datepicker-input),
.farma-datepicker :deep(.farma-datepicker-input) {
  width: 100%;
  height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
  padding: 0.625rem 2.6rem 0.625rem 0.9rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.farma-datepicker :deep(.p-datepicker-input::placeholder),
.farma-datepicker :deep(.farma-datepicker-input::placeholder) {
  color: #94a3b8;
}

.farma-datepicker :deep(.p-datepicker-input:focus),
.farma-datepicker :deep(.farma-datepicker-input:focus) {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.farma-datepicker :deep(.p-datepicker-dropdown),
.farma-datepicker :deep(.p-datepicker-input-icon-container) {
  color: #64748b;
}

.farma-datepicker :deep(.p-datepicker-dropdown) {
  width: 2.5rem;
  border: 0;
  background: transparent;
  border-radius: 0 0.85rem 0.85rem 0;
}

.farma-datepicker :deep(.p-datepicker-dropdown:hover) {
  background: rgba(59, 130, 246, 0.06);
  color: #2563eb;
}

.farma-paginator-wrap {
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

.farma-paginator :deep(.p-paginator-content) {
  gap: 0.25rem;
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
  transition: all 0.18s ease;
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

.farma-paginator :deep(.p-select),
.farma-paginator :deep(.p-dropdown) {
  border: 1px solid #e2e8f0 !important;
  box-shadow: none !important;
  min-height: 2rem;
  border-radius: 0.65rem;
}

.farma-paginator :deep(.p-paginator-rpp-dropdown) {
  margin-left: 0.5rem;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.drawer-enter-to,
.drawer-leave-from {
  transform: translateX(0%);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
