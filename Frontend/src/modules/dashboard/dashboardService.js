// dashboardService.js
import api from '@/config/axiosConfig';

const dashboardService = {
  async obtenerResumen() {
    const { data } = await api.get('/metricas/resumen');
    return data;
  },
  async obtenerVentasSemana() {
    const { data } = await api.get('/metricas/ventas-semana');
    return data;
  },
  async obtenerInventarioPorCategoria() {
    const { data } = await api.get('/metricas/inventario-categoria');
    return data;
  },
  async obtenerCaducidades(dias = 90) {
    const { data } = await api.get('/metricas/caducidades', { params: { dias } });
    return data;
  },
};

export default dashboardService;
