<template>
  <section class="pos-root flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] flex-col overflow-hidden bg-slate-50">
    <header class="shrink-0 border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <nav class="flex items-center gap-1.5 text-xs text-slate-400">
            <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
            <i class="pi pi-chevron-right text-[10px]"></i>
            <span class="font-medium text-blue-600">Punto de Venta</span>
          </nav>

          <div class="mt-2 flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-sm shadow-blue-200/70">
              <i class="pi pi-shopping-bag text-white"></i>
            </div>

            <div class="min-w-0">
              <h1 class="truncate text-lg font-bold text-slate-900">Punto de Venta</h1>
              <p class="text-xs text-slate-500">
                Caja rápida para ventas, selección por lote y cobro inmediato.
              </p>
            </div>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <div class="hidden rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 md:block">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Caja
            </p>
            <p class="mt-0.5 text-xs font-bold text-emerald-700">Activa y lista</p>
          </div>

          <button class="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition" :class="clienteSeleccionado
              ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            " @click="dialogClientes = true">
            <i class="pi pi-user text-xs"></i>
            <span class="max-w-[170px] truncate font-medium">
              {{ nombreClienteSeleccionado }}
            </span>
            <i class="pi pi-chevron-down text-[10px]"></i>
          </button>

          <button v-if="!carritoVacio"
            class="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
            @click="confirmarCancelar">
            <i class="pi pi-times text-xs"></i>
            Cancelar venta
          </button>
        </div>
      </div>
    </header>

    <div class="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
      <div class="flex items-center gap-3">
        <div class="relative flex-1">
          <i class="pi pi-barcode absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input ref="buscadorRef" v-model="scanQuery" type="text"
            placeholder="Escanea código de barras o escribe SKU, UPC o nombre..."
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
            autocomplete="off" @keydown.enter.prevent="onScanEnter" @input="onScanInput" />
        </div>

        <button
          class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          @click="dialogBuscar = true">
          <i class="pi pi-search text-xs"></i>
          Búsqueda manual
        </button>
      </div>

      <div class="mt-2 flex flex-wrap items-center gap-2">
        <span
          class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Enter para buscar
        </span>
        <span
          class="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
          SKU / UPC / nombre
        </span>
        <span
          class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
          Lotes FEFO
        </span>
      </div>

      <div v-if="mensajeError"
        class="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
        {{ mensajeError }}
      </div>
    </div>

    <div class="flex min-h-0 flex-1 overflow-hidden">
      <div class="pos-main-panel flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div class="shrink-0 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-5 py-3">
          <div
            class="grid grid-cols-[1fr_90px_120px_44px] gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Producto</span>
            <span class="text-center">Cantidad</span>
            <span class="text-right">Importe</span>
            <span></span>
          </div>
        </div>

        <div class="pos-carrito-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div v-if="carritoVacio" class="flex h-full flex-col items-center justify-center gap-4 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 shadow-inner">
              <i class="pi pi-shopping-cart text-3xl text-slate-300"></i>
            </div>

            <div class="text-center">
              <p class="text-sm font-semibold text-slate-500">Carrito vacío</p>
              <p class="mt-1 text-xs text-slate-400">
                Escanea un producto o usa la búsqueda manual para comenzar la venta.
              </p>
            </div>
          </div>

          <TransitionGroup v-else name="carrito-item" tag="div">
            <div v-for="item in carrito" :key="item._key"
              class="grid grid-cols-[1fr_90px_120px_44px] items-center gap-2 border-b border-slate-100 px-5 py-3 transition hover:bg-slate-50/70">
              <div class="min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-800">
                      {{ item.producto.nombre }}
                    </p>

                    <div class="mt-1 flex flex-wrap items-center gap-2">
                      <span class="font-mono text-[11px] text-slate-400">
                        {{ item.producto.sku || 'Sin SKU' }}
                      </span>

                      <span v-if="item.producto?.presentacion"
                        class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {{ item.producto.presentacion }}
                      </span>

                      <span v-if="item.lote"
                        class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Lote: {{ item.lote.codigo_lote || item.lote.clave || 'Sin lote' }}
                      </span>

                      <span v-if="item.lote?.fecha_caducidad"
                        class="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Caduca: {{ formatFecha(item.lote.fecha_caducidad) }}
                      </span>

                      <span v-if="item.lote"
                        class="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        Stock lote: {{ Number(item.lote.cantidad_actual ?? item.lote.cantidad ?? 0) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-center gap-1">
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
                  @click="store.actualizarCantidadProducto(item._key, item.cantidad - 1)">
                  <i class="pi pi-minus text-[10px]"></i>
                </button>

                <input :value="item.cantidad" type="number" min="1"
                  class="w-10 rounded-xl border border-slate-200 bg-white py-1.5 text-center text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  @change="store.actualizarCantidadProducto(item._key, Number($event.target.value))" />

                <button
                  class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
                  @click="store.actualizarCantidadProducto(item._key, item.cantidad + 1)">
                  <i class="pi pi-plus text-[10px]"></i>
                </button>
              </div>

              <div class="text-right">
                <p class="text-sm font-bold text-slate-800">
                  {{ formatMoneda(item.cantidad * (item.precio_unitario ?? 0)) }}
                </p>
                <p class="text-[10px] text-slate-400">
                  {{ formatMoneda(item.precio_unitario ?? 0) }} c/u
                </p>
              </div>

              <button
                class="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                @click="store.eliminarProductoDelCarrito(item._key)">
                <i class="pi pi-trash text-sm"></i>
              </button>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <aside
        class="pos-resumen-panel flex w-80 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white xl:w-[22rem]">
        <div class="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-5 py-4">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cliente</p>

          <div class="mt-2 flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100">
              <i class="pi pi-user text-sm text-blue-600"></i>
            </div>

            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-800">
                {{ nombreClienteSeleccionado }}
              </p>
              <p class="text-[11px] text-slate-400">Seleccionado desde el buscador</p>
            </div>
          </div>
        </div>

        <div class="pos-resumen-scroll flex-1 overflow-y-auto px-5 py-4">
          <p class="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Resumen</p>

          <div class="space-y-3">
            <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
              <div class="flex items-center justify-between text-sm text-slate-600">
                <span>Artículos</span>
                <span class="font-semibold text-slate-800">{{ totalArticulos }}</span>
              </div>

              <div class="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span class="font-semibold text-slate-800">{{ formatMoneda(subtotal) }}</span>
              </div>
            </div>

            <div
              class="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-100/60 p-4 shadow-sm shadow-blue-100/70">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500">Total a cobrar</p>
                  <p class="mt-1 text-3xl font-black tracking-tight text-blue-700">
                    {{ formatMoneda(totalGeneral) }}
                  </p>
                </div>

                <div
                  class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
                  <i class="pi pi-wallet text-base"></i>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-2">
                <div class="rounded-2xl bg-white/80 px-3 py-2">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Productos</p>
                  <p class="mt-1 text-sm font-bold text-slate-800">{{ totalArticulos }}</p>
                </div>

                <div class="rounded-2xl bg-white/80 px-3 py-2">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cliente</p>
                  <p class="mt-1 truncate text-sm font-bold text-slate-800">
                    {{ nombreClienteSeleccionado }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="shrink-0 border-t border-slate-100 p-4">
          <button :disabled="carritoVacio" class="premium-cobrar-btn group w-full" @click="dialogCobrar = true">
            <span class="premium-cobrar-btn__icon">
              <i class="pi pi-credit-card text-sm"></i>
            </span>

            <span class="flex min-w-0 flex-1 flex-col items-start text-left">
              <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100/90">
                Cobrar ahora
              </span>
              <span class="truncate text-base font-bold text-white">
                {{ carritoVacio ? 'Sin productos' : formatMoneda(totalGeneral) }}
              </span>
            </span>

            <span class="premium-cobrar-btn__arrow">
              <i class="pi pi-arrow-right text-xs"></i>
            </span>
          </button>
        </div>
      </aside>
    </div>

    <DialogBuscarProducto v-model="dialogBuscar" :termino-inicial="scanQuery" @seleccionar="onProductoSeleccionado" />

    <DialogSeleccionarLote v-model="dialogLote" :producto="productoPendiente" @confirmar="onLoteSeleccionado" />

    <DialogSeleccionarCliente v-model="dialogClientes" @seleccionar="onClienteSeleccionado"
      @limpiar="onLimpiarCliente" />

    <DialogCobrar v-model="dialogCobrar" :carrito="carrito" :total="totalGeneral" :subtotal="subtotal"
      :total-articulos="totalArticulos" :cliente="clienteSeleccionado" @confirmar="onConfirmarVenta" />
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useVentasStore } from '../../ventasStore';
import DialogBuscarProducto from './dialogs/DialogBuscarProducto.vue';
import DialogSeleccionarLote from './dialogs/DialogSeleccionarLote.vue';
import DialogSeleccionarCliente from './dialogs/DialogSeleccionarCliente.vue';
import DialogCobrar from './dialogs/DialogCobrar.vue';

