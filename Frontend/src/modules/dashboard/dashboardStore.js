import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardStore = defineStore('dashboard', () => {
  const cargando = ref(false);

  const metricas = ref([
    {
      titulo: 'Ventas del día',
      valor: '$12,480',
      cambio: '+8.4%',
      icono: 'pi pi-shopping-cart',
      color: 'emerald',
    },
    {
      titulo: 'Compras del mes',
      valor: '$86,200',
      cambio: '+3.1%',
      icono: 'pi pi-box',
      color: 'blue',
    },
    {
      titulo: 'Productos bajos',
      valor: '18',
      cambio: '-2',
      icono: 'pi pi-exclamation-triangle',
      color: 'amber',
    },
    {
      titulo: 'Próximos a caducar',
      valor: '11',
      cambio: '+1',
      icono: 'pi pi-clock',
      color: 'rose',
    },
  ]);

  const actividadReciente = ref([
    {
      titulo: 'Compra registrada a proveedor principal',
      detalle: 'Hace 12 minutos',
      icono: 'pi pi-briefcase',
    },
    {
      titulo: 'Venta registrada en mostrador',
      detalle: 'Hace 20 minutos',
      icono: 'pi pi-shopping-bag',
    },
    {
      titulo: 'Lote próximo a caducar identificado',
      detalle: 'Hace 1 hora',
      icono: 'pi pi-calendar',
    },
    {
      titulo: 'Usuario administrador actualizado',
      detalle: 'Hace 2 horas',
      icono: 'pi pi-users',
    },
  ]);

  const accesosRapidos = ref([
    { titulo: 'Nueva compra', ruta: '/compras', icono: 'pi pi-plus-circle' },
    { titulo: 'Nueva venta', ruta: '/ventas', icono: 'pi pi-wallet' },
    { titulo: 'Ver inventario', ruta: '/inventario', icono: 'pi pi-box' },
    { titulo: 'Ir a reportes', ruta: '/reportes', icono: 'pi pi-chart-bar' },
  ]);

  return {
    cargando,
    metricas,
    actividadReciente,
    accesosRapidos,
  };
});
