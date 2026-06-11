import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoaderStore = defineStore('loader', () => {
  const visible = ref(false);
  const mensaje = ref('Cargando');

  function mostrar(msg = 'Cargando') {
    mensaje.value = msg;
    visible.value = true;
  }

  function ocultar() {
    visible.value = false;
    mensaje.value = 'Cargando';
  }

  return { visible, mensaje, mostrar, ocultar };
});
