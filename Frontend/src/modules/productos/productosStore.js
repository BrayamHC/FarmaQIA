import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { productosService } from './productosService';

export const useProductosStore = defineStore('productos', () => {
  const cargando = ref(false);
  const cargandoDetalle = ref(false);

  const productos = ref([]);
  const productoDetalle = ref(null);

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

  async function obtenerProductos(params = {}) {
    cargando.value = true;

    try {
      const response = await productosService.obtenerProductos({
        page: params.page ?? page.value,
        limit: params.limit ?? limit.value,
        busqueda: params.busqueda ?? filtros.value.busqueda,
        fecha_inicio: params.fecha_inicio ?? filtros.value.fecha_inicio,
        fecha_fin: params.fecha_fin ?? filtros.value.fecha_fin,
        status: params.status ?? filtros.value.status,
      });

      productos.value = response?.productos ?? [];
      total.value = response?.total ?? 0;
      page.value = response?.page ?? 1;
      limit.value = response?.limit ?? 10;
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



  return {
    cargando,
    cargandoDetalle,
    productos,
    productoDetalle,
    total,
    page,
    limit,
    filtros,
    totalPaginas,
    obtenerProductos,
    obtenerProductoDetalle,
    actualizarFiltros,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarLimite,
    limpiarDetalle,
    crearProducto,
  };
});
