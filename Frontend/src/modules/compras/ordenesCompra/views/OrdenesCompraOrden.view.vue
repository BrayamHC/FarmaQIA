<!-- Frontend/src/modules/compras/ordenesCompra/views/OrdenesCompraOrden.view.vue -->
<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/compras/ordenes" class="transition hover:text-slate-600">
          Órdenes de Compra
        </RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">
          {{ esCrear ? 'Nueva orden' : (orden?.folio_display ?? 'Detalle') }}
        </span>
      </nav>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200/70">
            <i class="pi pi-file-edit text-base text-white"></i>
          </div>

          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              {{ esCrear ? 'Nueva Orden de Compra' : (orden?.folio_display || 'Detalle de orden') }}
            </h1>
            <p class="text-sm text-slate-500">
              {{ esCrear ? 'Captura los datos de la nueva orden de compra.' : 'Detalle de la orden de compra.' }}
            </p>
          </div>
        </div>

        <div v-if="!esCrear && orden" class="flex items-center gap-2">
          <span class="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
            :class="statusClass(orden.status)">
            <span class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="statusDot(orden.status)"></span>
            {{ capitalizar(orden.status) }}
          </span>

          <button type="button" class="farma-btn farma-btn-ghost" @click="abrirMenu($event)">
            <i class="pi pi-ellipsis-v text-sm"></i>
            <span>Acciones</span>
          </button>
        </div>
      </div>
    </header>

    <Menu ref="menuRef" :model="menuItems" popup :pt="menuPt">
      <template #item="{ item, props }">
        <a v-ripple
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          :class="{ 'text-rose-600 hover:bg-rose-50 hover:text-rose-700': item.danger }" v-bind="props.action">
          <i :class="[item.icon, 'text-sm']"></i>
          <span>{{ item.label }}</span>
        </a>
      </template>
    </Menu>

    <div v-if="cargandoDetalle" class="flex items-center justify-center py-24">
      <i class="pi pi-spin pi-spinner text-3xl text-blue-500"></i>
    </div>

    <form v-else class="grid grid-cols-1 gap-6 xl:grid-cols-3" @submit.prevent="onSubmit">
      <div class="space-y-6 xl:col-span-2">
        <article class="card-base rounded-2xl border border-slate-200 bg-white p-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-slate-900" style="font-family: var(--font-title)">
                Datos generales
              </h2>
              <p class="mt-1 text-sm text-slate-500">
                Información principal de la orden de compra.
              </p>
            </div>

            <span v-if="!esCrear && orden?.folio_display"
              class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {{ orden.folio_display }}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">
                Proveedor
              </label>

              <Select v-if="esCrear" v-model="form.proveedor_uuid" :options="proveedoresOptions" optionLabel="label"
                optionValue="value" placeholder="Selecciona un proveedor" filter showClear appendTo="self"
                :loading="cargandoCatalogosCrear" class="farma-select-field farma-select-editing w-full"
                @before-show="cargarProveedoresLista" @focus="cargarProveedoresLista" @change="onProveedorChange"
                :pt="selectPt" />

              <div v-else class="farma-view-value">
                {{ form.proveedor_nombre || '—' }}
              </div>
            </div>

            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">
                Almacén destino
              </label>

              <Select v-if="esCrear" v-model="form.almacen_uuid" :options="almacenesOptions" optionLabel="label"
                optionValue="value" placeholder="Selecciona un almacén" filter showClear appendTo="self"
                :loading="cargandoCatalogosCrear" class="farma-select-field farma-select-editing w-full"
                @before-show="cargarAlmacenesLista" @focus="cargarAlmacenesLista" @change="onAlmacenChange"
                :pt="selectPt" />

              <div v-else class="farma-view-value">
                {{ form.almacen_nombre || '—' }}
              </div>
            </div>

            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">
                Entrega estimada
              </label>

              <div v-if="esCrear" class="farma-datepicker-click" @click="abrirCalendario(fechaEntregaRef)">
                <DatePicker ref="fechaEntregaRef" v-model="form.fecha_entrega_estimada" placeholder="YYYY-MM-DD"
                  dateFormat="yy-mm-dd" showIcon iconDisplay="input" manualInput showOnFocus appendTo="self"
                  inputClass="farma-datepicker-input" class="w-full farma-datepicker"
                  @update:modelValue="sincronizarInput(fechaEntregaRef, form.fecha_entrega_estimada)" />
              </div>

              <div v-else class="farma-view-value">
                {{ form.fecha_entrega_estimada || '—' }}
              </div>
            </div>

            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">
                Condiciones de pago
              </label>
              <input v-model="form.condiciones_pago" type="text" placeholder="Crédito 30 días" class="farma-input"
                :class="esCrear ? 'farma-input-editing' : 'farma-input-disabled'" :disabled="!esCrear" />
            </div>
          </div>

          <div class="mt-4">
            <label class="mb-1.5 block text-xs font-medium text-slate-500">
              Notas
            </label>
            <textarea v-model="form.notas" rows="3" class="farma-textarea"
              :class="esCrear ? 'farma-input-editing' : 'farma-input-disabled'" :disabled="!esCrear"
              placeholder="Notas adicionales de la orden" />
          </div>
        </article>

        <article class="card-base rounded-2xl border border-slate-200 bg-white p-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-slate-900" style="font-family: var(--font-title)">
                Partidas
              </h2>
              <p class="mt-1 text-sm text-slate-500">
                Productos incluidos dentro de la orden.
              </p>
            </div>

            <button v-if="esCrear" type="button" class="farma-btn farma-btn-primary" @click="abrirBuscadorProducto">
              <i class="pi pi-plus text-xs"></i>
              <span>Agregar producto</span>
            </button>
          </div>

          <div class="farma-table-shell">
            <div class="farma-table-content">
              <div class="overflow-x-auto">
                <table class="w-full min-w-[760px] text-sm">
                  <thead class="bg-slate-50">
                    <tr class="border-b border-slate-200">
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Producto
                      </th>
                      <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Cantidad
                      </th>
                      <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Precio est.
                      </th>
                      <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Subtotal
                      </th>
                      <th v-if="!esCrear"
                        class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                      <th v-if="esCrear" class="px-4 py-3"></th>
                    </tr>
                  </thead>

                  <tbody class="divide-y divide-slate-100">
                    <tr v-if="!partidas.length">
                      <td :colspan="esCrear ? 5 : 5" class="px-4 py-10 text-center text-sm text-slate-400">
                        Sin partidas agregadas
                      </td>
                    </tr>

                    <tr v-for="(p, idx) in partidas" :key="p._key ?? p.uuid ?? `${p.producto_uuid}-${idx}`"
                      class="transition hover:bg-blue-50/30">
                      <td class="px-4 py-3">
                        <p class="font-medium text-slate-700">{{ p.producto_nombre }}</p>
                        <p class="mt-0.5 text-xs text-slate-400">SKU: {{ p.producto_sku || '—' }}</p>
                      </td>

                      <td class="px-4 py-3 text-right">
                        <input v-model.number="p.cantidad_solicitada" type="number" min="1" step="1"
                          class="farma-input-mini text-right" :disabled="!esCrear" @input="recalcularPartida(p)" />
                      </td>

                      <td class="px-4 py-3 text-right">
                        <input v-model.number="p.precio_unitario_est" type="number" min="0" step="0.01"
                          class="farma-input-mini text-right" :disabled="!esCrear" @input="recalcularPartida(p)" />
                      </td>

                      <td class="px-4 py-3 text-right font-semibold text-slate-900">
                        {{ formatMoneda(p.subtotal_estimado) }}
                      </td>

                      <td v-if="!esCrear" class="px-4 py-3 text-center">
                        <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {{ capitalizar(p.status) }}
                        </span>
                      </td>

                      <td v-if="esCrear" class="px-4 py-3 text-right">
                        <button type="button"
                          class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                          @click="eliminarPartida(idx)">
                          <i class="pi pi-trash text-sm"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </article>
      </div>

      <aside class="self-start xl:sticky xl:top-4">
        <article class="card-base rounded-2xl border border-slate-200 bg-white p-6">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Resumen
          </p>
          <h2 class="mt-1 mb-4 text-lg font-semibold text-slate-900">
            Totales estimados
          </h2>

          <div class="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Subtotal</span>
              <span class="font-medium text-slate-800">{{ formatMoneda(totales.subtotal) }}</span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-slate-500">IVA (16%)</span>
              <span class="font-medium text-slate-800">{{ formatMoneda(totales.iva) }}</span>
            </div>

            <div class="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold">
              <span class="text-slate-900">Total</span>
              <span class="text-blue-600">{{ formatMoneda(totales.total) }}</span>
            </div>
          </div>

          <div v-if="!esCrear && orden" class="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
            <div class="farma-stock-mini-card">
              <p class="farma-stock-mini-card__label">Autorizó</p>
              <p class="farma-stock-mini-card__value text-slate-700">
                {{ orden.nombre_autoriza || '—' }}
              </p>
            </div>

            <div class="farma-stock-mini-card">
              <p class="farma-stock-mini-card__label">Fecha autorización</p>
              <p class="farma-stock-mini-card__value text-slate-700">
                {{ formatFechaHora(orden.fecha_autorizacion) }}
              </p>
            </div>

            <div v-if="orden.motivo_rechazo" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
                Motivo de rechazo
              </p>
              <p class="mt-1 text-sm font-medium text-rose-700">
                {{ orden.motivo_rechazo }}
              </p>
            </div>
          </div>

          <button v-if="esCrear" type="submit" class="farma-btn farma-btn-primary mt-5 w-full"
            :disabled="store.guardando || !puedeGuardar">
            <i class="pi pi-save text-xs"></i>
            <span>{{ store.guardando ? 'Guardando...' : 'Crear orden' }}</span>
          </button>
        </article>
      </aside>
    </form>

    <DialogBuscarProductoOrden v-model:visible="mostrarBuscadorProducto" @seleccionar="agregarProductoDesdeDialog" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Menu from 'primevue/menu'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Ripple from 'primevue/ripple'
