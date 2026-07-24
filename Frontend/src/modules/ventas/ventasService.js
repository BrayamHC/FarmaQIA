// src/modules/ventas/ventasService.js
import axios from '@/config/axiosConfig'

const ENDPOINT = '/ventas'

async function crearVenta(payload) {
  const { data } = await axios.post(ENDPOINT, payload)
  return data
}

async function obtenerVentas(params = {}) {
  const { data } = await axios.get(ENDPOINT, { params })
  return data
}

async function obtenerVentaPorUuid(uuid) {
  const { data } = await axios.get(`${ENDPOINT}/${uuid}`)
  return data
}

export const ventasService = {
  crearVenta,
  obtenerVentas,
  obtenerVentaPorUuid,
}

export default ventasService