const store = useVentasStore();

const buscadorRef = ref(null);
const scanQuery = ref('');
const dialogBuscar = ref(false);
const dialogLote = ref(false);
const dialogClientes = ref(false);
const dialogCobrar = ref(false);
const productoPendiente = ref(null);
const mensajeError = ref('');
let scanTimeout = null;

const carrito = computed(() => store.carrito);
const carritoVacio = computed(() => store.carritoVacio);
const totalArticulos = computed(() => store.totalArticulos);
const subtotal = computed(() => store.subtotal);
const totalGeneral = computed(() => store.totalGeneral);
const clienteSeleccionado = computed(() => store.clienteSeleccionado);

const nombreClienteSeleccionado = computed(() => {
  const cliente = clienteSeleccionado.value;
  return (
    cliente?.nombre_completo ||
    cliente?.nombre ||
    cliente?.razon_social ||
    'Público en general'
  );
});

function limpiarMensajeError() {
  mensajeError.value = '';
}

function enfocarBuscador() {
  nextTick(() => buscadorRef.value?.focus());
}

function onScanInput() {
  limpiarMensajeError();
  clearTimeout(scanTimeout);

  scanTimeout = setTimeout(() => {
    const q = scanQuery.value.trim();
    if (q.length >= 3) buscarProductoRapido(q);
  }, 400);
}