import { useOrdenesCompraStore } from '../ordenesCompraStore'
import { useProveedoresStore } from '@/modules/proveedores/proveedoresStore'
import { useAlmacenesStore } from '@/modules/almacenes/almacenesStore'
import DialogBuscarProductoOrden from '../components/DialogBuscarProductoOrden.vue'

defineOptions({
  directives: {
    ripple: Ripple,
  },
})

const props = defineProps({
  modo: { type: String, default: 'crear' },
  uuid: { type: String, default: null },
})

const store = useOrdenesCompraStore()
const proveedoresStore = useProveedoresStore()
const almacenesStore = useAlmacenesStore()
const router = useRouter()

const menuRef = ref(null)
const mostrarBuscadorProducto = ref(false)
const fechaEntregaRef = ref(null)

const esCrear = computed(() => props.modo === 'crear')
const cargandoDetalle = computed(() => !esCrear.value && store.cargandoDetalle)
const orden = computed(() => store.ordenDetalle)

const form = ref({
  proveedor_uuid: null,
  proveedor_nombre: '',
  almacen_uuid: null,
  almacen_nombre: '',
  fecha_entrega_estimada: null,
  condiciones_pago: '',
  moneda: 'MXN',
  notas: '',
})

const partidas = ref([])

const cargandoCatalogosCrear = computed(() =>
  proveedoresStore.cargando || almacenesStore.cargando,
)

