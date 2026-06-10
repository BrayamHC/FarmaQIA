import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import authService from './authService';
import { useNotificacionesStore } from '@/stores/notificaciones.store';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('farmaq_token') || null);
  const usuario = ref(JSON.parse(localStorage.getItem('farmaq_usuario') || 'null'));
  const cargando = ref(false);
  const errorLogin = ref(null);
  const loginReciente = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const nombreCompleto = computed(() => {
    if (!usuario.value) return 'Usuario';

    return (
      usuario.value.nombre_completo ||
      `${usuario.value.nombre || ''} ${usuario.value.apellido || ''}`.trim() ||
      usuario.value.email ||
      'Usuario'
    );
  });

  const rolNombre = computed(() => {
    return usuario.value?.rol?.nombre || usuario.value?.rolNombre || 'Administrador';
  });

  const permisos = computed(() => usuario.value?.permisos || []);

  function guardarSesion(nuevoToken, nuevoUsuario) {
    token.value = nuevoToken;
    usuario.value = nuevoUsuario;

    localStorage.setItem('farmaq_token', nuevoToken);
    localStorage.setItem('farmaq_usuario', JSON.stringify(nuevoUsuario));
  }

  function limpiarSesion() {
    token.value = null;
    usuario.value = null;
    cargando.value = false;
    errorLogin.value = null;
    loginReciente.value = false;

    localStorage.removeItem('farmaq_token');
    localStorage.removeItem('farmaq_usuario');
  }

  async function login(credentials) {
    cargando.value = true;
    errorLogin.value = null;

    try {
      const response = await authService.login(credentials);

      const tokenRecibido =
        response?.token ??
        response?.access_token ??
        response?.sessionToken ??
        response?.data?.token ??
        null;

      const usuarioRecibido =
        response?.usuario ??
        response?.user ??
        response?.data?.usuario ??
        response?.data?.user ??
        null;

      if (!tokenRecibido || !usuarioRecibido) {
        return {
          exito: false,
          error: 'No se recibió la sesión correctamente desde el servidor.',
        };
      }

      guardarSesion(tokenRecibido, usuarioRecibido);
      loginReciente.value = true;

      return {
        exito: true,
      };
    } catch (error) {
      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Credenciales inválidas. Intenta nuevamente.';

      errorLogin.value = Array.isArray(mensaje) ? mensaje[0] : mensaje;

      return {
        exito: false,
        error: errorLogin.value,
      };
    } finally {
      cargando.value = false;
    }
  }

  async function obtenerPerfil() {
    try {
      const response = await authService.obtenerPerfil();
      const perfil = response?.data ?? response;

      usuario.value = {
        ...usuario.value,
        ...perfil,
      };

      localStorage.setItem('farmaq_usuario', JSON.stringify(usuario.value));
      return perfil;
    } catch (error) {
      limpiarSesion();
      throw error;
    }
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      limpiarSesion();
    }
  }

  return {
    token,
    usuario,
    cargando,
    errorLogin,
    loginReciente,
    isAuthenticated,
    nombreCompleto,
    rolNombre,
    permisos,
    guardarSesion,
    limpiarSesion,
    login,
    obtenerPerfil,
    logout,
  };
});
