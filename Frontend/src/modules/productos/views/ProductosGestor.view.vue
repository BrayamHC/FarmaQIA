<template>
  <section class="flex min-h-[calc(100vh-8rem)] flex-col gap-8">
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

    <article class="card-base flex min-h-0 flex-1 flex-col overflow-hidden">
      <DataTable :value="productosStore.productos" :rows="productosStore.pageSize" :totalRecords="productosStore.total"
        paginator paginatorPosition="bottom"
        paginatorTemplate="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
        :rowsPerPageOptions="[5, 10, 20]" dataKey="producto_uuid" responsiveLayout="scroll"
        :loading="productosStore.cargando" stripedRows class="productos-table flex min-h-0 flex-1"
        tableStyle="min-width: 100%">
        <Column field="sku" header="SKU" style="width: 140px">
          <template #body="slotProps">
            <button
              class="font-mono text-[13px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              @click="abrirDetalle(slotProps.data)">
              {{ slotProps.data.sku }}
            </button>
          </template>
        </Column>

        <Column field="upc" header="UPC" style="width: 150px" />

        <Column field="nombre" header="Nombre" style="width: 220px" />

        <Column field="descripcion" header="Descripción">
          <template #body="slotProps">
            <span class="truncate text-slate-500">
              {{ slotProps.data.descripcion }}
            </span>
          </template>
        </Column>

        <Column field="categoria_nombre" header="Categoría" style="width: 170px" />

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
    </article>

    <Drawer v-model:visible="detalleVisible" position="right" :style="{ width: 'min(46rem, 92vw)' }" :dismissable="true"
      :showCloseIcon="true" class="producto-drawer">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-box text-white"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Detalle del producto
            </h2>
            <p class="text-sm text-slate-500">
              Información general y técnica del catálogo.
            </p>
          </div>
        </div>
      </template>

      <div v-if="productoSeleccionado" class="space-y-6">
        <section class="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-6">
          <div class="flex items-start gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <i class="pi pi-image text-2xl text-blue-200"></i>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold uppercase tracking-widest text-blue-600">
                {{ productoSeleccionado.sku }}
              </p>
              <h3 class="mt-1 text-2xl font-bold text-slate-900">
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
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-slate-100 text-slate-600'">
                  {{ productoSeleccionado.status }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h4 class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Información principal
          </h4>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">UPC</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ productoSeleccionado.upc }}</p>
            </div>

            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Presentación</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ productoSeleccionado.presentacion }}</p>
            </div>

            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Precio público</p>
              <p class="mt-2 text-sm font-semibold text-blue-600">${{ productoSeleccionado.precio_publico }}</p>
            </div>

            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Costo compra</p>
              <p class="mt-2 text-sm font-medium text-slate-900">${{ productoSeleccionado.costo_compra }}</p>
            </div>
          </div>
        </section>

        <section>
          <h4 class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Información técnica
          </h4>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Registro sanitario</p>
              <p class="mt-2 text-sm font-medium text-slate-900">
                {{ productoSeleccionado.numero_registro_sanitario }}
              </p>
            </div>

            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Temperatura</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ productoSeleccionado.temperatura }}</p>
            </div>

            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Con lote</p>
              <p class="mt-2 text-sm font-medium text-slate-900">
                {{ productoSeleccionado.con_lote ? 'Sí' : 'No' }}
              </p>
            </div>

            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Con impuestos</p>
              <p class="mt-2 text-sm font-medium text-slate-900">
                {{ productoSeleccionado.con_impuestos ? 'Sí' : 'No' }}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h4 class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Unidades y medidas
          </h4>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Peso</p>
              <p class="mt-2 text-sm font-medium text-slate-900">
                {{ productoSeleccionado.peso_valor }} {{ productoSeleccionado.peso_unidad }}
              </p>
            </div>

            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Volumen</p>
              <p class="mt-2 text-sm font-medium text-slate-900">
                {{ productoSeleccionado.volumen_valor }} {{ productoSeleccionado.volumen_unidad }}
              </p>
            </div>

            <div class="rounded-2xl bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Factor</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ productoSeleccionado.factor_unidades }}</p>
            </div>
          </div>
        </section>

        <section v-if="productoSeleccionado.tags">
          <h4 class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Tags
          </h4>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in productoSeleccionado.tags.split(',')" :key="tag"
              class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {{ tag.trim() }}
            </span>
          </div>
        </section>
      </div>
    </Drawer>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Drawer from 'primevue/drawer';
import { useProductosStore } from '../productosStore';

const productosStore = useProductosStore();
const detalleVisible = ref(false);
const productoSeleccionado = ref(null);

onMounted(() => {
  productosStore.obtenerProductos();
});

const abrirDetalle = (producto) => {
  productoSeleccionado.value = producto;
  detalleVisible.value = true;
};
</script>

<style scoped>
.productos-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.18);
}

.productos-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.1);
}

.productos-table :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

.productos-table :deep(.p-datatable-tbody > tr:hover) {
  background: rgba(59, 130, 246, 0.03);
}

.productos-table :deep(.p-paginator) {
  border-top: 1px solid rgba(96, 165, 250, 0.14);
  border-radius: 0;
  margin-top: auto;
  background: #fff;
}

.producto-drawer :deep(.p-drawer-content) {
  padding-top: 0.5rem;
}
</style>
