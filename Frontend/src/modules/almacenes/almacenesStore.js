import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/config/axiosConfig';
import { useNotificacionesStore } from '@/stores/notificaciones.store';

export const useAlmacenesStore = defineStore('almacenes', () => {
  const cargando = ref(false);
  const cargandoDetalle = ref(false);

  const almacenes = ref([]);
  const total = ref(0);

  const almacenDetalle = ref(null);

  const notificacionesStore = useNotificacionesStore();

  async function obtenerAlmacenes(params = {}) {
    cargando.value = true;
    try {
      const { data } = await axios.get('/almacenes', { params });

      almacenes.value =
        data?.data?.almacenes ??
        data?.almacenes ??
        [];

      total.value = Number(
        data?.meta?.total ??
        data?.total ??
        almacenes.value?.length ??
        0
      );

      return data;
    } catch (error) {
      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudieron obtener los almacenes.'
      );
      throw error;
    } finally {
      cargando.value = false;
    }
  }

  async function obtenerAlmacenDetalle(almacenUuid) {
    cargandoDetalle.value = true;
    try {
      const { data } = await axios.get(`/almacenes/${almacenUuid}`);

      almacenDetalle.value =
        data?.data?.almacen ??
        data?.almacen ??
        null;

      return almacenDetalle.value;
    } catch (error) {
      almacenDetalle.value = null;
      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudo obtener el detalle del almacén.'
      );
      throw error;
    } finally {
      cargandoDetalle.value = false;
    }
  }

  async function crearAlmacen(payload) {
    try {
      const { data } = await axios.post('/almacenes', payload);
      notificacionesStore.success(
        data?.meta?.message || 'Almacén creado correctamente.'
      );
      return data;
    } catch (error) {
      notificacionesStore.error(
        error?.response?.data?.message || 'Ocurrió un error al crear el almacén.'
      );
      throw error;
    }
  }

  async function actualizarAlmacen(almacenUuid, payload) {
    try {
      const { data } = await axios.patch(`/almacenes/${almacenUuid}`, payload);
      notificacionesStore.success(
        data?.meta?.message || 'Almacén actualizado correctamente.'
      );
      return data;
    } catch (error) {
      notificacionesStore.error(
        error?.response?.data?.message || 'Ocurrió un error al actualizar el almacén.'
      );
      throw error;
    }
  }

  async function cambiarStatusAlmacen(almacenUuid, status) {
    try {
      const { data } = await axios.patch(`/almacenes/${almacenUuid}/status`, { status });
      notificacionesStore.success(
        data?.meta?.message || 'Status actualizado correctamente.'
      );
      return data;
    } catch (error) {
      notificacionesStore.error(
        error?.response?.data?.message || 'No fue posible actualizar el status del almacén.'
      );
      throw error;
    }
  }

  function limpiarDetalle() {
    almacenDetalle.value = null;
  }

  return {
    cargando,
    cargandoDetalle,
    almacenes,
    total,
    almacenDetalle,
    obtenerAlmacenes,
    obtenerAlmacenDetalle,
    crearAlmacen,
    actualizarAlmacen,
    cambiarStatusAlmacen,
    limpiarDetalle,
  };
});
