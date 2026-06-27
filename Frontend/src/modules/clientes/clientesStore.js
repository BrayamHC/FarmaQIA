import { defineStore } from 'pinia';
import { ref } from 'vue';
import { clientesService } from './clientesService';

export const useClientesStore = defineStore('clientes', () => {
  const cargando = ref(false);
  const clientes = ref([]);
  const total = ref(0);
  const clienteDetalle = ref(null);

  async function obtenerClientes(filtros = {}) {
    cargando.value = true;

    try {
      const response = await clientesService.obtenerClientes(filtros);

      clientes.value = response?.data?.clientes ?? [];
      total.value = Number(response?.meta?.total ?? 0);

      return response;
    } finally {
      cargando.value = false;
    }
  }

  async function obtenerClientePorUUID(clienteUuid) {
    cargando.value = true;

    try {
      const response = await clientesService.obtenerClientePorUUID(clienteUuid);
      clienteDetalle.value = response?.cliente ?? null;
      return response?.cliente ?? null;
    } finally {
      cargando.value = false;
    }
  }

  async function crearCliente(payload) {
    return await clientesService.crearCliente(payload);
  }

  async function actualizarCliente(clienteUuid, payload) {
    return await clientesService.actualizarCliente(clienteUuid, payload);
  }

  async function cambiarStatusCliente(clienteUuid, status) {
    return await clientesService.cambiarStatusCliente(clienteUuid, status);
  }

  function limpiarDetalle() {
    clienteDetalle.value = null;
  }

  return {
    cargando,
    clientes,
    total,
    clienteDetalle,
    obtenerClientes,
    obtenerClientePorUUID,
    crearCliente,
    actualizarCliente,
    cambiarStatusCliente,
    limpiarDetalle,
  };
});