async function onScanEnter() {
  const q = scanQuery.value.trim();
  if (!q) return;
  await buscarProductoRapido(q);
}

async function buscarProductoRapido(termino) {
  limpiarMensajeError();

  try {
    const resultados = await store.buscarProductoParaPOS(termino);

    if (!resultados.length) {
      mensajeError.value = 'No se encontraron productos con ese criterio.';
      dialogBuscar.value = true;
      return;
    }

    if (resultados.length === 1) {
      await onProductoSeleccionado(resultados[0]);
      return;
    }

    dialogBuscar.value = true;
  } catch (error) {
    console.error('Error buscando producto en POS:', error);
    mensajeError.value = 'Ocurrió un error al buscar el producto.';
  }
}

async function onProductoSeleccionado(producto) {
  if (!producto?.producto_uuid) return;

  limpiarMensajeError();

  try {
    const productoDetalle = producto?.lotes
      ? producto
      : await store.seleccionarProducto(producto);

    if (!productoDetalle) {
      mensajeError.value = 'No fue posible cargar el detalle del producto.';
      return;
    }

    const lotesDisponibles = Array.isArray(productoDetalle?.lotes)
      ? productoDetalle.lotes
      : [];

    if (productoDetalle.con_lote && lotesDisponibles.length) {
      productoPendiente.value = productoDetalle;
      dialogLote.value = true;
      dialogBuscar.value = false;
      return;
    }

    store.agregarProductoAlCarrito({
      producto: productoDetalle,
      lote: null,
      cantidad: 1,
    });

    productoPendiente.value = null;
    dialogLote.value = false;
    dialogBuscar.value = false;
    scanQuery.value = '';
    enfocarBuscador();
  } catch (error) {
    console.error('Error seleccionando producto:', error);
    mensajeError.value = 'No fue posible seleccionar el producto.';
  }
}

