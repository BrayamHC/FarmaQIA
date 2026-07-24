// Frontend/src/modules/ventas/views/pos/posService.js
import api from '@/config/axiosConfig'

const BASE_URL = '/ventas'

async function crearVenta(payload) {
  const { data } = await api.post(BASE_URL, payload)
  return data
}

export default {
  crearVenta,
}
