import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { productosService } from './productosService';

export const useProductosStore = defineStore('productos', () => {
  const cargando = ref(false);
  const cargandoDetalle = ref(false);
  const cambiandoStatus = ref(false);
  const guardandoStock = ref(false);
  const cargandoStock = ref(false);
  const cargandoLotes = ref(false);
  const cargandoCatalogosStock = ref(false);

  const productos = ref([]);
  const productoDetalle = ref(null);
  const stockProducto = ref(null);
  const lotesProducto = ref([]);

  const proveedores = ref([]);
  const almacenes = ref([]);

  const total = ref(0);
  const page = ref(1);
  const limit = ref(10);

  const filtros = ref({
    busqueda: '',
    fecha_inicio: null,
    fecha_fin: null,
    status: null,
  });

  const totalPaginas = computed(() => {
    if (!limit.value) return 1;
    return Math.ceil(total.value / limit.value);
  });

  const proveedoresOptions = computed(() =>
    (proveedores.value ?? []).map((item) => ({
      label:
        item.nombre_comercial ||
        item.nombre ||
        item.razon_social ||
        item.proveedor ||
        'Proveedor',
      value: item.proveedor_uuid || item.uuid,
    })),
  );

  const almacenesOptions = computed(() =>
    (almacenes.value ?? []).map((item) => ({
      label: item.nombre || item.almacen || 'Almacén',
      value: item.almacen_uuid || item.uuid,
    })),
  );

  async function obtenerProductos(params = {}) {
    cargando.value = true;

    try {
      const requestParams = {
        page: params.page ?? page.value,
        limit: params.limit ?? limit.value,
        busqueda: params.busqueda ?? filtros.value.busqueda,
        fecha_inicio: params.fecha_inicio ?? filtros.value.fecha_inicio,
        fecha_fin: params.fecha_fin ?? filtros.value.fecha_fin,
        status: params.status ?? filtros.value.status,
        sort: params.sort,
      };

      const response = await productosService.obtenerProductos(requestParams);

      productos.value = response?.productos ?? [];
      total.value = response?.total ?? 0;
      page.value = response?.page ?? requestParams.page;
      limit.value = response?.limit ?? requestParams.limit;

      filtros.value = {
        busqueda: requestParams.busqueda ?? '',
        fecha_inicio: requestParams.fecha_inicio ?? null,
        fecha_fin: requestParams.fecha_fin ?? null,
        status: requestParams.status ?? null,
      };

      return response;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    } finally {
      cargando.value = false;
    }
  }

  async function obtenerProductoDetalle(productoUuid) {
    cargandoDetalle.value = true;

    try {
      const response = await productosService.obtenerProductoDetalle(productoUuid);
      productoDetalle.value = response;
      return response;
    } catch (error) {
      console.error('Error obteniendo detalle del producto:', error);
      throw error;
    } finally {
      cargandoDetalle.value = false;
    }
  }

  async function obtenerStockProducto(productoUuid) {
    cargandoStock.value = true;

    try {
      const response = await productosService.obtenerStockProducto(productoUuid);
      stockProducto.value = response;
      return response;
    } catch (error) {
      console.error('Error obteniendo stock del producto:', error);
      throw error;
    } finally {
      cargandoStock.value = false;
    }
  }

  async function obtenerLotesProducto(productoUuid) {
    cargandoLotes.value = true;

    try {
      const response = await productosService.obtenerLotesProducto(productoUuid);
      lotesProducto.value = response?.lotes ?? [];
      return response;
    } catch (error) {
      console.error('Error obteniendo lotes del producto:', error);
      throw error;
    } finally {
      cargandoLotes.value = false;
    }
  }

  async function obtenerCatalogosStock(params = {}) {
    cargandoCatalogosStock.value = true;

    try {
      const [responseProveedores, responseAlmacenes] = await Promise.all([
        productosService.obtenerProveedores(params.proveedores ?? {}),
        productosService.obtenerAlmacenes(params.almacenes ?? {}),
      ]);

      proveedores.value =
        responseProveedores?.data?.proveedores ??
        responseProveedores?.proveedores ??
        responseProveedores?.data ??
        [];

      almacenes.value =
        responseAlmacenes?.data?.almacenes ??
        responseAlmacenes?.almacenes ??
        responseAlmacenes?.data ??
        [];

      return {
        proveedores: proveedores.value,
        almacenes: almacenes.value,
      };
    } catch (error) {
      console.error('Error obteniendo catálogos de stock:', error);
      proveedores.value = [];
      almacenes.value = [];
      throw error;
    } finally {
      cargandoCatalogosStock.value = false;
    }
  }

  function limpiarCatalogosStock() {
    proveedores.value = [];
    almacenes.value = [];
  }

  function actualizarFiltros(nuevosFiltros = {}) {
    filtros.value = {
      ...filtros.value,
      ...nuevosFiltros,
    };
  }

  async function aplicarFiltros(nuevosFiltros = {}) {
    actualizarFiltros(nuevosFiltros);
    page.value = 1;

    await obtenerProductos({
      page: 1,
      limit: limit.value,
    });
  }

  async function limpiarFiltros() {
    filtros.value = {
      busqueda: '',
      fecha_inicio: null,
      fecha_fin: null,
      status: null,
    };

    page.value = 1;

    await obtenerProductos({
      page: 1,
      limit: limit.value,
    });
  }

  async function cambiarPagina(nuevaPage) {
    page.value = nuevaPage;

    await obtenerProductos({
      page: nuevaPage,
      limit: limit.value,
    });
  }

  async function cambiarLimite(nuevoLimite) {
    limit.value = nuevoLimite;
    page.value = 1;

    await obtenerProductos({
      page: 1,
      limit: nuevoLimite,
    });
  }

  function limpiarDetalle() {
    productoDetalle.value = null;
    stockProducto.value = null;
    lotesProducto.value = [];
  }

  async function crearProducto(payload) {
    cargando.value = true;

    try {
      const response = await productosService.crearProducto(payload);
      return response;
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    } finally {
      cargando.value = false;
    }
  }

  async function actualizarProducto(productoUuid, payload) {
    cargando.value = true;

    try {
      const response = await productosService.actualizarProducto(productoUuid, payload);

      if (productoDetalle.value?.producto_uuid === productoUuid) {
        await obtenerProductoDetalle(productoUuid);
      }

      return response;
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    } finally {
      cargando.value = false;
    }
  }

  async function cambiarStatusProducto(productoUuid, status) {
    cambiandoStatus.value = true;

    try {
      const response = await productosService.cambiarStatusProducto(productoUuid, { status });

      if (productoDetalle.value?.producto_uuid === productoUuid) {
        await obtenerProductoDetalle(productoUuid);
      }

      await obtenerProductos({
        page: page.value,
        limit: limit.value,
      });

      return response;
    } catch (error) {
      console.error('Error cambiando status del producto:', error);
      throw error;
    } finally {
      cambiandoStatus.value = false;
    }
  }

  async function altaLoteStock(productoUuid, payload) {
    guardandoStock.value = true;

    try {
      const response = await productosService.altaLoteStock(productoUuid, payload);

      if (productoDetalle.value?.producto_uuid === productoUuid) {
        await Promise.all([
          obtenerProductoDetalle(productoUuid),
          obtenerStockProducto(productoUuid),
          obtenerLotesProducto(productoUuid),
        ]);
      }

      await obtenerProductos({
        page: page.value,
        limit: limit.value,
      });

      return response;
    } catch (error) {
      console.error('Error registrando alta manual de stock:', error);
      throw error;
    } finally {
      guardandoStock.value = false;
    }
  }

  async function cambiarStatusLote(productoUuid, loteUuid, status) {
    cargandoLotes.value = true;

    try {
      const response = await productosService.cambiarStatusLote(productoUuid, loteUuid, { status });

      await Promise.all([
        obtenerProductoDetalle(productoUuid),
        obtenerStockProducto(productoUuid),
        obtenerLotesProducto(productoUuid),
      ]);

      return response;
    } catch (error) {
      console.error('Error cambiando status del lote:', error);
      throw error;
    } finally {
      cargandoLotes.value = false;
    }
  }

  return {
    cargando,
    cargandoDetalle,
    cambiandoStatus,
    guardandoStock,
    cargandoStock,
    cargandoLotes,
    cargandoCatalogosStock,
    productos,
    productoDetalle,
    stockProducto,
    lotesProducto,
    proveedores,
    almacenes,
    proveedoresOptions,
    almacenesOptions,
    total,
    page,
    limit,
    filtros,
    totalPaginas,
    obtenerProductos,
    obtenerProductoDetalle,
    obtenerStockProducto,
    obtenerLotesProducto,
    obtenerCatalogosStock,
    limpiarCatalogosStock,
    actualizarFiltros,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarLimite,
    limpiarDetalle,
    crearProducto,
    actualizarProducto,
    cambiarStatusProducto,
    altaLoteStock,
    cambiarStatusLote,
  };
});
