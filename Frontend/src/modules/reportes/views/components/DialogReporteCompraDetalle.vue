<template>
  <Dialog :visible="visible" modal :draggable="false" :closable="true" :dismissableMask="true"
    :style="{ width: '74rem' }" :breakpoints="{ '1280px': '88vw', '768px': '96vw' }" class="farma-dialog"
    @update:visible="emit('update:visible', $event)" @hide="emit('hide')">
    <template #header>
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <i class="pi pi-shopping-cart text-base"></i>
        </div>
        <div class="min-w-0">
          <h3 class="truncate text-base font-bold text-slate-900">
            {{ compra?.folio_display || 'Detalle de compra' }}
          </h3>
          <p class="truncate text-xs text-slate-500">
            {{ formatearFecha(compra?.fecha_orden) }}
          </p>
        </div>
      </div>
    </template>

    <div v-if="!compra" class="flex flex-col items-center justify-center py-14 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <i class="pi pi-shopping-cart text-2xl text-slate-300"></i>
      </div>
      <p class="text-sm font-medium text-slate-500">No hay información disponible</p>
    </div>

    <div v-else class="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1">
      <section class="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Subtotal</span>
          <strong class="farma-kpi-card__value">{{ formatearMoneda(compra.subtotal_estimado) }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">IVA</span>
          <strong class="farma-kpi-card__value">{{ formatearMoneda(compra.iva_estimado) }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Total</span>
          <strong class="farma-kpi-card__value text-emerald-700">{{ formatearMoneda(compra.total_estimado) }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Moneda</span>
          <strong class="farma-kpi-card__value">{{ compra.moneda || '—' }}</strong>
        </article>

        <article class="farma-kpi-card">
          <span class="farma-kpi-card__label">Status</span>
          <strong class="farma-kpi-card__value">{{ compra.status || '—' }}</strong>
        </article>
      </section>

      <section class="farma-section-card">
        <header class="farma-section-card__header">
          <div>
            <h4 class="farma-section-card__title">Información general</h4>
            <p class="farma-section-card__subtitle">Datos principales de la orden de compra.</p>
          </div>
        </header>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div class="farma-info-row">
            <span class="farma-info-row__label">Folio</span>
            <span class="farma-info-row__value">{{ compra.folio_display || '—' }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Proveedor</span>
            <span class="farma-info-row__value">{{ compra.proveedor_nombre || '—' }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Almacén</span>
            <span class="farma-info-row__value">{{ compra.almacen_nombre || '—' }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Fecha entrega estimada</span>
            <span class="farma-info-row__value">{{ formatearFecha(compra.fecha_entrega_estimada) }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Condiciones pago</span>
            <span class="farma-info-row__value">{{ compra.condiciones_pago || '—' }}</span>
          </div>
          <div class="farma-info-row">
            <span class="farma-info-row__label">Tipo cambio</span>
            <span class="farma-info-row__value">{{ compra.tipo_cambio ?? '—' }}</span>
          </div>
        </div>

        <div class="mt-4 farma-info-row">
          <span class="farma-info-row__label">Notas</span>
          <span class="farma-info-row__value">{{ compra.notas || 'Sin notas registradas' }}</span>
        </div>
      </section>

      <section class="farma-section-card">
        <header class="farma-section-card__header">
          <div>
            <h4 class="farma-section-card__title">Partidas</h4>
            <p class="farma-section-card__subtitle">Detalle de productos incluidos en la orden.</p>
          </div>
        </header>

        <div v-if="compra.detalles?.length" class="space-y-3">
          <article v-for="detalle in compra.detalles" :key="detalle.partida_oc_uuid" class="farma-nested-card">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-800">
                  {{ detalle.producto_nombre || 'Producto' }}
                </p>
                <p class="text-xs text-slate-400">{{ detalle.sku || 'Sin SKU' }}</p>
              </div>

              <span class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {{ detalle.status || '—' }}
              </span>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <div class="farma-info-row">
                <span class="farma-info-row__label">Cant. solicitada</span>
                <span class="farma-info-row__value">{{ detalle.cantidad_solicitada ?? 0 }}</span>
              </div>
              <div class="farma-info-row">
                <span class="farma-info-row__label">Cant. recibida</span>
                <span class="farma-info-row__value">{{ detalle.cantidad_recibida ?? 0 }}</span>
              </div>
              <div class="farma-info-row">
                <span class="farma-info-row__label">P. unitario</span>
                <span class="farma-info-row__value">{{ formatearMoneda(detalle.precio_unitario_est) }}</span>
              </div>
              <div class="farma-info-row">
                <span class="farma-info-row__label">Desc. importe</span>
                <span class="farma-info-row__value">{{ formatearMoneda(detalle.descuento_importe) }}</span>
              </div>
              <div class="farma-info-row">
                <span class="farma-info-row__label">Subtotal</span>
                <span class="farma-info-row__value text-emerald-700">{{ formatearMoneda(detalle.subtotal_estimado)
                  }}</span>
              </div>
            </div>

            <div class="mt-3 farma-info-row">
              <span class="farma-info-row__label">Comentarios</span>
              <span class="farma-info-row__value">{{ detalle.comentarios || 'Sin comentarios' }}</span>
            </div>
          </article>
        </div>

        <div v-else class="farma-empty-inline">
          No hay partidas registradas para esta compra.
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
  compra: {
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
</style>
