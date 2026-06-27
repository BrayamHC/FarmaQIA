<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/inventario" class="transition hover:text-slate-600">Inventario</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/inventario/productos" class="transition hover:text-slate-600">Productos</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Crear producto</span>
      </nav>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-plus-circle text-base text-white"></i>
          </div>

          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Crear Producto
            </h1>
            <p class="text-sm text-slate-500">
              Registra la información general, comercial y técnica del producto.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start lg:self-auto">
          <button type="button" class="farma-btn farma-btn-ghost" @click="router.push('/inventario/productos')">
            <i class="pi pi-times text-xs"></i>
            <span>Cancelar</span>
          </button>

          <button type="button" class="farma-btn farma-btn-primary" :disabled="productosStore.cargando"
            @click="submitForm">
            <i :class="productosStore.cargando ? 'pi pi-spin pi-spinner text-xs' : 'pi pi-check text-xs'"></i>
            <span>{{ productosStore.cargando ? 'Guardando...' : 'Guardar' }}</span>
          </button>
        </div>
      </div>
    </header>

    <div class="app-scroll flex-1 overflow-y-auto pr-1">
      <form class="space-y-4 pb-6" @submit.prevent="submitForm">
        <section class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div class="space-y-4">
            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Información general
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Datos principales</h2>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">SKU *</label>
                  <input v-model="form.sku" type="text" class="farma-input" placeholder="Ej. HIG-0009" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">UPC</label>
                  <input v-model="form.upc" type="text" class="farma-input" placeholder="Código UPC" />
                </div>

                <div class="md:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Nombre *</label>
                  <input v-model="form.nombre" type="text" class="farma-input" placeholder="Nombre del producto" />
                </div>

                <div class="md:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Descripción</label>
                  <textarea v-model="form.descripcion" rows="3" class="farma-textarea"
                    placeholder="Describe el producto"></textarea>
                </div>


                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Unidad de medida *</label>
                  <Select v-model="form.unidad_medida_uuid" :options="unidadesMedidaOptions" optionLabel="label"
                    optionValue="value" placeholder="Selecciona una unidad" filter
                    :loading="catalogosStore.cargandoUnidadesMedida" class="w-full farma-select" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Categoría *</label>
                  <Select v-model="form.categoria_uuid" :options="categoriasOptions" optionLabel="label"
                    optionValue="value" placeholder="Selecciona una categoría" filter
                    :loading="catalogosStore.cargandoCategorias" class="w-full farma-select" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Proveedor</label>
                  <Select v-model="form.proveedor_uuid" :options="proveedoresOptions" optionLabel="label"
                    optionValue="value" placeholder="Selecciona un proveedor" filter :loading="cargandoProveedores"
                    class="w-full farma-select" />
                </div>

                <div class="md:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Presentación</label>
                  <input v-model="form.presentacion" type="text" class="farma-input" placeholder="Ej. Botella 500 ml" />
                </div>
              </div>
            </article>

            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Información comercial
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Precios y control</h2>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Costo compra</label>
                  <input v-model.number="form.costo_compra" type="number" step="0.01" min="0" class="farma-input" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Precio público</label>
                  <input v-model.number="form.precio_publico" type="number" step="0.01" min="0" class="farma-input" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Factor unidades</label>
                  <input v-model.number="form.factor_unidades" type="number" min="0" class="farma-input" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Unidad entrada</label>
                  <input v-model="form.unidad_entrada" type="text" class="farma-input" placeholder="Caja" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Unidad salida</label>
                  <input v-model="form.unidad_salida" type="text" class="farma-input" placeholder="Pieza" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Control almacén</label>
                  <Select v-model="form.control_almacen" :options="controlAlmacenOptions" optionLabel="label"
                    optionValue="value" placeholder="Selecciona control" class="w-full farma-select" />
                </div>

                <div class="md:col-span-2 lg:col-span-3">
                  <label
                    class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    <input v-model="form.con_lote" type="checkbox"
                      class="h-4 w-4 rounded border-slate-300 text-blue-600" />
                    <span>Controlar por lote</span>
                  </label>
                </div>
              </div>
            </article>

            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Información técnica
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Medidas, temperatura y registro</h2>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Volumen valor</label>
                  <input v-model.number="form.volumen_valor" type="number" step="0.01" min="0" class="farma-input" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Volumen unidad</label>
                  <input v-model="form.volumen_unidad" type="text" class="farma-input" placeholder="ml, l" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Peso valor</label>
                  <input v-model.number="form.peso_valor" type="number" step="0.01" min="0" class="farma-input" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Peso unidad</label>
                  <input v-model="form.peso_unidad" type="text" class="farma-input" placeholder="g, kg" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Temperatura valor</label>
                  <input v-model.number="form.temperatura.valor" type="number" step="0.1" class="farma-input" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Temperatura unidad</label>
                  <input v-model="form.temperatura.unidad" type="text" class="farma-input" placeholder="°C" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Registro sanitario</label>
                  <input v-model="form.numero_registro_sanitario" type="text" class="farma-input"
                    placeholder="Número de registro" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Fecha entrada</label>
                  <div class="farma-datepicker-click" @click="fechaEntradaRef?.showOverlay?.()">
                    <DatePicker ref="fechaEntradaRef" v-model="form.fecha_entrada" placeholder="YYYY-MM-DD"
                      dateFormat="yy-mm-dd" showIcon iconDisplay="input" manualInput showOnFocus
                      inputClass="farma-datepicker-input" class="w-full farma-datepicker" />
                  </div>
                </div>
              </div>
            </article>

            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Tags</p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Etiquetas de referencia</h2>
              </div>

              <div class="space-y-3">
                <div class="flex flex-col gap-3 md:flex-row">
                  <input v-model="tagInput" type="text" class="farma-input flex-1"
                    placeholder="Ej. gripe, fiebre, antiséptico" @keydown.enter.prevent="agregarTag" />

                  <button type="button" class="farma-btn farma-btn-ghost" @click="agregarTag">
                    <i class="pi pi-plus text-xs"></i>
                    <span>Agregar tag</span>
                  </button>
                </div>

                <div v-if="form.tags.length" class="flex flex-wrap gap-2">
                  <span v-for="tag in form.tags" :key="tag"
                    class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {{ tag }}
                    <button type="button" class="hover:text-blue-900" @click="eliminarTag(tag)">
                      <i class="pi pi-times text-[10px]"></i>
                    </button>
                  </span>
                </div>

                <p v-else class="text-sm text-slate-400">
                  Aún no hay tags agregados.
                </p>
              </div>
            </article>
          </div>

          <aside class="space-y-4">
            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Imagen</p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Vista previa local</h2>
              </div>

              <div class="space-y-4">
                <div class="farma-image-frame">
                  <img v-if="imagenPreview" :src="imagenPreview" alt="Vista previa del producto"
                    class="farma-image-preview" />

                  <div v-else class="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
                    <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <i class="pi pi-image text-xl text-slate-300"></i>
                    </div>
                    <p class="text-sm font-medium text-slate-500">Sin imagen seleccionada</p>
                    <p class="mt-1 text-xs text-slate-400">
                      Puedes cargar una imagen solo como referencia visual.
                    </p>
                  </div>
                </div>

                <input ref="inputImagenRef" type="file" accept="image/*" class="hidden" @change="onSeleccionarImagen" />

                <div class="grid grid-cols-1 gap-2">
                  <button type="button" class="farma-btn farma-btn-ghost w-full justify-center"
                    @click="inputImagenRef?.click()">
                    <i class="pi pi-upload text-xs"></i>
                    <span>{{ imagenPreview ? 'Cambiar imagen' : 'Seleccionar imagen' }}</span>
                  </button>

                  <button v-if="imagenPreview" type="button" class="farma-btn farma-btn-soft w-full justify-center"
                    @click="removerImagen">
                    <i class="pi pi-trash text-xs"></i>
                    <span>Quitar imagen</span>
                  </button>
                </div>

                <div class="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">
                    Nota actual
                  </p>
                  <p class="mt-1 text-sm text-amber-700">
                    La imagen aún no se envía al backend. Solo se usa como referencia visual local; después se integrará
                    la carga a S3.
                  </p>
                </div>
              </div>
            </article>
          </aside>
        </section>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import { useProductosStore } from '../productosStore';
