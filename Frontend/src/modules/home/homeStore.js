import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHomeStore = defineStore('home', () => {
  const cargando = ref(false);

  const modulos = ref([
    {
      titulo: 'Ventas',
      descripcion: 'Genera ventas, pedidos y facturas de forma rápida y sencilla.',
      icono: 'pi pi-shopping-cart',
      ruta: '/ventas',
      color: 'emerald',
      submodulos: ['Punto de venta', 'Notas de venta', 'Clientes', 'Cajas'],
    },
    {
      titulo: 'Compras',
      descripcion: 'Lleva el control de tus proveedores y órdenes de compra sin complicaciones.',
      icono: 'pi pi-wallet',
      ruta: '/compras',
      color: 'blue',
      submodulos: ['Órdenes de compra', 'Proveedores', 'Recepciones', 'Devoluciones'],
    },
    {
      titulo: 'Inventario',
      descripcion: 'Administra almacenes, stock, lotes y movimientos de inventario.',
      icono: 'pi pi-box',
      ruta: '/inventario',
      color: 'amber',
      submodulos: ['Productos', 'Almacenes', 'Lotes', 'Movimientos'],
    },
    {
      titulo: 'Reportes',
      descripcion: 'Visualización de métricas y análisis de datos operativos.',
      icono: 'pi pi-chart-bar',
      ruta: '/reportes',
      color: 'purple',
      submodulos: ['Ventas', 'Compras', 'Inventario', 'Caducidades'],
    },
    {
      titulo: 'Usuarios',
      descripcion: 'Gestión de cuentas, roles y permisos del sistema.',
      icono: 'pi pi-users',
      ruta: '/usuarios',
      color: 'rose',
      submodulos: ['Cuentas', 'Roles', 'Permisos', 'Sucursales'],
    },
  ]);

  return {
    cargando,
    modulos,
  };
});
