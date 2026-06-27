import api from '@/config/axiosConfig';

const BASE_URL = '/proveedores';

export async function obtenerProveedores(params = {}) {
  const { data } = await api.get(BASE_URL, { params });
  return data;
}

export async function obtenerProveedorPorUUID(uuid) {
  const { data } = await api.get(`${BASE_URL}/${uuid}`);
  return data;
}

export async function crearProveedor(payload) {
  const { data } = await api.post(BASE_URL, payload);
  return data;
}

export async function actualizarProveedor(uuid, payload) {
  const { data } = await api.put(`${BASE_URL}/${uuid}`, payload);
  return data;
}

export async function cambiarStatusProveedor(uuid, status) {
  const { data } = await api.patch(`${BASE_URL}/${uuid}/status`, { status });
  return data;
}

export default {
  obtenerProveedores,
  obtenerProveedorPorUUID,
  crearProveedor,
  actualizarProveedor,
  cambiarStatusProveedor,
};