const proveedoresOptions = computed(() =>
  (proveedoresStore.proveedores ?? []).map((item) => ({
    label: item.nombre,
    value: item.proveedor_uuid,
    raw: item,
  })),
)

const almacenesOptions = computed(() =>
  (almacenesStore.almacenes ?? []).map((item) => ({
    label: item.nombre,
    value: item.almacen_uuid,
    raw: item,
  })),
)

const totales = computed(() => {
  const subtotal = partidas.value.reduce((acc, p) => acc + Number(p.subtotal_estimado ?? 0), 0)
  const iva = subtotal * 0.16
  return {
    subtotal,
    iva,
    total: subtotal + iva,
  }
})

const puedeGuardar = computed(() => {
  return Boolean(
    form.value.proveedor_uuid &&
    form.value.almacen_uuid &&
    partidas.value.length > 0,
  )
})

const menuPt = {
  root: { class: 'farma-menu-popup' },
  separator: { class: 'farma-menu-separator' },
}

const selectPt = {
  root: { class: 'w-full' },
  overlay: { class: 'farma-prime-select-overlay' },
}

const menuItems = computed(() => {
  const o = orden.value
  if (!o || esCrear.value) return []

  const items = []

  if (['borrador', 'pendiente'].includes(o.status)) {
    items.push({
      label: 'Autorizar',
      icon: 'pi pi-check-circle',
      command: () => accionAutorizar(),
    })
    items.push({
      label: 'Rechazar',
      icon: 'pi pi-times-circle',
      command: () => accionRechazar(),
      danger: true,
    })
  }

  if (o.status !== 'cancelada') {
    if (items.length) items.push({ separator: true })
    items.push({
      label: 'Cancelar orden',
      icon: 'pi pi-ban',
      command: () => accionCancelar(),
      danger: true,
    })
  }

  return items
})

