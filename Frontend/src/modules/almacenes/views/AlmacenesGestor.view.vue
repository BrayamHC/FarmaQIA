<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/inventario" class="transition hover:text-slate-600">Inventario</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Almacenes</span>
      </nav>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-building text-base text-white"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Gestor de Almacenes
            </h1>
            <p class="text-sm text-slate-500">
              Administre almacenes, responsables y estado operativo por sucursal.
            </p>
          </div>
        </div>

        <button
          class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          @click="abrirCrear">
          <i class="pi pi-plus text-sm"></i>
          <span>Nuevo almacén</span>
        </button>
      </div>
    </header>

    <div class="farma-filtros-bar">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label class="input-label text-xs font-medium text-slate-500">Nombre</label>
          <div class="relative">
            <i class="pi pi-search farma-search-icon"></i>
            <input v-model="filtros.nombre" type="text" placeholder="Buscar almacén..." class="farma-search-input"
              @input="onBuscarInput" />
          </div>
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Encargado</label>
          <div class="relative">
            <i class="pi pi-user farma-search-icon"></i>
            <input v-model="filtros.encargado" type="text" placeholder="Nombre del encargado" class="farma-search-input"
              @input="onBuscarInput" />
          </div>
        </div>

        <div>
          <label class="input-label text-xs font-medium text-slate-500">Status</label>
          <select v-model="filtros.status" class="farma-select-input" @change="aplicarFiltros">
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="eliminado">Eliminado</option>
          </select>
        </div>

        <div class="flex items-end justify-end gap-2 xl:col-span-2">
          <button class="farma-btn-limpiar" title="Limpiar filtros" @click="limpiarTodo">
            <i class="pi pi-filter-slash text-sm"></i>
          </button>
          <button class="farma-btn-buscar" @click="aplicarFiltros">
            <i class="pi pi-search text-sm"></i>
            <span>Buscar</span>
          </button>
        </div>
      </div>

      <div class="farma-filtros-activos-reserva">
        <div v-if="hayFiltrosActivos" class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs font-medium text-slate-400">Filtros activos</span>

          <span v-if="filtros.nombre"
            class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <i class="pi pi-search text-[10px]"></i>
            {{ filtros.nombre }}
            <button class="ml-0.5 hover:text-blue-900" @click="limpiarFiltro('nombre')">
              <i class="pi pi-times text-[10px]"></i>
            </button>
          </span>

          <span v-if="filtros.encargado"
            class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <i class="pi pi-user text-[10px]"></i>
            {{ filtros.encargado }}
            <button class="ml-0.5 hover:text-blue-900" @click="limpiarFiltro('encargado')">
              <i class="pi pi-times text-[10px]"></i>
            </button>
          </span>

          <span v-if="filtros.status"
            class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <i class="pi pi-tag text-[10px]"></i>
            {{ capitalizar(filtros.status) }}
            <button class="ml-0.5 hover:text-blue-900" @click="limpiarFiltro('status')">
              <i class="pi pi-times text-[10px]"></i>
            </button>
          </span>
        </div>
      </div>
    </div>

    <article class="card-base farma-table-shell flex min-h-0 flex-1 flex-col">
      <div class="farma-table-content app-scroll min-h-0 flex-1">
        <DataTable :value="almacenesTabla" scrollable scrollHeight="flex" dataKey="almacen_uuid"
          :tableStyle="{ minWidth: '100%' }" :loading="almacenesStore.cargando" stripedRows
          class="almacenes-table h-full">
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <i class="pi pi-building text-2xl text-slate-300"></i>
              </div>
              <p class="text-sm font-medium text-slate-500">
                {{ almacenesStore.cargando ? 'Cargando almacenes...' : 'No se encontraron almacenes' }}
              </p>
              <p class="mt-1 text-xs text-slate-400">
                {{ almacenesStore.cargando ? 'Espera un momento' : 'Intenta ajustar los filtros de búsqueda' }}
              </p>
            </div>
          </template>

          <Column field="nombre" header="Nombre" style="width: 220px">
            <template #body="slotProps">
              <div>
                <button type="button" class="group text-left" @click="abrirDetalle(slotProps.data)">
                  <p class="text-sm font-semibold text-slate-800 transition group-hover:text-blue-600">
                    {{ slotProps.data.nombre }}
                  </p>
                </button>
                <p class="text-xs text-slate-400">
                  {{ slotProps.data.sucursal_nombre || 'Sin sucursal' }}
                </p>
              </div>
            </template>
          </Column>

          <Column field="descripcion" header="Descripción">
            <template #body="slotProps">
              <span class="line-clamp-1 text-sm text-slate-500">{{ slotProps.data.descripcion || '—' }}</span>
            </template>
          </Column>

          <Column field="encargado" header="Encargado" style="width: 220px">
            <template #body="slotProps">
              <span class="text-sm text-slate-600">{{ slotProps.data.encargado || '—' }}</span>
            </template>
          </Column>

          <Column field="telefono" header="Teléfono" style="width: 150px">
            <template #body="slotProps">
              <span class="text-sm text-slate-600">{{ slotProps.data.telefono || '—' }}</span>
            </template>
          </Column>

          <Column field="direccion" header="Dirección" style="width: 220px">
            <template #body="slotProps">
              <span class="line-clamp-1 text-sm text-slate-500">{{ slotProps.data.direccion || '—' }}</span>
            </template>
          </Column>

          <Column field="status" header="Status" style="width: 120px">
            <template #body="slotProps">
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(slotProps.data.status)">
                {{ capitalizar(slotProps.data.status) }}
              </span>
            </template>
          </Column>

          <Column field="fecha_creacion" header="Creación" style="width: 140px">
            <template #body="slotProps">
              <span class="text-xs text-slate-500">{{ formatearFechaTexto(slotProps.data.fecha_creacion) }}</span>
            </template>
          </Column>

          <Column header="Acciones" style="width: 180px">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <button class="farma-action-btn text-blue-600 hover:bg-blue-50" title="Editar almacén"
                  @click="abrirEditar(slotProps.data)">
                  <i class="pi pi-pencil"></i>
                </button>

                <button v-if="slotProps.data.status === 'activo'"
                  class="farma-action-btn text-amber-600 hover:bg-amber-50" title="Desactivar"
                  @click="abrirConfirmacionStatus(slotProps.data, 'inactivo')">
                  <i class="pi pi-ban"></i>
                </button>

                <button v-if="slotProps.data.status === 'inactivo'"
                  class="farma-action-btn text-emerald-600 hover:bg-emerald-50" title="Activar"
                  @click="abrirConfirmacionStatus(slotProps.data, 'activo')">
                  <i class="pi pi-check-circle"></i>
                </button>

                <button v-if="slotProps.data.status !== 'eliminado'"
                  class="farma-action-btn text-rose-600 hover:bg-rose-50" title="Eliminar"
                  @click="abrirConfirmacionStatus(slotProps.data, 'eliminado')">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <footer class="farma-paginator-wrap shrink-0">
        <Paginator :first="first" :rows="rows" :totalRecords="totalRegistros" :rowsPerPageOptions="[10, 20, 30]"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}" class="farma-paginator" @page="onPage" />
      </footer>
    </article>

    <Dialog v-model:visible="modalVisible" modal appendTo="body" :closable="!guardando" :dismissableMask="!guardando"
      :draggable="false" :style="{ width: 'min(42rem, 96vw)' }" class="farma-dialog" :pt="{
        mask: { class: 'farma-dialog-mask' },
        root: { class: 'farma-dialog-root' },
        header: { class: 'farma-dialog-header-shell' },
        content: { class: 'farma-dialog-content-shell' },
        closeButton: { class: 'farma-dialog-close-btn' },
        closeButtonIcon: { class: 'farma-dialog-close-icon' }
      }">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-building text-white"></i>
          </div>

          <div class="min-w-0">
            <h2 class="text-lg font-bold text-slate-900" style="font-family: var(--font-title)">
              {{ modoEdicion ? 'Editar almacén' : 'Nuevo almacén' }}
            </h2>
            <p class="text-sm text-slate-500">
              Capture la información general del almacén.
            </p>
          </div>
        </div>
      </template>

      <form class="grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="guardarAlmacen">
        <div class="md:col-span-2">
          <label class="farma-label">Nombre *</label>
          <input v-model.trim="form.nombre" type="text" class="farma-input" maxlength="150" />
          <p v-if="errores.nombre" class="farma-error">{{ errores.nombre }}</p>
        </div>

        <div class="md:col-span-2">
          <label class="farma-label">Descripción</label>
          <textarea v-model.trim="form.descripcion" rows="3" class="farma-textarea" maxlength="500"></textarea>
          <p v-if="errores.descripcion" class="farma-error">{{ errores.descripcion }}</p>
        </div>

        <div>
          <label class="farma-label">Encargado</label>
          <input v-model.trim="form.encargado" type="text" class="farma-input" maxlength="150" />
          <p v-if="errores.encargado" class="farma-error">{{ errores.encargado }}</p>
        </div>

        <div>
          <label class="farma-label">Teléfono</label>
          <input v-model.trim="form.telefono" type="text" class="farma-input" maxlength="20" />
          <p v-if="errores.telefono" class="farma-error">{{ errores.telefono }}</p>
        </div>

        <div class="md:col-span-2">
          <label class="farma-label">Dirección</label>
          <textarea v-model.trim="form.direccion" rows="3" class="farma-textarea" maxlength="300"></textarea>
          <p v-if="errores.direccion" class="farma-error">{{ errores.direccion }}</p>
        </div>

        <div class="md:col-span-2 flex items-center justify-end gap-2 border-t border-slate-200/80 pt-4">
          <button type="button" class="farma-btn-secundario" :disabled="guardando" @click="cerrarModal">
            Cancelar
          </button>

          <button type="submit" class="farma-btn-primario" :disabled="guardando">
            <i v-if="guardando" class="pi pi-spin pi-spinner text-sm"></i>
            <span>{{ guardando ? 'Guardando...' : modoEdicion ? 'Actualizar almacén' : 'Crear almacén' }}</span>
          </button>
        </div>
      </form>
    </Dialog>

    <Dialog v-model:visible="confirmacionVisible" modal appendTo="body" :closable="!cambiandoStatus"
      :dismissableMask="!cambiandoStatus" :draggable="false" :style="{ width: 'min(30rem, 92vw)' }" class="farma-dialog"
      :pt="{
        mask: { class: 'farma-dialog-mask' },
        root: { class: 'farma-dialog-root farma-confirm-root' },
        header: { class: 'farma-dialog-header-shell' },
        content: { class: 'farma-dialog-content-shell' },
        closeButton: { class: 'farma-dialog-close-btn' },
        closeButtonIcon: { class: 'farma-dialog-close-icon' }
      }">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" :class="confirmacionIconoClase">
            <i :class="confirmacionIcono"></i>
          </div>

          <div class="min-w-0">
            <h2 class="text-lg font-bold text-slate-900" style="font-family: var(--font-title)">
              {{ confirmacionTitulo }}
            </h2>
            <p class="text-sm text-slate-500">
              Confirme la acción sobre el almacén seleccionado.
            </p>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p class="text-sm text-slate-600">
            {{ confirmacionMensaje }}
          </p>

          <div v-if="almacenConfirmacion" class="mt-3 rounded-xl border border-white/70 bg-white/90 p-3">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Almacén</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">
              {{ almacenConfirmacion.nombre || 'Sin nombre' }}
            </p>
            <p class="mt-0.5 text-xs text-slate-500">
              {{ almacenConfirmacion.encargado || 'Sin encargado' }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-slate-200/80 pt-4">
          <button type="button" class="farma-btn-secundario" :disabled="cambiandoStatus"
            @click="cerrarConfirmacionStatus">
            Cancelar
          </button>

          <button type="button" class="farma-btn-confirmar" :class="confirmacionBotonClase" :disabled="cambiandoStatus"
            @click="ejecutarCambioStatus">
            <i v-if="cambiandoStatus" class="pi pi-spin pi-spinner text-sm"></i>
            <i v-else :class="confirmacionIcono"></i>
            <span>{{ cambiandoStatus ? 'Procesando...' : confirmacionBotonTexto }}</span>
          </button>
        </div>
      </div>
    </Dialog>

    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="detalleVisible" class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
          @click="cerrarDetalle" />
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="drawer">
        <aside v-if="detalleVisible" class="fixed inset-y-0 right-0 z-50 flex flex-col overflow-hidden bg-white"
          style="width: min(52rem, 94vw); box-shadow: var(--shadow-lg);">
          <div
            class="flex items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                <i class="pi pi-building text-white"></i>
              </div>
              <div>
                <h2 class="text-xl font-bold text-slate-900" style="font-family: var(--font-title)">
                  Detalle del almacén
                </h2>
                <p class="text-sm text-slate-500">
                  Información general, stock y productos del almacén.
                </p>
              </div>
            </div>

            <button
              class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              @click="cerrarDetalle">
              <i class="pi pi-times text-base"></i>
            </button>
          </div>

          <div class="flex min-h-0 flex-1 flex-col px-6 py-6">
            <div v-if="almacenesStore.cargandoDetalle" class="space-y-4">
              <div class="h-36 animate-pulse rounded-2xl bg-slate-100"></div>
              <div class="grid grid-cols-2 gap-3">
                <div class="h-20 animate-pulse rounded-xl bg-slate-100"></div>
                <div class="h-20 animate-pulse rounded-xl bg-slate-100"></div>
                <div class="h-20 animate-pulse rounded-xl bg-slate-100"></div>
                <div class="h-20 animate-pulse rounded-xl bg-slate-100"></div>
              </div>
              <div class="flex-1 rounded-2xl bg-slate-100"></div>
            </div>

            <div v-else-if="almacenDetalle" class="flex min-h-0 flex-1 flex-col gap-5">
              <section class="rounded-2xl border border-blue-100/60 bg-gradient-to-br from-blue-50 to-white p-5">
                <div class="flex flex-col gap-4 md:flex-row md:items-start">
                  <div
                    class="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm">
                    <i class="pi pi-building text-3xl text-blue-300"></i>
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-semibold uppercase tracking-widest text-blue-600">
                      {{ almacenDetalle.sucursal_nombre || 'Sin sucursal' }}
                    </p>

                    <h3 class="mt-1 text-lg font-bold text-slate-900">
                      {{ almacenDetalle.nombre || 'Almacén sin nombre' }}
                    </h3>

                    <p class="mt-1 text-sm leading-relaxed text-slate-600">
                      {{ almacenDetalle.descripcion || 'Sin descripción' }}
                    </p>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Encargado: {{ almacenDetalle.encargado || 'Sin encargado' }}
                      </span>

                      <span class="rounded-full px-3 py-1 text-xs font-semibold"
                        :class="statusClass(almacenDetalle.status)">
                        {{ capitalizar(almacenDetalle.status) }}
                      </span>
                    </div>

                    <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div class="rounded-xl border border-white/70 bg-white/80 p-3">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Teléfono</p>
                        <p class="mt-1 text-sm font-medium text-slate-900">
                          {{ almacenDetalle.telefono || '—' }}
                        </p>
                      </div>

                      <div class="rounded-xl border border-white/70 bg-white/80 p-3 md:col-span-2">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Dirección</p>
                        <p class="mt-1 text-sm font-medium text-slate-900">
                          {{ almacenDetalle.direccion || '—' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Resumen del almacén
                </p>

                <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Total productos
                    </p>
                    <p class="mt-1 text-base font-bold text-slate-900">
                      {{ almacenDetalle.resumen?.total_productos ?? 0 }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-blue-400">
                      Stock total
                    </p>
                    <p class="mt-1 text-base font-bold text-blue-600">
                      {{ formatearNumero(almacenDetalle.resumen?.stock_total_actual ?? 0) }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-amber-500">
                      Stock bajo
                    </p>
                    <p class="mt-1 text-base font-bold text-amber-600">
                      {{ almacenDetalle.resumen?.productos_stock_bajo ?? 0 }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-rose-500">
                      Sin stock
                    </p>
                    <p class="mt-1 text-base font-bold text-rose-600">
                      {{ almacenDetalle.resumen?.productos_sin_stock ?? 0 }}
                    </p>
                  </div>
                </div>
              </section>

              <section class="flex min-h-0 flex-1 flex-col">
                <div class="mb-3 shrink-0">
                  <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Productos asociados
                  </p>
                  <p class="mt-1 text-sm text-slate-500">
                    Stock actual, mínimos y máximos configurados.
                  </p>
                </div>

                <div v-if="almacenDetalle.productos?.length"
                  class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div class="farma-drawer-table-scroll overflow-x-auto overflow-y-auto">
                    <table class="min-w-full divide-y divide-slate-200">
                      <thead class="sticky top-0 z-10 bg-slate-50">
                        <tr>
                          <th
                            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Producto
                          </th>
                          <th
                            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                            SKU
                          </th>
                          <th
                            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Stock actual
                          </th>
                          <th
                            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Stock mín.
                          </th>
                          <th
                            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Stock máx.
                          </th>
                          <th
                            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Estado
                          </th>
                        </tr>
                      </thead>

                      <tbody class="divide-y divide-slate-100 bg-white">
                        <tr v-for="producto in almacenDetalle.productos" :key="producto.stock_almacen_uuid">
                          <td class="px-4 py-3">
                            <div>
                              <p class="text-sm font-semibold text-slate-900">
                                {{ producto.producto_nombre || 'Producto sin nombre' }}
                              </p>
                              <p class="text-xs text-slate-400">
                                {{ producto.codigo_barras || producto.upc || 'Sin código de barras' }}
                              </p>
                            </div>
                          </td>

                          <td class="px-4 py-3 text-sm text-slate-600">
                            {{ producto.sku || '—' }}
                          </td>

                          <td class="px-4 py-3 text-sm font-semibold text-slate-900">
                            {{ formatearNumero(producto.stock_actual) }}
                          </td>

                          <td class="px-4 py-3 text-sm text-slate-600">
                            {{ formatearNumero(producto.stock_minimo) }}
                          </td>

                          <td class="px-4 py-3 text-sm text-slate-600">
                            {{ formatearNumero(producto.stock_maximo) }}
                          </td>

                          <td class="px-4 py-3">
                            <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                              :class="stockEstadoClass(producto.stock_estado)">
                              {{ capitalizarEstadoStock(producto.stock_estado) }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div v-else
                  class="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4">
                  <p class="text-sm text-slate-500">No hay productos asociados a este almacén.</p>
                </div>
              </section>

              <section class="shrink-0">
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Auditoría
                </p>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Fecha creación</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ formatearFechaTexto(almacenDetalle.fecha_creacion) }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Fecha actualización
                    </p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ formatearFechaTexto(almacenDetalle.fecha_actualizacion) }}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div v-else class="flex h-full items-center justify-center py-16">
              <div class="text-center">
                <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <i class="pi pi-building text-2xl text-slate-300"></i>
                </div>
                <p class="text-sm font-medium text-slate-500">No se pudo cargar el detalle</p>
              </div>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import Dialog from 'primevue/dialog';
import { useAlmacenesStore } from '../almacenesStore';
import { useAuthStore } from '@/modules/auth/authStore';

const almacenesStore = useAlmacenesStore();
const authStore = useAuthStore();

const filtros = ref({
  nombre: '',
  encargado: '',
  status: '',
});

const first = ref(0);
const rows = ref(10);
const guardando = ref(false);
const modalVisible = ref(false);
const modoEdicion = ref(false);
const detalleVisible = ref(false);
const almacenEditando = ref(null);

const confirmacionVisible = ref(false);
const cambiandoStatus = ref(false);
const almacenConfirmacion = ref(null);
const statusObjetivo = ref('');

let busquedaTimeout = null;

const formInicial = () => ({
  nombre: '',
  descripcion: '',
  encargado: '',
  direccion: '',
  telefono: '',
});

const form = reactive(formInicial());
const errores = reactive({
  nombre: '',
  descripcion: '',
  encargado: '',
  direccion: '',
  telefono: '',
});

const totalRegistros = computed(() => Number(almacenesStore.total || 0));
const paginaActual = computed(() => Math.floor(first.value / rows.value) + 1);
const almacenesTabla = computed(() => (almacenesStore.cargando ? [] : (almacenesStore.almacenes ?? [])));
const almacenDetalle = computed(() => almacenesStore.almacenDetalle);
const hayFiltrosActivos = computed(() => Boolean(filtros.value.nombre || filtros.value.encargado || filtros.value.status));

const confirmacionTitulo = computed(() => {
  if (statusObjetivo.value === 'inactivo') return 'Desactivar almacén';
  if (statusObjetivo.value === 'eliminado') return 'Eliminar almacén';
  if (statusObjetivo.value === 'activo') return 'Activar almacén';
  return 'Confirmar acción';
});

const confirmacionMensaje = computed(() => {
  const nombre = almacenConfirmacion.value?.nombre || 'este almacén';

  if (statusObjetivo.value === 'inactivo') {
    return `¿Deseas desactivar el almacén "${nombre}"? Podrás activarlo nuevamente más adelante.`;
  }

  if (statusObjetivo.value === 'eliminado') {
    return `¿Deseas eliminar el almacén "${nombre}"? Esta acción cambiará su estado a eliminado.`;
  }

  if (statusObjetivo.value === 'activo') {
    return `¿Deseas activar nuevamente el almacén "${nombre}"?`;
  }

  return 'Confirma la acción seleccionada.';
});

const confirmacionBotonTexto = computed(() => {
  if (statusObjetivo.value === 'inactivo') return 'Sí, desactivar';
  if (statusObjetivo.value === 'eliminado') return 'Sí, eliminar';
  if (statusObjetivo.value === 'activo') return 'Sí, activar';
  return 'Confirmar';
});

const confirmacionBotonClase = computed(() => {
  if (statusObjetivo.value === 'eliminado') return 'farma-btn-danger';
  if (statusObjetivo.value === 'inactivo') return 'farma-btn-warning';
  return 'farma-btn-success';
});

const confirmacionIcono = computed(() => {
  if (statusObjetivo.value === 'eliminado') return 'pi pi-trash text-white';
  if (statusObjetivo.value === 'inactivo') return 'pi pi-ban text-white';
  return 'pi pi-check-circle text-white';
});

const confirmacionIconoClase = computed(() => {
  if (statusObjetivo.value === 'eliminado') return 'bg-rose-600';
  if (statusObjetivo.value === 'inactivo') return 'bg-amber-500';
  return 'bg-emerald-600';
});

function limpiarErrores() {
  Object.keys(errores).forEach((key) => {
    errores[key] = '';
  });
}

function resetForm() {
  Object.assign(form, formInicial());
  limpiarErrores();
}

function capitalizar(valor) {
  if (!valor) return '—';
  return String(valor).charAt(0).toUpperCase() + String(valor).slice(1);
}

function capitalizarEstadoStock(valor) {
  if (!valor) return 'Normal';
  if (valor === 'sin_stock') return 'Sin stock';
  if (valor === 'stock_bajo') return 'Stock bajo';
  if (valor === 'bajo') return 'Stock bajo';
  if (valor === 'sobrestock') return 'Sobrestock';
  return capitalizar(valor);
}

function statusClass(status) {
  if (status === 'activo') return 'bg-blue-50 text-blue-700';
  if (status === 'inactivo') return 'bg-slate-100 text-slate-600';
  if (status === 'eliminado') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
}

function stockEstadoClass(status) {
  if (status === 'sin_stock') return 'bg-rose-50 text-rose-700';
  if (status === 'stock_bajo' || status === 'bajo') return 'bg-amber-50 text-amber-700';
  if (status === 'sobrestock') return 'bg-violet-50 text-violet-700';
  return 'bg-emerald-50 text-emerald-700';
}

function formatearFechaTexto(value) {
  if (!value) return '—';
  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) return value;

  return fecha.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatearNumero(value) {
  return Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function validarForm() {
  limpiarErrores();
  let valido = true;

  if (!form.nombre || form.nombre.trim().length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres';
    valido = false;
  }

  if ((form.descripcion || '').length > 500) {
    errores.descripcion = 'La descripción no puede exceder 500 caracteres';
    valido = false;
  }

  if ((form.encargado || '').length > 150) {
    errores.encargado = 'El encargado no puede exceder 150 caracteres';
    valido = false;
  }

  if ((form.direccion || '').length > 300) {
    errores.direccion = 'La dirección no puede exceder 300 caracteres';
    valido = false;
  }

  if ((form.telefono || '').length > 20) {
    errores.telefono = 'El teléfono no puede exceder 20 caracteres';
    valido = false;
  }

  return valido;
}

function buildPayload() {
  const payload = {
    nombre: form.nombre?.trim() || undefined,
    descripcion: form.descripcion?.trim() || undefined,
    encargado: form.encargado?.trim() || undefined,
    direccion: form.direccion?.trim() || undefined,
    telefono: form.telefono?.trim() || undefined,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  );
}

async function cargarAlmacenes() {
  await almacenesStore.obtenerAlmacenes({
    page: paginaActual.value,
    limit: rows.value,
    nombre: filtros.value.nombre || undefined,
    encargado: filtros.value.encargado || undefined,
    status: filtros.value.status || undefined,
  });
}

function onBuscarInput() {
  clearTimeout(busquedaTimeout);
  busquedaTimeout = setTimeout(() => {
    aplicarFiltros();
  }, 350);
}

async function aplicarFiltros() {
  first.value = 0;
  await cargarAlmacenes();
}

async function limpiarFiltro(campo) {
  filtros.value[campo] = '';
  first.value = 0;
  await cargarAlmacenes();
}

async function limpiarTodo() {
  filtros.value = {
    nombre: '',
    encargado: '',
    status: '',
  };
  first.value = 0;
  await cargarAlmacenes();
}

async function onPage(event) {
  first.value = event.first;
  rows.value = event.rows;
  await cargarAlmacenes();
}

function abrirCrear() {
  modoEdicion.value = false;
  almacenEditando.value = null;
  resetForm();
  modalVisible.value = true;
}

function abrirEditar(almacen) {
  modoEdicion.value = true;
  almacenEditando.value = almacen;
  resetForm();

  Object.assign(form, {
    nombre: almacen.nombre || '',
    descripcion: almacen.descripcion || '',
    encargado: almacen.encargado || '',
    direccion: almacen.direccion || '',
    telefono: almacen.telefono || '',
  });

  modalVisible.value = true;
}

async function abrirDetalle(almacen) {
  detalleVisible.value = true;

  try {
    await almacenesStore.obtenerAlmacenDetalle(almacen.almacen_uuid);
  } catch (_error) {
  }
}

function cerrarDetalle() {
  detalleVisible.value = false;
  almacenesStore.limpiarDetalle();
}

function cerrarModal(forzado = false) {
  if (guardando.value && !forzado) return;

  modalVisible.value = false;
  almacenEditando.value = null;
  modoEdicion.value = false;
  resetForm();
}

function cerrarModalExito() {
  modalVisible.value = false;
  almacenEditando.value = null;
  modoEdicion.value = false;
  resetForm();
}

async function guardarAlmacen() {
  if (!validarForm()) return;

  guardando.value = true;

  try {
    const payload = buildPayload();

    if (modoEdicion.value && almacenEditando.value?.almacen_uuid) {
      await almacenesStore.actualizarAlmacen(
        almacenEditando.value.almacen_uuid,
        payload
      );
    } else {
      await almacenesStore.crearAlmacen(payload);
    }

    cerrarModalExito();
    await cargarAlmacenes();
  } catch (_error) {
  } finally {
    guardando.value = false;
  }
}

function abrirConfirmacionStatus(almacen, status) {
  almacenConfirmacion.value = almacen;
  statusObjetivo.value = status;
  confirmacionVisible.value = true;
}

function cerrarConfirmacionStatus() {
  if (cambiandoStatus.value) return;

  confirmacionVisible.value = false;
  almacenConfirmacion.value = null;
  statusObjetivo.value = '';
}

function cerrarConfirmacionExito() {
  confirmacionVisible.value = false;
  almacenConfirmacion.value = null;
  statusObjetivo.value = '';
}

async function ejecutarCambioStatus() {
  if (!almacenConfirmacion.value?.almacen_uuid || !statusObjetivo.value) return;

  cambiandoStatus.value = true;

  try {
    await almacenesStore.cambiarStatusAlmacen(
      almacenConfirmacion.value.almacen_uuid,
      statusObjetivo.value
    );

    cerrarConfirmacionExito();
    await cargarAlmacenes();
  } catch (_error) {
  } finally {
    cambiandoStatus.value = false;
  }
}

watch(
  () => authStore.sucursalActiva?.sucursal_uuid,
  async (nueva, anterior) => {
    if (!nueva || nueva === anterior) return;
    first.value = 0;
    await cargarAlmacenes();
  }
);

onMounted(async () => {
  await cargarAlmacenes();
});

onBeforeUnmount(() => {
  clearTimeout(busquedaTimeout);
});
</script>

<style scoped>
.farma-table-shell {
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 1rem;
  background: #ffffff;
  overflow: hidden;
}

.farma-table-content {
  min-height: 0;
  overflow: hidden;
}

.almacenes-table {
  height: 100%;
}

.almacenes-table :deep(.p-datatable) {
  height: 100%;
}

.almacenes-table :deep(.p-datatable-table-container) {
  height: 100%;
}

.almacenes-table :deep(.p-datatable-wrapper) {
  height: 100%;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-secondary) transparent;
}

.almacenes-table :deep(.p-datatable-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.almacenes-table :deep(.p-datatable-wrapper::-webkit-scrollbar-track) {
  background: transparent;
  border-radius: 9999px;
}

.almacenes-table :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: var(--color-secondary);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.almacenes-table :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb:hover) {
  background: var(--color-primary);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.almacenes-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.14);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 1;
}

.almacenes-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.72rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.08);
}

.almacenes-table :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

.almacenes-table :deep(.p-datatable-tbody > tr:hover > td) {
  background: rgba(59, 130, 246, 0.03);
}

.farma-filtros-activos-reserva {
  min-height: 1rem;
  margin-top: 0.75rem;
}

.farma-search-input,
.farma-select-input,
.farma-input,
.farma-textarea {
  width: 100%;
  min-height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
  padding: 0.625rem 0.9rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.farma-search-input {
  padding-left: 2.4rem;
}

.farma-search-input:focus,
.farma-select-input:focus,
.farma-input:focus,
.farma-textarea:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.farma-search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
}

.farma-label,
.input-label {
  display: block;
  margin-bottom: 0.45rem;
}

.farma-textarea {
  min-height: auto;
  resize: vertical;
}

.farma-btn-limpiar,
.farma-btn-buscar,
.farma-btn-primario,
.farma-btn-secundario,
.farma-btn-confirmar,
.farma-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.85rem;
  transition: all 0.18s ease;
}

