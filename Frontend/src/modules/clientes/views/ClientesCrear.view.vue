<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/ventas" class="transition hover:text-slate-600">Ventas</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/clientes" class="transition hover:text-slate-600">Clientes</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Crear cliente</span>
      </nav>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-user-plus text-base text-white"></i>
          </div>

          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Crear Cliente
            </h1>
            <p class="text-sm text-slate-500">
              Registra la información general, fiscal y de contacto del cliente.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start lg:self-auto">
          <button type="button" class="farma-btn farma-btn-ghost" @click="router.push('/clientes')">
            <i class="pi pi-times text-xs"></i>
            <span>Cancelar</span>
          </button>

          <button type="button" class="farma-btn farma-btn-primary" :disabled="clientesStore.cargando || enviando"
            @click="submitForm">
            <i :class="enviando ? 'pi pi-spin pi-spinner text-xs' : 'pi pi-check text-xs'"></i>
            <span>{{ enviando ? 'Guardando...' : 'Guardar' }}</span>
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
                <div class="md:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Nombre *</label>
                  <input v-model="form.nombre" type="text" class="farma-input" maxlength="255"
                    placeholder="Nombre completo del cliente" @blur="normalizarTexto('nombre')" />
                  <p v-if="errores.nombre" class="farma-error">{{ errores.nombre }}</p>
                </div>

                <div class="md:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Razón social</label>
                  <input v-model="form.razon_social" type="text" class="farma-input" maxlength="255"
                    placeholder="Razón social" @blur="normalizarTexto('razon_social')" />
                  <p v-if="errores.razon_social" class="farma-error">{{ errores.razon_social }}</p>
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">RFC</label>
                  <input :value="form.rfc" type="text" class="farma-input uppercase" maxlength="13"
                    placeholder="RFC del cliente" @input="onInputRFC" @blur="validarCampoRFC" />
                  <p v-if="errores.rfc" class="farma-error">{{ errores.rfc }}</p>
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Código postal fiscal</label>
                  <input :value="form.codigo_postal_fiscal" type="text" class="farma-input" maxlength="5"
                    inputmode="numeric" placeholder="C.P. fiscal" @input="onInputCodigoPostal"
                    @blur="validarCampoCodigoPostal" />
                  <p v-if="errores.codigo_postal_fiscal" class="farma-error">
                    {{ errores.codigo_postal_fiscal }}
                  </p>
                </div>
              </div>
            </article>

            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Contacto
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Medios de contacto</h2>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Teléfono</label>
                  <input :value="form.telefono" type="text" class="farma-input" maxlength="10" inputmode="numeric"
                    placeholder="10 dígitos" @input="onInputTelefono" @blur="validarCampoTelefono" />
                  <p v-if="errores.telefono" class="farma-error">{{ errores.telefono }}</p>
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Correo electrónico</label>
                  <input v-model="form.email" type="email" class="farma-input" maxlength="255"
                    placeholder="correo@cliente.com" @blur="validarCampoEmail" />
                  <p v-if="errores.email" class="farma-error">{{ errores.email }}</p>
                </div>

                <div class="md:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Dirección</label>
                  <textarea v-model="form.direccion" rows="4" class="farma-textarea" maxlength="1000"
                    placeholder="Dirección del cliente" @blur="normalizarTexto('direccion')"></textarea>
                  <p v-if="errores.direccion" class="farma-error">{{ errores.direccion }}</p>
                </div>
              </div>
            </article>
          </div>

          <aside class="self-start xl:sticky xl:top-4 xl:h-fit">
            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Resumen
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Vista previa de captura</h2>
              </div>

              <div class="space-y-4">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Cliente</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">
                    {{ form.nombre || 'Sin nombre capturado' }}
                  </p>
                  <p class="mt-1 text-sm text-slate-500">
                    {{ form.razon_social || 'Sin razón social' }}
                  </p>
                </div>

                <div class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">RFC</p>
                    <p class="mt-1 text-sm text-slate-700">{{ form.rfc || '—' }}</p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Teléfono</p>
                    <p class="mt-1 text-sm text-slate-700">{{ form.telefono || '—' }}</p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Correo</p>
                    <p class="mt-1 break-all text-sm text-slate-700">{{ form.email || '—' }}</p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      C.P. Fiscal
                    </p>
                    <p class="mt-1 text-sm text-slate-700">{{ form.codigo_postal_fiscal || '—' }}</p>
                  </div>
                </div>

                <div class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-widest text-blue-600">
                    Recomendación
                  </p>
                  <p class="mt-1 text-sm text-blue-700">
                    Completa al menos nombre, teléfono y datos fiscales para registrar un cliente útil
                    para ventas y facturación.
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
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useClientesStore } from '../clientesStore';

const router = useRouter();
const clientesStore = useClientesStore();
const enviando = ref(false);

const form = reactive({
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  rfc: '',
  razon_social: '',
  codigo_postal_fiscal: '',
});

const errores = reactive({
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  rfc: '',
  razon_social: '',
  codigo_postal_fiscal: '',
});

