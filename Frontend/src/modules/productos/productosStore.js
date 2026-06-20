import { defineStore } from 'pinia';
import { ref } from 'vue';
import { productosService } from './productosService';

export const useProductosStore = defineStore('productos', () => {
  const cargando = ref(false);
  const productos = ref([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(5);

  /**
   * Obtener productos paginados
   */
  async function obtenerProductos() {
    cargando.value = true;
    try {
      const response = await productosService.obtenerProductos();
      productos.value = response.data;
      total.value = response.total;
      page.value = response.page;
      pageSize.value = response.pageSize;
    } catch (error) {
      console.error('Error en store obteniendo productos:', error);
    }
    cargando.value = false;
  }

  /**
   * Cambiar página
   */
  function cambiarPagina(newPage) {
    page.value = newPage;
    obtenerProductos();
  }

  return {
    cargando,
    productos,
    total,
    page,
    pageSize,
    obtenerProductos,
    cambiarPagina,
  };
});
