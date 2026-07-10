<template>
  <section class="flex h-[calc(100vh-8rem)] flex-col gap-4">
    <header class="flex flex-col gap-3">
      <nav class="flex items-center gap-1.5 text-xs text-slate-400">
        <RouterLink to="/home" class="transition hover:text-slate-600">Inicio</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <RouterLink to="/inventario" class="transition hover:text-slate-600">Inventario</RouterLink>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="font-medium text-blue-600">Productos</span>
      </nav>

      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <i class="pi pi-box text-base text-white"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="font-family: var(--font-title)">
              Gestor de Productos
            </h1>
            <p class="text-sm text-slate-500">
              Consulta, filtrado y detalle de productos del inventario.
            </p>
          </div>
        </div>

        <div>
          <button
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            @click="router.push('/inventario/productos/crear')">
            <i class="pi pi-plus text-sm"></i>
            <span>Nuevo producto</span>
          </button>
        </div>
      </div>
    </header>

    <div class="farma-filtros-bar">
      <div class="farma-filtros-busqueda">
        <label class="input-label text-xs font-medium text-slate-500">Buscar</label>
        <div class="relative">
          <i class="pi pi-search farma-search-icon"></i>
          <input v-model="filtros.busqueda" type="text" placeholder="SKU, UPC o nombre..." class="farma-search-input"
            @input="onBuscarInput" />
        </div>
      </div>

      <div class="farma-filtros-fecha">
        <label class="input-label text-xs font-medium text-slate-500">Fecha inicio</label>
        <div class="farma-datepicker-click" @click="abrirCalendario(fechaInicioRef)">
          <DatePicker ref="fechaInicioRef" v-model="filtros.fechaInicio" placeholder="YYYY-MM-DD" dateFormat="yy-mm-dd"
            showIcon iconDisplay="input" manualInput showOnFocus inputClass="farma-datepicker-input"
            class="w-full farma-datepicker" @date-select="aplicarFiltros"
            @update:modelValue="sincronizarInput(fechaInicioRef, filtros.fechaInicio)" />
        </div>
      </div>

      <div class="farma-filtros-fecha">
        <label class="input-label text-xs font-medium text-slate-500">Fecha fin</label>
        <div class="farma-datepicker-click" @click="abrirCalendario(fechaFinRef)">
          <DatePicker ref="fechaFinRef" v-model="filtros.fechaFin" placeholder="YYYY-MM-DD" dateFormat="yy-mm-dd"
            showIcon iconDisplay="input" manualInput showOnFocus inputClass="farma-datepicker-input"
            class="w-full farma-datepicker" @date-select="aplicarFiltros"
            @update:modelValue="sincronizarInput(fechaFinRef, filtros.fechaFin)" />
        </div>
      </div>

      <div class="farma-filtros-fecha">
        <label class="input-label text-xs font-medium text-slate-500">Status</label>
        <Select v-model="filtros.status" :options="statusOptions" optionLabel="label" optionValue="value"
          placeholder="Todos" showClear class="w-full farma-select" />
      </div>

      <div class="farma-filtros-acciones">
        <button title="Limpiar filtros" class="farma-btn-limpiar" @click="limpiarTodo">
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

        <span v-if="filtros.busqueda"
          class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <i class="pi pi-search text-[10px]"></i>
          {{ filtros.busqueda }}
          <button class="ml-0.5 hover:text-blue-900" @click="limpiarFiltro('busqueda')">
            <i class="pi pi-times text-[10px]"></i>
          </button>
        </span>

        <span v-if="filtros.fechaInicio"
          class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <i class="pi pi-calendar text-[10px]"></i>
          Desde {{ formatearFecha(filtros.fechaInicio) }}
          <button class="ml-0.5 hover:text-blue-900" @click="limpiarFiltro('fechaInicio')">
            <i class="pi pi-times text-[10px]"></i>
          </button>
        </span>

        <span v-if="filtros.fechaFin"
          class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <i class="pi pi-calendar text-[10px]"></i>
          Hasta {{ formatearFecha(filtros.fechaFin) }}
          <button class="ml-0.5 hover:text-blue-900" @click="limpiarFiltro('fechaFin')">
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

    <article class="card-base farma-table-shell flex min-h-0 flex-1 flex-col">
      <div class="farma-table-content app-scroll min-h-0 flex-1">
        <DataTable :value="productosTabla" scrollable scrollHeight="flex" dataKey="producto_uuid"
          :tableStyle="{ minWidth: '100%' }" :loading="productosStore.cargando" stripedRows
          class="productos-table h-full">
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <i class="pi pi-box text-2xl text-slate-300"></i>
              </div>
              <p class="text-sm font-medium text-slate-500">
                {{ productosStore.cargando ? 'Cargando productos...' : 'No se encontraron productos' }}
              </p>
              <p class="mt-1 text-xs text-slate-400">
                {{ productosStore.cargando ? 'Espera un momento' : 'Intenta ajustar los filtros de búsqueda' }}
              </p>
            </div>
          </template>

          <Column field="sku" header="SKU" style="width: 140px">
            <template #body="slotProps">
              <button
                class="font-mono text-[13px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                @click="abrirDetalle(slotProps.data)">
                {{ slotProps.data.sku }}
              </button>
            </template>
          </Column>

          <Column field="upc" header="UPC" style="width: 160px">
            <template #body="slotProps">
              <span class="text-sm text-slate-600">{{ slotProps.data.upc }}</span>
            </template>
          </Column>

          <Column field="nombre" header="Nombre" style="width: 260px">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img v-if="slotProps.data.url_imagen" :src="slotProps.data.url_imagen" :alt="slotProps.data.nombre"
                    class="h-full w-full object-cover" />
                  <i v-else class="pi pi-image text-slate-300"></i>
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-slate-800">{{ slotProps.data.nombre }}</p>
                  <p class="truncate text-xs text-slate-400">{{ slotProps.data.presentacion || 'Sin presentación' }}</p>
                </div>
              </div>
            </template>
          </Column>

          <Column field="descripcion" header="Descripción">
            <template #body="slotProps">
              <span class="line-clamp-1 text-sm text-slate-500">{{ slotProps.data.descripcion }}</span>
            </template>
          </Column>

          <Column field="categoria" header="Categoría" style="width: 190px">
            <template #body="slotProps">
              <span class="text-sm text-slate-600">{{ slotProps.data.categoria }}</span>
            </template>
          </Column>

          <Column field="fecha_creacion" header="Creación" style="width: 140px">
            <template #body="slotProps">
              <span class="text-xs text-slate-500">{{ formatearFechaTexto(slotProps.data.fecha_creacion) }}</span>
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
        </DataTable>
      </div>

      <div class="farma-paginator-wrap shrink-0">
        <Paginator :first="first" :rows="rows" :totalRecords="totalRegistros" :rowsPerPageOptions="[10, 20, 30]"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}" class="farma-paginator" @page="onPage" />
      </div>
    </article>

    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="detalleVisible" class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
          @click="cerrarDetalle" />
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="drawer">
        <aside v-if="detalleVisible" class="fixed inset-y-0 right-0 z-50 flex flex-col bg-white"
          style="width: min(56rem, 96vw); box-shadow: var(--shadow-lg)">
          <div
            class="flex items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                <i class="pi pi-box text-white"></i>
              </div>
              <div>
                <h2 class="text-xl font-bold text-slate-900" style="font-family: var(--font-title)">
                  Detalle del producto
                </h2>
                <p class="text-sm text-slate-500">Información general, técnica y stock del producto.</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Transition name="fade-slide">
                <span v-if="modoEdicion && hayModificaciones"
                  class="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 sm:inline-flex">
                  <i class="pi pi-pencil text-[10px]"></i>
                  Cambios sin guardar
                </span>
              </Transition>

              <Transition name="fade-slide">
                <button v-if="modoEdicion" type="button" class="farma-btn farma-btn-primary"
                  :disabled="!hayModificaciones || productosStore.cargando" @click="submitForm">
                  <i :class="productosStore.cargando ? 'pi pi-spin pi-spinner text-xs' : 'pi pi-check text-xs'"></i>
                  <span>{{ productosStore.cargando ? 'Guardando...' : 'Guardar cambios' }}</span>
                </button>
              </Transition>

              <button v-if="productoDetalle" type="button"
                class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                @click="toggleMenuAcciones">
                <i class="pi pi-ellipsis-h text-sm"></i>
              </button>

              <Menu ref="menuAccionesRef" :model="accionesMenuItems" popup :pt="{
                root: { class: 'farma-menu-popup' },
                list: { class: 'p-1' },
                item: { class: 'rounded-xl overflow-hidden' },
                itemLink: { class: '!p-0' },
                itemLabel: { class: 'sr-only' },
                separator: { class: 'farma-menu-separator' },
              }">
                <template #item="{ item }">
                  <button v-if="!item.separator" type="button"
                    class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
                    :class="item.itemClass" :disabled="item.disabled" @click="item.command">
                    <i :class="[item.icon, 'text-sm shrink-0', item.iconClass]"></i>
                    <span>{{ item.label }}</span>
                  </button>
                </template>
              </Menu>

              <button
                class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                @click="cerrarDetalle">
                <i class="pi pi-times text-base"></i>
              </button>
            </div>
          </div>

          <div class="app-scroll flex-1 overflow-y-auto px-6 py-6">
            <div v-if="productosStore.cargandoDetalle" class="space-y-4">
              <div class="h-40 animate-pulse rounded-2xl bg-slate-100"></div>
              <div class="grid grid-cols-2 gap-3">
                <div class="h-24 animate-pulse rounded-xl bg-slate-100"></div>
                <div class="h-24 animate-pulse rounded-xl bg-slate-100"></div>
                <div class="h-24 animate-pulse rounded-xl bg-slate-100"></div>
                <div class="h-24 animate-pulse rounded-xl bg-slate-100"></div>
              </div>
            </div>

            <form v-else-if="productoDetalle" class="space-y-6" @submit.prevent="submitForm">
              <section class="rounded-2xl border border-blue-100/60 bg-gradient-to-br from-blue-50 to-white p-6">
                <div class="flex flex-col gap-5 md:flex-row md:items-start">
                  <div
                    class="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                    <img v-if="productoDetalle.url_imagen" :src="productoDetalle.url_imagen"
                      :alt="productoDetalle.nombre" class="h-full w-full object-cover" />
                    <div v-else class="flex h-full w-full items-center justify-center bg-slate-50">
                      <i class="pi pi-image text-3xl text-blue-200"></i>
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-semibold uppercase tracking-widest text-blue-600">
                      {{ productoDetalle.sku || 'Sin SKU' }}
                    </p>
                    <h3 class="mt-1 text-xl font-bold text-slate-900">
                      {{ productoDetalle.nombre || 'Producto sin nombre' }}
                    </h3>
                    <p class="mt-1 text-sm leading-relaxed text-slate-600">
                      {{ productoDetalle.descripcion || 'Sin descripción' }}
                    </p>

                    <div class="mt-3 flex flex-wrap items-center gap-2">
                      <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {{ productoDetalle.categoria || 'Sin categoría' }}
                      </span>
                      <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                        :class="statusClass(productoDetalle.status)">
                        {{ capitalizar(productoDetalle.status) }}
                      </span>
                    </div>

                    <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div class="rounded-xl border border-white/70 bg-white/80 p-3">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">SKU</p>
                        <p class="mt-1 text-sm font-medium text-slate-900">{{ productoDetalle.sku || '—' }}</p>
                      </div>
                      <div class="rounded-xl border border-white/70 bg-white/80 p-3">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Clave UM</p>
                        <p class="mt-1 text-sm font-medium text-slate-900">{{ productoDetalle.clave_unidad_medida || '—'
                          }}
                        </p>
                      </div>
                      <div class="rounded-xl border border-white/70 bg-white/80 p-3">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Stock total</p>
                        <p class="mt-1 text-sm font-bold text-blue-600">{{ productoDetalle.stock?.total ?? 0 }}</p>
                      </div>
                      <div class="rounded-xl border border-white/70 bg-white/80 p-3">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Fecha entrada</p>
                        <p class="mt-1 text-sm font-medium text-slate-900">
                          {{ formatearFechaTexto(productoDetalle.fecha_entrada) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="mb-4">
                  <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Información comercial</p>
                  <h2 class="mt-1 text-lg font-semibold text-slate-900">Identificación y precios</h2>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">UPC</label>
                    <InputText v-if="modoEdicion" v-model="form.upc"
                      class="farma-primevue-input farma-input-editing w-full" placeholder="Código UPC"
                      :maxlength="30" />
                    <p v-else class="farma-view-value">{{ form.upc || '—' }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Presentación</label>
                    <InputText v-if="modoEdicion" v-model="form.presentacion"
                      class="farma-primevue-input farma-input-editing w-full" placeholder="Ej. Caja con 20 tabletas"
                      :maxlength="150" />
                    <p v-else class="farma-view-value">{{ form.presentacion || '—' }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Precio público</label>
                    <InputNumber v-if="modoEdicion" v-model="form.precio_publico" class="w-full"
                      inputClass="farma-primevue-input farma-input-editing w-full" mode="currency" currency="MXN"
                      locale="es-MX" :min="0" placeholder="$0.00" />
                    <p v-else class="farma-view-value farma-view-highlight">
                      {{ formatearMoneda(form.precio_publico) }}
                    </p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Costo compra</label>
                    <InputNumber v-if="modoEdicion" v-model="form.costo_compra" class="w-full"
                      inputClass="farma-primevue-input farma-input-editing w-full" mode="currency" currency="MXN"
                      locale="es-MX" :min="0" placeholder="$0.00" />
                    <p v-else class="farma-view-value">{{ formatearMoneda(form.costo_compra) }}</p>
                  </div>

                  <div class="md:col-span-2">
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Proveedor</label>
                    <Select v-if="modoEdicion" v-model="form.proveedor_uuid"
                      :options="productosStore.proveedoresOptions" optionLabel="label" optionValue="value"
                      placeholder="Selecciona un proveedor" filter showClear appendTo="self"
                      class="farma-select-field farma-select-editing w-full" />
                    <p v-else class="farma-view-value">{{ proveedorLabel || 'Sin proveedor asignado' }}</p>
                  </div>
                </div>
              </article>

              <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="mb-4">
                  <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Información técnica</p>
                  <h2 class="mt-1 text-lg font-semibold text-slate-900">Regulación y manejo</h2>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Registro sanitario</label>
                    <InputText v-if="modoEdicion" v-model="form.numero_registro_sanitario"
                      class="farma-primevue-input farma-input-editing w-full" placeholder="Número de registro"
                      :maxlength="50" />
                    <p v-else class="farma-view-value">{{ form.numero_registro_sanitario || '—' }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Control almacén</label>
                    <Select v-if="modoEdicion" v-model="form.control_almacen" :options="controlAlmacenOptions"
                      optionLabel="label" optionValue="value" placeholder="Selecciona control" appendTo="self"
                      class="farma-select-field farma-select-editing w-full" />
                    <p v-else class="farma-view-value">{{ controlAlmacenLabel || '—' }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Temperatura (valor)</label>
                    <InputNumber v-if="modoEdicion" v-model="form.temperatura_valor" class="w-full"
                      inputClass="farma-primevue-input farma-input-editing w-full" placeholder="0" />
                    <p v-else class="farma-view-value">{{ form.temperatura_valor ?? '—' }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Temperatura (unidad)</label>
                    <Select v-if="modoEdicion" v-model="form.temperatura_unidad" :options="temperaturaUnidadOptions"
                      optionLabel="label" optionValue="value" placeholder="Selecciona unidad" appendTo="self"
                      class="farma-select-field farma-select-editing w-full" />
                    <p v-else class="farma-view-value">{{ temperaturaUnidadLabel || '—' }}</p>
                  </div>

                  <div
                    class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 md:col-span-2">
                    <div>
                      <p class="text-sm font-semibold text-slate-800">Maneja lotes</p>
                      <p class="text-xs text-slate-500">Activa si el producto requiere control de lote y caducidad.</p>
                    </div>
                    <ToggleSwitch v-if="modoEdicion" v-model="form.con_lote" />
                    <span v-else class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                      :class="form.con_lote ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">
                      {{ form.con_lote ? 'Sí' : 'No' }}
                    </span>
                  </div>
                </div>
              </article>

              <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="mb-4">
                  <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Unidades y medidas</p>
                  <h2 class="mt-1 text-lg font-semibold text-slate-900">Dimensiones del producto</h2>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Unidad de medida</label>
                    <Select v-if="modoEdicion" v-model="form.unidad_medida" :options="unidadMedidaOptions"
                      optionLabel="label" optionValue="value" placeholder="Selecciona unidad" filter appendTo="self"
                      class="farma-select-field farma-select-editing w-full" />
                    <p v-else class="farma-view-value">{{ unidadMedidaLabel || '—' }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Peso (valor)</label>
                    <InputNumber v-if="modoEdicion" v-model="form.peso_valor" class="w-full"
                      inputClass="farma-primevue-input farma-input-editing w-full" placeholder="0"
                      :maxFractionDigits="3" />
                    <p v-else class="farma-view-value">{{ form.peso_valor ?? '—' }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Peso (unidad)</label>
                    <Select v-if="modoEdicion" v-model="form.peso_unidad" :options="pesoUnidadOptions"
                      optionLabel="label" optionValue="value" placeholder="kg / g" appendTo="self"
                      class="farma-select-field farma-select-editing w-full" />
                    <p v-else class="farma-view-value">{{ form.peso_unidad || '—' }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Volumen (valor)</label>
                    <InputNumber v-if="modoEdicion" v-model="form.volumen_valor" class="w-full"
                      inputClass="farma-primevue-input farma-input-editing w-full" placeholder="0"
                      :maxFractionDigits="3" />
                    <p v-else class="farma-view-value">{{ form.volumen_valor ?? '—' }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-500">Volumen (unidad)</label>
                    <Select v-if="modoEdicion" v-model="form.volumen_unidad" :options="volumenUnidadOptions"
                      optionLabel="label" optionValue="value" placeholder="ml / L" appendTo="self"
                      class="farma-select-field farma-select-editing w-full" />
                    <p v-else class="farma-view-value">{{ form.volumen_unidad || '—' }}</p>
                  </div>
                </div>
              </article>

              <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="mb-4">
                  <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Tags</p>
                  <h2 class="mt-1 text-lg font-semibold text-slate-900">Palabras clave para búsqueda IA</h2>
                </div>

                <div v-if="!modoEdicion" class="flex flex-wrap gap-2">
                  <span v-for="tag in (productoDetalle?.tags || [])" :key="tag"
                    class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {{ tag }}
                  </span>

                  <span v-if="!productoDetalle?.tags?.length" class="text-sm text-slate-400">
                    Sin tags capturados
                  </span>
                </div>

                <div v-else class="space-y-3">
                  <div class="flex flex-wrap gap-2">
                    <span v-for="tag in form.tags" :key="tag"
                      class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {{ tag }}
                      <button type="button" class="hover:text-blue-900" @click="quitarTag(tag)">
                        <i class="pi pi-times text-[10px]"></i>
                      </button>
                    </span>
                  </div>

                  <div class="flex gap-2">
                    <InputText v-model="nuevoTag" class="farma-primevue-input farma-input-editing w-full"
                      placeholder="Escribe un tag y presiona Enter" @keydown.enter.prevent="agregarTag" />
                    <button type="button"
                      class="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      @click="agregarTag">
                      Agregar
                    </button>
                  </div>
                </div>
              </article>

              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Stock por almacén</p>
                <div v-if="productoDetalle.stock?.almacenes?.length" class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div v-for="almacen in productoDetalle.stock.almacenes" :key="almacen.nombre"
                    class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{{ almacen.nombre }}
                    </p>
                    <p class="mt-1.5 text-sm font-bold text-slate-900">{{ almacen.stock ?? 0 }}</p>
                  </div>
                </div>
                <div v-else class="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-4">
                  <p class="text-sm text-slate-500">No hay desglose de stock por almacén.</p>
                </div>
              </section>

              <article class="card-base rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="mb-4 flex items-center justify-between">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Lotes registrados</p>
                    <h2 class="mt-1 text-lg font-semibold text-slate-900">Trazabilidad FEFO</h2>
                  </div>
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                    {{ productosStore.lotesProducto.length }} lote(s)
                  </span>
                </div>

                <div v-if="productosStore.cargandoLotes" class="space-y-2">
                  <div class="h-14 animate-pulse rounded-xl bg-slate-100"></div>
                  <div class="h-14 animate-pulse rounded-xl bg-slate-100"></div>
                </div>

                <div v-else-if="productosStore.lotesProducto.length"
                  class="overflow-hidden rounded-xl border border-slate-100">
                  <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <tr>
                        <th class="px-4 py-2.5">Lote</th>
                        <th class="px-4 py-2.5">Cantidad</th>
                        <th class="px-4 py-2.5">Caducidad</th>
                        <th class="px-4 py-2.5">Almacén</th>
                        <th class="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="lote in productosStore.lotesProducto" :key="lote.lote_uuid"
                        class="hover:bg-slate-50/60">
                        <td class="px-4 py-2.5 font-mono text-slate-700">{{ lote.codigo_lote || '—' }}</td>
                        <td class="px-4 py-2.5 font-semibold text-slate-800">{{ lote.cantidad_actual ?? 0 }}</td>
                        <td class="px-4 py-2.5 text-slate-600">{{ formatearFechaTexto(lote.fecha_caducidad) || '—' }}
                        </td>
                        <td class="px-4 py-2.5 text-slate-600">{{ lote.almacen_nombre || '—' }}</td>
                        <td class="px-4 py-2.5">
                          <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            :class="statusClass(lote.status)">
                            {{ capitalizar(lote.status) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-else class="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-4">
                  <p class="text-sm text-slate-500">Este producto aún no tiene lotes registrados.</p>
                </div>
              </article>

              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Auditoría</p>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Fecha creación</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ formatearFechaTexto(productoDetalle.fecha_creacion, true) }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Fecha actualización
                    </p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ formatearFechaTexto(productoDetalle.fecha_actualizacion, true) }}
                    </p>
                  </div>
                </div>
              </section>
            </form>

            <div v-else class="flex h-full items-center justify-center py-16">
              <div class="text-center">
                <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <i class="pi pi-box text-2xl text-slate-300"></i>
                </div>
                <p class="text-sm font-medium text-slate-500">No se pudo cargar el detalle</p>
              </div>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <Dialog v-model:visible="dialogStatusVisible" modal :closable="!productosStore.cambiandoStatus"
      :style="{ width: '28rem' }" :pt="{
        root: { class: 'farma-dialog-root' },
        mask: { class: 'farma-dialog-mask' },
        header: { style: 'display:none' },
        content: { class: 'farma-dialog-content' },
        footer: { style: 'display:none' },
      }">
      <div class="flex items-start gap-4 p-6 pb-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          :class="statusObjetivo === 'inactivo' ? 'bg-amber-100' : 'bg-emerald-100'">
          <i :class="statusObjetivo === 'inactivo' ? 'pi pi-ban text-amber-600' : 'pi pi-check-circle text-emerald-600'"
            class="text-xl"></i>
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-bold text-slate-900">
            {{ statusObjetivo === 'inactivo' ? 'Desactivar producto' : 'Activar producto' }}
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-500">
            {{
              statusObjetivo === 'inactivo'
                ? 'El producto quedará inactivo y no aparecerá disponible para ventas ni compras.'
                : 'El producto quedará activo y disponible para nuevas operaciones.'
            }}
          </p>
        </div>
      </div>

      <div class="mx-6 mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Producto</p>
        <p class="mt-1 text-sm font-semibold text-slate-800">{{ productoDetalle?.nombre }}</p>
        <p class="mt-0.5 text-xs text-slate-500">{{ productoDetalle?.sku || 'Sin SKU' }}</p>
      </div>

      <div class="flex items-center justify-end gap-4 border-t border-slate-100 px-6 py-4">
        <Button label="Cancelar" :disabled="productosStore.cambiandoStatus"
          class="!rounded-lg !bg-slate-100 !border !border-slate-300 !text-slate-700 hover:!bg-slate-200 !px-4 !py-2 !text-sm"
          @click="dialogStatusVisible = false" />
        <Button
          :label="productosStore.cambiandoStatus ? 'Aplicando...' : (statusObjetivo === 'inactivo' ? 'Desactivar' : 'Activar')"
          :loading="productosStore.cambiandoStatus" class="!rounded-lg !px-4 !py-2 !text-sm !text-white" :class="statusObjetivo === 'inactivo'
            ? '!bg-amber-500 !border-amber-500 hover:!bg-amber-600'
            : '!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700'" @click="confirmarCambioStatus" />
      </div>
    </Dialog>

    <Dialog v-model:visible="dialogEliminarVisible" modal :closable="!productosStore.cambiandoStatus"
      :style="{ width: '28rem' }" :pt="{
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
          <h3 class="text-base font-bold text-slate-900">Eliminar producto</h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-500">
            Esta acción marcará al producto como eliminado. No podrá usarse en nuevas operaciones.
          </p>
        </div>
      </div>

      <div class="mx-6 mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-rose-500">Producto a eliminar</p>
        <p class="mt-1 text-sm font-semibold text-rose-900">{{ productoDetalle?.nombre }}</p>
        <p class="mt-0.5 text-xs text-rose-600">{{ productoDetalle?.sku || 'Sin SKU' }}</p>
      </div>

      <div class="flex items-center justify-end gap-4 border-t border-slate-100 px-6 py-4">
        <Button label="Cancelar" :disabled="productosStore.cambiandoStatus"
          class="!rounded-lg !bg-slate-100 !border !border-slate-300 !text-slate-700 hover:!bg-slate-200 !px-4 !py-2 !text-sm"
          @click="dialogEliminarVisible = false" />
        <Button :label="productosStore.cambiandoStatus ? 'Eliminando...' : 'Eliminar'"
          :loading="productosStore.cambiandoStatus"
          class="!rounded-lg !px-4 !py-2 !text-sm !text-white !bg-rose-600 !border-rose-600 hover:!bg-rose-700"
          @click="confirmarEliminar" />
      </div>
    </Dialog>

    <Dialog v-model:visible="dialogStockVisible" modal :closable="!productosStore.guardandoStock"
      :style="{ width: '58rem' }" :pt="{
        root: { class: 'farma-dialog-root farma-dialog-stock' },
        mask: { class: 'farma-dialog-mask' },
        header: { style: 'display:none' },
        content: { class: 'farma-dialog-content' },
        footer: { style: 'display:none' },
      }">
      <div class="farma-stock-layout">
        <div class="flex items-start gap-4 border-b border-slate-100 px-6 py-5 shrink-0">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100">
            <i class="pi pi-box text-xl text-blue-600"></i>
          </div>

          <div class="min-w-0">
            <h3 class="text-base font-bold text-slate-900">Alta de stock</h3>
            <p class="mt-1 text-sm leading-relaxed text-slate-500">
              Registra un nuevo lote de entrada para
              <span class="font-semibold text-slate-700">{{ productoDetalle?.nombre }}</span>.
              Los campos marcados con <span class="font-semibold text-rose-500">*</span> son obligatorios.
            </p>
          </div>
        </div>

        <div class="farma-stock-body app-scroll px-6 py-5">
          <div class="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">
                Almacén <span class="text-rose-500">*</span>
              </label>
              <Select v-model="formStock.almacen_uuid" :options="productosStore.almacenesOptions" optionLabel="label"
                optionValue="value" placeholder="Selecciona un almacén" filter showClear appendTo="self"
                :loading="productosStore.cargandoCatalogosStock"
                class="farma-select-field farma-select-editing w-full" />
            </div>

            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">
                Código lote <span class="text-rose-500">*</span>
              </label>
              <InputText v-model="formStock.codigo_lote" class="farma-primevue-input farma-input-editing w-full"
                placeholder="Ej. L-2026-001" :maxlength="50" />
            </div>

            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">
                Cantidad actual <span class="text-rose-500">*</span>
              </label>
              <InputNumber v-model="formStock.cantidad_actual" class="w-full"
                inputClass="farma-primevue-input farma-input-editing w-full" :min="1" placeholder="0" />
            </div>

            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">
                Fecha caducidad <span class="text-rose-500">*</span>
              </label>
              <div class="farma-datepicker-click" @click="abrirCalendario(fechaCaducidadStockRef)">
                <DatePicker ref="fechaCaducidadStockRef" v-model="formStock.fecha_caducidad" placeholder="YYYY-MM-DD"
                  dateFormat="yy-mm-dd" showIcon iconDisplay="input" manualInput showOnFocus appendTo="self"
                  inputClass="farma-datepicker-input" class="w-full farma-datepicker"
                  @update:modelValue="sincronizarInput(fechaCaducidadStockRef, formStock.fecha_caducidad)" />
              </div>
            </div>

            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Fecha fabricación</label>
              <div class="farma-datepicker-click" @click="abrirCalendario(fechaFabricacionStockRef)">
                <DatePicker ref="fechaFabricacionStockRef" v-model="formStock.fecha_fabricacion"
                  placeholder="YYYY-MM-DD" dateFormat="yy-mm-dd" showIcon iconDisplay="input" manualInput showOnFocus
                  appendTo="self" inputClass="farma-datepicker-input" class="w-full farma-datepicker"
                  @update:modelValue="sincronizarInput(fechaFabricacionStockRef, formStock.fecha_fabricacion)" />
              </div>
            </div>

            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Costo unitario compra</label>
              <InputNumber v-model="formStock.costo_unitario_compra" class="w-full"
                inputClass="farma-primevue-input farma-input-editing w-full" mode="currency" currency="MXN"
                locale="es-MX" :min="0" placeholder="$0.00" />
            </div>

            <div class="farma-field md:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Proveedor</label>
              <Select v-model="formStock.proveedor_uuid" :options="productosStore.proveedoresOptions"
                optionLabel="label" optionValue="value" placeholder="Selecciona un proveedor" filter showClear
                appendTo="self" :loading="productosStore.cargandoCatalogosStock"
                class="farma-select-field farma-select-editing farma-select-proveedor w-full" />
            </div>

            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Stock mínimo</label>
              <InputNumber v-model="formStock.stock_minimo" class="w-full"
                inputClass="farma-primevue-input farma-input-editing w-full" :min="0" placeholder="0" />
            </div>

            <div class="farma-field">
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Stock máximo</label>
              <InputNumber v-model="formStock.stock_maximo" class="w-full"
                inputClass="farma-primevue-input farma-input-editing w-full" :min="0" placeholder="0" />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-4 border-t border-slate-100 px-6 py-4 shrink-0">
          <Button label="Cancelar" :disabled="productosStore.guardandoStock"
            class="!rounded-lg !bg-slate-100 !border !border-slate-300 !text-slate-700 hover:!bg-slate-200 !px-4 !py-2 !text-sm"
            @click="dialogStockVisible = false" />
          <Button :label="productosStore.guardandoStock ? 'Guardando...' : 'Registrar alta'"
            :loading="productosStore.guardandoStock"
            :disabled="productosStore.cargandoCatalogosStock || !stockFormValido"
            class="!rounded-lg !px-4 !py-2 !text-sm !text-white !bg-blue-600 !border-blue-600 hover:!bg-blue-700"
            @click="guardarAltaStock" />
        </div>
      </div>
    </Dialog>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import Paginator from 'primevue/paginator';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import ToggleSwitch from 'primevue/toggleswitch';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import { useProductosStore } from '../productosStore';
import { useAuthStore } from '@/modules/auth/authStore';

const router = useRouter();
const productosStore = useProductosStore();
const authStore = useAuthStore();

const detalleVisible = ref(false);
const modoEdicion = ref(false);
const fechaInicioRef = ref(null);
const fechaFinRef = ref(null);
const fechaCaducidadStockRef = ref(null);
const fechaFabricacionStockRef = ref(null);
const menuAccionesRef = ref(null);
const nuevoTag = ref('');

const filtros = ref({
  busqueda: '',
  fechaInicio: null,
  fechaFin: null,
  status: null,
});

const first = ref(0);
const rows = ref(10);
const cargandoListado = ref(false);
const dialogStatusVisible = ref(false);
const dialogStockVisible = ref(false);
const dialogEliminarVisible = ref(false);
const statusObjetivo = ref('activo');

const formStock = ref({
  almacen_uuid: null,
  codigo_lote: '',
  cantidad_actual: null,
  fecha_fabricacion: null,
  fecha_caducidad: null,
  costo_unitario_compra: null,
  proveedor_uuid: null,
  stock_minimo: null,
  stock_maximo: null,
});

const form = ref({
  upc: '',
  presentacion: '',
  precio_publico: null,
  costo_compra: null,
  proveedor_uuid: null,
  numero_registro_sanitario: '',
  control_almacen: null,
  temperatura_valor: null,
  temperatura_unidad: null,
  con_lote: false,
  unidad_medida: null,
  peso_valor: null,
  peso_unidad: null,
  volumen_valor: null,
  volumen_unidad: null,
  tags: [],
});

const formOriginal = ref({});
let busquedaTimeout = null;

const statusOptions = [
  { label: 'Activos', value: 'activo' },
  { label: 'Inactivos', value: 'inactivo' },
  { label: 'Eliminados', value: 'eliminado' },
];

const controlAlmacenOptions = [
  { label: 'FEFO (primero en caducar)', value: 'fefo' },
  { label: 'PEPS (primeras entradas)', value: 'peps' },
  { label: 'Manual', value: 'manual' },
];

const temperaturaUnidadOptions = [
  { label: 'Ambiente', value: 'ambiente' },
  { label: 'Refrigeración (2-8°C)', value: 'refrigeracion' },
  { label: 'Congelación (-20°C)', value: 'congelacion' },
];

const unidadMedidaOptions = [
  { label: 'Pieza', value: 'pieza' },
  { label: 'Caja', value: 'caja' },
  { label: 'Blíster', value: 'blister' },
  { label: 'Frasco', value: 'frasco' },
  { label: 'Ampolleta', value: 'ampolleta' },
  { label: 'Tableta', value: 'tableta' },
  { label: 'Kilogramo', value: 'kg' },
  { label: 'Litro', value: 'l' },
];

const pesoUnidadOptions = [
  { label: 'g', value: 'g' },
  { label: 'kg', value: 'kg' },
  { label: 'mg', value: 'mg' },
];

const volumenUnidadOptions = [
  { label: 'ml', value: 'ml' },
  { label: 'L', value: 'l' },
];

const productoDetalle = computed(() => productosStore.productoDetalle);
const totalRegistros = computed(() => Number(productosStore.total || 0));
const paginaActual = computed(() => Math.floor(first.value / rows.value) + 1);
const productosTabla = computed(() => (productosStore.cargando ? [] : productosStore.productos ?? []));

const proveedorLabel = computed(() =>
  productosStore.proveedoresOptions.find((o) => o.value === form.value.proveedor_uuid)?.label,
);

const controlAlmacenLabel = computed(() =>
  controlAlmacenOptions.find((o) => o.value === form.value.control_almacen)?.label,
);

const temperaturaUnidadLabel = computed(() =>
  temperaturaUnidadOptions.find((o) => o.value === form.value.temperatura_unidad)?.label,
);

const unidadMedidaLabel = computed(() =>
  unidadMedidaOptions.find((o) => o.value === form.value.unidad_medida)?.label,
);

const hayFiltrosActivos = computed(() =>
  Boolean(
    filtros.value.busqueda ||
    filtros.value.fechaInicio ||
    filtros.value.fechaFin ||
    filtros.value.status,
  ),
);

const hayModificaciones = computed(() => {
  const keys = Object.keys(form.value).filter((k) => k !== 'tags');

  const camposCambiaron = keys.some((k) => {
    const a = form.value[k] ?? '';
    const b = formOriginal.value[k] ?? '';
    return String(a) !== String(b);
  });

  const tagsCambiaron =
    JSON.stringify(form.value.tags ?? []) !== JSON.stringify(formOriginal.value.tags ?? []);

  return camposCambiaron || tagsCambiaron;
});

const configurarInputFechaModelo = async (pickerRef, getValue, setValue) => {
  await nextTick();

  const input = getInput(pickerRef);
  if (!input || input.dataset.maskedModel) return;

  input.dataset.maskedModel = 'true';
  input.setAttribute('placeholder', 'YYYY-MM-DD');
  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('maxlength', '10');
  input.autocomplete = 'off';
  input.spellcheck = false;

  input.addEventListener('keydown', (e) => {
    if (
      e.ctrlKey ||
      e.metaKey ||
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) ||
      /\d/.test(e.key)
    ) return;

    e.preventDefault();
  });

  input.addEventListener('input', (e) => {
    const masked = enmascararFecha(e.target.value);
    e.target.value = masked;
    setValue(parsearFecha(masked));
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text') ?? '';
    const masked = enmascararFecha(text);
    input.value = masked;
    setValue(parsearFecha(masked));
  });

  input.addEventListener('blur', () => sincronizarInput(pickerRef, getValue()));
};

const stockFormValido = computed(() =>
  Boolean(
    formStock.value.almacen_uuid &&
    formStock.value.codigo_lote?.trim() &&
    Number(formStock.value.cantidad_actual) > 0 &&
    formStock.value.fecha_caducidad,
  ),
);

const accionesMenuItems = computed(() => {
  const status = String(productoDetalle.value?.status || '').toLowerCase();

  const items = [
    {
      label: modoEdicion.value ? 'Cancelar edición' : 'Editar',
      icon: modoEdicion.value ? 'pi pi-times' : 'pi pi-pencil',
      iconClass: modoEdicion.value ? 'text-slate-500' : 'text-blue-500',
      itemClass: 'text-black font-bold hover:bg-slate-50',
      command: () => {
        cerrarMenuAcciones();
        if (modoEdicion.value) cancelarEdicion();
        else activarEdicion();
      },
    },
    {
      label: 'Alta de stock',
      icon: 'pi pi-box',
      iconClass: 'text-blue-500',
      itemClass: 'text-black font-bold hover:bg-blue-50',
      command: () => {
        cerrarMenuAcciones();
        abrirDialogStock();
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
        abrirDialogStatus('inactivo');
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
        abrirDialogStatus('activo');
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
        abrirDialogEliminar();
      },
    });
  }

  return items;
});

const getInput = (pickerRef) =>
  pickerRef?.value?.el?.querySelector('input') ||
  pickerRef?.value?.el?.querySelector('.p-inputtext');

const formatearFecha = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatearFechaBackend = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return undefined;
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatearFechaTexto = (value, conHora = false) => {
  if (!value) return '';
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return value;

  if (conHora) {
    return fecha.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return fecha.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const parsearFecha = (value) => {
  const limpio = String(value).replace(/\D/g, '').slice(0, 8);
  if (limpio.length !== 8) return null;

  const y = Number(limpio.slice(0, 4));
  const m = Number(limpio.slice(4, 6));
  const d = Number(limpio.slice(6, 8));
  const fecha = new Date(y, m - 1, d);

  return fecha.getFullYear() === y &&
    fecha.getMonth() === m - 1 &&
    fecha.getDate() === d
    ? fecha
    : null;
};

const enmascararFecha = (value) => {
  const limpio = String(value).replace(/\D/g, '').slice(0, 8);
  if (limpio.length <= 4) return limpio;
  if (limpio.length <= 6) return `${limpio.slice(0, 4)}-${limpio.slice(4)}`;
  return `${limpio.slice(0, 4)}-${limpio.slice(4, 6)}-${limpio.slice(6, 8)}`;
};

const sincronizarInput = async (pickerRef, valor) => {
  await nextTick();
  const input = getInput(pickerRef);
  if (input) input.value = formatearFecha(valor);
};

const configurarInputFecha = async (pickerRef, campo) => {
  await nextTick();
  const input = getInput(pickerRef);
  if (!input || input.dataset.masked) return;

  input.dataset.masked = 'true';
  input.setAttribute('placeholder', 'YYYY-MM-DD');
  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('maxlength', '10');
  input.autocomplete = 'off';
  input.spellcheck = false;

  input.addEventListener('keydown', (e) => {
    if (
      e.ctrlKey ||
      e.metaKey ||
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) ||
      /\d/.test(e.key)
    ) return;

    e.preventDefault();
  });

  input.addEventListener('input', (e) => {
    const masked = enmascararFecha(e.target.value);
    e.target.value = masked;
    filtros.value[campo] = parsearFecha(masked);
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text') ?? '';
    const masked = enmascararFecha(text);
    input.value = masked;
    filtros.value[campo] = parsearFecha(masked);
  });

  input.addEventListener('blur', () => sincronizarInput(pickerRef, filtros.value[campo]));
};

const abrirCalendario = async (pickerRef) => {
  pickerRef?.value?.showOverlay?.();
  await nextTick();
  getInput(pickerRef)?.focus();
};

function capitalizar(valor) {
  if (!valor) return '';
  return String(valor).charAt(0).toUpperCase() + String(valor).slice(1);
}

function statusClass(status) {
  if (status === 'activo') return 'bg-blue-50 text-blue-700';
  if (status === 'inactivo') return 'bg-slate-100 text-slate-600';
  if (status === 'eliminado') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
}

function formatearMoneda(valor) {
  if (valor === null || valor === undefined || valor === '') return '-';
  const numero = Number(valor);
  if (Number.isNaN(numero)) return valor;
  return numero.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

async function cargarProductos() {
  if (cargandoListado.value) return;

  try {
    cargandoListado.value = true;

    await productosStore.obtenerProductos({
      page: paginaActual.value,
      limit: rows.value,
      busqueda: filtros.value.busqueda || undefined,
      fecha_inicio: formatearFechaBackend(filtros.value.fechaInicio),
      fecha_fin: formatearFechaBackend(filtros.value.fechaFin),
      status: filtros.value.status || undefined,
    });
  } finally {
    cargandoListado.value = false;
  }
}

function onBuscarInput() {
  clearTimeout(busquedaTimeout);
  busquedaTimeout = setTimeout(() => aplicarFiltros(), 350);
}

async function aplicarFiltros() {
  first.value = 0;
  await cargarProductos();
}

async function limpiarFiltro(campo) {
  filtros.value[campo] = campo === 'busqueda' ? '' : null;
  first.value = 0;

  if (campo === 'fechaInicio') {
    await sincronizarInput(fechaInicioRef, filtros.value.fechaInicio);
  }

  if (campo === 'fechaFin') {
    await sincronizarInput(fechaFinRef, filtros.value.fechaFin);
  }

  await cargarProductos();
}

async function limpiarTodo() {
  filtros.value = {
    busqueda: '',
    fechaInicio: null,
    fechaFin: null,
    status: null,
  };

  first.value = 0;
  await sincronizarInput(fechaInicioRef, null);
  await sincronizarInput(fechaFinRef, null);
  await cargarProductos();
}

async function onPage(event) {
  first.value = event.first;
  rows.value = event.rows;
  await cargarProductos();
}

function poblarFormulario(p) {
  const datos = {
    upc: p.upc ?? '',
    presentacion: p.presentacion ?? '',
    precio_publico:
      p.precio_publico !== undefined && p.precio_publico !== null ? Number(p.precio_publico) : null,
    costo_compra:
      p.costo_compra !== undefined && p.costo_compra !== null ? Number(p.costo_compra) : null,
    proveedor_uuid: p.proveedor_uuid ?? null,
    numero_registro_sanitario: p.numero_registro_sanitario ?? '',
    control_almacen: p.control_almacen ?? null,
    temperatura_valor: p.temperatura?.valor ?? null,
    temperatura_unidad: p.temperatura?.unidad ?? null,
    con_lote: Boolean(p.con_lote),
    unidad_medida: p.unidad_medida ?? null,
    peso_valor: p.peso_valor ?? null,
    peso_unidad: p.peso_unidad ?? null,
    volumen_valor: p.volumen_valor ?? null,
    volumen_unidad: p.volumen_unidad ?? null,
    tags: Array.isArray(p.tags) ? [...p.tags] : [],
  };

  form.value = { ...datos, tags: [...datos.tags] };
  formOriginal.value = { ...datos, tags: [...datos.tags] };
}

function activarEdicion() {
  modoEdicion.value = true;
}

function cancelarEdicion() {
  form.value = {
    ...formOriginal.value,
    tags: [...(formOriginal.value.tags ?? [])],
  };
  modoEdicion.value = false;
  nuevoTag.value = '';
}

function agregarTag() {
  const valor = nuevoTag.value.trim().toLowerCase();

  if (!valor || form.value.tags.includes(valor)) {
    nuevoTag.value = '';
    return;
  }

  form.value.tags.push(valor);
  nuevoTag.value = '';
}

function quitarTag(tag) {
  form.value.tags = form.value.tags.filter((t) => t !== tag);
}

function construirPayload() {
  const f = form.value;

  return {
    upc: f.upc || null,
    presentacion: f.presentacion || null,
    precio_publico: f.precio_publico === null || f.precio_publico === undefined ? null : Number(f.precio_publico),
    costo_compra: f.costo_compra === null || f.costo_compra === undefined ? null : Number(f.costo_compra),
    proveedor_uuid: f.proveedor_uuid || null,
    numero_registro_sanitario: f.numero_registro_sanitario || null,
    control_almacen: f.control_almacen || null,
    temperatura: {
      valor: f.temperatura_valor === null || f.temperatura_valor === undefined ? null : Number(f.temperatura_valor),
      unidad: f.temperatura_unidad || null,
    },
    con_lote: Boolean(f.con_lote),
    unidad_medida: f.unidad_medida || null,
    peso_valor: f.peso_valor === null || f.peso_valor === undefined ? null : Number(f.peso_valor),
    peso_unidad: f.peso_unidad || null,
    volumen_valor: f.volumen_valor === null || f.volumen_valor === undefined ? null : Number(f.volumen_valor),
    volumen_unidad: f.volumen_unidad || null,
    tags: f.tags,
  };
}

async function submitForm() {
  if (!productoDetalle.value || !hayModificaciones.value) return;

  try {
    await productosStore.actualizarProducto(
      productoDetalle.value.producto_uuid,
      construirPayload(),
    );

    const p = productosStore.productoDetalle;
    if (p) poblarFormulario(p);

    modoEdicion.value = false;
    await cargarProductos();
  } catch (error) {
    console.error('Error al actualizar producto:', error);
  }
}

async function abrirDetalle(producto) {
  detalleVisible.value = true;
  modoEdicion.value = false;
  productosStore.limpiarDetalle();

  try {
    const [detalle] = await Promise.all([
      productosStore.obtenerProductoDetalle(producto.producto_uuid),
      productosStore.obtenerLotesProducto(producto.producto_uuid),
      productosStore.obtenerCatalogosStock(),
    ]);

    if (detalle) {
      poblarFormulario(detalle);
    }
  } catch (error) {
    console.error('Error cargando detalle del producto:', error);
  }
}

function cerrarDetalle() {
  detalleVisible.value = false;
  modoEdicion.value = false;
  dialogStatusVisible.value = false;
  dialogStockVisible.value = false;
  dialogEliminarVisible.value = false;
  productosStore.limpiarDetalle();
}

function toggleMenuAcciones(event) {
  menuAccionesRef.value?.toggle(event);
}

function cerrarMenuAcciones() {
  menuAccionesRef.value?.hide();
}

function abrirDialogStatus(status) {
  statusObjetivo.value = status || productoDetalle.value?.status || 'activo';
  dialogStatusVisible.value = true;
}

function abrirDialogEliminar() {
  dialogEliminarVisible.value = true;
}

async function confirmarCambioStatus() {
  if (!productoDetalle.value?.producto_uuid || !statusObjetivo.value) return;

  try {
    await productosStore.cambiarStatusProducto(
      productoDetalle.value.producto_uuid,
      statusObjetivo.value,
    );
    dialogStatusVisible.value = false;
  } catch (error) {
    console.error('Error al cambiar status:', error);
  }
}

async function confirmarEliminar() {
  if (!productoDetalle.value?.producto_uuid) return;

  try {
    await productosStore.cambiarStatusProducto(
      productoDetalle.value.producto_uuid,
      'eliminado',
    );
    dialogEliminarVisible.value = false;
    cerrarDetalle();
    await cargarProductos();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  }
}

async function abrirDialogStock() {
  formStock.value = {
    almacen_uuid: null,
    codigo_lote: '',
    cantidad_actual: null,
    fecha_fabricacion: null,
    fecha_caducidad: null,
    costo_unitario_compra: null,
    proveedor_uuid: null,
    stock_minimo: null,
    stock_maximo: null,
  };

  await productosStore.obtenerCatalogosStock();
  dialogStockVisible.value = true;

  await nextTick();

  await configurarInputFechaModelo(
    fechaCaducidadStockRef,
    () => formStock.value.fecha_caducidad,
    (value) => { formStock.value.fecha_caducidad = value; },
  );

  await configurarInputFechaModelo(
    fechaFabricacionStockRef,
    () => formStock.value.fecha_fabricacion,
    (value) => { formStock.value.fecha_fabricacion = value; },
  );

  await sincronizarInput(fechaCaducidadStockRef, formStock.value.fecha_caducidad);
  await sincronizarInput(fechaFabricacionStockRef, formStock.value.fecha_fabricacion);
}

async function guardarAltaStock() {
  if (!productoDetalle.value?.producto_uuid || !stockFormValido.value) return;

  const payload = {
    almacen_uuid: formStock.value.almacen_uuid,
    codigo_lote: formStock.value.codigo_lote.trim(),
    cantidad_actual: Number(formStock.value.cantidad_actual),
    fecha_caducidad: formatearFechaBackend(formStock.value.fecha_caducidad),
  };

  if (formStock.value.fecha_fabricacion) {
    payload.fecha_fabricacion = formatearFechaBackend(formStock.value.fecha_fabricacion);
  }

  if (formStock.value.costo_unitario_compra !== null && formStock.value.costo_unitario_compra !== undefined) {
    payload.costo_unitario_compra = Number(formStock.value.costo_unitario_compra);
  }

  if (formStock.value.proveedor_uuid) {
    payload.proveedor_uuid = formStock.value.proveedor_uuid;
  }

  if (formStock.value.stock_minimo !== null && formStock.value.stock_minimo !== undefined) {
    payload.stock_minimo = Number(formStock.value.stock_minimo);
  }

  if (formStock.value.stock_maximo !== null && formStock.value.stock_maximo !== undefined) {
    payload.stock_maximo = Number(formStock.value.stock_maximo);
  }

  try {
    await productosStore.altaLoteStock(productoDetalle.value.producto_uuid, payload);
    dialogStockVisible.value = false;
  } catch (error) {
    console.error('Error al registrar alta de stock:', error);
  }
}

watch(
  () => filtros.value.fechaInicio,
  () => sincronizarInput(fechaInicioRef, filtros.value.fechaInicio),
);

watch(
  () => filtros.value.fechaFin,
  () => sincronizarInput(fechaFinRef, filtros.value.fechaFin),
);

watch(
  () => authStore.sucursalActiva?.sucursal_uuid,
  async (nueva, anterior) => {
    if (!nueva || nueva === anterior) return;

    first.value = 0;
    cerrarDetalle();
    productosStore.limpiarCatalogosStock();
    await cargarProductos();
  },
);

onMounted(async () => {
  first.value = 0;
  rows.value = 10;

  await cargarProductos();
  await configurarInputFecha(fechaInicioRef, 'fechaInicio');
  await configurarInputFecha(fechaFinRef, 'fechaFin');
  await sincronizarInput(fechaInicioRef, filtros.value.fechaInicio);
  await sincronizarInput(fechaFinRef, filtros.value.fechaFin);
});

onBeforeUnmount(() => {
  clearTimeout(busquedaTimeout);
});
</script>

<style scoped>
/* ── Tabla ── */
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

.productos-table {
  height: 100%;
}

.productos-table :deep(.p-datatable) {
  height: 100%;
}

.productos-table :deep(.p-datatable-table-container) {
  height: 100%;
}

.productos-table :deep(.p-datatable-wrapper) {
  height: 100%;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-secondary) transparent;
}

.productos-table :deep(.p-datatable-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.productos-table :deep(.p-datatable-wrapper::-webkit-scrollbar-track) {
  background: transparent;
  border-radius: 9999px;
}

.productos-table :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: var(--color-secondary);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.productos-table :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb:hover) {
  background: var(--color-primary);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.productos-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.14);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 1;
}

.productos-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.72rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.08);
}

.productos-table :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

.productos-table :deep(.p-datatable-tbody > tr:hover > td) {
  background: rgba(59, 130, 246, 0.03);
}

.farma-filtros-activos-reserva {
  min-height: 1rem;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Datepicker filtros ── */
.farma-datepicker-click {
  width: 100%;
  cursor: text;
}

.farma-datepicker :deep(.p-datepicker-input),
.farma-datepicker :deep(.farma-datepicker-input) {
  width: 100%;
  height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
  padding: 0.625rem 2.6rem 0.625rem 0.9rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.farma-datepicker :deep(.p-datepicker-input::placeholder),
.farma-datepicker :deep(.farma-datepicker-input::placeholder) {
  color: #94a3b8;
}

.farma-datepicker :deep(.p-datepicker-input:focus),
.farma-datepicker :deep(.farma-datepicker-input:focus) {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.farma-datepicker :deep(.p-datepicker-dropdown) {
  width: 2.5rem;
  border: 0;
  background: transparent;
  border-radius: 0 0.85rem 0.85rem 0;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.farma-datepicker :deep(.p-datepicker-dropdown:hover) {
  background: rgba(59, 130, 246, 0.06);
  color: #2563eb;
}

.farma-datepicker :deep(.p-datepicker-input-icon-container) {
  width: 2.5rem;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ── Select filtros ── */
.farma-select :deep(.p-select) {
  width: 100%;
  min-height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #ffffff;
  box-shadow: none;
}

.farma-select :deep(.p-select-label) {
  padding: 0.625rem 0.9rem;
  color: #0f172a;
}

.farma-select :deep(.p-select-trigger) {
  color: #64748b;
}

/* ── Paginador ── */
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

.farma-paginator :deep(.p-paginator-current) {
  margin: 0 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

/* ── Cards drawer ── */
.card-base {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

/* ── Botones drawer ── */
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

/* ── Inputs drawer / dialogs ── */
.farma-primevue-input {
  width: 100%;
  border-radius: 0.9rem !important;
  font-size: 0.875rem !important;
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

.farma-input-editing:focus {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
  outline: none !important;
}

:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-inputnumber-input) {
  width: 100%;
  border-radius: 0.9rem !important;
  font-size: 0.875rem !important;
  padding: 0.72rem 0.95rem !important;
  box-shadow: none !important;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease !important;
}

:deep(.p-inputnumber-input.farma-input-editing),
:deep(.p-inputnumber .farma-input-editing) {
  background: #ffffff !important;
  border: 1px solid #93c5fd !important;
  color: #0f172a !important;
}

:deep(.p-inputnumber-input.farma-input-editing:focus),
:deep(.p-inputnumber .farma-input-editing:focus) {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
  outline: none !important;
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background: #2563eb !important;
}

/* ── Vista de solo lectura ── */
.farma-view-value {
  border-radius: 0.9rem;
  padding: 0.72rem 0.95rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  min-height: 2.75rem;
  display: flex;
  align-items: center;
}

.farma-view-highlight {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.15);
  color: #2563eb;
  font-weight: 700;
}

/* ── Tabla de lotes ── */
table {
  border-collapse: collapse;
}

/* ── Layout dialog stock ── */
.farma-stock-layout {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.farma-stock-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: visible;
}

.farma-field {
  min-width: 0;
}

/* ── Animaciones ── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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
  transform: translateX(0);
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
}

/* =====================================================
   GLOBAL — PrimeVue teleport / overlays
   ===================================================== */

:global(.farma-menu-popup) {
  border-radius: 1rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.14) !important;
  overflow: hidden !important;
  padding: 0.375rem !important;
  min-width: 11rem !important;
  background: #ffffff !important;
  z-index: 1200 !important;
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

:global(.farma-menu-separator) {
  margin: 0.25rem 0.5rem;
  border-top: 1px solid #e2e8f0;
}

/* ── Dialogs base ── */
:global(.farma-dialog-mask) {
  background: rgba(15, 23, 42, 0.5) !important;
  backdrop-filter: blur(3px) !important;
}

:global(.farma-dialog-root) {
  border-radius: 1.25rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.18) !important;
  overflow: hidden !important;
  background: #ffffff !important;
}

:global(.farma-dialog-root .p-dialog-header) {
  background: #ffffff !important;
}

:global(.farma-dialog-content) {
  padding: 0 !important;
  background: #ffffff !important;
}

/* ── Dialog stock ── */
:global(.farma-dialog-stock) {
  width: min(58rem, 96vw) !important;
  max-width: 96vw !important;
  max-height: 92vh !important;
  min-height: 46rem !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: visible !important;
}

:global(.farma-dialog-stock .p-dialog-content) {
  padding: 0 !important;
  background: #ffffff !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  height: 100% !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}

:global(.farma-dialog-stock .app-scroll) {
  min-height: 0 !important;
  overflow-y: auto !important;
  overflow-x: visible !important;
}

:global(.farma-dialog-stock .p-dialog-content::-webkit-scrollbar),
:global(.farma-dialog-stock .app-scroll::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:global(.farma-dialog-stock .p-dialog-content::-webkit-scrollbar-thumb),
:global(.farma-dialog-stock .app-scroll::-webkit-scrollbar-thumb) {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 9999px;
}

:global(.farma-dialog-stock .p-dialog-content::-webkit-scrollbar-track),
:global(.farma-dialog-stock .app-scroll::-webkit-scrollbar-track) {
  background: transparent;
}

:global(.farma-dialog-stock .p-dialog-content),
:global(.farma-dialog-stock .app-scroll) {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
}

/* ── Selects dentro de formularios ── */
:global(.farma-select-field .p-select) {
  width: 100%;
  min-height: 44px;
  border-radius: 0.9rem !important;
  box-shadow: none !important;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

:global(.farma-select-field.farma-select-disabled .p-select) {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

:global(.farma-select-field.farma-select-editing .p-select) {
  background: #ffffff !important;
  border: 1px solid #93c5fd !important;
}

:global(.farma-select-field.farma-select-editing .p-select:not(.p-disabled):hover) {
  border-color: #60a5fa !important;
}

:global(.farma-select-field.farma-select-editing .p-select.p-focus) {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
}

:global(.farma-select-field .p-select-label) {
  padding: 0.72rem 0.95rem !important;
  color: #0f172a;
  line-height: 1.35;
}

:global(.farma-select-proveedor .p-select-label) {
  padding-right: 2.75rem !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.farma-select-field .p-select-trigger) {
  width: 2.75rem !important;
  color: #64748b !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:global(.farma-select-field .p-select-overlay) {
  border-radius: 0.9rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14) !important;
  z-index: 1300 !important;
  margin-top: 0.25rem !important;
  background: #ffffff !important;
}

:global(.farma-select-field .p-select-list-container) {
  padding: 0.35rem !important;
}

:global(.farma-select-field .p-select-option) {
  border-radius: 0.7rem !important;
  padding: 0.75rem 0.9rem !important;
  line-height: 1.35 !important;
}

:global(.farma-select-field .p-select-option.p-focus) {
  background: rgba(59, 130, 246, 0.08) !important;
  color: #1d4ed8 !important;
}

:global(.farma-select-field .p-select-option.p-select-option-selected) {
  background: rgba(37, 99, 235, 0.1) !important;
  color: #1d4ed8 !important;
  font-weight: 600;
}

/* ── DatePicker panel global ── */
:global(.p-datepicker-panel) {
  z-index: 1300 !important;
  border-radius: 1rem !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14) !important;
  background: #ffffff !important;
}

:global(.p-datepicker-panel .p-datepicker-header) {
  background: #ffffff !important;
  border-bottom: 1px solid #eef2f7 !important;
}

:global(.p-datepicker-panel .p-datepicker-calendar td > span.p-highlight) {
  background: #2563eb !important;
  color: #ffffff !important;
}

:global(.p-datepicker-panel .p-datepicker-calendar td > span:focus) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12) !important;
}

/* ── DatePicker dentro de dialog / drawer ── */
:global(.farma-dialog-root .p-datepicker) {
  width: 100%;
}

:global(.farma-dialog-root .p-datepicker-input),
:global(.farma-dialog-root .p-datepicker .p-inputtext) {
  width: 100%;
}

:global(.farma-dialog-root .p-datepicker-dropdown) {
  width: 2.5rem !important;
  border: 0 !important;
  background: transparent !important;
  color: #64748b !important;
  border-radius: 0 0.85rem 0.85rem 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:global(.farma-dialog-root .p-datepicker-dropdown:hover) {
  background: rgba(59, 130, 246, 0.06) !important;
  color: #2563eb !important;
}

:global(.farma-dialog-root .p-datepicker-input-icon-container) {
  width: 2.5rem !important;
  color: #64748b !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* ── InputNumber en dialogs ── */
:global(.farma-dialog-root .p-inputnumber) {
  width: 100%;
}

:global(.farma-dialog-root .p-inputnumber-input) {
  width: 100%;
  min-height: 44px;
  border-radius: 0.9rem !important;
}

/* ── Responsive dialog stock ── */
@media (max-width: 768px) {
  .farma-stock-body {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  :global(.farma-dialog-stock) {
    width: 96vw !important;
    max-height: 94vh !important;
    min-height: auto !important;
    border-radius: 1rem !important;
  }

  :global(.farma-dialog-stock .p-dialog-content) {
    max-height: none !important;
  }
}
</style>