import { useCatalogosStore } from '@/modules/catalogos/catalogosStore';

const router = useRouter();
const productosStore = useProductosStore();
const catalogosStore = useCatalogosStore();

const tagInput = ref('');
const inputImagenRef = ref(null);
const imagenFile = ref(null);
const imagenPreview = ref('');
const fechaEntradaRef = ref(null);

const cargandoProveedores = ref(false);
const proveedoresOptions = ref([]);


const controlAlmacenOptions = ref([
  { label: 'PEPS', value: 'PEPS' },
  { label: 'FEFO', value: 'FEFO' },
]);

const unidadesMedidaOptions = computed(() =>
  (catalogosStore.unidadesMedida ?? []).map((item) => ({
    label: `${item.clave} - ${item.nombre}`,
    value: item.unidad_medida_uuid,
  }))
);

const categoriasOptions = computed(() =>
  (catalogosStore.categorias ?? []).map((item) => ({
    label: item.nombre_categoria_padre
      ? `${item.nombre_categoria_padre} - ${item.nombre_categoria}`
      : item.nombre_categoria,
    value: item.categoria_uuid,
  }))
);

const form = ref({
  sku: '',
  upc: '',
  nombre: '',
  descripcion: '',
  status: 'activo',
  unidad_medida_uuid: '',
  categoria_uuid: '',
  proveedor_uuid: '',
  volumen_valor: null,
  volumen_unidad: '',
  peso_valor: null,
  peso_unidad: '',
  unidad_entrada: '',
  unidad_salida: '',
  control_almacen: '',
  factor_unidades: 0,
  con_lote: false,
  costo_compra: 0,
  precio_publico: 0,
  numero_registro_sanitario: '',
  temperatura: {
    valor: null,
    unidad: '°C',
  },
  presentacion: '',
  fecha_entrada: null,
  tags: [],
  url_imagen: '',
});

