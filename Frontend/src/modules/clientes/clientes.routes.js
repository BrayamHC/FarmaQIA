const clientesRoutes = [
  {
    path: '/ventas/clientes',
    name: 'Clientes',
    component: () => import('./views/ClientesGestor.view.vue'),
    meta: {
      requiresAuth: true,
      title: 'Clientes | FarmaQ IA',
    },
  },
  {
    path: 'ventas/clientes/crear',
    name: 'CrearCliente',
    component: () => import('./views/ClientesCrear.view.vue'),
    meta: {
      requiresAuth: true,
      title: 'Crear Cliente | FarmaQ IA',
    },
  },
];

export default clientesRoutes;