.farma-btn-limpiar {
  width: 42px;
  height: 42px;
  border: 1px solid #e2e8f0;
  color: #64748b;
  background: #fff;
}

.farma-btn-limpiar:hover {
  background: #f8fafc;
  color: #334155;
}

.farma-btn-buscar,
.farma-btn-primario {
  min-height: 42px;
  padding: 0 1rem;
  background: #2563eb;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
}

.farma-btn-buscar:hover,
.farma-btn-primario:hover {
  background: #1d4ed8;
}

.farma-btn-secundario {
  min-height: 42px;
  padding: 0 1rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
}

.farma-btn-secundario:hover {
  background: #f8fafc;
}

.farma-btn-confirmar {
  min-height: 42px;
  padding: 0 1rem;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
}

.farma-btn-warning {
  background: #f59e0b;
}

.farma-btn-warning:hover {
  background: #d97706;
}

.farma-btn-danger {
  background: #e11d48;
}

.farma-btn-danger:hover {
  background: #be123c;
}

.farma-btn-success {
  background: #059669;
}

.farma-btn-success:hover {
  background: #047857;
}

.farma-action-btn {
  width: 34px;
  height: 34px;
}

.farma-error {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #e11d48;
}

.farma-paginator-wrap {
  flex-shrink: 0;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: #fff;
  padding: 0.75rem 1rem;
}

