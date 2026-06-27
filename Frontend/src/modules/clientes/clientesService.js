import api from '@/config/axiosConfig';

const BASE_URL = '/clientes';

export const clientesService = {
  async obtenerClientes(params = {}) {
    const { data } = await api.get(BASE_URL, { params });
    return data;
  },

  async obtenerClientePorUUID(clienteUuid) {
    const { data } = await api.get(`${BASE_URL}/${clienteUuid}`);
    return data;
  },

  async crearCliente(payload) {
    const { data } = await api.post(BASE_URL, payload);
    return data;
  },

  async actualizarCliente(clienteUuid, payload) {
    const { data } = await api.put(`${BASE_URL}/${clienteUuid}`, payload);
    return data;
  },

  async cambiarStatusCliente(clienteUuid, status) {
    const { data } = await api.patch(`${BASE_URL}/${clienteUuid}/status`, { status });
    return data;
  },
};
