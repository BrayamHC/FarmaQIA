// Frontend/src/modules/almacenes/almacenesService.js
import axios from '@/config/axiosConfig'

async function obtenerAlmacenes(params = {}) {
  const { data } = await axios.get('/almacenes', { params })

  return {
    almacenes: data?.data?.almacenes ?? data?.almacenes ?? [],
    total: Number(
      data?.meta?.total ??
      data?.total ??
      data?.data?.almacenes?.length ??
      data?.almacenes?.length ??
      0,
    ),
    raw: data,
  }
}

async function obtenerAlmacenDetalle(almacenUuid) {
  const { data } = await axios.get(`/almacenes/${almacenUuid}`)

  return data?.data?.almacen ?? data?.almacen ?? null
}

export const almacenesService = {
  obtenerAlmacenes,
  obtenerAlmacenDetalle,
}
