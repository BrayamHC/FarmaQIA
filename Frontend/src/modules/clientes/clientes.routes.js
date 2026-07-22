const clientesRoutes = [
  {
    path: 'ventas/clientes',
    name: 'Clientes',
    component: () => import('./views/ClientesGestor.view.vue'),
  },
  {
    path: 'ventas/clientes/crear',
    name: 'CrearCliente',
    component: () => import('./views/ClientesCrear.view.vue'),
  },
];

export default clientesRoutes;