const RFC_REGEX = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function limpiarErrores() {
  Object.keys(errores).forEach((key) => {
    errores[key] = '';
  });
}

function normalizarTexto(campo) {
  form[campo] = String(form[campo] || '').trim();
}

function onInputTelefono(event) {
  const value = String(event.target.value || '').replace(/\D/g, '').slice(0, 10);
  form.telefono = value;
  if (errores.telefono) validarCampoTelefono();
}

function onInputCodigoPostal(event) {
  const value = String(event.target.value || '').replace(/\D/g, '').slice(0, 5);
  form.codigo_postal_fiscal = value;
  if (errores.codigo_postal_fiscal) validarCampoCodigoPostal();
}

function onInputRFC(event) {
  const value = String(event.target.value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9Ñ&]/g, '')
    .slice(0, 13);

  form.rfc = value;
  if (errores.rfc) validarCampoRFC();
}

function validarCampoNombre() {
  const valor = String(form.nombre || '').trim();

  if (!valor) {
    errores.nombre = 'El nombre es requerido';
    return false;
  }

  if (valor.length > 255) {
    errores.nombre = 'El nombre no puede exceder 255 caracteres';
    return false;
  }

  errores.nombre = '';
  return true;
}

function validarCampoTelefono() {
  const valor = String(form.telefono || '').trim();

  if (!valor) {
    errores.telefono = '';
    return true;
  }

  if (!/^\d{10}$/.test(valor)) {
    errores.telefono = 'El teléfono debe contener 10 dígitos';
    return false;
  }

  errores.telefono = '';
  return true;
}

function validarCampoEmail() {
  const valor = String(form.email || '').trim();

  if (!valor) {
    errores.email = '';
    return true;
  }

  if (valor.length > 255) {
    errores.email = 'El correo no puede exceder 255 caracteres';
    return false;
  }

  if (!EMAIL_REGEX.test(valor)) {
    errores.email = 'Email inválido';
    return false;
  }

  errores.email = '';
  return true;
}

function validarCampoRFC() {
  const valor = String(form.rfc || '').trim().toUpperCase();

  if (!valor) {
    errores.rfc = '';
    return true;
  }

  if (valor.length > 20) {
    errores.rfc = 'El RFC no puede exceder 20 caracteres';
    return false;
  }

  if (!(valor.length === 12 || valor.length === 13)) {
    errores.rfc = 'El RFC debe tener 12 o 13 caracteres';
    return false;
  }

  if (!RFC_REGEX.test(valor)) {
    errores.rfc = 'El RFC no tiene un formato válido';
    return false;
  }

  errores.rfc = '';
  return true;
}

function validarCampoRazonSocial() {
  const valor = String(form.razon_social || '').trim();

  if (!valor) {
    errores.razon_social = '';
    return true;
  }

  if (valor.length > 255) {
    errores.razon_social = 'La razón social no puede exceder 255 caracteres';
    return false;
  }

  errores.razon_social = '';
  return true;
}

function validarCampoCodigoPostal() {
  const valor = String(form.codigo_postal_fiscal || '').trim();

  if (!valor) {
    errores.codigo_postal_fiscal = '';
    return true;
  }

  if (!/^\d{5}$/.test(valor)) {
    errores.codigo_postal_fiscal = 'El código postal debe contener 5 dígitos';
    return false;
  }

  errores.codigo_postal_fiscal = '';
  return true;
}

function validarCampoDireccion() {
  errores.direccion = '';
  return true;
}

function validarForm() {
  normalizarTexto('nombre');
  normalizarTexto('email');
  normalizarTexto('direccion');
  normalizarTexto('razon_social');
  form.rfc = String(form.rfc || '').trim().toUpperCase();

  const resultados = [
    validarCampoNombre(),
    validarCampoTelefono(),
    validarCampoEmail(),
    validarCampoDireccion(),
    validarCampoRFC(),
    validarCampoRazonSocial(),
    validarCampoCodigoPostal(),
  ];

  return resultados.every(Boolean);
}

function construirPayload() {
  const payload = {
    nombre: form.nombre.trim(),
    telefono: form.telefono ? form.telefono.trim() : undefined,
    email: form.email ? form.email.trim() : undefined,
    direccion: form.direccion ? form.direccion.trim() : undefined,
    rfc: form.rfc ? form.rfc.trim().toUpperCase() : undefined,
    razon_social: form.razon_social ? form.razon_social.trim() : undefined,
    codigo_postal_fiscal: form.codigo_postal_fiscal
      ? form.codigo_postal_fiscal.trim()
      : undefined,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  );
}

async function submitForm() {
  limpiarErrores();

  if (!validarForm()) return;

  enviando.value = true;

  try {
    await clientesStore.crearCliente(construirPayload());
    router.push('/clientes');
  } catch (error) {
    console.error('Error creando cliente:', error);
  } finally {
    enviando.value = false;
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

.farma-error {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #e11d48;
}
</style>
