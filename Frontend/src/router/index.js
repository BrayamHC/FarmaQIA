import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/modules/auth/authStore';
import authRoutes from '@/modules/auth/auth.routes';
import dashboardRoutes from '@/modules/dashboard/dashboard.routes';
import homeRoutes from '@/modules/home/home.routes';
import ventasRoutes from '@/modules/ventas/ventas.routes';
import inventarioRoutes from '@/modules/inventario/inventario.routes';
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

      // ── Compras ─────────────────────────────────────────────
      {
        path: 'compras',
        children: [
          { path: '', name: 'Compras', component: placeholderView('Compras'), meta: { requiresAuth: true, title: 'Compras | FarmaQ IA' } },
          // { path: 'ordenes',      name: 'OrdenesDeCompra', component: () => import('@/modules/compras/views/Ordenes.view.vue'),      meta: { requiresAuth: true, title: 'Órdenes de compra | FarmaQ IA' } },
          // { path: 'proveedores',  name: 'Proveedores',     component: () => import('@/modules/compras/views/Proveedores.view.vue'),  meta: { requiresAuth: true, title: 'Proveedores | FarmaQ IA'        } },
          // { path: 'recepciones',  name: 'Recepciones',     component: () => import('@/modules/compras/views/Recepciones.view.vue'),  meta: { requiresAuth: true, title: 'Recepciones | FarmaQ IA'        } },
          // { path: 'devoluciones', name: 'Devoluciones',    component: () => import('@/modules/compras/views/Devoluciones.view.vue'), meta: { requiresAuth: true, title: 'Devoluciones | FarmaQ IA'       } },
        ],
      },

      // ── Reportes ─────────────────────────────────────────────
      {
        path: 'reportes',
        children: [
          { path: '', name: 'Reportes', component: placeholderView('Reportes'), meta: { requiresAuth: true, title: 'Reportes | FarmaQ IA' } },
          // { path: 'ventas',      name: 'ReportesVentas',      component: () => import('@/modules/reportes/views/Ventas.view.vue'),      meta: { requiresAuth: true, title: 'Reportes Ventas | FarmaQ IA'      } },
          // { path: 'compras',     name: 'ReportesCompras',     component: () => import('@/modules/reportes/views/Compras.view.vue'),     meta: { requiresAuth: true, title: 'Reportes Compras | FarmaQ IA'     } },
          // { path: 'inventario',  name: 'ReportesInventario',  component: () => import('@/modules/reportes/views/Inventario.view.vue'),  meta: { requiresAuth: true, title: 'Reportes Inventario | FarmaQ IA'  } },
          // { path: 'caducidades', name: 'ReportesCaducidades', component: () => import('@/modules/reportes/views/Caducidades.view.vue'), meta: { requiresAuth: true, title: 'Reportes Caducidades | FarmaQ IA' } },
        ],
      },

      // ── Usuarios ─────────────────────────────────────────────
      {
        path: 'usuarios',
        children: [
          { path: '', name: 'Usuarios', component: placeholderView('Usuarios'), meta: { requiresAuth: true, title: 'Usuarios | FarmaQ IA' } },
          // { path: 'cuentas',    name: 'Cuentas',    component: () => import('@/modules/usuarios/views/Cuentas.view.vue'),    meta: { requiresAuth: true, title: 'Cuentas | FarmaQ IA'    } },
          // { path: 'roles',      name: 'Roles',      component: () => import('@/modules/usuarios/views/Roles.view.vue'),      meta: { requiresAuth: true, title: 'Roles | FarmaQ IA'      } },
          // { path: 'permisos',   name: 'Permisos',   component: () => import('@/modules/usuarios/views/Permisos.view.vue'),   meta: { requiresAuth: true, title: 'Permisos | FarmaQ IA'   } },
          // { path: 'sucursales', name: 'Sucursales', component: () => import('@/modules/usuarios/views/Sucursales.view.vue'), meta: { requiresAuth: true, title: 'Sucursales | FarmaQ IA' } },
        ],
      },
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
