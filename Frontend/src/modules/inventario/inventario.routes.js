const inventarioRoutes = [
  {
    path: 'inventario',
    children: [
      {
        path: '',
        name: 'Inventario',
        component: () => import('./views/InventarioHome.view.vue'),
        meta: {
          requiresAuth: true,
          title: 'Inventario | FarmaQ IA',
        },
      },
      {
        path: 'productos',
        name: 'ProductosGestor',
        component: () => import('../productos/views/ProductosGestor.view.vue'),
        meta: {
          requiresAuth: true,
          title: 'Productos | FarmaQ IA',
        },
      },
      {
        path: 'lotes',
        name: 'LotesGestor',
        component: () => import('./lotes/views/LotesGestor.view.vue'),
        meta: {
          requiresAuth: true,
          title: 'Lotes | FarmaQ IA',
        },
      },
    ],
  },
];

export default inventarioRoutes;
