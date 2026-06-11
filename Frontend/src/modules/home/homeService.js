import api from '@/config/axiosConfig';

const homeService = {
  async obtenerModulos() {
    const { data } = await api.get('/home/modulos');
    return data;
  },
};

export default homeService;
