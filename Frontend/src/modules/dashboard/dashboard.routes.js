const dashboardRoutes = [
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.view.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard | FarmaQ IA',
    },
  },
];

export default dashboardRoutes;
