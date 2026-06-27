const productosRoutes = [
  {
    path: '/inventario/productos',
    name: 'ProductosGestor',
    component: () => import('./views/ProductosGestor.view.vue'),
    meta: {
      requiresAuth: true,
      title: 'Gestor de productos | FarmaQ IA',
    },
  },
  {
    path: '/inventario/productos/crear',
    name: 'CrearProducto',
    component: () => import('./views/CrearProducto.view.vue'),
    meta: {
      requiresAuth: true,
      title: 'Crear producto | FarmaQ IA',
    },
  },
];

export default productosRoutes;
