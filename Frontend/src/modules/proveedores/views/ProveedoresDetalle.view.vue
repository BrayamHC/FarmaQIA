<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <!-- ── Header ───────────────────────────────────────────────────── -->
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/compras" class="transition hover:text-slate-600">Compras</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/proveedores" class="transition hover:text-slate-600">Proveedores</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">
          {{ cargandoInicial ? 'Cargando...' : (proveedorDetalle?.nombre || 'Detalle') }}
        </span>
      </nav>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <Button icon="pi pi-arrow-left" severity="secondary" outlined
            class="!h-10 !w-10 !rounded-xl !border-slate-200 !text-slate-500" @click="router.push('/proveedores')" />

          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-truck text-base text-white"></i>
          </div>

          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              {{ cargandoInicial ? '...' : (proveedorDetalle?.nombre || 'Proveedor') }}
            </h1>
            <p class="text-sm text-slate-500">
              {{ cargandoInicial ? 'Cargando información del proveedor' : (proveedorDetalle?.nombre_comercial ||
                'Detalle del proveedor') }}
            </p>
          </div>
        </div>

        <!-- Acciones header -->
        <div class="flex items-center gap-2 self-start lg:self-auto">
          <!-- Banner de edición activa -->
          <Transition name="fade-slide">
            <span v-if="modoEdicion && hayModificaciones"
              class="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 sm:inline-flex">
              <i class="pi pi-pencil text-[10px]"></i>
              Cambios sin guardar
            </span>
          </Transition>

          <button type="button" class="farma-btn farma-btn-ghost" :disabled="cargandoInicial"
            @click="router.push('/proveedores')">
            <i class="pi pi-times text-xs"></i>
            <span>Cerrar</span>
          </button>

          <!-- Guardar: solo visible en modo edición y con cambios -->
          <Transition name="fade-slide">
            <button v-if="modoEdicion" type="button" class="farma-btn farma-btn-primary"
              :disabled="!hayModificaciones || proveedoresStore.cargando" @click="submitForm">
              <i :class="proveedoresStore.cargando ? 'pi pi-spin pi-spinner text-xs' : 'pi pi-check text-xs'"></i>
              <span>{{ proveedoresStore.cargando ? 'Guardando...' : 'Guardar cambios' }}</span>
            </button>
          </Transition>
        </div>
      </div>
    </header>

    <!-- ── Skeleton ─────────────────────────────────────────────────── -->
    <div v-if="cargandoInicial" class="flex-1 space-y-4 overflow-hidden pr-1">
      <section class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="rounded-2xl border border-slate-200 bg-white p-5">
            <div class="mb-4 h-4 w-32 animate-pulse rounded bg-slate-100"></div>
            <div class="h-6 w-48 animate-pulse rounded bg-slate-100"></div>
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div class="h-12 animate-pulse rounded-xl bg-slate-100"></div>
              <div class="h-12 animate-pulse rounded-xl bg-slate-100"></div>
            </div>
          </div>
        </div>
        <div class="hidden xl:block">
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <div class="mb-4 h-4 w-24 animate-pulse rounded bg-slate-100"></div>
            <div class="space-y-3">
              <div class="h-28 animate-pulse rounded-2xl bg-slate-100"></div>
              <div class="h-44 animate-pulse rounded-2xl bg-slate-100"></div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ── Formulario ────────────────────────────────────────────────── -->
    <div v-else class="app-scroll flex-1 overflow-y-auto pr-1">
      <form class="space-y-4 pb-6" @submit.prevent="submitForm">
        <section class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div class="space-y-4">

            <!-- Información general — con menú de acciones en esquina -->
            <article class="card-base relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <!-- Menú 3 puntos en esquina superior derecha de la card -->
              <div class="absolute right-4 top-4 flex items-center gap-2">
                <button type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                  :disabled="cargandoInicial || !proveedorDetalle" @click="(e) => menuAccionesRef.toggle(e)">
                  <i class="pi pi-ellipsis-h text-sm"></i>
                </button>

                <Menu ref="menuAccionesRef" :model="menuAcciones" popup :pt="{
                  root: { class: 'farma-menu-popup' },
                  list: { class: 'p-1' },
                  item: { class: 'rounded-xl overflow-hidden' },
                  itemLink: { class: '!p-0' },
                  itemLabel: { class: 'sr-only' },
                }">
                  <template #item="{ item }">
                    <button type="button"
                      class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition"
                      :class="item.itemClass" @click="item.command">
                      <i :class="[item.icon, 'text-sm shrink-0', item.iconClass]"></i>
                      <span>{{ item.label }}</span>
                    </button>
                  </template>
                </Menu>
              </div>

              <div class="mb-4 pr-32">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Información general</p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Datos principales</h2>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="md:col-span-1">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Nombre *</label>
                  <InputText v-model="form.nombre" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Nombre o razón social" :maxlength="255" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Nombre comercial</label>
                  <InputText v-model="form.nombre_comercial" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Nombre comercial" :maxlength="255" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">RFC</label>
                  <InputText v-model="form.rfc" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="RFC del proveedor" :maxlength="13" :disabled="!modoEdicion" />
                </div>
                <div class="flex items-center gap-2 pt-5">
                  <span class="text-xs font-medium text-slate-500">Status:</span>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="statusClass(proveedorDetalle?.status)">
                    {{ capitalizar(proveedorDetalle?.status) }}
                  </span>
                </div>
              </div>
            </article>

            <!-- Contacto comercial -->
            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Contacto comercial</p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Responsable y medios de contacto</h2>
              </div>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Nombre de contacto</label>
                  <InputText v-model="form.contacto_nombre" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Nombre del contacto" :maxlength="150" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Teléfono</label>
                  <InputText v-model="form.contacto_telefono" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Teléfono del contacto" :maxlength="20" :disabled="!modoEdicion" />
                </div>
                <div class="md:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Correo electrónico</label>
                  <InputText v-model="form.contacto_email" type="email" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="correo@proveedor.com" :maxlength="150" :disabled="!modoEdicion" />
                </div>
              </div>
            </article>

            <!-- Dirección -->
            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Dirección</p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Ubicación fiscal o comercial</h2>
              </div>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div class="lg:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Calle</label>
                  <InputText v-model="form.calle" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Calle" :maxlength="255" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">No. exterior</label>
                  <InputText v-model="form.numero_exterior" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Exterior" :maxlength="20" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">No. interior</label>
                  <InputText v-model="form.numero_interior" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Interior" :maxlength="20" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Colonia</label>
                  <InputText v-model="form.colonia" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Colonia" :maxlength="150" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Código postal</label>
                  <InputText v-model="form.codigo_postal" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Código postal" :maxlength="10" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Municipio</label>
                  <InputText v-model="form.municipio" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Municipio" :maxlength="100" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Estado</label>
                  <InputText v-model="form.estado" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Estado" :maxlength="100" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">País</label>
                  <InputText v-model="form.pais" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="País" :maxlength="100" :disabled="!modoEdicion" />
                </div>
              </div>
            </article>

            <!-- Condiciones comerciales -->
            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Condiciones comerciales</p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Crédito y acuerdos</h2>
              </div>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Condiciones de pago</label>
                  <InputText v-model="form.condiciones_pago" class="farma-primevue-input w-full"
                    :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                    placeholder="Ej. Transferencia a 30 días" :maxlength="100" :disabled="!modoEdicion" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-500">Días de crédito</label>
                  <InputNumber v-model="form.dias_credito" class="w-full"
                    :inputClass="`farma-primevue-input w-full ${!modoEdicion ? 'farma-input-disabled' : 'farma-input-editing'}`"
                    :min="0" :useGrouping="false" placeholder="0" :disabled="!modoEdicion" />
                </div>
              </div>
            </article>

            <!-- Observaciones -->
            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Observaciones</p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Notas internas</h2>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-500">Notas</label>
                <Textarea v-model="form.notas" rows="4" class="farma-primevue-input w-full"
                  :class="{ 'farma-input-disabled': !modoEdicion, 'farma-input-editing': modoEdicion }"
                  placeholder="Información adicional del proveedor" autoResize :disabled="!modoEdicion" />
              </div>
            </article>
          </div>

          <!-- ── Aside sticky ──────────────────────────────────────── -->
          <aside class="self-start xl:sticky xl:top-4 space-y-4">
            <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Resumen</p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Vista previa</h2>
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

                <!-- Metadatos -->
                <div class="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Registro</p>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-500">Creado</span>
                    <span class="text-xs font-medium text-slate-700">
                      {{ formatearFecha(proveedorDetalle?.fecha_creacion) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-500">Actualizado</span>
                    <span class="text-xs font-medium text-slate-700">
                      {{ formatearFecha(proveedorDetalle?.fecha_actualizacion) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-500">Status</span>
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      :class="statusClass(proveedorDetalle?.status)">
                      {{ capitalizar(proveedorDetalle?.status) }}
                    </span>
                  </div>
                </div>

                <!-- Tip modo edición -->
                <Transition name="fade-slide">
                  <div v-if="modoEdicion" class="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">Editando</p>
                    <p class="mt-1 text-sm text-amber-700">
                      Modifica los campos y presiona "Guardar cambios" para aplicar los cambios.
                    </p>
                  </div>
                  <div v-else class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <p class="text-xs font-semibold uppercase tracking-widest text-blue-600">Nota</p>
                    <p class="mt-1 text-sm text-blue-700">
                      Presiona "Editar" para modificar la información del proveedor.
                    </p>
                  </div>
                </Transition>
              </div>
            </article>
          </aside>
        </section>
      </form>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         Modal: Desactivar / Activar
    ═══════════════════════════════════════════════════════ -->
    <Dialog v-model:visible="modalStatusVisible" modal :closable="!ejecutando" :style="{ width: '28rem' }" :pt="{
      root: { class: 'farma-dialog-root' },
      mask: { class: 'farma-dialog-mask' },
      header: { style: 'display:none' },
      content: { class: 'farma-dialog-content' },
      footer: { style: 'display:none' },
    }">
      <div class="flex items-start gap-4 p-6 pb-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          :class="nuevoStatus === 'inactivo' ? 'bg-amber-100' : 'bg-emerald-100'">
          <i :class="nuevoStatus === 'inactivo' ? 'pi pi-ban text-amber-600' : 'pi pi-check-circle text-emerald-600'"
            class="text-xl"></i>
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-bold text-slate-900">
            {{ nuevoStatus === 'inactivo' ? 'Desactivar proveedor' : 'Activar proveedor' }}
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-500">
            {{ nuevoStatus === 'inactivo'
              ? 'El proveedor quedará inactivo y no aparecerá en nuevas órdenes de compra.'
              : 'El proveedor quedará activo y disponible para nuevas operaciones.' }}
          </p>
        </div>
      </div>

      <div class="mx-6 mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Proveedor</p>
        <p class="mt-1 text-sm font-semibold text-slate-800">{{ proveedorDetalle?.nombre }}</p>
        <p class="mt-0.5 text-xs text-slate-500">{{ proveedorDetalle?.rfc || 'Sin RFC' }}</p>
      </div>

      <div class="flex items-center justify-end gap-4 border-t border-slate-100 px-6 py-4">

        <!-- Cancelar -->
        <Button label="Cancelar" :disabled="ejecutando" class="
      !rounded-lg
      !bg-slate-100
      !border !border-slate-300
      !text-slate-700
      hover:!bg-slate-200
      !px-4 !py-2
      !text-sm
    " @click="modalStatusVisible = false" />

        <!-- Confirmar -->
        <Button :label="ejecutando ? 'Aplicando...' : (nuevoStatus === 'inactivo' ? 'Desactivar' : 'Activar')"
          :loading="ejecutando" class="!rounded-lg !px-4 !py-2 !text-sm !text-white" :class="nuevoStatus === 'inactivo'
            ? '!bg-amber-500 !border-amber-500 hover:!bg-amber-600'
            : '!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700'
            " @click="confirmarStatus" />

      </div>
    </Dialog>

    <!-- ═══════════════════════════════════════════════════════
         Modal: Eliminar
    ═══════════════════════════════════════════════════════ -->
    <Dialog v-model:visible="modalEliminarVisible" modal :closable="!ejecutando" :style="{ width: '28rem' }" :pt="{
      root: { class: 'farma-dialog-root' },
      mask: { class: 'farma-dialog-mask' },
      header: { style: 'display:none' },
      content: { class: 'farma-dialog-content' },
      footer: { style: 'display:none' },
    }">
      <div class="flex items-start gap-4 p-6 pb-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100">
          <i class="pi pi-trash text-xl text-rose-600"></i>
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-bold text-slate-900">Eliminar proveedor</h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-500">
            Esta acción marcará al proveedor como eliminado. No podrá usarse en nuevas operaciones.
          </p>
        </div>
      </div>

      <div class="mx-6 mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-rose-500">Proveedor a eliminar</p>
        <p class="mt-1 text-sm font-semibold text-rose-900">{{ proveedorDetalle?.nombre }}</p>
        <p class="mt-0.5 text-xs text-rose-600">{{ proveedorDetalle?.rfc || 'Sin RFC' }}</p>
      </div>

      <div class="flex items-center justify-end gap-4 border-t border-slate-100 px-6 py-4">

        <!-- Cancelar -->
        <Button label="Cancelar" :disabled="ejecutando" class="
      !rounded-lg
      !bg-slate-100
      !border !border-slate-300
      !text-slate-700
      hover:!bg-slate-200
      !px-4 !py-2
      !text-sm
    " @click="modalEliminarVisible = false" />

        <!-- Eliminar -->
        <Button :label="ejecutando ? 'Eliminando...' : 'Eliminar'" :loading="ejecutando" class="
      !rounded-lg
      !px-4 !py-2
      !text-sm
      !text-white
      !bg-rose-600
      !border-rose-600
      hover:!bg-rose-700
    " @click="confirmarEliminar" />

      </div>
    </Dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';
import { useProveedoresStore } from '../proveedoresStore';

const route = useRoute();
const router = useRouter();
const proveedoresStore = useProveedoresStore();

// ── Estado ───────────────────────────────────────────────────────────
const cargandoInicial = ref(true);
const modoEdicion = ref(false);
const proveedorDetalle = computed(() => proveedoresStore.proveedorDetalle);
const menuAccionesRef = ref(null);
const modalStatusVisible = ref(false);
const modalEliminarVisible = ref(false);
const nuevoStatus = ref('');
const ejecutando = ref(false);

// Snapshot del form al cargar / guardar — para detectar cambios
const formOriginal = ref({});

const form = ref({
  nombre: '', nombre_comercial: '', rfc: '',
  contacto_nombre: '', contacto_telefono: '', contacto_email: '',
  calle: '', numero_exterior: '', numero_interior: '',
  colonia: '', municipio: '', estado: '', pais: 'México', codigo_postal: '',
  condiciones_pago: '', dias_credito: 0, notas: '',
});

// Detecta si hay campos modificados respecto al snapshot
const hayModificaciones = computed(() => {
  const keys = Object.keys(form.value);
  return keys.some((k) => {
    const a = form.value[k] ?? '';
    const b = formOriginal.value[k] ?? '';
    return String(a) !== String(b);
  });
});

// ── Menú de acciones ─────────────────────────────────────────────────
const menuAcciones = computed(() => {
  const status = proveedorDetalle.value?.status;

  const items = [
    {
      label: modoEdicion.value ? 'Cancelar edición' : 'Editar',
      icon: modoEdicion.value ? 'pi pi-times' : 'pi pi-pencil',
      iconClass: modoEdicion.value ? 'text-slate-500' : 'text-blue-500',
      itemClass: 'text-black font-bold hover:bg-slate-50',
      command: () => {
        cerrarMenuAcciones();

        if (modoEdicion.value) {
          cancelarEdicion();
        } else {
          activarEdicion();
        }
      },
    },
  ];

  if (status === 'activo') {
    items.push({
      label: 'Desactivar',
      icon: 'pi pi-ban',
      iconClass: 'text-amber-500',
      itemClass: 'text-black font-bold hover:bg-amber-50',
      command: () => {
        cerrarMenuAcciones();
        abrirModalStatus('inactivo');
      },
    });
  }

  if (status === 'inactivo') {
    items.push({
      label: 'Activar',
      icon: 'pi pi-check-circle',
      iconClass: 'text-emerald-500',
      itemClass: 'text-black font-bold hover:bg-emerald-50',
      command: () => {
        cerrarMenuAcciones();
        abrirModalStatus('activo');
      },
    });
  }

  if (status !== 'eliminado') {
    items.push({
      label: 'Eliminar',
      icon: 'pi pi-trash',
      iconClass: 'text-rose-500',
      itemClass: 'text-black font-bold hover:bg-rose-50',
      command: () => {
        cerrarMenuAcciones();
        modalEliminarVisible.value = true;
      },
    });
  }

  return items;
});


// ── Helpers ───────────────────────────────────────────────────────────
function capitalizar(valor) {
  if (!valor) return '—';
  return String(valor).charAt(0).toUpperCase() + String(valor).slice(1);
}

function statusClass(status) {
  if (status === 'activo') return 'bg-blue-50 text-blue-700';
  if (status === 'inactivo') return 'bg-slate-100 text-slate-600';
  if (status === 'eliminado') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
}

function formatearFecha(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Poblar formulario ────────────────────────────────────────────────
function poblarFormulario(p) {
  const datos = {
    nombre: p.nombre ?? '',
    nombre_comercial: p.nombre_comercial ?? '',
    rfc: p.rfc ?? '',
    contacto_nombre: p.contacto_nombre ?? '',
    contacto_telefono: p.contacto_telefono ?? '',
    contacto_email: p.contacto_email ?? '',
    calle: p.calle ?? '',
    numero_exterior: p.numero_exterior ?? '',
    numero_interior: p.numero_interior ?? '',
    colonia: p.colonia ?? '',
    municipio: p.municipio ?? '',
    estado: p.estado ?? '',
    pais: p.pais ?? 'México',
    codigo_postal: p.codigo_postal ?? '',
    condiciones_pago: p.condiciones_pago ?? '',
    dias_credito: Number(p.dias_credito ?? 0),
    notas: p.notas ?? '',
  };
  form.value = { ...datos };
  formOriginal.value = { ...datos };
}

// ── Modos edición ────────────────────────────────────────────────────
function activarEdicion() {
  modoEdicion.value = true;
}

function cancelarEdicion() {
  form.value = { ...formOriginal.value };
  modoEdicion.value = false;
}

// ── Payload ──────────────────────────────────────────────────────────
function construirPayload() {
  const f = form.value;
  return {
    nombre: f.nombre || undefined,
    nombre_comercial: f.nombre_comercial || null,
    rfc: f.rfc || null,
    contacto_nombre: f.contacto_nombre || null,
    contacto_telefono: f.contacto_telefono || null,
    contacto_email: f.contacto_email || null,
    calle: f.calle || null,
    numero_exterior: f.numero_exterior || null,
    numero_interior: f.numero_interior || null,
    colonia: f.colonia || null,
    municipio: f.municipio || null,
    estado: f.estado || null,
    pais: f.pais || null,
    codigo_postal: f.codigo_postal || null,
    condiciones_pago: f.condiciones_pago || null,
    dias_credito: Number(f.dias_credito ?? 0),
    notas: f.notas || null,
  };
}

// ── Submit ───────────────────────────────────────────────────────────
async function submitForm() {
  if (!proveedorDetalle.value || !hayModificaciones.value) return;
  try {
    await proveedoresStore.actualizarProveedor(route.params.uuid, construirPayload());
    const p = await proveedoresStore.obtenerProveedorPorUUID(route.params.uuid);
    if (p) poblarFormulario(p);
    modoEdicion.value = false;
  } catch (_) { /* manejado en store */ }
}

// ── Acciones de status ───────────────────────────────────────────────
function abrirModalStatus(status) {
  nuevoStatus.value = status;
  modalStatusVisible.value = true;
}

async function confirmarStatus() {
  ejecutando.value = true;
  try {
    await proveedoresStore.cambiarStatusProveedor(route.params.uuid, nuevoStatus.value);
    modalStatusVisible.value = false;
    await proveedoresStore.obtenerProveedorPorUUID(route.params.uuid);
  } catch (_) { /* */ } finally { ejecutando.value = false; }
}

async function confirmarEliminar() {
  ejecutando.value = true;
  try {
    await proveedoresStore.cambiarStatusProveedor(route.params.uuid, 'eliminado');
    modalEliminarVisible.value = false;
    router.push('/proveedores');
  } catch (_) { /* */ } finally { ejecutando.value = false; }
}

function cerrarMenuAcciones() {
  menuAccionesRef.value?.hide();
}

// ── Ciclo de vida ─────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const p = await proveedoresStore.obtenerProveedorPorUUID(route.params.uuid);
    if (p) poblarFormulario(p);
  } finally {
    cargandoInicial.value = false;
  }
});
</script>

