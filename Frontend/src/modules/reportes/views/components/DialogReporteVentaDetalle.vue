<template>
  <Dialog :visible="visible" modal :draggable="false" :closable="true" :dismissableMask="true"
    :style="{ width: '74rem' }" :breakpoints="{ '1280px': '88vw', '768px': '96vw' }" class="farma-dialog"
    @update:visible="emit('update:visible', $event)" @hide="emit('hide')">
    <template #header>
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <i class="pi pi-chart-line text-base"></i>
        </div>
        <div class="min-w-0">
          <h3 class="truncate text-base font-bold text-slate-900">
            {{ venta?.folio || 'Detalle de venta' }}
          </h3>
          <p class="truncate text-xs text-slate-500">
            {{ formatearFechaHora(venta?.fecha_venta) }}
          </p>
        </div>
      </div>
    </template>

    <div v-if="!venta" class="flex flex-col items-center justify-center py-14 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <i class="pi pi-chart-line text-2xl text-slate-300"></i>
      </div>
      <p class="text-sm font-medium text-slate-500">No hay información disponible</p>
    </div>

    <div v-else class="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1">
      <section class="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Subtotal</span>
          <strong class="farma-kpi-card__value">{{ formatearMoneda(venta.subtotal) }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Descuento</span>
          <strong class="farma-kpi-card__value">{{ formatearMoneda(venta.descuento_total) }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Impuesto</span>
          <strong class="farma-kpi-card__value">{{ formatearMoneda(venta.impuesto_total) }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Total</span>
          <strong class="farma-kpi-card__value text-emerald-700">{{ formatearMoneda(venta.total) }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Status</span>
          <strong class="farma-kpi-card__value">{{ capitalizar(venta.status) }}</strong>
        </article>
      </section>

      <section class="farma-section-card">
        <header class="farma-section-card__header">
          <div>
            <h4 class="farma-section-card__title">Información general</h4>
            <p class="farma-section-card__subtitle">Datos principales de la venta.</p>
          </div>
        </header>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div class="farma-info-row">
            <span class="farma-info-row__label">Folio</span>
            <span class="farma-info-row__value">{{ venta.folio || '—' }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Cliente</span>
            <span class="farma-info-row__value">{{ venta.cliente_nombre || 'Público general' }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Método de pago</span>
            <span class="farma-info-row__value">{{ capitalizar(venta.metodo_pago) }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Monto recibido</span>
            <span class="farma-info-row__value">{{ formatearMoneda(venta.monto_recibido) }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Cambio</span>
            <span class="farma-info-row__value">{{ formatearMoneda(venta.cambio) }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">UUID</span>
            <span class="farma-info-row__value farma-break">{{ venta.venta_uuid || '—' }}</span>
          </div>
        </div>
      </section>

      <section class="farma-section-card">
        <header class="farma-section-card__header">
          <div>
            <h4 class="farma-section-card__title">Partidas</h4>
            <p class="farma-section-card__subtitle">Detalle de productos incluidos en la venta.</p>
          </div>
        </header>

        <div v-if="venta.detalles?.length" class="space-y-3">
          <article v-for="detalle in venta.detalles" :key="detalle.detalle_uuid" class="farma-nested-card">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-800">
                  {{ detalle.producto_nombre_snapshot || 'Producto' }}
                </p>
                <p class="text-xs text-slate-400">{{ detalle.sku_snapshot || 'Sin SKU' }}</p>
              </div>

              <span class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Cantidad: {{ detalle.cantidad ?? 0 }}
              </span>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <div class="farma-info-row">
                <span class="farma-info-row__label">Precio unitario</span>
                <span class="farma-info-row__value">{{ formatearMoneda(detalle.precio_unitario) }}</span>
              </div>
              <div class="farma-info-row">
                <span class="farma-info-row__label">Descuento</span>
                <span class="farma-info-row__value">{{ formatearMoneda(detalle.descuento) }}</span>
              </div>
              <div class="farma-info-row">
                <span class="farma-info-row__label">Impuesto</span>
                <span class="farma-info-row__value">{{ formatearMoneda(detalle.impuesto) }}</span>
              </div>
              <div class="farma-info-row">
                <span class="farma-info-row__label">Subtotal</span>
                <span class="farma-info-row__value">{{ formatearMoneda(detalle.subtotal) }}</span>
              </div>
              <div class="farma-info-row">
                <span class="farma-info-row__label">Total</span>
                <span class="farma-info-row__value text-emerald-700">{{ formatearMoneda(detalle.total) }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="farma-empty-inline">
          No hay partidas registradas para esta venta.
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
  venta: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:visible', 'hide']);

function capitalizar(valor) {
  if (!valor) return '—';
  return String(valor).charAt(0).toUpperCase() + String(valor).slice(1);
}

function formatearMoneda(valor) {
  return Number(valor || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

function formatearFechaHora(valor) {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  font-size: 1.05rem;
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