.farma-paginator :deep(.p-paginator) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.farma-paginator :deep(.p-paginator-content) {
  gap: 0.25rem;
}

.farma-paginator :deep(.p-paginator-page),
.farma-paginator :deep(.p-paginator-first),
.farma-paginator :deep(.p-paginator-prev),
.farma-paginator :deep(.p-paginator-next),
.farma-paginator :deep(.p-paginator-last) {
  min-width: 2rem;
  height: 2rem;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0.65rem;
  color: #64748b;
  background: transparent;
  transition: all 0.18s ease;
}

.farma-paginator :deep(.p-paginator-page:hover),
.farma-paginator :deep(.p-paginator-first:hover),
.farma-paginator :deep(.p-paginator-prev:hover),
.farma-paginator :deep(.p-paginator-next:hover),
.farma-paginator :deep(.p-paginator-last:hover) {
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
}

.farma-paginator :deep(.p-paginator-page.p-highlight) {
  background: #2563eb !important;
  color: #fff !important;
  font-weight: 600;
}

.farma-paginator :deep(.p-select),
.farma-paginator :deep(.p-dropdown) {
  border: 1px solid #e2e8f0 !important;
  box-shadow: none !important;
  min-height: 2rem;
  border-radius: 0.65rem;
}

.farma-paginator :deep(.p-paginator-rpp-dropdown) {
  margin-left: 0.5rem;
}