function onLoteSeleccionado({ producto, lote }) {
  if (!producto || !lote) return;

  limpiarMensajeError();

  store.agregarProductoAlCarrito({
    producto,
    lote,
    cantidad: 1,
  });

  productoPendiente.value = null;
  dialogLote.value = false;
  dialogBuscar.value = false;
  scanQuery.value = '';
  enfocarBuscador();
}

function onClienteSeleccionado(cliente) {
  store.seleccionarCliente(cliente);
  dialogClientes.value = false;
  enfocarBuscador();
}

function onLimpiarCliente() {
  store.limpiarClienteSeleccionado();
  dialogClientes.value = false;
  enfocarBuscador();
}

function onConfirmarVenta() {
  store.limpiarCarrito();
  productoPendiente.value = null;
  dialogCobrar.value = false;
  scanQuery.value = '';
  limpiarMensajeError();
  enfocarBuscador();
}

function confirmarCancelar() {
  store.limpiarCarrito();
  productoPendiente.value = null;
  dialogLote.value = false;
  scanQuery.value = '';
  limpiarMensajeError();
  enfocarBuscador();
}

function formatMoneda(valor) {
  return Number(valor ?? 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

function formatFecha(fecha) {
  if (!fecha) return 'Sin fecha';

  const f = new Date(fecha);
  if (Number.isNaN(f.getTime())) return 'Sin fecha';

  return f.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

onMounted(() => {
  enfocarBuscador();
});

onBeforeUnmount(() => {
  clearTimeout(scanTimeout);
});
</script>

<style scoped>
.pos-root {
  font-family: var(--font-body, system-ui, sans-serif);
}

.carrito-item-enter-active,
.carrito-item-leave-active {
  transition: all 0.22s ease;
}

.carrito-item-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.carrito-item-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.premium-cobrar-btn {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-height: 72px;
  border-radius: 1.35rem;
  padding: 0.95rem 1rem;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.22), transparent 38%),
    linear-gradient(135deg, #2563eb 0%, #1d4ed8 52%, #1e40af 100%);
  box-shadow:
    0 14px 30px rgba(37, 99, 235, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
}

.premium-cobrar-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 18px 34px rgba(37, 99, 235, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.premium-cobrar-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
  box-shadow: none;
}

.premium-cobrar-btn__icon {
  display: flex;
  height: 2.8rem;
  width: 2.8rem;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  backdrop-filter: blur(8px);
}

.premium-cobrar-btn__arrow {
  display: flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  transition: transform 0.18s ease, background 0.18s ease;
}

.group:hover .premium-cobrar-btn__arrow {
  transform: translateX(2px);
  background: rgba(255, 255, 255, 0.22);
}

:global(.farma-pos-dialog-mask) {
  background: rgba(15, 23, 42, 0.42) !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
}

:global(.farma-pos-dialog-root) {
  border-radius: 1.25rem !important;
  border: 1px solid rgba(226, 232, 240, 0.95) !important;
  background: #ffffff !important;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18) !important;
  overflow: hidden !important;
}

:global(.farma-pos-dialog-root .p-dialog) {
  background: #ffffff !important;
  border-radius: 1.25rem !important;
  overflow: hidden !important;
}

:global(.farma-pos-dialog-root .p-dialog-content) {
  padding: 0 !important;
  background: #ffffff !important;
}

:global(.farma-pos-dialog-root .p-dialog-header) {
  display: none !important;
}

:global(.farma-pos-dialog-content) {
  padding: 0 !important;
  background: #ffffff !important;
}

:global(.farma-pos-dialog-root .p-dialog-content),
:global(.farma-pos-dialog-root .p-dialog-content > div) {
  background: #ffffff !important;
}

.pos-main-panel,
.pos-resumen-panel {
  min-height: 0;
}

.pos-carrito-scroll,
.pos-resumen-scroll {
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
}

.pos-carrito-scroll::-webkit-scrollbar,
.pos-resumen-scroll::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.pos-carrito-scroll::-webkit-scrollbar-track,
.pos-resumen-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.pos-carrito-scroll::-webkit-scrollbar-thumb,
.pos-resumen-scroll::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 9999px;
}

.pos-carrito-scroll::-webkit-scrollbar-thumb:hover,
.pos-resumen-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.65);
}
</style>
