import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/modules/auth/authStore';
import authRoutes from '@/modules/auth/auth.routes';
import dashboardRoutes from '@/modules/dashboard/dashboard.routes';

const placeholderView = (title) => ({
  name: `${title}Placeholder`,
  template: `
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">${title}</h1>
      <p class="mt-2 text-sm text-slate-500">Módulo en construcción.</p>
    </section>
  `,
});

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      ...dashboardRoutes,
      {
        path: 'compras',
        name: 'Compras',
        component: placeholderView('Compras'),
        meta: { requiresAuth: true, title: 'Compras | FarmaQ IA' },
      },
      {
        path: 'ventas',
        name: 'Ventas',
        component: placeholderView('Ventas'),
        meta: { requiresAuth: true, title: 'Ventas | FarmaQ IA' },
      },
      {
        path: 'inventario',
        name: 'Inventario',
        component: placeholderView('Inventario'),
        meta: { requiresAuth: true, title: 'Inventario | FarmaQ IA' },
      },
      {
        path: 'proveedores',
        name: 'Proveedores',
        component: placeholderView('Proveedores'),
        meta: { requiresAuth: true, title: 'Proveedores | FarmaQ IA' },
      },
      {
        path: 'administrador',
        name: 'Administrador',
        component: placeholderView('Administrador'),
        meta: { requiresAuth: true, title: 'Administrador | FarmaQ IA' },
      },
      {
        path: 'reportes',
        name: 'Reportes',
        component: placeholderView('Reportes'),
        meta: { requiresAuth: true, title: 'Reportes | FarmaQ IA' },
      },
    ],
  },
  ...authRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NoEncontrado',
    component: () => import('@/views/NotFound.view.vue'),
    meta: {
      title: 'Página no encontrada | FarmaQ IA',
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  document.title = to.meta?.title || 'FarmaQ IA';

  if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
    return next({
      name: 'Login',
      query: { redirect: to.fullPath },
    });
  }

  if (to.name === 'Login' && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' });
  }

  next();
});

export default router;
