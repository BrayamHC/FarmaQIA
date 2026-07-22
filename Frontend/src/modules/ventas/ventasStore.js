// Frontend/src/modules/ventas/ventasStore.js
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { productosService } from '@/modules/productos/productosService';
import { clientesService } from '@/modules/clientes/clientesService';

export const useVentasStore = defineStore('ventas', () => {
  const cargando = ref(false);

  const submodulos = ref([
    {
      titulo: 'Punto de Venta',
      descripcion: 'Terminal optimizada para el despacho rápido de medicamentos y productos farmacéuticos.',
      icono: 'pi pi-desktop',
      ruta: '/ventas/punto-de-venta',
      tags: ['Caja rápida', 'Recetas'],
    },
    {
      titulo: 'Notas de Venta',
      descripcion: 'Consulta de historial, pedidos pendientes y gestión de facturación electrónica.',
      icono: 'pi pi-file-edit',
      ruta: '/ventas/notas-de-venta',
      tags: ['Historial', 'Anulaciones'],
    },
    {
      titulo: 'Clientes',
      descripcion: 'Base de datos de clientes, programas de lealtad y cuentas corrientes activas.',
      icono: 'pi pi-users',
      ruta: '/ventas/clientes',
      tags: ['Fidelidad', 'Créditos'],
    },
    {
      titulo: 'Cajas',
      descripcion: 'Arqueo de caja, cierres diarios, egresos y control de flujo de efectivo.',
      icono: 'pi pi-building-columns',
      ruta: '/ventas/cajas',
      tags: ['Cierres', 'Arqueos'],
    },
  ]);

  const ventasRecientes = ref([
    { folio: 'F001-00234', cliente: 'Juan Pérez', hora: '12:45 PM', monto: '$120.50' },
    { folio: 'F001-00235', cliente: 'María García', hora: '1:12 PM', monto: '$45.00' },
    { folio: 'F001-00236', cliente: 'Pedro S.', hora: '2:05 PM', monto: '$312.20' },
    { folio: 'F001-00237', cliente: 'Consumidor Final', hora: '3:30 PM', monto: '$12.90' },
    { folio: 'F001-00238', cliente: 'Laura Mendoza', hora: '3:58 PM', monto: '$87.00' },
  ]);

  const estadoCaja = ref({
    total: '$1,450.00',
    progreso: 72,
    estado: 'Caja conciliada correctamente',
  });

  const cargandoProductos = ref(false);
  const cargandoProductoDetalle = ref(false);

  const productos = ref([]);
  const productoSeleccionado = ref(null);
  const totalProductos = ref(0);
  const pageProductos = ref(1);
  const limitProductos = ref(20);

  const filtrosProductos = ref({
    termino: '',
    status: 'activo',
    con_lote: null,
    page: 1,
    limit: 20,
    sort: null,
  });

  const cargandoClientes = ref(false);
  const clientes = ref([]);
  const totalClientes = ref(0);
  const clienteSeleccionado = ref(null);

  const filtrosClientes = ref({
    busqueda: '',
    page: 1,
    limit: 20,
  });

  const carrito = ref([]);

  const carritoVacio = computed(() => carrito.value.length === 0);

  const totalArticulos = computed(() =>
    carrito.value.reduce((acc, item) => acc + Number(item.cantidad ?? 0), 0),
  );

  const subtotal = computed(() =>
    carrito.value.reduce(
      (acc, item) => acc + Number(item.cantidad ?? 0) * Number(item.precio_unitario ?? 0),
      0,
    ),
  );

  const totalGeneral = computed(() => subtotal.value);

  function limpiarBusquedaProductos() {
    productos.value = [];
    totalProductos.value = 0;
    pageProductos.value = 1;
  }

  function limpiarProductoSeleccionado() {
    productoSeleccionado.value = null;
  }

  function limpiarBusquedaClientes() {
    clientes.value = [];
    totalClientes.value = 0;
    filtrosClientes.value = {
      busqueda: '',
      page: 1,
      limit: 20,
    };
  }

  function limpiarEstadoPOS() {
    limpiarBusquedaProductos();
    limpiarProductoSeleccionado();
    limpiarBusquedaClientes();
    clienteSeleccionado.value = null;
    carrito.value = [];
  }

  function esTextoCodigo(valor = '') {
    const limpio = String(valor).trim();
    if (!limpio) return false;
    return /^[A-Za-z0-9-]+$/.test(limpio) && limpio.length <= 40;
  }

  function normalizarLotes(producto) {
    const lotes = Array.isArray(producto?.lotes) ? producto.lotes : [];

    return lotes
      .map((lote) => ({
        ...lote,
        lote_uuid: lote.lote_uuid,
        codigo_lote: lote.codigo_lote ?? lote.clave ?? '',
        cantidad_actual: Number(lote.cantidad_actual ?? lote.cantidad ?? 0),
        fecha_caducidad: lote.fecha_caducidad ?? null,
        almacen: lote.almacen ?? null,
      }))
      .filter((lote) => lote.lote_uuid && lote.cantidad_actual > 0)
      .sort((a, b) => {
        const fechaA = a.fecha_caducidad ? new Date(a.fecha_caducidad).getTime() : Number.MAX_SAFE_INTEGER;
        const fechaB = b.fecha_caducidad ? new Date(b.fecha_caducidad).getTime() : Number.MAX_SAFE_INTEGER;
        return fechaA - fechaB;
      });
  }

  function obtenerPrecioUnitario(producto) {
    if (!producto) return 0;

    if (producto.precio_venta != null) {
      return Number(producto.precio_venta ?? 0);
    }

    if (Array.isArray(producto.precios) && producto.precios.length) {
      const precioDefault =
        producto.precios.find((item) => item?.es_default) ??
        producto.precios.find((item) => item?.status === 'activo') ??
        producto.precios[0];

      if (precioDefault?.precio_venta != null) {
        return Number(precioDefault.precio_venta ?? 0);
      }
    }

    return Number(producto.precio_publico ?? 0);
  }

  function obtenerStockDisponibleProducto(producto) {
    if (!producto) return 0;

    if (producto?.stock?.total != null) {
      return Number(producto.stock.total ?? 0);
    }

    if (Array.isArray(producto?.stock?.almacenes)) {
      return producto.stock.almacenes.reduce(
        (acc, item) => acc + Number(item?.stock ?? 0),
        0,
      );
    }

    if (Array.isArray(producto?.lotes)) {
      return normalizarLotes(producto).reduce(
        (acc, lote) => acc + Number(lote.cantidad_actual ?? 0),
        0,
      );
    }

    return 0;
  }

  async function obtenerProductosPOS(params = {}) {
    cargandoProductos.value = true;

    try {
      const termino = String(params.termino ?? filtrosProductos.value.termino ?? '').trim();

      const requestParams = {
        page: Number(params.page ?? filtrosProductos.value.page ?? pageProductos.value ?? 1),
        limit: Number(params.limit ?? filtrosProductos.value.limit ?? limitProductos.value ?? 20),
        status: params.status ?? filtrosProductos.value.status ?? 'activo',
        con_lote:
          typeof params.con_lote === 'boolean'
            ? params.con_lote
            : filtrosProductos.value.con_lote ?? undefined,
        sort: params.sort ?? filtrosProductos.value.sort ?? undefined,
      };

      if (termino) {
        if (params.modo === 'sku') {
          requestParams.sku = termino;
        } else if (params.modo === 'upc') {
          requestParams.upc = termino;
        } else if (params.modo === 'nombre') {
          requestParams.nombre = termino;
        } else if (esTextoCodigo(termino)) {
          requestParams.sku = termino;
        } else {
          requestParams.nombre = termino;
        }
      }

      const response = await productosService.obtenerProductos(requestParams);

      productos.value = Array.isArray(response?.productos) ? response.productos : [];
      totalProductos.value = Number(response?.total ?? 0);
      pageProductos.value = Number(response?.page ?? requestParams.page);
      limitProductos.value = Number(response?.limit ?? requestParams.limit);

      filtrosProductos.value = {
        termino,
        status: requestParams.status ?? 'activo',
        con_lote: typeof requestParams.con_lote === 'boolean' ? requestParams.con_lote : null,
        page: pageProductos.value,
        limit: limitProductos.value,
        sort: requestParams.sort ?? null,
      };

      return response;
    } catch (error) {
      console.error('Error obteniendo productos POS:', error);
      productos.value = [];
      totalProductos.value = 0;
      throw error;
    } finally {
      cargandoProductos.value = false;
    }
  }

  async function buscarProductosPOS(termino = '', extras = {}) {
    return await obtenerProductosPOS({
      termino,
      page: 1,
      limit: extras.limit ?? limitProductos.value,
      status: extras.status ?? filtrosProductos.value.status ?? 'activo',
      con_lote: extras.con_lote,
      sort: extras.sort ?? filtrosProductos.value.sort ?? undefined,
      modo: extras.modo,
    });
  }

  async function buscarProductoParaPOS(termino = '') {
    const texto = String(termino).trim();
    if (!texto) return [];

    if (esTextoCodigo(texto)) {
      const porSku = await obtenerProductosPOS({
        termino: texto,
        modo: 'sku',
        page: 1,
        limit: 20,
        status: 'activo',
      });

      const productosSku = porSku?.productos ?? [];
      if (productosSku.length) return productosSku;

      const porUpc = await obtenerProductosPOS({
        termino: texto,
        modo: 'upc',
        page: 1,
        limit: 20,
        status: 'activo',
      });

      return porUpc?.productos ?? [];
    }

    const porNombre = await obtenerProductosPOS({
      termino: texto,
      modo: 'nombre',
      page: 1,
      limit: 20,
      status: 'activo',
    });

    return porNombre?.productos ?? [];
  }

  async function obtenerProductoParaVenta(productoUuid) {
    cargandoProductoDetalle.value = true;

    try {
      const response = await productosService.obtenerProductoDetalle(productoUuid);

      productoSeleccionado.value = {
        ...response,
        con_lote: Boolean(response?.con_lote),
        lotes: normalizarLotes(response),
        precio_unitario: obtenerPrecioUnitario(response),
        stock_disponible: obtenerStockDisponibleProducto(response),
      };

      return productoSeleccionado.value;
    } catch (error) {
      console.error('Error obteniendo producto para venta:', error);
      throw error;
    } finally {
      cargandoProductoDetalle.value = false;
    }
  }

  async function seleccionarProducto(productoBase) {
    if (!productoBase?.producto_uuid) return null;
    return await obtenerProductoParaVenta(productoBase.producto_uuid);
  }

  async function obtenerClientesPOS(filtros = {}) {
    cargandoClientes.value = true;

    try {
      const requestParams = {
        busqueda: filtros.busqueda ?? filtrosClientes.value.busqueda ?? '',
        page: Number(filtros.page ?? filtrosClientes.value.page ?? 1),
        limit: Number(filtros.limit ?? filtrosClientes.value.limit ?? 20),
      };

      const response = await clientesService.obtenerClientes(requestParams);

      clientes.value =
        response?.clientes ??
        response?.data?.clientes ??
        response?.data ??
        [];

      totalClientes.value =
        Number(response?.total ?? response?.meta?.total ?? 0);

      filtrosClientes.value = {
        busqueda: requestParams.busqueda ?? '',
        page: requestParams.page,
        limit: requestParams.limit,
      };

      return response;
    } catch (error) {
      console.error('Error obteniendo clientes POS:', error);
      clientes.value = [];
      totalClientes.value = 0;
      throw error;
    } finally {
      cargandoClientes.value = false;
    }
  }

  async function buscarClientesPOS(busqueda = '', extras = {}) {
    return await obtenerClientesPOS({
      busqueda,
      page: 1,
      limit: extras.limit ?? filtrosClientes.value.limit ?? 20,
    });
  }

  function seleccionarCliente(cliente) {
    clienteSeleccionado.value = cliente ?? null;
  }

  function limpiarClienteSeleccionado() {
    clienteSeleccionado.value = null;
  }

  function generarKeyCarrito(producto, lote = null) {
    return lote?.lote_uuid
      ? `${producto.producto_uuid}_${lote.lote_uuid}`
      : `${producto.producto_uuid}_sin_lote`;
  }

  function agregarProductoAlCarrito({ producto, lote = null, cantidad = 1 }) {
    if (!producto?.producto_uuid) return;

    const cantidadNumerica = Number(cantidad ?? 1);
    const key = generarKeyCarrito(producto, lote);
    const existente = carrito.value.find((item) => item._key === key);

    if (existente) {
      existente.cantidad += cantidadNumerica;
      return;
    }

    carrito.value.push({
      _key: key,
      producto_uuid: producto.producto_uuid,
      producto,
      lote_uuid: lote?.lote_uuid ?? null,
      lote,
      cantidad: cantidadNumerica,
      precio_unitario: obtenerPrecioUnitario(producto),
    });
  }

  function actualizarCantidadProducto(key, cantidad) {
    const item = carrito.value.find((row) => row._key === key);
    if (!item) return;

    const cantidadNumerica = Number(cantidad ?? 0);

    if (cantidadNumerica <= 0) {
      eliminarProductoDelCarrito(key);
      return;
    }

    item.cantidad = cantidadNumerica;
  }

  function eliminarProductoDelCarrito(key) {
    carrito.value = carrito.value.filter((item) => item._key !== key);
  }

  function limpiarCarrito() {
    carrito.value = [];
  }

  return {
    cargando,
    submodulos,
    ventasRecientes,
    estadoCaja,

    cargandoProductos,
    cargandoProductoDetalle,
    productos,
    productoSeleccionado,
    totalProductos,
    pageProductos,
    limitProductos,
    filtrosProductos,

    cargandoClientes,
    clientes,
    totalClientes,
    filtrosClientes,
    clienteSeleccionado,

    carrito,
    carritoVacio,
    totalArticulos,
    subtotal,
    totalGeneral,

    limpiarBusquedaProductos,
    limpiarProductoSeleccionado,
    limpiarBusquedaClientes,
    limpiarEstadoPOS,
    normalizarLotes,
    obtenerStockDisponibleProducto,
    obtenerPrecioUnitario,

    obtenerProductosPOS,
    buscarProductosPOS,
    buscarProductoParaPOS,
    obtenerProductoParaVenta,
    seleccionarProducto,

    obtenerClientesPOS,
    buscarClientesPOS,
    seleccionarCliente,
    limpiarClienteSeleccionado,

    agregarProductoAlCarrito,
    actualizarCantidadProducto,
    eliminarProductoDelCarrito,
    limpiarCarrito,
  };
});
