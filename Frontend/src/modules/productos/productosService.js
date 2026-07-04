import api from '@/config/axiosConfig';

export const productosService = {
  async obtenerProductos(params = {}) {
    const limit = Number(params.limit ?? 10);
    const page = Number(params.page ?? 1);
    const termino = String(params.busqueda ?? '').trim();

    const { data } = await api.get('/productos', {
      params: {
        page,
        limit,
        nombre: termino || undefined,
        sku: termino || undefined,
        upc: termino || undefined,
        status: params.status || undefined,
        fecha_inicio: params.fecha_inicio || undefined,
        fecha_fin: params.fecha_fin || undefined,
        sort: params.sort || undefined,
      },
    });

    return data;
  },

  async obtenerProductoDetalle(productoUuid) {
    const { data } = await api.get(`/productos/${productoUuid}`);
    return data;
  },

  async crearProducto(payload) {
    const { data } = await api.post('/productos', payload);
    return data;
  },

  async actualizarProducto(productoUuid, payload) {
    const { data } = await api.patch(`/productos/${productoUuid}`, payload);
    return data;
  },

  async cambiarStatusProducto(productoUuid, payload) {
    const { data } = await api.patch(`/productos/${productoUuid}/status`, payload);
    return data;
  },

  async altaLoteStock(productoUuid, payload) {
    const { data } = await api.post(`/productos/${productoUuid}/lotes`, payload);
    return data;
  },

  async obtenerStockProducto(productoUuid) {
    const { data } = await api.get(`/productos/${productoUuid}/stock`);
    return data;
  },

  async obtenerLotesProducto(productoUuid) {
    const { data } = await api.get(`/productos/${productoUuid}/lotes`);
    return data;
  },

  async cambiarStatusLote(productoUuid, loteUuid, payload) {
    const { data } = await api.patch(
      `/productos/${productoUuid}/lotes/${loteUuid}/status`,
      payload,
    );
    return data;
  },

  async obtenerProveedores(params = {}) {
    const { data } = await api.get('/proveedores', { params });
    return data;
  },

  async obtenerAlmacenes(params = {}) {
    const { data } = await api.get('/almacenes', { params });
    return data;
  },
};
