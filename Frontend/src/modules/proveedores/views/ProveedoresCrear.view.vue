<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/compras" class="transition hover:text-slate-600">Compras</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/proveedores" class="transition hover:text-slate-600">Proveedores</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Crear proveedor</span>
      </nav>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-plus-circle text-base text-white"></i>
          </div>

          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Crear Proveedor
            </h1>
            <p class="text-sm text-slate-500">
              Registra la información fiscal, comercial y de contacto del proveedor.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start lg:self-auto">
          <button type="button" class="farma-btn farma-btn-ghost" @click="router.push('/proveedores')">
            <i class="pi pi-times text-xs"></i>
            <span>Cancelar</span>
          </button>

          <button type="button" class="farma-btn farma-btn-primary" :disabled="proveedoresStore.cargando"
            @click="submitForm">
            <i :class="proveedoresStore.cargando ? 'pi pi-spin pi-spinner text-xs' : 'pi pi-check text-xs'"></i>
            <span>{{ proveedoresStore.cargando ? 'Guardando...' : 'Guardar' }}</span>
          </button>
        </div>
      </div>
    </header>

    <div class="app-scroll flex-1 overflow-y-auto pr-1">
      <form class="space-y-4 pb-6" @submit.prevent="submitForm">
        <section class="grid grid-cols-1 gap-15 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div class="space-y-4">
            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Información general
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Datos principales</h2>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="md:col-span-1">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Nombre *</label>
                  <input v-model="form.nombre" type="text" class="farma-input" placeholder="Nombre o razón social" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Nombre comercial</label>
                  <input v-model="form.nombre_comercial" type="text" class="farma-input"
                    placeholder="Nombre comercial" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">RFC</label>
                  <input v-model="form.rfc" type="text" maxlength="13" class="farma-input"
                    placeholder="RFC del proveedor" />
                </div>
              </div>
            </article>

            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Contacto comercial
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Responsable y medios de contacto</h2>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Nombre de contacto</label>
                  <input v-model="form.contacto_nombre" type="text" class="farma-input"
                    placeholder="Nombre del contacto" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Teléfono</label>
                  <input v-model="form.contacto_telefono" type="text" class="farma-input"
                    placeholder="Teléfono del contacto" />
                </div>

                <div class="md:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Correo electrónico</label>
                  <input v-model="form.contacto_email" type="email" class="farma-input"
                    placeholder="correo@proveedor.com" />
                </div>
              </div>
            </article>

            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Dirección
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Ubicación fiscal o comercial</h2>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div class="lg:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Calle</label>
                  <input v-model="form.calle" type="text" class="farma-input" placeholder="Calle" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">No. exterior</label>
                  <input v-model="form.numero_exterior" type="text" class="farma-input" placeholder="Exterior" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">No. interior</label>
                  <input v-model="form.numero_interior" type="text" class="farma-input" placeholder="Interior" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Colonia</label>
                  <input v-model="form.colonia" type="text" class="farma-input" placeholder="Colonia" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Código postal</label>
                  <input v-model="form.codigo_postal" type="text" class="farma-input" placeholder="Código postal" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Municipio</label>
                  <input v-model="form.municipio" type="text" class="farma-input" placeholder="Municipio" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Estado</label>
                  <input v-model="form.estado" type="text" class="farma-input" placeholder="Estado" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">País</label>
                  <input v-model="form.pais" type="text" class="farma-input" placeholder="País" />
                </div>
              </div>
            </article>

            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Condiciones comerciales
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Crédito y acuerdos</h2>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Condiciones de pago</label>
                  <input v-model="form.condiciones_pago" type="text" class="farma-input"
                    placeholder="Ej. Transferencia a 30 días" />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Días de crédito</label>
                  <input v-model.number="form.dias_credito" type="number" min="0" class="farma-input" />
                </div>
              </div>
            </article>

            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Observaciones
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Notas internas</h2>
              </div>

              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-500">Notas</label>
                <textarea v-model="form.notas" rows="4" class="farma-textarea"
                  placeholder="Información adicional del proveedor"></textarea>
              </div>
            </article>
          </div>

          <aside class="self-start xl:sticky xl:top-4">
            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Resumen
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Vista previa de captura</h2>
              </div>

              <div class="space-y-4">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Proveedor</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">
                    {{ form.nombre || 'Sin nombre capturado' }}
                  </p>
                  <p class="mt-1 text-sm text-slate-500">
                    {{ form.nombre_comercial || 'Sin nombre comercial' }}
                  </p>
                </div>

                <div class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">RFC</p>
                    <p class="mt-1 text-sm text-slate-700">{{ form.rfc || '—' }}</p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Contacto</p>
                    <p class="mt-1 text-sm text-slate-700">{{ form.contacto_nombre || '—' }}</p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Crédito</p>
                    <p class="mt-1 text-sm text-slate-700">{{ Number(form.dias_credito || 0) }} días</p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Correo</p>
                    <p class="mt-1 break-all text-sm text-slate-700">{{ form.contacto_email || '—' }}</p>
                  </div>
                </div>

                <div class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-widest text-blue-600">
                    Recomendación
                  </p>
                  <p class="mt-1 text-sm text-blue-700">
                    Completa al menos nombre, RFC, contacto y condiciones de pago para tener un proveedor útil desde
                    compras.
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
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useProveedoresStore } from '../proveedoresStore';

const router = useRouter();
const proveedoresStore = useProveedoresStore();

const form = ref({
  nombre: '',
  nombre_comercial: '',
  rfc: '',
  contacto_nombre: '',
  contacto_telefono: '',
  contacto_email: '',
  calle: '',
  numero_exterior: '',
  numero_interior: '',
  colonia: '',
  municipio: '',
  estado: '',
  pais: 'México',
  codigo_postal: '',
  condiciones_pago: '',
  dias_credito: 0,
  notas: '',
});

function construirPayload() {
  return {
    nombre: form.value.nombre || '',
    nombre_comercial: form.value.nombre_comercial || '',
    rfc: form.value.rfc || '',
    contacto_nombre: form.value.contacto_nombre || '',
    contacto_telefono: form.value.contacto_telefono || '',
    contacto_email: form.value.contacto_email || '',
    calle: form.value.calle || '',
    numero_exterior: form.value.numero_exterior || '',
    numero_interior: form.value.numero_interior || '',
    colonia: form.value.colonia || '',
    municipio: form.value.municipio || '',
    estado: form.value.estado || '',
    pais: form.value.pais || 'México',
    codigo_postal: form.value.codigo_postal || '',
    condiciones_pago: form.value.condiciones_pago || '',
    dias_credito: Number(form.value.dias_credito || 0),
    notas: form.value.notas || '',
  };
}

async function submitForm() {
  try {
    await proveedoresStore.crearProveedor?.(construirPayload());
    router.push('/proveedores');
  } catch (error) {
    console.error('Error creando proveedor:', error);
  }
}
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
  min-height: 110px;
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

.card-base {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}
</style>