<style scoped>
/* ── Inputs ── */
.farma-primevue-input {
  width: 100%;
  border-radius: 0.9rem !important;
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
  padding: 0.72rem 0.95rem !important;
  box-shadow: none !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease !important;
}

.farma-input-disabled {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #475569 !important;
  cursor: default !important;
  pointer-events: none;
}

.farma-input-editing {
  background: #ffffff !important;
  border: 1px solid #93c5fd !important;
  color: #0f172a !important;
}

.farma-input-editing:focus,
.farma-input-editing.p-focus {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
  outline: none !important;
}

:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-inputnumber-input) {
  border-radius: 0.9rem !important;
  font-size: 0.875rem !important;
  padding: 0.72rem 0.95rem !important;
  box-shadow: none !important;
  transition: border-color 0.2s ease, background 0.2s ease !important;
}

:deep(.p-textarea) {
  border-radius: 0.9rem !important;
  font-size: 0.875rem !important;
  padding: 0.72rem 0.95rem !important;
  min-height: 110px;
  resize: vertical;
  box-shadow: none !important;
}


/* ── Botones ── */
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
  cursor: pointer;
}

.farma-btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.16);
}

.farma-btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.farma-btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.farma-btn-ghost {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
}

.farma-btn-ghost:hover:not(:disabled) {
  background: #f8fafc;
  color: #0f172a;
}

