import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useInventarioStore = defineStore('inventario', () => {
  const cargando = ref(false);

  const submodulos = ref([
    {
      titulo: 'Productos',
      descripcion: 'Administración central de medicamentos y artículos con búsqueda, consulta y control visual.',
      icono: 'pi pi-box',
      ruta: '/inventario/productos',
      tags: ['SKU', 'Catálogo'],
    },
    {
      titulo: 'Lotes',
      descripcion: 'Seguimiento de lotes, caducidades y trazabilidad operativa por entrada de mercancía.',
      icono: 'pi pi-ticket',
      ruta: '/inventario/lotes',
      tags: ['FEFO', 'Caducidad'],
    },
    {
      titulo: 'Almacenes',
      descripcion: 'Control de ubicaciones, sucursales y existencia por almacén con visión clara de stock.',
      icono: 'pi pi-warehouse',
      ruta: '/inventario/almacenes',
      tags: ['Stock', 'Ubicación'],
    },
    {
      titulo: 'Precios',
      descripcion: 'Gestión de precios públicos, costos y reglas comerciales del inventario.',
      icono: 'pi pi-tags',
      ruta: '/inventario/precios',
      tags: ['Costo', 'Venta'],
    },
  ]);

  const productosRecientes = ref([
    { sku: 'SKU-1024', nombre: 'Paracetamol 500 mg', categoria: 'Analgésicos', estado: 'Activo', fecha: 'Hoy, 10:45 AM' },
    { sku: 'SKU-1025', nombre: 'Ibuprofeno 400 mg', categoria: 'Antiinflamatorios', estado: 'Activo', fecha: 'Hoy, 11:10 AM' },
    { sku: 'SKU-1026', nombre: 'Loratadina 10 mg', categoria: 'Antialérgicos', estado: 'Activo', fecha: 'Hoy, 12:05 PM' },
    { sku: 'SKU-1027', nombre: 'Suero oral', categoria: 'Rehidratación', estado: 'Activo', fecha: 'Hoy, 1:20 PM' },
    { sku: 'SKU-1028', nombre: 'Gasas estériles', categoria: 'Curación', estado: 'Activo', fecha: 'Hoy, 2:30 PM' },
  ]);

  const estadoInventario = ref({
    total: '1,248 productos',
    progreso: 68,
    estado: 'Cobertura de stock saludable',
  });

  return { cargando, submodulos, productosRecientes, estadoInventario };
});
