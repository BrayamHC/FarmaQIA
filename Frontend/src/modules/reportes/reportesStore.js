// Frontend/src/modules/reportes/reportesStore.js
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { reportesService } from './reportesService';
import { useNotificacionesStore } from '@/stores/notificaciones.store';
import { useAlmacenesStore } from '@/modules/almacenes/almacenesStore';

function obtenerFechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

function obtenerPrimerDiaMes() {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
}

function crearFiltrosBase() {
  return {
    fecha_inicio: obtenerPrimerDiaMes(),
    fecha_fin: obtenerFechaHoy(),
    almacen_id: null,
  };
}

function limpiarPayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== '')
  );
}

function normalizarAlmacenId(valor) {
  if (valor === '' || valor === undefined || valor === null) return null;
  const numero = Number(valor);
  return Number.isNaN(numero) ? null : numero;
}

function normalizarFiltrosReporte(payload = {}) {
  return limpiarPayload({
    fecha_inicio: payload.fecha_inicio || undefined,
    fecha_fin: payload.fecha_fin || undefined,
    almacen_id: normalizarAlmacenId(payload.almacen_id),
  });
}

function descargarArchivo(blob, nombreArchivo) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const useReportesStore = defineStore('reportes', () => {
  const cargando = ref(false);
  const exportando = ref(false);
  const cargandoAlmacenes = ref(false);

  const notificacionesStore = useNotificacionesStore();
  const almacenesStore = useAlmacenesStore();

  const submodulos = ref([
    {
      titulo: 'Inventario',
      descripcion: 'Consulta existencias actuales, stock por almacén y lotes activos.',
      icono: 'pi pi-box',
      ruta: '/reportes/inventario',
      tags: ['Stock', 'Lotes', 'Excel', 'PDF'],
    },
    {
      titulo: 'Ventas',
      descripcion: 'Analiza ingresos, tickets y detalle de productos vendidos por período.',
      icono: 'pi pi-chart-line',
      ruta: '/reportes/ventas',
      tags: ['Tickets', 'Ingresos', 'Detalle'],
    },
    {
      titulo: 'Compras',
      descripcion: 'Consulta órdenes, proveedores y partidas registradas por período.',
      icono: 'pi pi-shopping-cart',
      ruta: '/reportes/compras',
      tags: ['Órdenes', 'Partidas', 'Proveedores'],
    },
  ]);

  const filtrosInventario = reactive(crearFiltrosBase());
  const filtrosVentas = reactive(crearFiltrosBase());
  const filtrosCompras = reactive(crearFiltrosBase());

  const reporteInventario = ref(null);
  const reporteVentas = ref(null);
  const reporteCompras = ref(null);

  const almacenesOptions = computed(() => Array.isArray(almacenesStore.almacenes) ? almacenesStore.almacenes : []);

  const filtrosInventarioActivos = computed(() => normalizarFiltrosReporte(filtrosInventario));
  const filtrosVentasActivos = computed(() => normalizarFiltrosReporte(filtrosVentas));
  const filtrosComprasActivos = computed(() => normalizarFiltrosReporte(filtrosCompras));

  async function cargarAlmacenes(params = {}) {
    cargandoAlmacenes.value = true;
    try {
      const payload = {
        page: 1,
        limit: 20,
        ...params,
      };

      await almacenesStore.obtenerAlmacenes(payload);
    } catch (error) {
      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudieron cargar los almacenes.'
      );
      throw error;
    } finally {
      cargandoAlmacenes.value = false;
    }
  }

  function setFiltrosInventario(payload = {}) {
    const normalizado = normalizarFiltrosReporte(payload);

    filtrosInventario.fecha_inicio = normalizado.fecha_inicio ?? '';
    filtrosInventario.fecha_fin = normalizado.fecha_fin ?? '';
    filtrosInventario.almacen_id = normalizado.almacen_id ?? null;
  }

  function resetFiltrosInventario() {
    const base = crearFiltrosBase();
    filtrosInventario.fecha_inicio = base.fecha_inicio;
    filtrosInventario.fecha_fin = base.fecha_fin;
    filtrosInventario.almacen_id = base.almacen_id;
  }

  async function obtenerInventario(payload = null) {
    cargando.value = true;
    try {
      if (payload) {
        setFiltrosInventario(payload);
      }

      const filtros = filtrosInventarioActivos.value;
      const reporte = await reportesService.obtenerReporteInventario(filtros);

      reporteInventario.value = reporte;
      return reporte;
    } catch (error) {
      reporteInventario.value = null;
      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudo obtener el reporte de inventario.'
      );
      throw error;
    } finally {
      cargando.value = false;
    }
  }

  async function exportarInventario(formato, payload = null) {
    exportando.value = true;
    try {
      if (payload) {
        setFiltrosInventario(payload);
      }

      const filtros = filtrosInventarioActivos.value;
      const archivo = await reportesService.exportarReporteInventario(formato, filtros);

      descargarArchivo(archivo.blob, archivo.filename);
      notificacionesStore.success(`Reporte de inventario exportado en ${formato.toUpperCase()}.`);
      return archivo;
    } catch (error) {
      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudo exportar el reporte de inventario.'
      );
      throw error;
    } finally {
      exportando.value = false;
    }
  }

  async function obtenerVentas(payload = null) {
    cargando.value = true;
    try {
      const filtros = payload ? normalizarFiltrosReporte(payload) : filtrosVentasActivos.value;
      const reporte = await reportesService.obtenerReporteVentas(filtros);
      reporteVentas.value = reporte;
      return reporte;
    } catch (error) {
      reporteVentas.value = null;
      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudo obtener el reporte de ventas.'
      );
      throw error;
    } finally {
      cargando.value = false;
    }
  }

  async function exportarVentas(formato, payload = null) {
    exportando.value = true;
    try {
      const filtros = payload ? normalizarFiltrosReporte(payload) : filtrosVentasActivos.value;
      const archivo = await reportesService.exportarReporteVentas(formato, filtros);
      descargarArchivo(archivo.blob, archivo.filename);
      notificacionesStore.success(`Reporte de ventas exportado en ${formato.toUpperCase()}.`);
      return archivo;
    } catch (error) {
      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudo exportar el reporte de ventas.'
      );
      throw error;
    } finally {
      exportando.value = false;
    }
  }

  async function obtenerCompras(payload = null) {
    cargando.value = true;
    try {
      const filtros = payload ? normalizarFiltrosReporte(payload) : filtrosComprasActivos.value;
      const reporte = await reportesService.obtenerReporteCompras(filtros);
      reporteCompras.value = reporte;
      return reporte;
    } catch (error) {
      reporteCompras.value = null;
      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudo obtener el reporte de compras.'
      );
      throw error;
    } finally {
      cargando.value = false;
    }
  }

  async function exportarCompras(formato, payload = null) {
    exportando.value = true;
    try {
      const filtros = payload ? normalizarFiltrosReporte(payload) : filtrosComprasActivos.value;
      const archivo = await reportesService.exportarReporteCompras(formato, filtros);
      descargarArchivo(archivo.blob, archivo.filename);
      notificacionesStore.success(`Reporte de compras exportado en ${formato.toUpperCase()}.`);
      return archivo;
    } catch (error) {
      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudo exportar el reporte de compras.'
      );
      throw error;
    } finally {
      exportando.value = false;
    }
  }

  function limpiarReporteInventario() {
    reporteInventario.value = null;
  }

  function limpiarReporteVentas() {
    reporteVentas.value = null;
  }

  function limpiarReporteCompras() {
    reporteCompras.value = null;
  }

  return {
    cargando,
    exportando,
    cargandoAlmacenes,
    submodulos,
    filtrosInventario,
    filtrosVentas,
    filtrosCompras,
    filtrosInventarioActivos,
    filtrosVentasActivos,
    filtrosComprasActivos,
    reporteInventario,
    reporteVentas,
    reporteCompras,
    almacenesOptions,
    cargarAlmacenes,
    setFiltrosInventario,
    resetFiltrosInventario,
    obtenerInventario,
    exportarInventario,
    obtenerVentas,
    exportarVentas,
    obtenerCompras,
    exportarCompras,
    limpiarReporteInventario,
    limpiarReporteVentas,
    limpiarReporteCompras,
  };
});
