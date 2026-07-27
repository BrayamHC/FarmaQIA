// dashboardStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import dashboardService from './dashboardService';
import { useNotificacionesStore } from '@/stores/notificaciones.store';

const PALETA_CATEGORIAS = ['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
const DIAS_SEMANA = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb' };

export const useDashboardStore = defineStore('dashboard', () => {
  const cargando = ref(false);
  const notificacionesStore = useNotificacionesStore();

  const metricas = ref([
    { titulo: 'Ventas del día', valor: '$0', cambio: '—', icono: 'pi pi-shopping-cart', color: 'emerald' },
    { titulo: 'Ventas de la semana', valor: '$0', cambio: '—', icono: 'pi pi-box', color: 'blue' },
    { titulo: 'Productos bajos', valor: '0', cambio: '—', icono: 'pi pi-exclamation-triangle', color: 'amber' },
    { titulo: 'Próximos a caducar', valor: '0', cambio: '—', icono: 'pi pi-clock', color: 'rose' },
  ]);

  const ventasChartData = ref({ labels: [], datasets: [] });
  const inventarioChartData = ref({ labels: [], datasets: [] });
  const caducidadesChartData = ref({ labels: [], datasets: [] });

  const actividadReciente = ref([
    { titulo: 'Compra registrada a proveedor principal', detalle: 'Hace 12 minutos', icono: 'pi pi-briefcase' },
    { titulo: 'Venta registrada en mostrador', detalle: 'Hace 20 minutos', icono: 'pi pi-shopping-bag' },
    { titulo: 'Lote próximo a caducar identificado', detalle: 'Hace 1 hora', icono: 'pi pi-calendar' },
    { titulo: 'Usuario administrador actualizado', detalle: 'Hace 2 horas', icono: 'pi pi-users' },
  ]);

  const accesosRapidos = ref([
    { titulo: 'Nueva compra', ruta: '/compras', icono: 'pi pi-plus-circle' },
    { titulo: 'Nueva venta', ruta: '/ventas', icono: 'pi pi-wallet' },
    { titulo: 'Ver inventario', ruta: '/inventario', icono: 'pi pi-box' },
    { titulo: 'Ir a reportes', ruta: '/reportes', icono: 'pi pi-chart-bar' },
  ]);

  function formatoMoneda(valor) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(valor ?? 0);
  }

  function formatoCambio(porcentaje) {
    if (porcentaje === null || porcentaje === undefined) return '—';
    const signo = porcentaje >= 0 ? '+' : '';
    return `${signo}${porcentaje}%`;
  }

  function mapearResumen(resumen) {
    metricas.value = [
      {
        titulo: 'Ventas del día',
        valor: formatoMoneda(resumen?.ventas_dia?.total),
        cambio: formatoCambio(resumen?.ventas_dia?.cambio_porcentual),
        icono: 'pi pi-shopping-cart',
        color: 'emerald',
      },
      {
        titulo: 'Ventas de la semana',
        valor: formatoMoneda(resumen?.ventas_semana?.total),
        cambio: formatoCambio(resumen?.ventas_semana?.cambio_porcentual),
        icono: 'pi pi-box',
        color: 'blue',
      },
      {
        titulo: 'Productos bajos',
        valor: String(resumen?.productos_bajos?.total ?? 0),
        cambio: formatoCambio(resumen?.productos_bajos?.cambio),
        icono: 'pi pi-exclamation-triangle',
        color: 'amber',
      },
      {
        titulo: 'Próximos a caducar',
        valor: String(resumen?.proximos_caducar?.total ?? 0),
        cambio: formatoCambio(resumen?.proximos_caducar?.cambio),
        icono: 'pi pi-clock',
        color: 'rose',
      },
    ];
  }

  function mapearVentasSemana(payload) {
    const labels = (payload?.labels ?? []).map((fechaStr) => {
      const [, mes, dia] = fechaStr.split('-');
      const fecha = new Date(Number(fechaStr.split('-')[0]), Number(mes) - 1, Number(dia));
      return DIAS_SEMANA[fecha.getDay()] ?? fechaStr;
    });

    ventasChartData.value = {
      labels,
      datasets: [
        {
          label: 'Ventas',
          data: payload?.data ?? [],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.14)',
          fill: true,
          tension: 0.38,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    };
  }

  function mapearInventario(payload) {
    const categorias = payload?.categorias ?? [];

    inventarioChartData.value = {
      labels: categorias.map((c) => c.categoria),
      datasets: [
        {
          data: categorias.map((c) => c.total_stock),
          backgroundColor: PALETA_CATEGORIAS,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    };
  }

  function mapearCaducidades(payload) {
    const buckets = payload?.buckets ?? [];

    caducidadesChartData.value = {
      labels: buckets.map((b) => b.rango),
      datasets: [
        {
          label: 'Productos por caducar',
          data: buckets.map((b) => b.cantidad),
          backgroundColor: ['#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
          borderRadius: 10,
          maxBarThickness: 42,
        },
      ],
    };
  }

  async function obtenerMetricas() {
    cargando.value = true;

    try {
      const [resumen, ventasSemana, inventario, caducidades] = await Promise.all([
        dashboardService.obtenerResumen(),
        dashboardService.obtenerVentasSemana(),
        dashboardService.obtenerInventarioPorCategoria(),
        dashboardService.obtenerCaducidades(),
      ]);

      mapearResumen(resumen);
      mapearVentasSemana(ventasSemana);
      mapearInventario(inventario);
      mapearCaducidades(caducidades);
    } catch (error) {
      notificacionesStore.error(
        error?.response?.data?.message || 'No se pudieron obtener las métricas del dashboard.',
      );
    } finally {
      cargando.value = false;
    }
  }

  return {
    cargando,
    metricas,
    ventasChartData,
    inventarioChartData,
    caducidadesChartData,
    actividadReciente,
    accesosRapidos,
    obtenerMetricas,
  };
});