function abrirMenu(event) {
  if (menuRef.value) {
    menuRef.value.toggle(event)
  }
}

function abrirBuscadorProducto() {
  mostrarBuscadorProducto.value = true
}

function agregarProductoDesdeDialog(payload) {
  const productos = Array.isArray(payload) ? payload : [payload]

  for (const producto of productos) {
    agregarProducto(producto)
  }

  mostrarBuscadorProducto.value = false
}

function agregarProducto(producto) {
  const productoUuid = producto?.uuid ?? producto?.producto_uuid
  if (!productoUuid) return

  const yaExiste = partidas.value.some((p) => p.producto_uuid === productoUuid)
  if (yaExiste) return

  const precioBase = Number(
    producto.precio_compra ??
    producto.costo_compra ??
    producto.precio_venta ??
    producto.precio_publico ??
    producto.precio_referencia ??
    0,
  )

  partidas.value.push({
    _key: `${productoUuid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    producto_uuid: productoUuid,
    producto_nombre: producto.nombre ?? 'Producto sin nombre',
    producto_sku: producto.sku ?? '',
    cantidad_solicitada: 1,
    precio_unitario_est: precioBase,
    subtotal_estimado: precioBase,
    descuento_porcentaje: 0,
    descuento_importe: 0,
  })
}

function recalcularPartida(partida) {
  const cantidad = Number(partida.cantidad_solicitada ?? 0)
  const precio = Number(partida.precio_unitario_est ?? 0)
  partida.subtotal_estimado = cantidad * precio
}

function eliminarPartida(index) {
  partidas.value.splice(index, 1)
}

async function cargarProveedoresLista() {
  if (!proveedoresStore.proveedores.length) {
    await proveedoresStore.obtenerProveedores({ page: 1, limit: 100 })
  }
}

async function cargarAlmacenesLista() {
  if (!almacenesStore.almacenes.length) {
    await almacenesStore.obtenerAlmacenes({ page: 1, limit: 100 })
  }
}

function onProveedorChange(event) {
  const value = event?.value ?? null
  const proveedor = (proveedoresStore.proveedores ?? []).find(
    (item) => item.proveedor_uuid === value,
  )

  form.value.proveedor_uuid = value
  form.value.proveedor_nombre = proveedor?.nombre ?? ''
  form.value.condiciones_pago = proveedor?.condiciones_pago ?? form.value.condiciones_pago
}

function onAlmacenChange(event) {
  const value = event?.value ?? null
  const almacen = (almacenesStore.almacenes ?? []).find(
    (item) => item.almacen_uuid === value,
  )

  form.value.almacen_uuid = value
  form.value.almacen_nombre = almacen?.nombre ?? ''
}

function abrirCalendario(datePickerRef) {
  const instancia = datePickerRef?.value
  if (!instancia) return

  if (typeof instancia.show === 'function') {
    instancia.show()
    return
  }

  if (instancia.overlayVisible !== undefined) {
    instancia.overlayVisible = true
  }
}

function sincronizarInput(datePickerRef, valor) {
  const instancia = datePickerRef?.value
  if (!instancia || !instancia.input) return

  if (!valor) {
    instancia.input.value = ''
    return
  }

  const fecha = valor instanceof Date ? valor : new Date(valor)
  if (Number.isNaN(fecha.getTime())) {
    instancia.input.value = ''
    return
  }

  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  instancia.input.value = `${anio}-${mes}-${dia}`
}

function formatearFechaPayload(valor) {
  if (!valor) return null

  const fecha = valor instanceof Date ? valor : new Date(valor)
  if (Number.isNaN(fecha.getTime())) return null

  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function construirPayload() {
  return {
    proveedor_uuid: form.value.proveedor_uuid,
    almacen_uuid: form.value.almacen_uuid,
    fecha_entrega_estimada: formatearFechaPayload(form.value.fecha_entrega_estimada),
    condiciones_pago: form.value.condiciones_pago || null,
    moneda: form.value.moneda,
    notas: form.value.notas || null,
    partidas: partidas.value.map((p) => ({
      producto_uuid: p.producto_uuid,
      cantidad_solicitada: Number(p.cantidad_solicitada ?? 0),
      precio_unitario_est: Number(p.precio_unitario_est ?? 0),
      descuento_porcentaje: Number(p.descuento_porcentaje ?? 0),
      descuento_importe: Number(p.descuento_importe ?? 0),
    })),
  }
}

async function onSubmit() {
  try {
    const payload = construirPayload()

    console.log('Payload Orden de Compra:', payload)
    console.log('Payload JSON:', JSON.stringify(payload, null, 2))

    const res = await store.crearOrden(payload)

    const nuevoUuid = res?.orden?.uuid ?? res?.uuid

    if (nuevoUuid) {
      await router.push(`/compras/ordenes/${nuevoUuid}`)
      return
    }

    await router.push('/compras/ordenes')
  } catch (error) {
    console.error('Error al crear la orden:', error)
  }
}

async function accionAutorizar() {
  if (!props.uuid) return
  try {
    await store.autorizarOrden(props.uuid)
    await store.obtenerOrdenPorUuid(props.uuid)
  } catch { }
}

async function accionRechazar() {
  if (!props.uuid) return
  const motivo = window.prompt('Motivo de rechazo:')
  if (!motivo) return

  try {
    await store.rechazarOrden(props.uuid, motivo)
    await store.obtenerOrdenPorUuid(props.uuid)
  } catch { }
}

async function accionCancelar() {
  if (!props.uuid) return
  const confirmado = window.confirm('¿Cancelar esta orden de compra?')
  if (!confirmado) return

  try {
    await store.cancelarOrden(props.uuid)
    await store.obtenerOrdenPorUuid(props.uuid)
  } catch { }
}

function formatFechaHora(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function formatMoneda(valor) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(valor ?? 0))
}

function capitalizar(valor) {
  if (!valor) return '—'
  const texto = String(valor)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function statusClass(status) {
  const map = {
    borrador: 'bg-slate-100 text-slate-500',
    pendiente: 'bg-amber-50 text-amber-600',
    autorizada: 'bg-emerald-50 text-emerald-600',
    rechazada: 'bg-rose-50 text-rose-600',
    cancelada: 'bg-slate-100 text-slate-400',
  }
  return map[status] ?? 'bg-slate-100 text-slate-500'
}

function statusDot(status) {
  const map = {
    borrador: 'bg-slate-400',
    pendiente: 'bg-amber-400',
    autorizada: 'bg-emerald-500',
    rechazada: 'bg-rose-500',
    cancelada: 'bg-slate-300',
  }
  return map[status] ?? 'bg-slate-400'
}

watch(
  () => orden.value,
  (nuevaOrden) => {
    if (!nuevaOrden || esCrear.value) return

    form.value = {
      proveedor_uuid: nuevaOrden.proveedor_uuid ?? null,
      proveedor_nombre: nuevaOrden.proveedor_nombre ?? '',
      almacen_uuid: nuevaOrden.almacen_uuid ?? null,
      almacen_nombre: nuevaOrden.almacen_nombre ?? '',
      fecha_entrega_estimada: nuevaOrden.fecha_entrega_estimada?.slice(0, 10) ?? '',
      condiciones_pago: nuevaOrden.condiciones_pago ?? '',
      moneda: nuevaOrden.moneda ?? 'MXN',
      notas: nuevaOrden.notas ?? '',
    }

    partidas.value = Array.isArray(nuevaOrden.partidas)
      ? nuevaOrden.partidas.map((p, index) => ({
        ...p,
        _key: p.uuid ?? `${p.producto_uuid}-${index}`,
        cantidad_solicitada: Number(p.cantidad_solicitada ?? 0),
        precio_unitario_est: Number(p.precio_unitario_est ?? 0),
        subtotal_estimado: Number(p.subtotal_estimado ?? 0),
        cantidad_recibida: Number(p.cantidad_recibida ?? 0),
      }))
      : []
  },
  { immediate: true },
)

onMounted(async () => {
  if (esCrear.value) {
    await Promise.allSettled([
      proveedoresStore.obtenerProveedores({ page: 1, limit: 100 }),
      almacenesStore.obtenerAlmacenes({ page: 1, limit: 100 }),
    ])
    return
  }

  if (props.uuid) {
    await store.obtenerOrdenPorUuid(props.uuid)
  }
})
</script>

<style scoped>
.card-base {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

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

.farma-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 0.85rem;
  padding: 0.62rem 0.95rem;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
  transition: all 0.2s ease;
  cursor: pointer;
}

.farma-btn-primary {
  background: #2563eb;
  color: #ffffff;
  border: none;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.16);
}

.farma-btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.farma-btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.farma-btn-ghost {
  background: #ffffff;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.farma-btn-ghost:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.farma-input,
.farma-textarea {
  width: 100%;
  border-radius: 0.9rem;
  font-size: 0.875rem;
  padding: 0.72rem 0.95rem;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  min-height: 44px;
}

.farma-textarea {
  min-height: 96px;
  resize: vertical;
}

.farma-input-disabled {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #475569 !important;
  cursor: default !important;
  pointer-events: none;
}

.farma-input-editing {
  background: #ffffff !important;
  border: 1px solid #93c5fd !important;
  color: #0f172a !important;
}

.farma-input-editing:focus {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
  outline: none !important;
}

.farma-view-value {
  border-radius: 0.9rem;
  padding: 0.72rem 0.95rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  min-height: 2.75rem;
  display: flex;
  align-items: center;
}

.farma-input-mini {
  width: 96px;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  padding: 0.55rem 0.7rem;
  font-size: 0.8125rem;
  color: #0f172a;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.farma-input-mini:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.farma-input-mini:disabled {
  background: #f8fafc;
  color: #64748b;
}

.farma-stock-mini-card {
  border-radius: 0.95rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.88);
  padding: 0.8rem 0.9rem;
}

.farma-stock-mini-card__label {
  font-size: 0.6875rem;
  line-height: 1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
}

.farma-stock-mini-card__value {
  margin-top: 0.35rem;
  font-size: 0.9rem;
  line-height: 1.2rem;
  font-weight: 700;
}

.farma-field {
  min-width: 0;
}

.farma-datepicker-click {
  width: 100%;
}

:global(.farma-select-field.p-select) {
  min-height: 44px;
  border-radius: 0.9rem !important;
  border: 1px solid #93c5fd !important;
  background: #ffffff !important;
  box-shadow: none !important;
}

:global(.farma-select-field.p-select:hover) {
  border-color: #60a5fa !important;
}

:global(.farma-select-field.p-select.p-focus) {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
}

:global(.farma-select-field .p-select-label) {
  padding: 0.72rem 0.95rem !important;
  font-size: 0.875rem !important;
  color: #0f172a !important;
}

:global(.farma-select-field .p-placeholder) {
  color: #94a3b8 !important;
}

:global(.farma-select-field .p-select-dropdown) {
  width: 2.75rem !important;
  color: #64748b !important;
}

:global(.farma-prime-select-overlay) {
  border-radius: 1rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.14) !important;
  overflow: hidden !important;
  background: #ffffff !important;
}

:global(.farma-prime-select-overlay .p-select-list) {
  padding: 0.4rem !important;
}

:global(.farma-prime-select-overlay .p-select-option) {
  border-radius: 0.75rem !important;
  font-size: 0.875rem !important;
}

:global(.farma-prime-select-overlay .p-select-option.p-focus) {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
}

:global(.farma-prime-select-overlay .p-select-option.p-select-option-selected) {
  background: #dbeafe !important;
  color: #1e3a8a !important;
  font-weight: 600 !important;
}

:global(.farma-datepicker .p-inputtext) {
  min-height: 44px;
  border-radius: 0.9rem !important;
  border: 1px solid #93c5fd !important;
  background: #ffffff !important;
  color: #0f172a !important;
  box-shadow: none !important;
  padding: 0.72rem 0.95rem !important;
  font-size: 0.875rem !important;
}

:global(.farma-datepicker .p-inputtext:focus) {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
  outline: none !important;
}

:global(.farma-menu-popup) {
  border-radius: 1rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.14) !important;
  overflow: hidden !important;
  padding: 0.375rem !important;
  min-width: 11rem !important;
  background: #ffffff !important;
  z-index: 1200 !important;
}

:global(.farma-menu-popup .p-menu-list) {
  padding: 0 !important;
}

:global(.farma-menu-popup .p-menuitem) {
  border-radius: 0.75rem !important;
  overflow: hidden !important;
}

:global(.farma-menu-popup .p-menuitem-link) {
  padding: 0 !important;
  background: transparent !important;
}

:global(.farma-menu-popup .p-menuitem-link:hover) {
  background: transparent !important;
}

:global(.farma-menu-separator) {
  margin: 0.25rem 0.5rem;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .farma-stock-body {
    padding: 1rem;
  }
}
</style>
