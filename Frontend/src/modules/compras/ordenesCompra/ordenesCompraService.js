// Frontend/src/modules/compras/ordenesCompra/ordenesCompraService.js
import api from '@/config/axiosConfig'

const BASE = '/ordenes-compra'

const ordenarParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )

export const ordenesCompraService = {
  async obtenerOrdenes(params = {}) {
    const { data } = await api.get(BASE, {
      params: ordenarParams(params),
    })
    return data
  },

  async obtenerOrdenPorUuid(uuid) {
    const { data } = await api.get(`${BASE}/${uuid}`)
    return data
  },

  async crearOrden(payload) {
    const { data } = await api.post(BASE, payload)
    return data
  },

  async autorizarOrden(uuid) {
    const { data } = await api.patch(`${BASE}/${uuid}/autorizar`)
    return data
  },

  async rechazarOrden(uuid, payload) {
    const { data } = await api.patch(`${BASE}/${uuid}/rechazar`, payload)
    return data
  },

  async cancelarOrden(uuid) {
    const { data } = await api.patch(`${BASE}/${uuid}/cancelar`)
    return data
  },
}

export default ordenesCompraService
