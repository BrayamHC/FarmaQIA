import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/config/axiosConfig';
import { useNotificacionesStore } from '@/stores/notificaciones.store';

export const useLotesStore = defineStore('lotes', () => {
  const cargando = ref(false);
  const lotes = ref([]);
  const total = ref(0);

  const notificacionesStore = useNotificacionesStore();

  async function obtenerLotes(params = {}) {
    cargando.value = true;

    try {
      const { data } = await axios.get('/lotes', {
        params,
        paramsSerializer: {
          indexes: false,
        },
      });

      lotes.value =
        data?.data?.lotes ??
        data?.data?.items ??
        data?.data ??
        data?.lotes ??
        data?.items ??
        [];

      total.value = Number(
        data?.data?.total ??
        data?.meta?.total ??
        data?.total ??
        lotes.value?.length ??
        0
      );

      return data;
    } catch (error) {
      lotes.value = [];
      total.value = 0;

      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudieron obtener los lotes.'
      );

      throw error;
    } finally {
      cargando.value = false;
    }
  }

  function limpiarLotes() {
    lotes.value = [];
    total.value = 0;
  }

  return {
    cargando,
    lotes,
    total,
    obtenerLotes,
    limpiarLotes,
  };
});
