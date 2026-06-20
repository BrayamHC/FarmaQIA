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
    ],
  },
];

export default inventarioRoutes;
