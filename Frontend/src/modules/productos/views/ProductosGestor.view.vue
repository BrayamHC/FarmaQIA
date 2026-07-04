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
          placeholder="Todos" showClear class="w-full" />
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
          style="width: min(52rem, 94vw); box-shadow: var(--shadow-lg)">
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
              <Menu ref="menuAccionesRef" :model="accionesMenuItems" popup />

              <button v-if="productoDetalle"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                @click="toggleMenuAcciones">
                <i class="pi pi-ellipsis-v text-xs"></i>
                <span>Acciones</span>
              </button>

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

            <div v-else-if="productoDetalle" class="space-y-6">
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

                    <div class="mt-3 flex flex-wrap gap-2">
                      <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {{ productoDetalle.categoria || 'Sin categoría' }}
                      </span>

                      <span class="rounded-full px-3 py-1 text-xs font-semibold"
                        :class="statusClass(productoDetalle.status, true)">
                        {{ capitalizar(productoDetalle.status) }}
                      </span>

                      <span v-if="productoDetalle.con_lote"
                        class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Con lote
                      </span>
                    </div>

                    <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div class="rounded-xl border border-white/70 bg-white/80 p-3">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">UPC</p>
                        <p class="mt-1 text-sm font-medium text-slate-900">{{ productoDetalle.upc }}</p>
                      </div>

                      <div class="rounded-xl border border-white/70 bg-white/80 p-3">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Unidad</p>
                        <p class="mt-1 text-sm font-medium text-slate-900">{{ productoDetalle.unidad_medida }}</p>
                      </div>

                      <div class="rounded-xl border border-white/70 bg-white/80 p-3">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Clave UM</p>
                        <p class="mt-1 text-sm font-medium text-slate-900">{{ productoDetalle.clave_unidad_medida }}</p>
                      </div>

                      <div class="rounded-xl border border-white/70 bg-white/80 p-3">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Stock total</p>
                        <p class="mt-1 text-sm font-bold text-blue-600">{{ productoDetalle.stock?.total ?? 0 }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Información comercial
                </p>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Presentación</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">{{ productoDetalle.presentacion }}</p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Proveedor</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">{{ productoDetalle.proveedor }}</p>
                  </div>

                  <div class="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-blue-400">Precio público</p>
                    <p class="mt-1.5 text-sm font-bold text-blue-600">
                      {{ formatearMoneda(productoDetalle.precio_publico) }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Costo compra</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ formatearMoneda(productoDetalle.costo_compra) }}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Información técnica
                </p>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Registro sanitario</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">{{ productoDetalle.numero_registro_sanitario }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Temperatura</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ formatearTemperatura(productoDetalle.temperatura) }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Control almacén</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">{{ productoDetalle.control_almacen }}</p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Fecha entrada</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ formatearFechaTexto(productoDetalle.fecha_entrada) }}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Unidades y medidas
                </p>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Peso</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ formatearMedida(productoDetalle.peso_valor, productoDetalle.peso_unidad) }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Volumen</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">
                      {{ formatearMedida(productoDetalle.volumen_valor, productoDetalle.volumen_unidad) }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Factor unidades</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">{{ productoDetalle.factor_unidades ?? '-' }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Unidad entrada</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">{{ productoDetalle.unidad_entrada }}</p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Unidad salida</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">{{ productoDetalle.unidad_salida }}</p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Con lote</p>
                    <p class="mt-1.5 text-sm font-medium text-slate-900">{{ productoDetalle.con_lote ? 'Sí' : 'No' }}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Stock por almacén
                </p>

                <div v-if="productoDetalle.stock?.almacenes?.length" class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div v-for="almacen in productoDetalle.stock.almacenes" :key="almacen.nombre"
                    class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      {{ almacen.nombre }}
                    </p>
                    <p class="mt-1.5 text-sm font-bold text-slate-900">{{ almacen.stock ?? 0 }}</p>
                  </div>
                </div>

                <div v-else class="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-4">
                  <p class="text-sm text-slate-500">No hay desglose de stock por almacén.</p>
                </div>
              </section>

              <section v-if="productoDetalle.tags?.length">
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Tags</p>

                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in productoDetalle.tags" :key="tag"
                    class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {{ tag }}
                  </span>
                </div>
              </section>

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
            </div>

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

    <Dialog v-model:visible="dialogStatusVisible" modal header="Cambiar status" :style="{ width: '30rem' }">
      <div class="space-y-4">
        <p class="text-sm text-slate-600">
          Selecciona el nuevo status para
          <span class="font-semibold text-slate-900">{{ productoDetalle?.nombre }}</span>
          del producto.
        </p>

        <Select v-model="statusObjetivo" :options="statusOptionsCambio" optionLabel="label" optionValue="value"
          placeholder="Selecciona un status" class="w-full" />

        <div class="flex justify-end gap-2 pt-2">
          <button class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            @click="dialogStatusVisible = false">
            Cancelar
          </button>

          <button class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            :disabled="productosStore.cambiandoStatus" @click="confirmarCambioStatus">
            {{ productosStore.cambiandoStatus ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="dialogEliminarVisible" modal header="Eliminar producto" :style="{ width: '30rem' }">
      <div class="space-y-4">
        <p class="text-sm text-slate-600">
          ¿Seguro que deseas eliminar
          <span class="font-semibold text-slate-900">{{ productoDetalle?.nombre }}</span>?
        </p>

        <div class="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
          <p class="text-sm text-rose-700">
            Esta acción cambiará el status del producto a eliminado.
          </p>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            @click="dialogEliminarVisible = false">
            Cancelar
          </button>

          <button class="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white"
            :disabled="productosStore.cambiandoStatus" @click="confirmarEliminar">
            {{ productosStore.cambiandoStatus ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="dialogStockVisible" modal header="Alta de stock" :style="{ width: '42rem' }"
      class="farma-stock-dialog">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="md:col-span-1">
          <label class="mb-1 block text-xs font-medium text-slate-500">Almacén</label>
          <Select v-model="formStock.almacen_uuid" :options="productosStore.almacenesOptions" optionLabel="label"
            optionValue="value" placeholder="Selecciona un almacén" filter class="w-full farma-select"
            :loading="productosStore.cargandoCatalogosStock" />
        </div>

        <div class="md:col-span-1">
          <label class="mb-1 block text-xs font-medium text-slate-500">Código lote</label>
          <input v-model="formStock.codigo_lote" type="text" class="farma-search-input" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Cantidad</label>
          <InputNumber v-model="formStock.cantidad_actual" inputClass="w-full" class="w-full" :min="1" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Costo unitario compra</label>
          <InputNumber v-model="formStock.costo_unitario_compra" inputClass="w-full" class="w-full" mode="currency"
            currency="MXN" locale="es-MX" :min="0" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Fecha fabricación</label>
          <DatePicker v-model="formStock.fecha_fabricacion" dateFormat="yy-mm-dd" showIcon iconDisplay="input"
            class="w-full farma-datepicker-dialog" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Fecha caducidad</label>
          <DatePicker v-model="formStock.fecha_caducidad" dateFormat="yy-mm-dd" showIcon iconDisplay="input"
            class="w-full farma-datepicker-dialog" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Proveedor</label>
          <Select v-model="formStock.proveedor_uuid" :options="productosStore.proveedoresOptions" optionLabel="label"
            optionValue="value" placeholder="Selecciona un proveedor" filter showClear class="w-full farma-select"
            :loading="productosStore.cargandoCatalogosStock" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Stock mínimo</label>
          <InputNumber v-model="formStock.stock_minimo" inputClass="w-full" class="w-full" :min="0" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Stock máximo</label>
          <InputNumber v-model="formStock.stock_maximo" inputClass="w-full" class="w-full" :min="0" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            @click="dialogStockVisible = false">
            Cancelar
          </button>

          <button class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            :disabled="productosStore.guardandoStock || productosStore.cargandoCatalogosStock || !formStock.almacen_uuid"
            @click="guardarAltaStock">
            {{ productosStore.guardandoStock ? 'Guardando...' : 'Registrar alta' }}
          </button>
        </div>
      </template>
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
import InputNumber from 'primevue/inputnumber';
import Menu from 'primevue/menu';
import { useProductosStore } from '../productosStore';
import { useAuthStore } from '@/modules/auth/authStore';

const router = useRouter();
const productosStore = useProductosStore();
const authStore = useAuthStore();

const detalleVisible = ref(false);
const fechaInicioRef = ref(null);
const fechaFinRef = ref(null);
const menuAccionesRef = ref(null);

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

const statusOptions = [
  { label: 'Activos', value: 'activo' },
  { label: 'Inactivos', value: 'inactivo' },
  { label: 'Eliminados', value: 'eliminado' },
];

const statusOptionsCambio = [
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' },
  { label: 'Eliminado', value: 'eliminado' },
];

let busquedaTimeout = null;

const productoDetalle = computed(() => productosStore.productoDetalle);
const totalRegistros = computed(() => Number(productosStore.total || 0));
const paginaActual = computed(() => Math.floor(first.value / rows.value) + 1);
const productosTabla = computed(() => (productosStore.cargando ? [] : productosStore.productos ?? []));

const hayFiltrosActivos = computed(() =>
  Boolean(
    filtros.value.busqueda ||
    filtros.value.fechaInicio ||
    filtros.value.fechaFin ||
    filtros.value.status,
  ),
);

const accionesMenuItems = computed(() => {
  const status = String(productoDetalle.value?.status || '').toLowerCase();

  return [
    {
      label: 'Cambiar status',
      icon: 'pi pi-sync',
      command: () => abrirDialogStatus(productoDetalle.value?.status),
    },
    {
      label: 'Activar',
      icon: 'pi pi-check-circle',
      disabled: status === 'activo',
      command: () => abrirDialogStatus('activo'),
    },
    {
      label: 'Desactivar',
      icon: 'pi pi-ban',
      disabled: status === 'inactivo',
      command: () => abrirDialogStatus('inactivo'),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      disabled: status === 'eliminado',
      command: abrirDialogEliminar,
    },
    {
      separator: true,
    },
    {
      label: 'Alta stock',
      icon: 'pi pi-plus',
      command: abrirDialogStock,
    },
  ];
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

  return fecha.getFullYear() === y && fecha.getMonth() === m - 1 && fecha.getDate() === d
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
    ) {
      return;
    }

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

function statusClass(status, detalle = false) {
  if (status === 'activo') return detalle ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700';
  if (status === 'inactivo') return 'bg-slate-100 text-slate-600';
  if (status === 'eliminado') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
}

function formatearMoneda(valor) {
  if (valor === null || valor === undefined || valor === '') return '-';
  const numero = Number(valor);
  if (Number.isNaN(numero)) return valor;

  return numero.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

function formatearTemperatura(temperatura) {
  if (!temperatura) return '-';
  if (typeof temperatura === 'string') return temperatura;

  const valor = temperatura?.valor ?? null;
  const unidad = temperatura?.unidad ?? '';

  if (valor === null || valor === undefined) return '-';
  return `${valor} ${unidad}`.trim();
}

function formatearMedida(valor, unidad) {
  if ((valor === null || valor === undefined || valor === '') && !unidad) return '-';
  if (valor === null || valor === undefined || valor === '') return unidad;
  return `${valor} ${unidad || ''}`.trim();
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
  busquedaTimeout = setTimeout(() => {
    aplicarFiltros();
  }, 350);
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

async function abrirDetalle(producto) {
  detalleVisible.value = true;
  productosStore.limpiarDetalle();

  try {
    await productosStore.obtenerProductoDetalle(producto.producto_uuid);
  } catch (error) {
    console.error('Error cargando detalle del producto:', error);
  }
}

function cerrarDetalle() {
  detalleVisible.value = false;
  dialogStatusVisible.value = false;
  dialogStockVisible.value = false;
  dialogEliminarVisible.value = false;
  productosStore.limpiarDetalle();
}

function toggleMenuAcciones(event) {
  menuAccionesRef.value?.toggle(event);
}

function abrirDialogStatus(status) {
  statusObjetivo.value = status || productoDetalle.value?.status || 'activo';
  dialogStatusVisible.value = true;
}

function abrirDialogEliminar() {
  dialogEliminarVisible.value = true;
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
}

async function confirmarCambioStatus() {
  if (!productoDetalle.value?.producto_uuid || !statusObjetivo.value) return;

  try {
    await productosStore.cambiarStatusProducto(
      productoDetalle.value.producto_uuid,
      statusObjetivo.value,
    );

    await productosStore.obtenerProductoDetalle(productoDetalle.value.producto_uuid);
    dialogStatusVisible.value = false;
    await cargarProductos();
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

    await productosStore.obtenerProductoDetalle(productoDetalle.value.producto_uuid);
    dialogEliminarVisible.value = false;
    await cargarProductos();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  }
}

async function guardarAltaStock() {
  if (!productoDetalle.value?.producto_uuid) return;

  const payload = {
    almacen_uuid: formStock.value.almacen_uuid || undefined,
    codigo_lote: formStock.value.codigo_lote || undefined,
    cantidad_actual: Number(formStock.value.cantidad_actual ?? 0),
    fecha_fabricacion: formatearFechaBackend(formStock.value.fecha_fabricacion),
    fecha_caducidad: formatearFechaBackend(formStock.value.fecha_caducidad),
    costo_unitario_compra:
      formStock.value.costo_unitario_compra === null ||
        formStock.value.costo_unitario_compra === undefined
        ? undefined
        : Number(formStock.value.costo_unitario_compra),
    proveedor_uuid: formStock.value.proveedor_uuid || undefined,
    stock_minimo:
      formStock.value.stock_minimo === null || formStock.value.stock_minimo === undefined
        ? undefined
        : Number(formStock.value.stock_minimo),
    stock_maximo:
      formStock.value.stock_maximo === null || formStock.value.stock_maximo === undefined
        ? undefined
        : Number(formStock.value.stock_maximo),
  };

  try {
    await productosStore.altaLoteStock(productoDetalle.value.producto_uuid, payload);
    await productosStore.obtenerProductoDetalle(productoDetalle.value.producto_uuid);
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
    detalleVisible.value = false;
    dialogStatusVisible.value = false;
    dialogStockVisible.value = false;
    dialogEliminarVisible.value = false;
    productosStore.limpiarDetalle();
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

.farma-datepicker :deep(.p-datepicker-dropdown),
.farma-datepicker :deep(.p-datepicker-input-icon-container) {
  color: #64748b;
}

.farma-datepicker :deep(.p-datepicker-dropdown) {
  width: 2.5rem;
  border: 0;
  background: transparent;
  border-radius: 0 0.85rem 0.85rem 0;
}

.farma-datepicker :deep(.p-datepicker-dropdown:hover) {
  background: rgba(59, 130, 246, 0.06);
  color: #2563eb;
}

.farma-datepicker-dialog :deep(.p-inputtext) {
  width: 100%;
  min-height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #ffffff;
  color: #0f172a;
  box-shadow: none;
}

.farma-select :deep(.p-select),
.farma-select :deep(.p-dropdown) {
  width: 100%;
  min-height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #ffffff;
  box-shadow: none;
}

.farma-select :deep(.p-select-label),
.farma-select :deep(.p-dropdown-label) {
  padding: 0.625rem 0.9rem;
  color: #0f172a;
}

.farma-select :deep(.p-select-trigger),
.farma-select :deep(.p-dropdown-trigger) {
  color: #64748b;
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

:deep(.p-dialog-mask) {
  background: rgba(15, 23, 42, 0.42) !important;
  backdrop-filter: blur(4px);
}

:deep(.p-dialog) {
  background: #ffffff !important;
}

:deep(.p-dialog .p-dialog-header) {
  background: #ffffff !important;
  border-bottom: 1px solid rgba(226, 232, 240, 0.85);
}

:deep(.p-dialog .p-dialog-content) {
  background: #ffffff !important;
}

:deep(.p-dialog .p-dialog-footer) {
  background: #ffffff !important;
  border-top: 1px solid rgba(226, 232, 240, 0.85);
}

:deep(.farma-stock-dialog .p-dialog) {
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

:deep(.p-menu) {
  border-radius: 0.95rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

:deep(.p-menu .p-menu-item-link) {
  padding: 0.8rem 0.95rem;
  font-size: 0.875rem;
}

:deep(.p-menu .p-menu-item-link:hover) {
  background: rgba(59, 130, 246, 0.06);
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

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
</style>
