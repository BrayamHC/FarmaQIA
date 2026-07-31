<template>
  <Dialog :visible="visible" modal :draggable="false" :closable="true" :dismissableMask="true"
    :style="{ width: '72rem' }" :breakpoints="{ '1280px': '85vw', '768px': '95vw' }" class="farma-dialog"
    @update:visible="emit('update:visible', $event)" @hide="emit('hide')">
    <template #header>
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <i class="pi pi-box text-base"></i>
        </div>
        <div class="min-w-0">
          <h3 class="truncate text-base font-bold text-slate-900">
            {{ inventario?.nombre || 'Detalle de inventario' }}
          </h3>
          <p class="truncate text-xs text-slate-500">
            {{ inventario?.sku || 'Sin SKU' }}
          </p>
        </div>
      </div>
    </template>

    <div v-if="!inventario" class="flex flex-col items-center justify-center py-14 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <i class="pi pi-box text-2xl text-slate-300"></i>
      </div>
      <p class="text-sm font-medium text-slate-500">No hay información disponible</p>
    </div>

    <div v-else class="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1">
      <section class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Stock total</span>
          <strong class="farma-kpi-card__value">{{ inventario.stock_total ?? 0 }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Costo compra</span>
          <strong class="farma-kpi-card__value">{{ formatearMoneda(inventario.costo_compra) }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Precio público</span>
          <strong class="farma-kpi-card__value">{{ formatearMoneda(inventario.precio_publico) }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Con lote</span>
          <strong class="farma-kpi-card__value">{{ inventario.con_lote ? 'Sí' : 'No' }}</strong>
        </article>
      </section>

      <section class="farma-section-card">
        <header class="farma-section-card__header">
          <div>
            <h4 class="farma-section-card__title">Información general</h4>
            <p class="farma-section-card__subtitle">Resumen base del producto en inventario.</p>
          </div>
        </header>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div class="farma-info-row">
            <span class="farma-info-row__label">SKU</span>
            <span class="farma-info-row__value">{{ inventario.sku || '—' }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Categoría</span>
            <span class="farma-info-row__value">{{ inventario.categoria || '—' }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Presentación</span>
            <span class="farma-info-row__value">{{ inventario.presentacion || '—' }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">UUID</span>
            <span class="farma-info-row__value farma-break">{{ inventario.producto_uuid || '—' }}</span>
          </div>
        </div>
      </section>

      <section class="farma-section-card">
        <header class="farma-section-card__header">
          <div>
            <h4 class="farma-section-card__title">Stock por almacén</h4>
            <p class="farma-section-card__subtitle">Distribución de existencias y niveles configurados.</p>
          </div>
        </header>

        <div v-if="inventario.almacenes?.length" class="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <article v-for="almacen in inventario.almacenes" :key="`${inventario.producto_uuid}-${almacen.almacen_id}`"
            class="farma-nested-card">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-800">{{ almacen.almacen_nombre || 'Almacén' }}</p>
                <p class="text-xs text-slate-400">Configuración de stock</p>
              </div>
              <span class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {{ almacen.stock_actual ?? 0 }}
              </span>
            </div>

            <div class="mt-3 grid grid-cols-3 gap-2">
              <div class="farma-stat-mini">
                <span class="farma-stat-mini__label">Actual</span>
                <strong class="farma-stat-mini__value">{{ almacen.stock_actual ?? 0 }}</strong>
              </div>
              <div class="farma-stat-mini">
                <span class="farma-stat-mini__label">Mínimo</span>
                <strong class="farma-stat-mini__value">{{ almacen.stock_minimo ?? 0 }}</strong>
              </div>
              <div class="farma-stat-mini">
                <span class="farma-stat-mini__label">Máximo</span>
                <strong class="farma-stat-mini__value">{{ almacen.stock_maximo ?? 0 }}</strong>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="farma-empty-inline">
          No hay stock por almacén disponible.
        </div>
      </section>

      <section class="farma-section-card">
        <header class="farma-section-card__header">
          <div>
            <h4 class="farma-section-card__title">Lotes</h4>
            <p class="farma-section-card__subtitle">Detalle de lotes, caducidad y cantidad actual.</p>
          </div>
        </header>

        <div v-if="inventario.lotes?.length" class="space-y-3">
          <article v-for="lote in inventario.lotes"
            :key="`${inventario.producto_uuid}-${lote.codigo_lote}-${lote.almacen_nombre}`" class="farma-nested-card">
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-800">{{ lote.codigo_lote || 'Sin lote' }}</p>
                <p class="text-xs text-slate-400">{{ lote.almacen_nombre || 'Sin almacén' }}</p>
              </div>

              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="caducidadClass(lote.dias_para_caducar)">
                {{ textoCaducidad(lote.dias_para_caducar) }}
              </span>
            </div>

            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div class="farma-info-row">
                <span class="farma-info-row__label">Cantidad actual</span>
                <span class="farma-info-row__value">{{ lote.cantidad_actual ?? 0 }}</span>
              </div>
              <div class="farma-info-row">
                <span class="farma-info-row__label">Caducidad</span>
                <span class="farma-info-row__value">{{ formatearFecha(lote.fecha_caducidad) }}</span>
              </div>
              <div class="farma-info-row">
                <span class="farma-info-row__label">Días restantes</span>
                <span class="farma-info-row__value">{{ lote.dias_para_caducar ?? '—' }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="farma-empty-inline">
          No hay lotes registrados para este producto.
        </div>
      </section>
    </div>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog';

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  inventario: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:visible', 'hide']);

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
  return fecha.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function caducidadClass(dias) {
  if (dias == null) return 'bg-slate-100 text-slate-600';
  if (dias < 0) return 'bg-rose-50 text-rose-700';
  if (dias <= 30) return 'bg-amber-50 text-amber-700';
  return 'bg-emerald-50 text-emerald-700';
}

function textoCaducidad(dias) {
  if (dias == null) return 'Sin fecha';
  if (dias < 0) return 'Caducado';
  if (dias <= 30) return 'Próximo a caducar';
  return 'Vigente';
}
</script>

<style scoped>
.farma-dialog :deep(.p-dialog-header) {
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.farma-dialog :deep(.p-dialog-content) {
  padding: 1rem 1.25rem 1.25rem;
  background: #f8fafc;
}

.farma-kpi-card,
.farma-section-card,
.farma-nested-card {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #fff;
  border-radius: 1rem;
}

.farma-kpi-card {
  padding: 1rem;
}

.farma-kpi-card__label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.farma-kpi-card__value {
  display: block;
  margin-top: 0.45rem;
  font-size: 1.15rem;
  color: #0f172a;
}

.farma-section-card {
  padding: 1rem;
}

.farma-section-card__header {
  margin-bottom: 0.9rem;
}

.farma-section-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.farma-section-card__subtitle {
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: #64748b;
}

.farma-nested-card {
  padding: 0.9rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.farma-info-row {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.farma-info-row__label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.farma-info-row__value {
  font-size: 0.9rem;
  color: #0f172a;
}

.farma-stat-mini {
  border-radius: 0.85rem;
  background: #f8fafc;
  padding: 0.75rem;
}

.farma-stat-mini__label {
  display: block;
  font-size: 0.72rem;
  color: #94a3b8;
}

.farma-stat-mini__value {
  display: block;
  margin-top: 0.2rem;
  font-size: 1rem;
  color: #0f172a;
}

.farma-empty-inline {
  border: 1px dashed rgba(203, 213, 225, 0.95);
  border-radius: 1rem;
  background: #fff;
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

.farma-break {
  word-break: break-all;
}
</style>
