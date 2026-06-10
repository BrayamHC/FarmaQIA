import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const visible = ref(false);
  const mensaje = ref('');
  const tipo = ref('info');
  const duracion = ref(3500);

  function mostrar(texto, variante = 'info', ms = 3500) {
    visible.value = false;

    setTimeout(() => {
      mensaje.value = texto;
      tipo.value = variante;
      duracion.value = ms;
      visible.value = true;
    }, 80);
  }

  function cerrar() {
    visible.value = false;
  }

  function success(texto, ms) {
    mostrar(texto, 'success', ms);
  }

  function error(texto, ms) {
    mostrar(texto, 'error', ms);
  }

  function warning(texto, ms) {
    mostrar(texto, 'warning', ms);
  }

  function info(texto, ms) {
    mostrar(texto, 'info', ms);
  }

  return {
    visible,
    mensaje,
    tipo,
    duracion,
    mostrar,
    cerrar,
    success,
    error,
    warning,
    info,
  };
});
