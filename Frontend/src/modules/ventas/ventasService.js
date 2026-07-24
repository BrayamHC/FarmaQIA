import axios from '@/config/axiosConfig'

async function crearVenta(payload) {
  const { data } = await axios.post('/ventas', payload)
  return data
}

export default {
  crearVenta,
}
