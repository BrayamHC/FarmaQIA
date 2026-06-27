// src/modules/catalogos/catalogosStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { catalogosService } from './catalogosService';

export const useCatalogosStore = defineStore('catalogos', () => {
  const cargandoUnidadesMedida = ref(false);
  const cargandoCategorias = ref(false);

  const unidadesMedida = ref([]);
  const categorias = ref([]);

  async function obtenerUnidadesMedida(params = {}) {
    cargandoUnidadesMedida.value = true;
    try {
      const response = await catalogosService.obtenerUnidadesMedida(params);
      unidadesMedida.value = response?.unidades_medida ?? [];
      return unidadesMedida.value;
    } catch (error) {
      console.error('Error obteniendo unidades de medida:', error);
      throw error;
    } finally {
      cargandoUnidadesMedida.value = false;
    }
  }

  async function obtenerCategoriasSubcategorias(params = {}) {
    cargandoCategorias.value = true;
    try {
      const response = await catalogosService.obtenerCategoriasSubcategorias(params);
      categorias.value = response?.categorias ?? [];
      return categorias.value;
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      throw error;
    } finally {
      cargandoCategorias.value = false;
    }
  }

  return {
    cargandoUnidadesMedida,
    cargandoCategorias,
    unidadesMedida,
    categorias,
    obtenerUnidadesMedida,
    obtenerCategoriasSubcategorias,
  };
});
