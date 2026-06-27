import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/modules/auth/authStore';
import authRoutes from '@/modules/auth/auth.routes';
import dashboardRoutes from '@/modules/dashboard/dashboard.routes';
import homeRoutes from '@/modules/home/home.routes';
import ventasRoutes from '@/modules/ventas/ventas.routes';
import inventarioRoutes from '@/modules/inventario/inventario.routes';
import productosRoutes from '../modules/productos/productos.routes';
import comprasRoutes from '../modules/compras/compras.routes';
import almacenesRoutes from '../modules/almacenes/almacenes.routes';
import proveedoresRoutes from '../modules/proveedores/proveedores.routes';
import clientesRoutes from '../modules/clientes/clientes.routes';


// ── Placeholder — eliminar cuando el módulo esté implementado ────
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
      { path: '', redirect: '/home' },

      // ── Módulos activos ──────────────────────────────────────
      ...homeRoutes,
      ...dashboardRoutes,
      ...ventasRoutes,
      ...inventarioRoutes,
      ...productosRoutes,
      ...comprasRoutes,
      ...almacenesRoutes,
      ...proveedoresRoutes,
      ...clientesRoutes,
    ],
  },

  ...authRoutes,

  {
    path: '/:pathMatch(.*)*',
    name: 'NoEncontrado',
    component: () => import('@/views/NotFound.view.vue'),
    meta: { title: 'Página no encontrada | FarmaQ IA' },
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
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  if (to.name === 'Login' && authStore.isAuthenticated) {
    return next({ name: 'Home' });
  }

  next();
});

export default router;
