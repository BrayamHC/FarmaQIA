import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useComprasStore = defineStore('compras', () => {
  const cargando = ref(false);

  // ── Submódulos ─────────────────────────────────────────────────────────────
  const submodulos = ref([
    {
      titulo: 'Órdenes de compra',
      descripcion: 'Crea, gestiona y da seguimiento a tus órdenes de compra con proveedores.',
      icono: 'pi pi-file-edit',
      ruta: '/compras/ordenes',
      tags: ['Crear', 'Seguimiento', 'Historial'],
    },
    {
      titulo: 'Proveedores',
      descripcion: 'Administra el catálogo de proveedores, contactos y condiciones comerciales.',
      icono: 'pi pi-building',
      ruta: '/proveedores',
      tags: ['Catálogo', 'Contactos', 'Crédito'],
    },
    {
      titulo: 'Órdenes de ingreso',
      descripcion: 'Registra la recepción de mercancía y valida cantidades contra la orden de compra.',
      icono: 'pi pi-truck',
      ruta: '/compras/ingresos',
      tags: ['Recepción', 'Validación', 'Lotes'],
    },
    {
      titulo: 'Análisis de compras',
      descripcion: 'Próximamente: métricas de gasto, comparativa de proveedores y tendencias.',
      icono: 'pi pi-chart-line',
      ruta: '/compras/analisis',
      tags: ['Próximamente'],
    },
  ]);

  // ── Compras recientes (mock — reemplazar con llamada a API) ─────────────────
  const comprasRecientes = ref([
    { folio: 'OC-00041', proveedor: 'Distribuidora Farma', fecha: '26/06/2026', estado: 'Recibida', total: '$4,820.00' },
    { folio: 'OC-00040', proveedor: 'Lab. Pisa', fecha: '25/06/2026', estado: 'Pendiente', total: '$11,350.00' },
    { folio: 'OC-00039', proveedor: 'Provefarma S.A.', fecha: '24/06/2026', estado: 'Recibida', total: '$2,190.50' },
    { folio: 'OC-00038', proveedor: 'MedSupply MX', fecha: '23/06/2026', estado: 'En tránsito', total: '$7,640.00' },
    { folio: 'OC-00037', proveedor: 'Distribuidora Farma', fecha: '22/06/2026', estado: 'Recibida', total: '$3,270.00' },
  ]);

  // ── Total de compras del período ────────────────────────────────────────────
  const totalCompras = ref({
    monto: '$29,270.50',
    progreso: 64,
    estado: '5 órdenes este mes · 3 recibidas',
  });

  return {
    cargando,
    submodulos,
    comprasRecientes,
    totalCompras,
  };
});
