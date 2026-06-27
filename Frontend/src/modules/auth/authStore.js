import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import authService from './authService';
import sucursalesService from '@/modules/sucursales/sucursalesService';
import { useNotificacionesStore } from '@/stores/notificaciones.store';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('farmaq_token') || null);
  const usuario = ref(JSON.parse(localStorage.getItem('farmaq_usuario') || 'null'));
  const sucursalesPermitidas = ref(
    JSON.parse(localStorage.getItem('farmaq_sucursales_permitidas') || '[]')
  );
  const sucursalActiva = ref(
    JSON.parse(localStorage.getItem('farmaq_sucursal_activa') || 'null')
  );

  const cargando = ref(false);
  const errorLogin = ref(null);
  const loginReciente = ref(false);
  const cambiandoSucursal = ref(false);
  const sesionInicializada = ref(false);

  const notificacionesStore = useNotificacionesStore();

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
    return (
      usuario.value?.rol?.rol ||
      usuario.value?.rol?.nombre ||
      usuario.value?.rolNombre ||
      'Administrador'
    );
  });

  const permisos = computed(() => usuario.value?.permisos || []);

  function persistirSesion() {
    if (token.value) {
      localStorage.setItem('farmaq_token', token.value);
    } else {
      localStorage.removeItem('farmaq_token');
    }

    if (usuario.value) {
      localStorage.setItem('farmaq_usuario', JSON.stringify(usuario.value));
    } else {
      localStorage.removeItem('farmaq_usuario');
    }

    localStorage.setItem(
      'farmaq_sucursales_permitidas',
      JSON.stringify(sucursalesPermitidas.value || [])
    );

    if (sucursalActiva.value) {
      localStorage.setItem(
        'farmaq_sucursal_activa',
        JSON.stringify(sucursalActiva.value)
      );
    } else {
      localStorage.removeItem('farmaq_sucursal_activa');
    }
  }

  function guardarSesion(nuevoToken, nuevoUsuario, nuevasSucursales = []) {
    token.value = nuevoToken;
    usuario.value = nuevoUsuario;
    sucursalesPermitidas.value = Array.isArray(nuevasSucursales) ? nuevasSucursales : [];

    const sucursalGuardada = sucursalActiva.value;
    const sucursalValida = sucursalesPermitidas.value.find(
      (sucursal) => sucursal.sucursal_uuid === sucursalGuardada?.sucursal_uuid
    );

    sucursalActiva.value = sucursalValida || sucursalesPermitidas.value[0] || null;

    persistirSesion();
  }

  function establecerSucursalLocal(sucursal) {
    sucursalActiva.value = sucursal || null;
    persistirSesion();
  }

  function limpiarSesion() {
    token.value = null;
    usuario.value = null;
    sucursalesPermitidas.value = [];
    sucursalActiva.value = null;
    cargando.value = false;
    errorLogin.value = null;
    loginReciente.value = false;
    cambiandoSucursal.value = false;
    sesionInicializada.value = false;

    localStorage.removeItem('farmaq_token');
    localStorage.removeItem('farmaq_usuario');
    localStorage.removeItem('farmaq_sucursales_permitidas');
    localStorage.removeItem('farmaq_sucursal_activa');
  }

  async function sincronizarSucursalPorDefecto() {
    if (!token.value) return null;

    if (!Array.isArray(sucursalesPermitidas.value) || !sucursalesPermitidas.value.length) {
      sucursalActiva.value = null;
      persistirSesion();
      sesionInicializada.value = true;
      return null;
    }

    const sucursalGuardada = sucursalActiva.value;
    const sucursalValida = sucursalesPermitidas.value.find(
      (sucursal) => sucursal.sucursal_uuid === sucursalGuardada?.sucursal_uuid
    );

    const sucursalObjetivo = sucursalValida || sucursalesPermitidas.value[0];

    if (!sucursalObjetivo) {
      sucursalActiva.value = null;
      persistirSesion();
      sesionInicializada.value = true;
      return null;
    }

    await cambiarSucursal(sucursalObjetivo.sucursal_uuid, {
      silencioso: true,
      mostrarNotificacion: false,
    });

    sesionInicializada.value = true;
    return sucursalObjetivo;
  }

  async function cambiarSucursal(
    sucursal_uuid,
    options = {
      silencioso: false,
      mostrarNotificacion: true,
    }
  ) {
    if (!sucursal_uuid) {
      throw new Error('Sucursal inválida');
    }

    const sucursalSeleccionada = sucursalesPermitidas.value.find(
      (sucursal) => sucursal.sucursal_uuid === sucursal_uuid
    );

    if (!sucursalSeleccionada) {
      throw new Error('La sucursal no está permitida para este usuario');
    }

    cambiandoSucursal.value = true;

    try {
      await sucursalesService.seleccionarSucursal(sucursal_uuid);
      establecerSucursalLocal(sucursalSeleccionada);

      if (options?.mostrarNotificacion) {
        notificacionesStore?.mostrarExito?.(
          `Sucursal activa: ${sucursalSeleccionada.nombre}`
        );
      }

      return {
        exito: true,
        sucursal: sucursalSeleccionada,
      };
    } catch (error) {
      if (!options?.silencioso) {
        notificacionesStore?.mostrarError?.(
          error?.response?.data?.message || 'No se pudo cambiar la sucursal.'
        );
      }

      throw error;
    } finally {
      cambiandoSucursal.value = false;
    }
  }

  async function inicializarSesion() {
    if (!token.value) {
      sesionInicializada.value = false;
      return null;
    }

    return await sincronizarSucursalPorDefecto();
  }

  async function login(credentials) {
    cargando.value = true;
    errorLogin.value = null;
    sesionInicializada.value = false;

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

      const sucursalesRecibidas =
        response?.sucursales_permitidas ??
        response?.data?.sucursales_permitidas ??
        [];

      if (!tokenRecibido || !usuarioRecibido) {
        return {
          exito: false,
          error: 'No se recibió la sesión correctamente desde el servidor.',
        };
      }

      guardarSesion(tokenRecibido, usuarioRecibido, sucursalesRecibidas);
      await sincronizarSucursalPorDefecto();

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

      persistirSesion();
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
    sucursalesPermitidas,
    sucursalActiva,
    cargando,
    cambiandoSucursal,
    errorLogin,
    loginReciente,
    sesionInicializada,
    isAuthenticated,
    nombreCompleto,
    rolNombre,
    permisos,
    guardarSesion,
    establecerSucursalLocal,
    sincronizarSucursalPorDefecto,
    inicializarSesion,
    cambiarSucursal,
    limpiarSesion,
    login,
    obtenerPerfil,
    logout,
  };
});
