const homeRoutes = [
  {
    path: 'home',
    name: 'Home',
    component: () => import('./views/Home.view.vue'),
    meta: {
      requiresAuth: true,
      title: 'Inicio | FarmaQ IA',
    },
  },
];

export default homeRoutes;
