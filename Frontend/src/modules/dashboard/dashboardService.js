import api from '@/config/axiosConfig';

const dashboardService = {
  async obtenerResumen() {
    const { data } = await api.get('/dashboard/resumen');
    return data;
  },
};

export default dashboardService;
