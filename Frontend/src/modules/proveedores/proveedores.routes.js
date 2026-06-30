const proveedoresRoutes = [
  {
    path: 'proveedores',
    name: 'ProveedoresGestor',
    component: () => import('./views/ProveedoresGestor.view.vue'),
    meta: { requiresAuth: true, title: 'Proveedores | FarmaQ IA' },
  },
  {
    path: 'proveedores/crear',
    name: 'CrearProveedor',
    component: () => import('./views/ProveedoresCrear.view.vue'),
    meta: { requiresAuth: true, title: 'Crear proveedor | FarmaQ IA' },
  },
  {
    path: 'proveedores/:uuid',
    name: 'DetalleProveedor',
    component: () => import('./views/ProveedoresDetalle.view.vue'),
    meta: { requiresAuth: true, title: 'Detalle proveedor | FarmaQ IA' },
  },
];

export default proveedoresRoutes;
