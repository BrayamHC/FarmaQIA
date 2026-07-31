import ReportesHomeView from './views/ReportesHome.view.vue';
import ReportesInventarioGestorView from './views/ReportesInventarioGestor.view.vue';
import ReportesVentasGestorView from './views/ReportesVentasGestor.view.vue';
import ReportesComprasGestorView from './views/ReportesComprasGestor.view.vue';

export default [
  {
    path: '/reportes',
    name: 'ReportesHome',
    component: ReportesHomeView,
    meta: { title: 'Reportes | FarmaQ IA' },
  },
  {
    path: '/reportes/inventario',
    name: 'ReportesInventario',
    component: ReportesInventarioGestorView,
    meta: { title: 'Reporte de inventario | FarmaQ IA' },
  },
  {
    path: '/reportes/ventas',
    name: 'ReportesVentas',
    component: ReportesVentasGestorView,
    meta: { title: 'Reporte de ventas | FarmaQ IA' },
  },
  {
    path: '/reportes/compras',
    name: 'ReportesCompras',
    component: ReportesComprasGestorView,
    meta: { title: 'Reporte de compras | FarmaQ IA' },
  },
];
