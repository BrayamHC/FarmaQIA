const ventasRoutes = [
  {
    path: 'ventas',
    children: [
      {
        path: '',
        name: 'Ventas',
        component: () => import('./views/Ventas.view.vue'),
        meta: {
          requiresAuth: true,
          title: 'Ventas | FarmaQ IA',
        },
      },
      {
        path: 'punto-de-venta',
        name: 'pos',
        component: () => import('./views/pos/PuntoDeVenta.view.vue'),
        meta: {
          requiresAuth: true,
          title: 'Punto de Venta | FarmaQ IA',
        },
      },
      // Placeholders visuales para los otros submódulos (sin lógica aún)
      {
        path: 'notas-de-venta',
        name: 'notas-de-venta',
        component: () => import('./views/Ventas.view.vue'), // temporal, cambiar cuando exista la vista real
        meta: { requiresAuth: true, title: 'Notas de Venta | FarmaQ IA' },
      },
      {
        path: 'cajas',
        name: 'ventas-cajas',
        component: () => import('./views/Ventas.view.vue'), // temporal
        meta: { requiresAuth: true, title: 'Cajas | FarmaQ IA' },
      },
    ],
  },
];

export default ventasRoutes;
