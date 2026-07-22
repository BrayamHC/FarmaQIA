import api from '@/config/axiosConfig';

const BASE_URL = '/lotes';

export const lotesService = {
  async obtenerLotes(params = {}) {
    const { data } = await api.get(BASE_URL, { params });
    return data;
  },
};
