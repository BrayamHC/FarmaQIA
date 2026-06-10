const authRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/Login.view.vue'),
    meta: {
      requiresAuth: false,
      title: 'Iniciar sesión | FarmaQ IA',
    },
  },
];

export default authRoutes;
