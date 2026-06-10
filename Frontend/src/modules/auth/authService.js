import api from '@/config/axiosConfig';

const authService = {
  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  async logout() {
    const { data } = await api.post('/auth/logout', {});
    return data;
  },

  async obtenerPerfil() {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export default authService;