.farma-paginator :deep(.p-paginator-current) {
  margin: 0 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

:global(.farma-dialog-mask) {
  background: rgba(15, 23, 42, 0.34) !important;
  backdrop-filter: blur(3px);
}

:global(.farma-dialog-root) {
  border: 1px solid rgba(226, 232, 240, 0.95) !important;
  border-radius: 1.4rem !important;
  overflow: hidden !important;
  background: linear-gradient(to bottom, #f8fafc 0%, #eef2f7 100%) !important;
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.22) !important;
}

:global(.farma-dialog-header-shell) {
  padding: 1.25rem 1.25rem 0.75rem 1.25rem !important;
  background: transparent !important;
  border: 0 !important;
}

:global(.farma-dialog-content-shell) {
  padding: 0 1.25rem 1.25rem 1.25rem !important;
  background: transparent !important;
}

:global(.farma-dialog-close-btn) {
  width: 2.2rem !important;
  height: 2.2rem !important;
  border-radius: 0.85rem !important;
  color: #64748b !important;
}

:global(.farma-dialog-close-btn:hover) {
  background: #eef2ff !important;
  color: #1d4ed8 !important;
}

:global(.farma-confirm-root) {
  max-width: 30rem;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.drawer-enter-to,
.drawer-leave-from {
  transform: translateX(0%);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.farma-drawer-table-scroll {
  flex: 1;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: var(--color-secondary) transparent;
}

.farma-drawer-table-scroll::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.farma-drawer-table-scroll::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 9999px;
}

.farma-drawer-table-scroll::-webkit-scrollbar-thumb {
  background: var(--color-secondary);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.farma-drawer-table-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
  border: 2px solid transparent;
  background-clip: padding-box;
}

@media (max-width: 768px) {
  .farma-paginator-wrap {
    padding: 0.75rem;
  }

  .farma-paginator :deep(.p-paginator) {
    justify-content: center;
    row-gap: 0.5rem;
  }

  .farma-paginator :deep(.p-paginator-current) {
    width: 100%;
    text-align: center;
    order: -1;
    margin: 0 0 0.25rem 0;
  }

  :global(.farma-dialog-header-shell) {
    padding: 1rem 1rem 0.65rem 1rem !important;
  }

  :global(.farma-dialog-content-shell) {
    padding: 0 1rem 1rem 1rem !important;
  }
}
</style>
