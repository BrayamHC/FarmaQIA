import { defineStore } from 'pinia';
import { ref } from 'vue';
import proveedoresService from './proveedoresService';
import { useNotificacionesStore } from '@/stores/notificaciones.store';

export const useProveedoresStore = defineStore('proveedores', () => {
  const notificacionesStore = useNotificacionesStore();

  const cargando = ref(false);
  const proveedores = ref([]);
  const total = ref(0);
  const proveedorDetalle = ref(null);

  async function obtenerProveedores(filtros = {}) {
    cargando.value = true;

    try {
      const response = await proveedoresService.obtenerProveedores(filtros);
      proveedores.value = response?.data?.proveedores ?? [];
      total.value = response?.meta?.total ?? 0;
    } catch (error) {
      proveedores.value = [];
      total.value = 0;

      notificacionesStore.agregarNotificacion?.({
        tipo: 'error',
        titulo: 'Error al cargar proveedores',
        mensaje: error?.response?.data?.message || 'No fue posible obtener la lista de proveedores.',
      });

      throw error;
    } finally {
      cargando.value = false;
    }
  }

  async function obtenerProveedorPorUUID(uuid) {
    cargando.value = true;

    try {
      const response = await proveedoresService.obtenerProveedorPorUUID(uuid);
      proveedorDetalle.value = response?.proveedor ?? null;
      return proveedorDetalle.value;
    } catch (error) {
      notificacionesStore.agregarNotificacion?.({
        tipo: 'error',
        titulo: 'Error al obtener proveedor',
        mensaje: error?.response?.data?.message || 'No fue posible obtener el detalle del proveedor.',
      });
      throw error;
    } finally {
      cargando.value = false;
    }
  }

  async function cambiarStatusProveedor(uuid, status) {
    try {
      const response = await proveedoresService.cambiarStatusProveedor(uuid, status);

      notificacionesStore.agregarNotificacion?.({
        tipo: 'success',
        titulo: 'Proveedor actualizado',
        mensaje: 'El status del proveedor se actualizó correctamente.',
      });

      return response?.proveedor ?? null;
    } catch (error) {
      notificacionesStore.agregarNotificacion?.({
        tipo: 'error',
        titulo: 'Error al actualizar status',
        mensaje: error?.response?.data?.message || 'No fue posible actualizar el status del proveedor.',
      });
      throw error;
    }
  }


  async function crearProveedor(payload) {
    cargando.value = true;

    try {
      const response = await proveedoresService.crearProveedor(payload);

      notificacionesStore.agregarNotificacion?.({
        tipo: 'success',
        titulo: 'Proveedor creado',
        mensaje: 'El proveedor se registró correctamente.',
      });

      return response?.proveedor ?? null;
    } catch (error) {
      notificacionesStore.agregarNotificacion?.({
        tipo: 'error',
        titulo: 'Error al crear proveedor',
        mensaje: error?.response?.data?.message || 'No fue posible registrar el proveedor.',
      });
      throw error;
    } finally {
      cargando.value = false;
    }
  }

  return {
    cargando,
    proveedores,
    total,
    proveedorDetalle,
    obtenerProveedores,
    obtenerProveedorPorUUID,
    cambiarStatusProveedor,
    crearProveedor,
  };
});
