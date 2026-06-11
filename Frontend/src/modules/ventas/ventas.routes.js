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

      // Futuras rutas
      // {
      //   path: 'punto-de-venta',
      //   name: 'PuntoDeVenta',
      //   component: () => import('./views/PuntoDeVenta.view.vue'),
      //   meta: { requiresAuth: true, title: 'Punto de Venta | FarmaQ IA' }
      // },
    ],
  },
];

export default ventasRoutes;
