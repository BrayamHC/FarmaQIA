// Frontend/src/modules/compras/ordenes/ordenesCompra.routes.js
export default [
  {
    path: '/compras/ordenes',
    name: 'OrdenesCompraGestor',
    component: () => import('./views/OrdenesCompraGestor.view.vue'),
    meta: { title: 'Órdenes de Compra | FarmaQ IA' },
  },
  {
    path: '/compras/ordenes/nueva',
    name: 'OrdenesCompraCrear',
    component: () => import('./views/OrdenesCompraOrden.view.vue'),
    props: { modo: 'crear' },
    meta: { title: 'Nueva Orden de Compra | FarmaQ IA' },
  },
  {
    path: '/compras/ordenes/:uuid',
    name: 'OrdenesCompraDetalle',
    component: () => import('./views/OrdenesCompraOrden.view.vue'),
    props: (route) => ({ modo: 'detalle', uuid: route.params.uuid }),
    meta: { title: 'Detalle Orden de Compra | FarmaQ IA' },
  },
]