function agregarTag() {
  const valor = tagInput.value.trim();
  if (!valor) return;
  if (!form.value.tags.includes(valor)) {
    form.value.tags.push(valor);
  }
  tagInput.value = '';
}

function eliminarTag(tag) {
  form.value.tags = form.value.tags.filter((item) => item !== tag);
}

function onSeleccionarImagen(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  imagenFile.value = file;
  imagenPreview.value = URL.createObjectURL(file);
}

function removerImagen() {
  imagenFile.value = null;
  imagenPreview.value = '';
  if (inputImagenRef.value) {
    inputImagenRef.value.value = '';
  }
}

function formatearFecha(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function construirPayload() {
  return {
    sku: form.value.sku || '',
    upc: form.value.upc || '',
    nombre: form.value.nombre || '',
    descripcion: form.value.descripcion || '',
    status: form.value.status || 'activo',
    unidad_medida_uuid: form.value.unidad_medida_uuid || '',
    categoria_uuid: form.value.categoria_uuid || '',
    proveedor_uuid: form.value.proveedor_uuid || '',
    volumen_valor: form.value.volumen_valor ?? 0,
    volumen_unidad: form.value.volumen_unidad || '',
    peso_valor: form.value.peso_valor ?? 0,
    peso_unidad: form.value.peso_unidad || '',
    unidad_entrada: form.value.unidad_entrada || '',
    unidad_salida: form.value.unidad_salida || '',
    control_almacen: form.value.control_almacen || '',
    factor_unidades: Number(form.value.factor_unidades || 0),
    con_lote: Boolean(form.value.con_lote),
    costo_compra: Number(form.value.costo_compra || 0),
    precio_publico: Number(form.value.precio_publico || 0),
    numero_registro_sanitario: form.value.numero_registro_sanitario || '',
    temperatura: {
      valor: form.value.temperatura?.valor ?? 0,
      unidad: form.value.temperatura?.unidad || '°C',
    },
    presentacion: form.value.presentacion || '',
    fecha_entrada: formatearFecha(form.value.fecha_entrada),
    tags: form.value.tags || [],
    url_imagen: '',
  };
}

async function cargarCatalogos() {
  try {
    await Promise.all([
      catalogosStore.obtenerUnidadesMedida?.(),
      catalogosStore.obtenerCategoriasSubcategorias?.(),
    ]);
  } catch (error) {
    console.error('Error cargando catálogos:', error);
  }
}

async function cargarProveedores() {
  cargandoProveedores.value = false;
  proveedoresOptions.value = [];
}

async function submitForm() {
  try {
    await productosStore.crearProducto(construirPayload());
    router.push('/inventario/productos');
  } catch (error) {
    console.error('Error creando producto:', error);
  }
}

onMounted(async () => {
  await Promise.all([cargarCatalogos(), cargarProveedores()]);
});
</script>

<style scoped>
.farma-input,
.farma-textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  background: #fff;
  color: #0f172a;
  padding: 0.72rem 0.95rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.farma-textarea {
  resize: vertical;
  min-height: 96px;
}

.farma-input::placeholder,
.farma-textarea::placeholder {
  color: #94a3b8;
}

.farma-input:focus,
.farma-textarea:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

:deep(.farma-select .p-select),
:deep(.farma-datepicker .p-datepicker-input) {
  width: 100%;
  min-height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  box-shadow: none;
  background: #fff;
  color: #0f172a;
}

:deep(.farma-select .p-select-label),
:deep(.farma-datepicker .p-datepicker-input) {
  padding: 0.72rem 0.95rem;
  font-size: 0.875rem;
}

:deep(.farma-select .p-select-dropdown) {
  width: 2.75rem;
  color: #64748b;
}

:deep(.farma-datepicker .p-datepicker-dropdown) {
  color: #64748b;
}

:deep(.farma-select .p-focus),
:deep(.farma-datepicker .p-inputtext:focus) {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
}

.farma-datepicker-click {
  width: 100%;
}

.farma-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 0.85rem;
  padding: 0.62rem 0.95rem;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
  transition: all 0.2s ease;
}

.farma-btn-primary {
  background: #2563eb;
  color: white;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.16);
}

.farma-btn-primary:hover {
  background: #1d4ed8;
}

.farma-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.farma-btn-ghost {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
}

.farma-btn-ghost:hover {
  background: #f8fafc;
  color: #0f172a;
}

.farma-btn-soft {
  background: #f1f5f9;
  color: #475569;
}

.farma-btn-soft:hover {
  background: #e2e8f0;
}

.farma-image-frame {
  height: 320px;
  width: 100%;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px dashed #e2e8f0;
  background: #f8fafc;
}

.farma-image-preview {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.card-base {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}
</style>
