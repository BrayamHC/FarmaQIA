import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

// ---------------------------------------------------------------------------
// Paleta de marca FarmaQ IA (tokens: --color-primary #3B82F6 / --color-secondary #60A5FA)
// ---------------------------------------------------------------------------
const MARCA_NOMBRE = 'FarmaQ IA';
const MARCA_TAGLINE = 'Sistema Inteligente de Gestión Farmacéutica';
const FONT_TITLE = 'Manrope';
const FONT_BODY = 'Inter';

const COLOR_PRIMARY = 'FF3B82F6';      // --color-primary
const COLOR_SECONDARY = 'FF60A5FA';    // --color-secondary
const COLOR_PRIMARY_DARK = 'FF2563EB'; // acento oscuro (mismo del botón de login)
const COLOR_HEADER_TEXT = 'FFFFFFFF';
const COLOR_STRIPE = 'FFF8FAFC';       // slate-50
const COLOR_BORDER = 'FFE2E8F0';       // slate-200
const COLOR_TEXT = 'FF0F172A';         // slate-900
const COLOR_MUTED = 'FF64748B';        // slate-500
const COLOR_SUCCESS_BG = 'FFECFDF5';   // emerald-50
const COLOR_SUCCESS_TEXT = 'FF047857'; // emerald-700
const COLOR_WARNING_BG = 'FFFFFBEB';   // amber-50
const COLOR_WARNING_TEXT = 'FFB45309'; // amber-700
const COLOR_DANGER_BG = 'FFFEF2F2';    // rose-50
const COLOR_DANGER_TEXT = 'FFB91C1C';  // rose-700

const CURRENCY_FMT = '"$"#,##0.00';

