// Frontend/src/modules/ventas/views/pos/posStore.js
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { productosService } from '../../../productos/productosService'
import { clientesService } from '../../../clientes/clientesService'
import { almacenesService } from '../../../almacenes/almacenesService'
import ventasService from '../../ventasService'

const POS_VENTA_STORAGE_KEY = 'farmaq_pos_venta_borrador'

export const usePosStore = defineStore('pos', () => {
  const cargando = ref(false)

  const cargandoProductos = ref(false)
  const productos = ref([])
  const totalProductos = ref(0)
  const pageProductos = ref(1)
  const limitProductos = ref(20)
  const filtrosProductos = ref({
    termino: '',
    status: 'activo',
    conlote: null,
    almacenid: null,
    page: 1,
    limit: 20,
    sort: null,
  })

  const cargandoClientes = ref(false)
  const clientes = ref([])
  const totalClientes = ref(0)
  const clienteSeleccionado = ref(null)
  const filtrosClientes = ref({
    busqueda: '',
    page: 1,
    limit: 20,
  })

  const cargandoAlmacenes = ref(false)
  const almacenesPOS = ref([])
  const totalAlmacenes = ref(0)
  const almacenSeleccionado = ref(null)
  const filtrosAlmacenes = ref({
    busqueda: '',
    page: 1,
    limit: 100,
    status: 'activo',
  })

  const carrito = ref([])
  const hidratandoBorrador = ref(false)

  const carritoVacio = computed(() => carrito.value.length === 0)

  const totalArticulos = computed(() =>
    carrito.value.reduce((acumulado, item) => acumulado + Number(item.cantidad ?? 0), 0),
  )

  const subtotal = computed(() =>
    redondearMoneda(
      carrito.value.reduce((acumulado, item) => {
        const cantidad = Number(item.cantidad ?? 0)
        const precioUnitario = Number(item.preciounitario ?? item.precio_unitario ?? 0)
        return acumulado + cantidad * precioUnitario
      }, 0),
    ),
  )

  const totalGeneral = computed(() => redondearMoneda(subtotal.value))

  const totalPaginasProductos = computed(() => {
    const limite = Number(limitProductos.value ?? 0)
    if (!limite) return 1
    return Math.max(1, Math.ceil(Number(totalProductos.value ?? 0) / limite))
  })

  function redondearMoneda(valor) {
    return Number(Number(valor ?? 0).toFixed(2))
  }

  function esEnteroPositivo(valor) {
    return Number.isInteger(valor) && valor > 0
  }

  function normalizarAlmacen(almacen) {
    if (!almacen) return null

    const almacenId = Number(
      almacen?.almacenid ??
      almacen?.almacen_id ??
      almacen?.id ??
      0,
    )

    return {
      ...almacen,
      id: esEnteroPositivo(almacenId) ? almacenId : null,
      almacenid: esEnteroPositivo(almacenId) ? almacenId : null,
      almacen_id: esEnteroPositivo(almacenId) ? almacenId : null,
      almacenuuid: almacen?.almacenuuid ?? almacen?.almacen_uuid ?? almacen?.uuid ?? null,
      almacen_uuid: almacen?.almacen_uuid ?? almacen?.almacenuuid ?? almacen?.uuid ?? null,
      nombre: almacen?.nombre ?? almacen?.descripcion ?? almacen?.clave ?? 'Almacén',
      clave: almacen?.clave ?? '',
      status: almacen?.status ?? 'activo',
      sucursal: almacen?.sucursal ?? null,
    }
  }

  function obtenerAlmacenIdSeleccionado() {
    const almacenId = Number(
      almacenSeleccionado.value?.almacenid ??
      almacenSeleccionado.value?.almacen_id ??
      almacenSeleccionado.value?.id ??
      0,
    )

    return esEnteroPositivo(almacenId) ? almacenId : undefined
  }

  function limpiarBusquedaProductos() {
    productos.value = []
    totalProductos.value = 0
    pageProductos.value = 1
    filtrosProductos.value = {
      termino: '',
      status: 'activo',
      conlote: null,
      almacenid: obtenerAlmacenIdSeleccionado() ?? null,
      page: 1,
      limit: limitProductos.value,
      sort: null,
    }
  }

  function limpiarBusquedaClientes() {
    clientes.value = []
    totalClientes.value = 0
    filtrosClientes.value = {
      busqueda: '',
      page: 1,
      limit: 20,
    }
  }

  function limpiarBusquedaAlmacenes() {
    almacenesPOS.value = []
    totalAlmacenes.value = 0
    filtrosAlmacenes.value = {
      busqueda: '',
      page: 1,
      limit: 100,
      status: 'activo',
    }
  }

  function limpiarEstadoPOS() {
    limpiarBusquedaProductos()
    limpiarBusquedaClientes()
    limpiarBusquedaAlmacenes()
    limpiarClienteSeleccionado()
    limpiarAlmacenSeleccionado()
    limpiarCarrito()
    eliminarBorradorVentaPOS()
  }

  function esTextoCodigo(valor) {
    const limpio = String(valor ?? '').trim()
    if (!limpio) return false
    return /^[A-Za-z0-9-.]+$/.test(limpio) && limpio.length <= 40
  }

  function normalizarLotes(producto) {
    const lotes = Array.isArray(producto?.lotes) ? producto.lotes : []

    return lotes
      .map((lote) => ({
        ...lote,
        loteuuid: lote?.loteuuid ?? lote?.lote_uuid ?? lote?.uuid ?? null,
        lote_uuid: lote?.lote_uuid ?? lote?.loteuuid ?? lote?.uuid ?? null,
        codigolote: lote?.codigolote ?? lote?.codigo_lote ?? lote?.clave ?? '',
        codigo_lote: lote?.codigo_lote ?? lote?.codigolote ?? lote?.clave ?? '',
        cantidadactual: Number(lote?.cantidadactual ?? lote?.cantidad_actual ?? lote?.cantidad ?? 0),
        cantidad_actual: Number(lote?.cantidad_actual ?? lote?.cantidadactual ?? lote?.cantidad ?? 0),
        fechacaducidad: lote?.fechacaducidad ?? lote?.fecha_caducidad ?? null,
        fecha_caducidad: lote?.fecha_caducidad ?? lote?.fechacaducidad ?? null,
        almacen: normalizarAlmacen(lote?.almacen),
      }))
      .filter((lote) => lote.loteuuid && lote.cantidadactual > 0 && lote.status !== 'inactivo')
      .sort((a, b) => {
        const fechaA = a.fechacaducidad ? new Date(a.fechacaducidad).getTime() : Number.MAX_SAFE_INTEGER
        const fechaB = b.fechacaducidad ? new Date(b.fechacaducidad).getTime() : Number.MAX_SAFE_INTEGER
        return fechaA - fechaB
      })
  }

  function obtenerPrecioUnitario(producto) {
    if (!producto) return 0

    if (producto?.precioventa != null) return Number(producto.precioventa ?? 0)
    if (producto?.precio_venta != null) return Number(producto.precio_venta ?? 0)
    if (producto?.preciopublico != null) return Number(producto.preciopublico ?? 0)
    if (producto?.precio_publico != null) return Number(producto.precio_publico ?? 0)

    if (Array.isArray(producto?.precios) && producto.precios.length) {
      const precioDefault =
        producto.precios.find((precio) => precio?.esdefault) ??
        producto.precios.find((precio) => precio?.es_default) ??
        producto.precios.find((precio) => precio?.status === 'activo') ??
        producto.precios[0]

      return Number(precioDefault?.precioventa ?? precioDefault?.precio_venta ?? 0)
    }

    return 0
  }

  function obtenerStockLista(producto) {
    if (!producto) return 0

    const stockPlano =
      producto?.stocktotal ??
      producto?.stock_total ??
      producto?.stockdisponible ??
      producto?.stock_disponible ??
      producto?.stockactual ??
      producto?.stock_actual ??
      producto?.stock?.total

    if (stockPlano != null) return Number(stockPlano ?? 0)

    const lotes = normalizarLotes(producto)
    if (lotes.length) {
      return lotes.reduce((acumulado, lote) => acumulado + Number(lote.cantidadactual ?? 0), 0)
    }

    return 0
  }

  function obtenerStockDisponibleProducto(producto) {
    return obtenerStockLista(producto)
  }

  async function obtenerProductosPOS(params = {}) {
    cargandoProductos.value = true

    try {
      const termino = String(params.termino ?? filtrosProductos.value.termino ?? '').trim()
      const almacenId = Number(
        params.almacenid ??
        params.almacen_id ??
        filtrosProductos.value.almacenid ??
        obtenerAlmacenIdSeleccionado() ??
        0,
      )

      const requestParams = {
        page: Number(params.page ?? pageProductos.value ?? 1),
        limit: Number(params.limit ?? limitProductos.value ?? 20),
        status: params.status ?? filtrosProductos.value.status ?? 'activo',
        conlote:
          typeof params.conlote === 'boolean'
            ? params.conlote
            : filtrosProductos.value.conlote ?? undefined,
        almacenid: esEnteroPositivo(almacenId) ? almacenId : undefined,
        sort: params.sort ?? filtrosProductos.value.sort ?? undefined,
      }

      if (termino) {
        if (params.modo === 'sku') requestParams.sku = termino
        else if (params.modo === 'upc') requestParams.upc = termino
        else if (params.modo === 'nombre') requestParams.nombre = termino
        else if (esTextoCodigo(termino)) requestParams.sku = termino
        else requestParams.nombre = termino
      }

      const response = await productosService.obtenerProductos(requestParams)

      productos.value = Array.isArray(response?.productos) ? response.productos : []
      totalProductos.value = Number(response?.total ?? 0)
      pageProductos.value = Number(response?.page ?? requestParams.page)
      limitProductos.value = Number(response?.limit ?? requestParams.limit)

      filtrosProductos.value = {
        termino,
        status: requestParams.status ?? 'activo',
        conlote: typeof requestParams.conlote === 'boolean' ? requestParams.conlote : null,
        almacenid: requestParams.almacenid ?? null,
        page: pageProductos.value,
        limit: limitProductos.value,
        sort: requestParams.sort ?? null,
      }

      return response
    } catch (error) {
      console.error('Error obteniendo productos POS:', error)
      productos.value = []
      totalProductos.value = 0
      throw error
    } finally {
      cargandoProductos.value = false
    }
  }

  async function buscarProductosPOS(termino = '', extras = {}) {
    return obtenerProductosPOS({
      termino,
      page: 1,
      limit: extras.limit ?? limitProductos.value,
      status: extras.status ?? filtrosProductos.value.status ?? 'activo',
      conlote: extras.conlote,
      almacenid: extras.almacenid ?? filtrosProductos.value.almacenid ?? obtenerAlmacenIdSeleccionado(),
      sort: extras.sort ?? filtrosProductos.value.sort ?? undefined,
      modo: extras.modo,
    })
  }

  async function buscarProductoParaPOS(termino) {
    const texto = String(termino ?? '').trim()
    if (!texto) return []

    const almacenid = obtenerAlmacenIdSeleccionado()

    const porSku = await obtenerProductosPOS({
      termino: texto,
      modo: 'sku',
      page: 1,
      limit: limitProductos.value,
      status: 'activo',
      almacenid,
    })
    if ((porSku?.productos ?? []).length) return porSku.productos

    const porUpc = await obtenerProductosPOS({
      termino: texto,
      modo: 'upc',
      page: 1,
      limit: limitProductos.value,
      status: 'activo',
      almacenid,
    })
    if ((porUpc?.productos ?? []).length) return porUpc.productos

    const porNombre = await obtenerProductosPOS({
      termino: texto,
      modo: 'nombre',
      page: 1,
      limit: limitProductos.value,
      status: 'activo',
      almacenid,
    })

    return porNombre?.productos ?? []
  }

  async function cambiarPaginaProductos(nuevaPagina) {
    const pagina = Number(nuevaPagina)
    if (!Number.isInteger(pagina)) return
    if (pagina < 1 || pagina > totalPaginasProductos.value) return
    if (pagina === pageProductos.value) return

    await obtenerProductosPOS({
      termino: filtrosProductos.value.termino,
      page: pagina,
      limit: limitProductos.value,
      status: filtrosProductos.value.status,
      conlote: filtrosProductos.value.conlote ?? undefined,
      almacenid: filtrosProductos.value.almacenid ?? obtenerAlmacenIdSeleccionado(),
      sort: filtrosProductos.value.sort ?? undefined,
    })
  }

  async function cambiarLimiteProductos(nuevoLimite) {
    const limite = Number(nuevoLimite)
    if (!Number.isInteger(limite) || limite <= 0) return

    limitProductos.value = limite

    await obtenerProductosPOS({
      termino: filtrosProductos.value.termino,
      page: 1,
      limit: limite,
      status: filtrosProductos.value.status,
      conlote: filtrosProductos.value.conlote ?? undefined,
      almacenid: filtrosProductos.value.almacenid ?? obtenerAlmacenIdSeleccionado(),
      sort: filtrosProductos.value.sort ?? undefined,
    })
  }

  async function obtenerClientesPOS(filtros = {}) {
    cargandoClientes.value = true

    try {
      const requestParams = {
        busqueda: filtros.busqueda ?? filtrosClientes.value.busqueda ?? '',
        page: Number(filtros.page ?? filtrosClientes.value.page ?? 1),
        limit: Number(filtros.limit ?? filtrosClientes.value.limit ?? 20),
      }

      const response = await clientesService.obtenerClientes(requestParams)

      clientes.value = response?.clientes ?? response?.data?.clientes ?? response?.data ?? []
      totalClientes.value = Number(response?.total ?? response?.meta?.total ?? 0)
      filtrosClientes.value = requestParams

      return response
    } catch (error) {
      console.error('Error obteniendo clientes POS:', error)
      clientes.value = []
      totalClientes.value = 0
      throw error
    } finally {
      cargandoClientes.value = false
    }
  }

  async function buscarClientesPOS(busqueda = '', extras = {}) {
    return obtenerClientesPOS({
      busqueda,
      page: 1,
      limit: extras.limit ?? filtrosClientes.value.limit ?? 20,
    })
  }

  async function obtenerAlmacenesPOS(filtros = {}) {
    cargandoAlmacenes.value = true

    try {
      const requestParams = {
        busqueda: filtros.busqueda ?? filtrosAlmacenes.value.busqueda ?? '',
        page: Number(filtros.page ?? filtrosAlmacenes.value.page ?? 1),
        limit: Number(filtros.limit ?? filtrosAlmacenes.value.limit ?? 100),
        status: filtros.status ?? filtrosAlmacenes.value.status ?? 'activo',
      }

      const response = await almacenesService.obtenerAlmacenes(requestParams)

      almacenesPOS.value = Array.isArray(response?.almacenes)
        ? response.almacenes.map((almacen) => normalizarAlmacen(almacen)).filter(Boolean)
        : []

      totalAlmacenes.value = Number(response?.total ?? almacenesPOS.value.length ?? 0)
      filtrosAlmacenes.value = requestParams

      return response
    } catch (error) {
      console.error('Error obteniendo almacenes POS:', error)
      almacenesPOS.value = []
      totalAlmacenes.value = 0
      throw error
    } finally {
      cargandoAlmacenes.value = false
    }
  }

  function seleccionarCliente(cliente) {
    clienteSeleccionado.value = cliente ?? null
  }

  function limpiarClienteSeleccionado() {
    clienteSeleccionado.value = null
  }

  async function seleccionarAlmacen(almacen) {
    almacenSeleccionado.value = normalizarAlmacen(almacen)
    limpiarBusquedaProductos()

    await obtenerProductosPOS({
      page: 1,
      limit: limitProductos.value,
      status: 'activo',
      almacenid: obtenerAlmacenIdSeleccionado(),
    })
  }

  function limpiarAlmacenSeleccionado() {
    almacenSeleccionado.value = null
    limpiarBusquedaProductos()
  }

  function generarKeyCarrito(producto, lote = null, almacen = null) {
    const productoUuid = producto?.productouuid ?? producto?.producto_uuid
    const loteUuid = lote?.loteuuid ?? lote?.lote_uuid ?? 'sin-lote'
    const almacenId = almacen?.almacenid ?? almacen?.almacen_id ?? almacen?.id ?? 'sin-almacen'
    return `${productoUuid}-${loteUuid}-${almacenId}`
  }

  function agregarProductoAlCarrito(producto, lote = null, cantidad = 1, almacen = null) {
    const productoUuid = producto?.productouuid ?? producto?.producto_uuid
    if (!productoUuid) return false

    const cantidadNumerica = Math.max(1, Number(cantidad ?? 1))
    const stockProducto = obtenerStockDisponibleProducto(producto)
    if (stockProducto <= 0) return false

    if (lote && Number(lote?.cantidadactual ?? lote?.cantidad_actual ?? 0) <= 0) return false

    const almacenNormalizado = normalizarAlmacen(almacen ?? lote?.almacen ?? almacenSeleccionado.value)
    const key = generarKeyCarrito(producto, lote, almacenNormalizado)

    const existente = carrito.value.find((item) => item.key === key)

    if (existente) {
      const maximo = existente.loteuuid
        ? Number(existente.lote?.cantidadactual ?? existente.lote?.cantidad_actual ?? 0)
        : obtenerStockDisponibleProducto(existente.producto)

      const nuevaCantidad = existente.cantidad + cantidadNumerica
      existente.cantidad = Math.min(nuevaCantidad, maximo)
      return existente.cantidad === nuevaCantidad
    }

    const cantidadMaxima = lote
      ? Number(lote?.cantidadactual ?? lote?.cantidad_actual ?? 0)
      : stockProducto

    carrito.value.push({
      key,
      productouuid: productoUuid,
      producto_uuid: productoUuid,
      producto,
      loteuuid: lote?.loteuuid ?? lote?.lote_uuid ?? null,
      lote_uuid: lote?.lote_uuid ?? lote?.loteuuid ?? null,
      lote: lote ?? null,
      almacenuuid: almacenNormalizado?.almacenuuid ?? almacenNormalizado?.almacen_uuid ?? null,
      almacen_uuid: almacenNormalizado?.almacen_uuid ?? almacenNormalizado?.almacenuuid ?? null,
      almacenid: almacenNormalizado?.almacenid ?? almacenNormalizado?.almacen_id ?? null,
      almacen_id: almacenNormalizado?.almacen_id ?? almacenNormalizado?.almacenid ?? null,
      almacennombre: almacenNormalizado?.nombre ?? '',
      almacen_nombre: almacenNormalizado?.nombre ?? '',
      cantidad: Math.min(cantidadNumerica, cantidadMaxima),
      preciounitario: obtenerPrecioUnitario(producto),
      precio_unitario: obtenerPrecioUnitario(producto),
    })

    return true
  }

  function actualizarCantidadProducto(key, cantidad) {
    const item = carrito.value.find((row) => row.key === key)
    if (!item) return

    const cantidadNumerica = Number(cantidad ?? 0)
    if (cantidadNumerica <= 0) {
      eliminarProductoDelCarrito(key)
      return
    }

    const maximo = item.loteuuid
      ? Number(item.lote?.cantidadactual ?? item.lote?.cantidad_actual ?? 0)
      : obtenerStockDisponibleProducto(item.producto)

    item.cantidad = Math.min(cantidadNumerica, maximo)
  }

  function eliminarProductoDelCarrito(key) {
    carrito.value = carrito.value.filter((item) => item.key !== key)
  }

  function limpiarCarrito() {
    carrito.value = []
  }

  function construirPartidasVenta() {
    return carrito.value.map((item) => {
      const cantidad = Number(item.cantidad ?? 0)
      const precioUnitario = redondearMoneda(item.preciounitario ?? item.precio_unitario ?? 0)
      const subtotalPartida = redondearMoneda(cantidad * precioUnitario)

      return {
        producto_uuid: item.producto_uuid ?? item.productouuid,
        lote_uuid: item.lote_uuid ?? item.loteuuid ?? null,
        almacen_id: item.almacen_id ?? item.almacenid ?? null,
        cantidad,
        precio_unitario: precioUnitario,
        descuento: 0,
        impuesto: 0,
        subtotal: subtotalPartida,
        total: subtotalPartida,
      }
    })
  }

  function construirPayloadCrearVenta(datosCobro = {}) {
    const subtotalVenta = redondearMoneda(subtotal.value)
    const totalVenta = redondearMoneda(totalGeneral.value)
    const almacenId = obtenerAlmacenIdSeleccionado()
    const metodoPago = String(datosCobro?.metodo_pago ?? datosCobro?.metodopago ?? '').trim()
    const esEfectivo = metodoPago === 'efectivo'

    return {
      cliente_uuid:
        clienteSeleccionado.value?.cliente_uuid ??
        clienteSeleccionado.value?.clienteuuid ??
        null,
      almacen_id: almacenId ?? null,
      metodo_pago: metodoPago,
      subtotal: subtotalVenta,
      descuento: 0,
      impuesto: 0,
      total: totalVenta,
      monto_recibido: redondearMoneda(
        esEfectivo
          ? Number(datosCobro?.monto_recibido ?? datosCobro?.montorecibido ?? 0)
          : totalVenta,
      ),
      cambio: redondearMoneda(
        esEfectivo
          ? Number(datosCobro?.cambio ?? 0)
          : 0,
      ),
      partidas: construirPartidasVenta(),
    }
  }

  function obtenerSnapshotBorradorVentaPOS() {
    return {
      version: 1,
      almacenSeleccionado: almacenSeleccionado.value ?? null,
      clienteSeleccionado: clienteSeleccionado.value ?? null,
      carrito: Array.isArray(carrito.value) ? carrito.value : [],
      timestamp: new Date().toISOString(),
    }
  }

  function guardarBorradorVentaPOS() {
    if (typeof window === 'undefined' || !window.localStorage) return

    try {
      const sinContenido =
        !almacenSeleccionado.value &&
        !clienteSeleccionado.value &&
        carrito.value.length === 0

      if (sinContenido) {
        window.localStorage.removeItem(POS_VENTA_STORAGE_KEY)
        return
      }

      const snapshot = obtenerSnapshotBorradorVentaPOS()
      window.localStorage.setItem(POS_VENTA_STORAGE_KEY, JSON.stringify(snapshot))
    } catch (error) {
      console.error('Error guardando borrador POS en localStorage:', error)
    }
  }

  function restaurarBorradorVentaPOS() {
    if (typeof window === 'undefined' || !window.localStorage) return false

    hidratandoBorrador.value = true

    try {
      const raw = window.localStorage.getItem(POS_VENTA_STORAGE_KEY)
      if (!raw) return false

      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') {
        eliminarBorradorVentaPOS()
        return false
      }

      almacenSeleccionado.value = normalizarAlmacen(parsed?.almacenSeleccionado)
      clienteSeleccionado.value = parsed?.clienteSeleccionado ?? null
      carrito.value = Array.isArray(parsed?.carrito) ? parsed.carrito : []

      return true
    } catch (error) {
      console.error('Error restaurando borrador POS desde localStorage:', error)
      eliminarBorradorVentaPOS()
      return false
    } finally {
      hidratandoBorrador.value = false
    }
  }

  function eliminarBorradorVentaPOS() {
    if (typeof window === 'undefined' || !window.localStorage) return

    try {
      window.localStorage.removeItem(POS_VENTA_STORAGE_KEY)
    } catch (error) {
      console.error('Error eliminando borrador POS del localStorage:', error)
    }
  }

  async function crearVenta(payload) {
    cargando.value = true

    try {
      const response = await ventasService.crearVenta(payload)
      eliminarBorradorVentaPOS()
      return response
    } catch (error) {
      console.error('Error creando venta:', error)
      throw error
    } finally {
      cargando.value = false
    }
  }

  watch(
    [carrito, clienteSeleccionado, almacenSeleccionado],
    () => {
      if (hidratandoBorrador.value) return
      guardarBorradorVentaPOS()
    },
    { deep: true },
  )

  return {
    cargando,
    cargandoProductos,
    productos,
    totalProductos,
    pageProductos,
    limitProductos,
    filtrosProductos,
    totalPaginasProductos,
    cargandoClientes,
    clientes,
    totalClientes,
    filtrosClientes,
    clienteSeleccionado,
    cargandoAlmacenes,
    almacenesPOS,
    totalAlmacenes,
    filtrosAlmacenes,
    almacenSeleccionado,
    carrito,
    carritoVacio,
    totalArticulos,
    subtotal,
    totalGeneral,
    limpiarBusquedaProductos,
    limpiarBusquedaClientes,
    limpiarBusquedaAlmacenes,
    limpiarEstadoPOS,
    normalizarAlmacen,
    normalizarLotes,
    obtenerPrecioUnitario,
    obtenerStockLista,
    obtenerStockDisponibleProducto,
    obtenerProductosPOS,
    buscarProductosPOS,
    buscarProductoParaPOS,
    cambiarPaginaProductos,
    cambiarLimiteProductos,
    obtenerClientesPOS,
    buscarClientesPOS,
    seleccionarCliente,
    limpiarClienteSeleccionado,
    obtenerAlmacenesPOS,
    seleccionarAlmacen,
    limpiarAlmacenSeleccionado,
    agregarProductoAlCarrito,
    actualizarCantidadProducto,
    eliminarProductoDelCarrito,
    limpiarCarrito,
    construirPartidasVenta,
    construirPayloadCrearVenta,
    guardarBorradorVentaPOS,
    restaurarBorradorVentaPOS,
    eliminarBorradorVentaPOS,
    crearVenta,
  }
})
