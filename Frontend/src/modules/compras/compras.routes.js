// Frontend/src/modules/compras/compras.routes.js
import ComprasHomeView from './views/Compras.view.vue'
import ordenesCompraRoutes from './ordenesCompra/ordenesCompra.routes.js'

export default [
  {
    path: '/compras',
    name: 'ComprasHome',
    component: ComprasHomeView,
    meta: { title: 'Compras | FarmaQ IA' },
  },
  ...ordenesCompraRoutes,
]
