import ComprasHomeView from './views/Compras.view.vue';

export default [
  {
    path: '/compras',
    name: 'ComprasHome',
    component: ComprasHomeView,
    meta: { title: 'Compras | FarmaQ IA' },
  },
  // Rutas de submódulos — activar cuando estén implementados
  // { path: '/compras/ordenes',      name: 'OrdenesCompra',  component: () => import('./views/OrdenesCompra.view.vue') },
  // { path: '/compras/proveedores',  name: 'Proveedores',    component: () => import('./views/Proveedores.view.vue')   },
  // { path: '/compras/ingresos',     name: 'OrdenesIngreso', component: () => import('./views/OrdenesIngreso.view.vue') },
  // { path: '/compras/analisis',     name: 'ComprasAnalisis',component: () => import('./views/ComprasAnalisis.view.vue') },
];
