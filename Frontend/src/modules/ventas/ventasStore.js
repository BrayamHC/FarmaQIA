import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useVentasStore = defineStore('ventas', () => {
  const cargando = ref(false);

  const submodulos = ref([
    {
      titulo: 'Punto de Venta',
      descripcion: 'Terminal optimizada para el despacho rápido de medicamentos y productos farmacéuticos.',
      icono: 'pi pi-desktop',
      ruta: '/ventas/punto-de-venta',
      tags: ['Caja rápida', 'Recetas'],
    },
    {
      titulo: 'Notas de Venta',
      descripcion: 'Consulta de historial, pedidos pendientes y gestión de facturación electrónica.',
      icono: 'pi pi-file-edit',
      ruta: '/ventas/notas-de-venta',
      tags: ['Historial', 'Anulaciones'],
    },
    {
      titulo: 'Clientes',
      descripcion: 'Base de datos de clientes, programas de lealtad y cuentas corrientes activas.',
      icono: 'pi pi-users',
      ruta: '/ventas/clientes',
      tags: ['Fidelidad', 'Créditos'],
    },
    {
      titulo: 'Cajas',
      descripcion: 'Arqueo de caja, cierres diarios, egresos y control de flujo de efectivo.',
      icono: 'pi pi-building-columns',
      ruta: '/ventas/cajas',
      tags: ['Cierres', 'Arqueos'],
    },
  ]);

  const ventasRecientes = ref([
    { folio: 'F001-00234', cliente: 'Juan Pérez', hora: '12:45 PM', monto: '$120.50' },
    { folio: 'F001-00235', cliente: 'María García', hora: '1:12 PM', monto: '$45.00' },
    { folio: 'F001-00236', cliente: 'Pedro S.', hora: '2:05 PM', monto: '$312.20' },
    { folio: 'F001-00237', cliente: 'Consumidor Final', hora: '3:30 PM', monto: '$12.90' },
    { folio: 'F001-00238', cliente: 'Laura Mendoza', hora: '3:58 PM', monto: '$87.00' },
    { folio: 'F001-00238', cliente: 'Laura Mendoza', hora: '3:58 PM', monto: '$87.00' },
    { folio: 'F001-00237', cliente: 'Consumidor Final', hora: '3:30 PM', monto: '$12.90' },
  ]);

  const estadoCaja = ref({
    total: '$1,450.00',
    progreso: 72,
    estado: 'Caja conciliada correctamente',
  });

  return {
    cargando,
    submodulos,
    ventasRecientes,
    estadoCaja,
  };
});
