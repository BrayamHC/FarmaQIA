const almacenesRoutes = [
  {
    path: '/inventario/almacenes',
    name: 'AlmacenesGestor',
    component: () => import('./views/AlmacenesGestor.view.vue'),
    meta: {
      requiresAuth: true,
      title: 'Gestor de almacenes | FarmaQ IA',
    },
  },
];

export default almacenesRoutes;