@Injectable()
export class ExcelGenerator {
    // -------------------------------------------------------------------
    // Helpers de estilo
    // -------------------------------------------------------------------
    private estiloHeaderFila(row: ExcelJS.Row) {
        row.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: COLOR_HEADER_TEXT }, size: 11 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
            cell.border = {
                top: { style: 'thin', color: { argb: COLOR_PRIMARY_DARK } },
                bottom: { style: 'thin', color: { argb: COLOR_PRIMARY_DARK } },
            };
        });
        row.height = 22;
    }

    private aplicarBordesYStripes(sheet: ExcelJS.Worksheet, filaInicio: number) {
        for (let i = filaInicio; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            const esPar = (i - filaInicio) % 2 === 1;
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
                };
                if (esPar) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_STRIPE } };
                }
                cell.font = cell.font?.bold ? cell.font : { color: { argb: COLOR_TEXT }, size: 10 };
            });
        }
    }

    private pintarBadge(cell: ExcelJS.Cell, texto: string, bg: string, texto_color: string) {
        cell.value = texto;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.font = { bold: true, color: { argb: texto_color }, size: 9 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }

    /** Pie de página impreso con la marca, igual en todas las hojas */
    private aplicarPiePagina(sheet: ExcelJS.Worksheet) {
        sheet.headerFooter.oddFooter = `&L&8&"${FONT_BODY}"${MARCA_NOMBRE} — ${MARCA_TAGLINE}&C&8Página &P de &N&R&8${new Date().toLocaleDateString('es-MX')}`;
    }

    /** Franja de marca (logo + nombre) usada como encabezado visual en la portada */
    private franjaMarca(sheet: ExcelJS.Worksheet, filaNum: number = 1) {
        sheet.mergeCells(`A${filaNum}:B${filaNum}`);
        const logoCell = sheet.getCell(`A${filaNum}`);
        logoCell.value = 'FarmaQ';
        logoCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' }, name: FONT_TITLE };
        logoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
        logoCell.alignment = { vertical: 'middle', horizontal: 'center' };

        sheet.mergeCells(`C${filaNum}:F${filaNum}`);
        const taglineCell = sheet.getCell(`C${filaNum}`);
        taglineCell.value = MARCA_TAGLINE.toUpperCase();
        taglineCell.font = { bold: true, size: 8, color: { argb: COLOR_SECONDARY }, name: FONT_BODY, italic: false };
        taglineCell.alignment = { vertical: 'middle', horizontal: 'left' };

        sheet.getRow(filaNum).height = 22;
    }

    private tituloPortada(sheet: ExcelJS.Worksheet, titulo: string, subtitulo: string) {
        this.franjaMarca(sheet, 1);

        sheet.mergeCells('A2:F2');
        const tituloCell = sheet.getCell('A2');
        tituloCell.value = titulo;
        tituloCell.font = { bold: true, size: 18, color: { argb: COLOR_PRIMARY_DARK }, name: FONT_TITLE };
        sheet.getRow(2).height = 28;

        sheet.mergeCells('A3:F3');
        const subCell = sheet.getCell('A3');
        subCell.value = subtitulo;
        subCell.font = { italic: true, size: 10, color: { argb: COLOR_MUTED }, name: FONT_BODY };
    }

    // -------------------------------------------------------------------
    // INVENTARIO — 4 hojas: Resumen, Productos, Almacenes, Lotes
    // -------------------------------------------------------------------
    async generarInventario(reporte: any): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema Farmacia';
        workbook.created = new Date();

        this.hojaResumen(workbook, reporte);
        this.hojaProductos(workbook, reporte);
        this.hojaAlmacenes(workbook, reporte);
        this.hojaLotes(workbook, reporte);

        return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
    }

    private hojaResumen(workbook: ExcelJS.Workbook, reporte: any) {
        const sheet = workbook.addWorksheet('Resumen', {
            views: [{ showGridLines: false }],
        });

        sheet.columns = [
            { width: 30 },
            { width: 26 },
            { width: 4 },
            { width: 30 },
            { width: 26 },
        ];

        this.tituloPortada(
            sheet,
            'Reporte de Inventario',
            `Generado: ${new Date(reporte.generado_en).toLocaleString('es-MX')} · ${reporte.sucursal_nombre ?? 'Sucursal no disponible'}`,
        );

        this.aplicarPiePagina(sheet);

        // -----------------------------------------------------------------
        // Filtros
        // -----------------------------------------------------------------

        sheet.getCell('A5').value = 'Filtros aplicados';
        sheet.getCell('A5').font = {
            bold: true,
            color: { argb: COLOR_PRIMARY_DARK },
            size: 12,
            name: FONT_TITLE,
        };

        const filtros = reporte.filtros_aplicados ?? {};

        const filasFiltro: [string, any][] = [
            ['Sucursal', reporte.sucursal_nombre ?? '—'],
            ['Almacén', filtros.almacen_nombre ?? 'Todos'],
            ['Fecha inicio', filtros.fecha_inicio ?? '—'],
            ['Fecha fin', filtros.fecha_fin ?? '—'],
        ];

        filasFiltro.forEach(([label, valor], idx) => {
            const row = sheet.getRow(6 + idx);

            row.getCell(1).value = label;
            row.getCell(1).font = {
                color: { argb: COLOR_MUTED },
                size: 10,
            };

            row.getCell(2).value = valor;
            row.getCell(2).font = {
                color: { argb: COLOR_TEXT },
                size: 10,
                bold: true,
            };
        });

        // -----------------------------------------------------------------
        // Indicadores
        // -----------------------------------------------------------------

        sheet.getCell('A11').value = 'Indicadores clave';
        sheet.getCell('A11').font = {
            bold: true,
            color: { argb: COLOR_PRIMARY_DARK },
            size: 12,
            name: FONT_TITLE,
        };

        const t = reporte.totales ?? {};

        const indicadores: [string, any, string?][] = [
            ['Total de productos', t.total_productos],
            ['Valor de inventario (costo)', t.valor_inventario_costo, CURRENCY_FMT],
            ['Valor de inventario (venta)', t.valor_inventario_venta, CURRENCY_FMT],
            ['Productos con bajo stock', t.productos_bajo_stock],
            ['Lotes por caducar (30 días)', t.lotes_por_caducar_30dias],
        ];

        indicadores.forEach(([label, valor, fmt], idx) => {
            const rowNum = 12 + idx;

            const labelCell = sheet.getCell(rowNum, 1);
            const valueCell = sheet.getCell(rowNum, 2);

            labelCell.value = label;
            labelCell.font = {
                color: { argb: COLOR_TEXT },
                size: 10,
            };

            valueCell.value = valor ?? 0;
            valueCell.font = {
                bold: true,
                size: 12,
                color: { argb: COLOR_PRIMARY_DARK },
            };

            if (fmt) {
                valueCell.numFmt = fmt;
            }

            sheet.getRow(rowNum).eachCell((cell) => {
                cell.border = {
                    bottom: {
                        style: 'hair',
                        color: { argb: COLOR_BORDER },
                    },
                };
            });
        });
    }

    private hojaProductos(workbook: ExcelJS.Workbook, reporte: any) {
        const sheet = workbook.addWorksheet('Productos', { views: [{ state: 'frozen', ySplit: 1 }] });

        sheet.columns = [
            { header: 'SKU', key: 'sku', width: 16 },
            { header: 'Nombre', key: 'nombre', width: 34 },
            { header: 'Categoría', key: 'categoria', width: 22 },
            { header: 'Presentación', key: 'presentacion', width: 20 },
            { header: 'Stock total', key: 'stock_total', width: 12 },
            { header: 'Costo compra', key: 'costo_compra', width: 14 },
            { header: 'Precio público', key: 'precio_publico', width: 14 },
            { header: 'Valor costo', key: 'valor_costo', width: 15 },
            { header: 'Valor venta', key: 'valor_venta', width: 15 },
            { header: 'Almacenes', key: 'almacenes_resumen', width: 30 },
            { header: 'Próx. caducidad (días)', key: 'proxima_caducidad', width: 18 },
            { header: 'Estado', key: 'estado', width: 16 },
        ];
        this.estiloHeaderFila(sheet.getRow(1));
        this.aplicarPiePagina(sheet);

        (reporte.items ?? []).forEach((item: any) => {
            const almacenesResumen = (item.almacenes ?? [])
                .map((a: any) => `${a.almacen_nombre}: ${a.stock_actual}`)
                .join(' | ') || '—';

            const diasMin = (item.lotes ?? []).reduce((min: number | null, l: any) => {
                if (l.dias_para_caducar == null) return min;
                return min === null ? l.dias_para_caducar : Math.min(min, l.dias_para_caducar);
            }, null as number | null);

            const bajoStockAlmacen = (item.almacenes ?? []).some(
                (a: any) => a.stock_minimo > 0 && a.stock_actual < a.stock_minimo,
            );

            let estado = 'Disponible';
            if (item.stock_total === 0) estado = 'Sin stock';
            else if (bajoStockAlmacen) estado = 'Bajo stock';

            const row = sheet.addRow({
                sku: item.sku,
                nombre: item.nombre,
                categoria: item.categoria ?? '—',
                presentacion: item.presentacion ?? '—',
                stock_total: item.stock_total,
                costo_compra: item.costo_compra,
                precio_publico: item.precio_publico,
                valor_costo: (item.costo_compra ?? 0) * (item.stock_total ?? 0),
                valor_venta: (item.precio_publico ?? 0) * (item.stock_total ?? 0),
                almacenes_resumen: almacenesResumen,
                proxima_caducidad: diasMin ?? '—',
                estado,
            });

            row.getCell('costo_compra').numFmt = CURRENCY_FMT;
            row.getCell('precio_publico').numFmt = CURRENCY_FMT;
            row.getCell('valor_costo').numFmt = CURRENCY_FMT;
            row.getCell('valor_venta').numFmt = CURRENCY_FMT;

            const estadoCell = row.getCell('estado');
            if (estado === 'Sin stock') this.pintarBadge(estadoCell, 'Sin stock', COLOR_DANGER_BG, COLOR_DANGER_TEXT);
            else if (estado === 'Bajo stock') this.pintarBadge(estadoCell, 'Bajo stock', COLOR_WARNING_BG, COLOR_WARNING_TEXT);
            else this.pintarBadge(estadoCell, 'Disponible', COLOR_SUCCESS_BG, COLOR_SUCCESS_TEXT);

            if (diasMin !== null && diasMin <= 30) {
                const cadCell = row.getCell('proxima_caducidad');
                cadCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: diasMin < 0 ? COLOR_DANGER_BG : COLOR_WARNING_BG } };
                cadCell.font = { bold: true, color: { argb: diasMin < 0 ? COLOR_DANGER_TEXT : COLOR_WARNING_TEXT } };
            }
        });

        this.aplicarBordesYStripes(sheet, 2);
        sheet.autoFilter = { from: 'A1', to: 'L1' };
    }

    private hojaAlmacenes(workbook: ExcelJS.Workbook, reporte: any) {
        const sheet = workbook.addWorksheet('Almacenes', { views: [{ state: 'frozen', ySplit: 1 }] });

        sheet.columns = [
            { header: 'SKU', key: 'sku', width: 16 },
            { header: 'Producto', key: 'nombre', width: 32 },
            { header: 'Almacén', key: 'almacen_nombre', width: 22 },
            { header: 'Stock actual', key: 'stock_actual', width: 14 },
            { header: 'Stock mínimo', key: 'stock_minimo', width: 14 },
            { header: 'Stock máximo', key: 'stock_maximo', width: 14 },
            { header: 'Estado', key: 'estado', width: 16 },
        ];
        this.estiloHeaderFila(sheet.getRow(1));
        this.aplicarPiePagina(sheet);

        (reporte.items ?? []).forEach((item: any) => {
            (item.almacenes ?? []).forEach((a: any) => {
                const bajoMinimo = a.stock_minimo > 0 && a.stock_actual < a.stock_minimo;
                const row = sheet.addRow({
                    sku: item.sku,
                    nombre: item.nombre,
                    almacen_nombre: a.almacen_nombre,
                    stock_actual: a.stock_actual,
                    stock_minimo: a.stock_minimo,
                    stock_maximo: a.stock_maximo,
                    estado: bajoMinimo ? 'Bajo mínimo' : 'Normal',
                });
                const estadoCell = row.getCell('estado');
                if (bajoMinimo) this.pintarBadge(estadoCell, 'Bajo mínimo', COLOR_WARNING_BG, COLOR_WARNING_TEXT);
                else this.pintarBadge(estadoCell, 'Normal', COLOR_SUCCESS_BG, COLOR_SUCCESS_TEXT);
            });
        });

        if (sheet.rowCount === 1) {
            sheet.addRow({ sku: 'Sin registros de almacén para el periodo seleccionado.' });
        }

        this.aplicarBordesYStripes(sheet, 2);
        sheet.autoFilter = { from: 'A1', to: 'G1' };
    }

    private hojaLotes(workbook: ExcelJS.Workbook, reporte: any) {
        const sheet = workbook.addWorksheet('Lotes', { views: [{ state: 'frozen', ySplit: 1 }] });

        sheet.columns = [
            { header: 'SKU', key: 'sku', width: 16 },
            { header: 'Producto', key: 'nombre', width: 32 },
            { header: 'Almacén', key: 'almacen_nombre', width: 20 },
            { header: 'Código de lote', key: 'codigo_lote', width: 18 },
            { header: 'Cantidad actual', key: 'cantidad_actual', width: 15 },
            { header: 'Fecha de caducidad', key: 'fecha_caducidad', width: 18 },
            { header: 'Días para caducar', key: 'dias_para_caducar', width: 16 },
            { header: 'Alerta', key: 'alerta', width: 16 },
        ];
        this.estiloHeaderFila(sheet.getRow(1));
        this.aplicarPiePagina(sheet);

        (reporte.items ?? []).forEach((item: any) => {
            (item.lotes ?? []).forEach((l: any) => {
                let alerta = 'Vigente';
                if (l.dias_para_caducar < 0) alerta = 'Vencido';
                else if (l.dias_para_caducar <= 30) alerta = 'Por vencer';

                const row = sheet.addRow({
                    sku: item.sku,
                    nombre: item.nombre,
                    almacen_nombre: l.almacen_nombre,
                    codigo_lote: l.codigo_lote,
                    cantidad_actual: l.cantidad_actual,
                    fecha_caducidad: new Date(l.fecha_caducidad).toLocaleDateString('es-MX'),
                    dias_para_caducar: l.dias_para_caducar,
                    alerta,
                });

                const alertaCell = row.getCell('alerta');
                if (alerta === 'Vencido') this.pintarBadge(alertaCell, 'Vencido', COLOR_DANGER_BG, COLOR_DANGER_TEXT);
                else if (alerta === 'Por vencer') this.pintarBadge(alertaCell, 'Por vencer', COLOR_WARNING_BG, COLOR_WARNING_TEXT);
                else this.pintarBadge(alertaCell, 'Vigente', COLOR_SUCCESS_BG, COLOR_SUCCESS_TEXT);
            });
        });

        if (sheet.rowCount === 1) {
            sheet.addRow({ sku: 'Sin lotes registrados para el periodo seleccionado.' });
        }

        this.aplicarBordesYStripes(sheet, 2);
        sheet.autoFilter = { from: 'A1', to: 'H1' };
    }

    // -------------------------------------------------------------------
    // VENTAS (con estilo de marca aplicado al encabezado)
    // -------------------------------------------------------------------
    async generarVentas(reporte: any): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();

        const ventasSheet = workbook.addWorksheet('Ventas', { views: [{ state: 'frozen', ySplit: 1 }] });
        ventasSheet.columns = [
            { header: 'Folio', key: 'folio', width: 18 },
            { header: 'Fecha venta', key: 'fecha_venta', width: 20 },
            { header: 'Cliente', key: 'cliente_nombre', width: 28 },
            { header: 'Método pago', key: 'metodo_pago', width: 18 },
            { header: 'Status', key: 'status', width: 14 },
            { header: 'Subtotal', key: 'subtotal', width: 14 },
            { header: 'Descuento', key: 'descuento_total', width: 14 },
            { header: 'Impuesto', key: 'impuesto_total', width: 14 },
            { header: 'Total', key: 'total', width: 14 },
        ];
        this.estiloHeaderFila(ventasSheet.getRow(1));
        this.aplicarPiePagina(ventasSheet);

        (reporte.items ?? []).forEach((venta: any) => {
            const row = ventasSheet.addRow({
                folio: venta.folio,
                fecha_venta: venta.fecha_venta,
                cliente_nombre: venta.cliente_nombre ?? 'Público general',
                metodo_pago: venta.metodo_pago ?? '',
                status: venta.status,
                subtotal: venta.subtotal,
                descuento_total: venta.descuento_total,
                impuesto_total: venta.impuesto_total,
                total: venta.total,
            });
            ['subtotal', 'descuento_total', 'impuesto_total', 'total'].forEach((k) => {
                row.getCell(k).numFmt = CURRENCY_FMT;
            });
        });
        this.aplicarBordesYStripes(ventasSheet, 2);
        ventasSheet.autoFilter = { from: 'A1', to: 'I1' };

        const detalleSheet = workbook.addWorksheet('Ventas Detalle', { views: [{ state: 'frozen', ySplit: 1 }] });
        detalleSheet.columns = [
            { header: 'Folio', key: 'folio', width: 18 },
            { header: 'Producto', key: 'producto', width: 35 },
            { header: 'SKU', key: 'sku', width: 20 },
            { header: 'Cantidad', key: 'cantidad', width: 12 },
            { header: 'Precio unitario', key: 'precio_unitario', width: 15 },
            { header: 'Descuento', key: 'descuento', width: 12 },
            { header: 'Impuesto', key: 'impuesto', width: 12 },
            { header: 'Subtotal', key: 'subtotal', width: 14 },
            { header: 'Total', key: 'total', width: 14 },
        ];
        this.estiloHeaderFila(detalleSheet.getRow(1));
        this.aplicarPiePagina(detalleSheet);

        (reporte.items ?? []).forEach((venta: any) => {
            (venta.detalles ?? []).forEach((detalle: any) => {
                const row = detalleSheet.addRow({
                    folio: venta.folio,
                    producto: detalle.producto_nombre_snapshot,
                    sku: detalle.sku_snapshot ?? '',
                    cantidad: detalle.cantidad,
                    precio_unitario: detalle.precio_unitario,
                    descuento: detalle.descuento,
                    impuesto: detalle.impuesto,
                    subtotal: detalle.subtotal,
                    total: detalle.total,
                });
                ['precio_unitario', 'descuento', 'impuesto', 'subtotal', 'total'].forEach((k) => {
                    row.getCell(k).numFmt = CURRENCY_FMT;
                });
            });
        });
        this.aplicarBordesYStripes(detalleSheet, 2);

        return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
    }

    // -------------------------------------------------------------------
    // COMPRAS (con estilo de marca aplicado al encabezado)
    // -------------------------------------------------------------------
    async generarCompras(reporte: any): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();

        const comprasSheet = workbook.addWorksheet('Compras', { views: [{ state: 'frozen', ySplit: 1 }] });
        comprasSheet.columns = [
            { header: 'Folio', key: 'folio_display', width: 20 },
            { header: 'Fecha orden', key: 'fecha_orden', width: 20 },
            { header: 'Proveedor', key: 'proveedor_nombre', width: 30 },
            { header: 'Almacén', key: 'almacen_nombre', width: 22 },
            { header: 'Moneda', key: 'moneda', width: 12 },
            { header: 'Status', key: 'status', width: 14 },
            { header: 'Subtotal', key: 'subtotal_estimado', width: 14 },
            { header: 'IVA', key: 'iva_estimado', width: 14 },
            { header: 'Total', key: 'total_estimado', width: 14 },
        ];
        this.estiloHeaderFila(comprasSheet.getRow(1));
        this.aplicarPiePagina(comprasSheet);

        (reporte.items ?? []).forEach((compra: any) => {
            const row = comprasSheet.addRow({
                folio_display: compra.folio_display,
                fecha_orden: compra.fecha_orden,
                proveedor_nombre: compra.proveedor_nombre ?? '',
                almacen_nombre: compra.almacen_nombre ?? '',
                moneda: compra.moneda ?? '',
                status: compra.status,
                subtotal_estimado: compra.subtotal_estimado,
                iva_estimado: compra.iva_estimado,
                total_estimado: compra.total_estimado,
            });
            ['subtotal_estimado', 'iva_estimado', 'total_estimado'].forEach((k) => {
                row.getCell(k).numFmt = CURRENCY_FMT;
            });
        });
        this.aplicarBordesYStripes(comprasSheet, 2);
        comprasSheet.autoFilter = { from: 'A1', to: 'I1' };

        const detalleSheet = workbook.addWorksheet('Compras Detalle', { views: [{ state: 'frozen', ySplit: 1 }] });
        detalleSheet.columns = [
            { header: 'Folio', key: 'folio', width: 20 },
            { header: 'Producto', key: 'producto_nombre', width: 35 },
            { header: 'SKU', key: 'sku', width: 20 },
            { header: 'Cant. solicitada', key: 'cantidad_solicitada', width: 16 },
            { header: 'Cant. recibida', key: 'cantidad_recibida', width: 16 },
            { header: 'Precio unitario', key: 'precio_unitario_est', width: 15 },
            { header: 'Desc. %', key: 'descuento_porcentaje', width: 12 },
            { header: 'Desc. importe', key: 'descuento_importe', width: 14 },
            { header: 'Subtotal', key: 'subtotal_estimado', width: 14 },
            { header: 'Status', key: 'status', width: 14 },
        ];
        this.estiloHeaderFila(detalleSheet.getRow(1));
        this.aplicarPiePagina(detalleSheet);

        (reporte.items ?? []).forEach((compra: any) => {
            (compra.detalles ?? []).forEach((detalle: any) => {
                const row = detalleSheet.addRow({
                    folio: compra.folio_display,
                    producto_nombre: detalle.producto_nombre ?? '',
                    sku: detalle.sku ?? '',
                    cantidad_solicitada: detalle.cantidad_solicitada,
                    cantidad_recibida: detalle.cantidad_recibida,
                    precio_unitario_est: detalle.precio_unitario_est,
                    descuento_porcentaje: detalle.descuento_porcentaje,
                    descuento_importe: detalle.descuento_importe,
                    subtotal_estimado: detalle.subtotal_estimado,
                    status: detalle.status,
                });
                ['precio_unitario_est', 'descuento_importe', 'subtotal_estimado'].forEach((k) => {
                    row.getCell(k).numFmt = CURRENCY_FMT;
                });
            });
        });
        this.aplicarBordesYStripes(detalleSheet, 2);

        return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
    }
}