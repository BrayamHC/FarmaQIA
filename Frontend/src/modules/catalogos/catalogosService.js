// catalogosService.js
import api from '@/config/axiosConfig';

export const catalogosService = {
  async obtenerUnidadesMedida(params = {}) {
    const { data } = await api.get('/catalogos/unidades-medida', { params });
    return data;
  },

  async obtenerCategoriasSubcategorias(params = {}) {
    const { data } = await api.get('/catalogos/categoras-subcategorias', { params });
    return data;
  },
};
