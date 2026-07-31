// Frontend/src/modules/compras/ordenesCompra/ordenesCompraStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

import ordenesCompraService from './ordenesCompraService'
import proveedoresService from '@/modules/proveedores/proveedoresService'
import { productosService } from '@/modules/productos/productosService'
import { almacenesService } from '@/modules/almacenes/almacenesService'
import { useNotificacionesStore } from '@/stores/notificaciones.store'

export const useOrdenesCompraStore = defineStore('ordenesCompra', () => {
  const notificaciones = useNotificacionesStore()

  // ── Lista ────────────────────────────────────────────────────────────────
  const ordenes = ref([])
  const totalOrdenes = ref(0)
  const paginaOrdenes = ref(1)
  const limitOrdenes = ref(20)
  const cargandoOrdenes = ref(false)

  const filtros = ref({
    folio: '',
    proveedor_uuid: '',
    almacen_uuid: '',
    status: '',
    fecha_inicio: '',
    fecha_fin: '',
    sort: 'fecha_creacion:desc',
    page: 1,
    limit: 20,
  })

  // ── Detalle ──────────────────────────────────────────────────────────────
  const ordenDetalle = ref(null)
  const cargandoDetalle = ref(false)
  const guardando = ref(false)

  // ── Catálogos reciclados ────────────────────────────────────────────────
  const proveedores = ref([])
  const cargandoProveedores = ref(false)

  const productos = ref([])
  const cargandoProductos = ref(false)

  const almacenes = ref([])
  const cargandoAlmacenes = ref(false)

  function limpiarParams(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined),
    )
  }

  function normalizarOrden(o = {}) {
    return {
      ...o,
      subtotal_estimado: Number(o.subtotal_estimado ?? 0),
      iva_estimado: Number(o.iva_estimado ?? 0),
      total_estimado: Number(o.total_estimado ?? 0),
      total_partidas: Number(o.total_partidas ?? 0),
    }
  }

  function normalizarPartida(p = {}) {
    return {
      ...p,
      cantidad_solicitada: Number(p.cantidad_solicitada ?? 0),
      precio_unitario_est: Number(p.precio_unitario_est ?? 0),
      descuento_porcentaje: Number(p.descuento_porcentaje ?? 0),
      descuento_importe: Number(p.descuento_importe ?? 0),
      subtotal_estimado: Number(p.subtotal_estimado ?? 0),
      cantidad_recibida: Number(p.cantidad_recibida ?? 0),
    }
  }

  function normalizarDetalle(o = {}) {
    return {
      ...normalizarOrden(o),
      partidas: Array.isArray(o.partidas) ? o.partidas.map(normalizarPartida) : [],
    }
  }

  // ── Lista ────────────────────────────────────────────────────────────────
  async function obtenerOrdenes(params = {}) {
    cargandoOrdenes.value = true
    try {
      const req = limpiarParams({
        folio: params.folio ?? filtros.value.folio,
        proveedor_uuid: params.proveedor_uuid ?? filtros.value.proveedor_uuid,
        almacen_uuid: params.almacen_uuid ?? filtros.value.almacen_uuid,
        status: params.status ?? filtros.value.status,
        fecha_inicio: params.fecha_inicio ?? filtros.value.fecha_inicio,
        fecha_fin: params.fecha_fin ?? filtros.value.fecha_fin,
        sort: params.sort ?? filtros.value.sort ?? 'fecha_creacion:desc',
        page: Number(params.page ?? filtros.value.page ?? 1),
        limit: Number(params.limit ?? filtros.value.limit ?? 20),
      })

      const res = await ordenesCompraService.obtenerOrdenes(req)

      ordenes.value = Array.isArray(res?.ordenes)
        ? res.ordenes.map(normalizarOrden)
        : []

      totalOrdenes.value = Number(res?.meta?.total ?? 0)
      paginaOrdenes.value = Number(res?.meta?.page ?? req.page)
      limitOrdenes.value = Number(res?.meta?.limit ?? req.limit)
      filtros.value = {
        ...filtros.value,
        ...req,
      }

      return res
    } catch (e) {
      console.error('Error obteniendo órdenes de compra:', e)
      ordenes.value = []
      totalOrdenes.value = 0
      notificaciones.error(
        e?.response?.data?.message ?? 'Error al obtener las órdenes de compra',
      )
      throw e
    } finally {
      cargandoOrdenes.value = false
    }
  }

  async function obtenerOrdenPorUuid(uuid) {
    if (!uuid) return null

    cargandoDetalle.value = true
    try {
      const res = await ordenesCompraService.obtenerOrdenPorUuid(uuid)
      ordenDetalle.value = normalizarDetalle(res?.orden ?? res ?? {})
      return ordenDetalle.value
    } catch (e) {
      console.error('Error obteniendo detalle de orden de compra:', e)
      ordenDetalle.value = null
      notificaciones.error(
        e?.response?.data?.message ?? 'Error al obtener el detalle de la orden',
      )
      throw e
    } finally {
      cargandoDetalle.value = false
    }
  }

  async function crearOrden(payload) {
    guardando.value = true
    try {
      const res = await ordenesCompraService.crearOrden(payload)
      notificaciones.success('Orden de compra creada correctamente')
      return res
    } catch (e) {
      notificaciones.error(
        e?.response?.data?.message ?? 'Error al crear la orden de compra',
      )
      throw e
    } finally {
      guardando.value = false
    }
  }

  // Fragmento de Frontend/src/modules/compras/ordenesCompra/ordenesCompraStore.js

  async function autorizarOrden(uuid) {
    guardando.value = true
    try {
      const res = await ordenesCompraService.autorizarOrden(uuid)
      notificaciones.success('Orden autorizada correctamente')
      return res
    } catch (e) {
      notificaciones.error(
        e?.response?.data?.message ?? 'Error al autorizar la orden',
      )
      throw e
    } finally {
      guardando.value = false
    }
  }

  async function rechazarOrden(uuid, motivo) {
    guardando.value = true
    try {
      const res = await ordenesCompraService.rechazarOrden(uuid, {
        motivo_rechazo: motivo,
      })
      notificaciones.success('Orden rechazada correctamente')
      return res
    } catch (e) {
      notificaciones.error(
        e?.response?.data?.message ?? 'Error al rechazar la orden',
      )
      throw e
    } finally {
      guardando.value = false
    }
  }

  async function cancelarOrden(uuid, motivoCancelacion) {
    guardando.value = true
    try {
      const res = await ordenesCompraService.cancelarOrden(uuid, {
        motivo_cancelacion: motivoCancelacion,
      })
      notificaciones.success('Orden cancelada correctamente')
      return res
    } catch (e) {
      notificaciones.error(
        e?.response?.data?.message ?? 'Error al cancelar la orden',
      )
      throw e
    } finally {
      guardando.value = false
    }
  }

  // ── Catálogos ────────────────────────────────────────────────────────────
  async function cargarProveedores(termino = '') {
    cargandoProveedores.value = true
    try {
      const res = await proveedoresService.obtenerProveedores({
        nombre: termino || undefined,
        page: 1,
        limit: 100,
      })

      const proveedoresLista =
        res?.data?.proveedores ??
        res?.proveedores ??
        []

      proveedores.value = Array.isArray(proveedoresLista) ? proveedoresLista : []
      return res
    } catch (e) {
      console.error('Error cargando proveedores:', e)
      proveedores.value = []
      notificaciones.error('Error al cargar proveedores')
      throw e
    } finally {
      cargandoProveedores.value = false
    }
  }
  async function buscarProductos(termino = '', params = {}) {
    cargandoProductos.value = true
    try {
      const req = limpiarParams({
        nombre: termino || undefined,
        status: 'activo',
        page: Number(params.page ?? 1),
        limit: Number(params.limit ?? 15),
      })

      const res = await productosService.obtenerProductos(req)

      productos.value = Array.isArray(res?.productos) ? res.productos : []
      return res
    } catch (e) {
      console.error('Error buscando productos:', e)
      productos.value = []
      notificaciones.error(
        e?.response?.data?.message ?? 'Error al buscar productos',
      )
      throw e
    } finally {
      cargandoProductos.value = false
    }
  }

  async function cargarAlmacenes() {
    if (almacenes.value.length) return { almacenes: almacenes.value }

    cargandoAlmacenes.value = true
    try {
      const res = await almacenesService.obtenerAlmacenes({ limit: 100 })
      almacenes.value = Array.isArray(res?.almacenes) ? res.almacenes : []
      return res
    } catch (e) {
      console.error('Error cargando almacenes:', e)
      almacenes.value = []
      notificaciones.error('Error al cargar almacenes')
      throw e
    } finally {
      cargandoAlmacenes.value = false
    }
  }

  function limpiarDetalle() {
    ordenDetalle.value = null
  }

  function limpiarOrdenes() {
    ordenes.value = []
    totalOrdenes.value = 0
    paginaOrdenes.value = 1
  }

  return {
    ordenes,
    totalOrdenes,
    paginaOrdenes,
    limitOrdenes,
    cargandoOrdenes,
    filtros,

    ordenDetalle,
    cargandoDetalle,
    guardando,

    proveedores,
    cargandoProveedores,

    productos,
    cargandoProductos,

    almacenes,
    cargandoAlmacenes,

    obtenerOrdenes,
    obtenerOrdenPorUuid,
    crearOrden,
    autorizarOrden,
    rechazarOrden,
    cancelarOrden,

    cargarProveedores,
    buscarProductos,
    cargarAlmacenes,

    limpiarDetalle,
    limpiarOrdenes,
  }
})
