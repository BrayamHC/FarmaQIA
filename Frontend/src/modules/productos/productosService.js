import api from '@/config/axiosConfig';

export const productosService = {
  async obtenerProductos(params = {}) {
    const limit = Number(params.limit ?? 6);
    const page = Number(params.page ?? 1);

    const { data } = await api.get('/productos', {
      params: {
        page,
        limit,
        busqueda: params.busqueda || undefined,
        fecha_inicio: params.fecha_inicio || undefined,
        fecha_fin: params.fecha_fin || undefined,
        status: params.status || undefined,
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
};