.farma-btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


/* ── Cards ── */
.card-base {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}


/* ── Transición fade-slide ── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}


/* =====================================================
   GLOBAL
   Componentes PrimeVue con teleport a body
   ===================================================== */

/* ── Menu popup ── */
:global(.farma-menu-popup) {
  border-radius: 1rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.14) !important;
  overflow: hidden !important;
  padding: 0.375rem !important;
  min-width: 10rem !important;
  background: #ffffff !important;
}

:global(.farma-menu-popup .p-menu-list) {
  padding: 0 !important;
}

:global(.farma-menu-popup .p-menuitem) {
  border-radius: 0.75rem !important;
  overflow: hidden !important;
}

:global(.farma-menu-popup .p-menuitem-link) {
  padding: 0 !important;
  background: transparent !important;
}

:global(.farma-menu-popup .p-menuitem-link:hover) {
  background: transparent !important;
}


/* ── Modales ── */
:global(.farma-dialog-root) {
  border-radius: 1.25rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.18) !important;
  overflow: hidden !important;
  background: #ffffff !important;
}

:global(.farma-dialog-mask) {
  background: rgba(15, 23, 42, 0.5) !important;
  backdrop-filter: blur(3px) !important;
}

:global(.farma-dialog-content) {
  padding: 0 !important;
  background: #ffffff !important;
}
</style>
