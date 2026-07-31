import { Injectable } from '@nestjs/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? (pdfFonts as any).vfs;

// ---------------------------------------------------------------------------
// Paleta de marca FarmaQ IA (tokens: --color-primary #3B82F6 / --color-secondary #60A5FA)
// ---------------------------------------------------------------------------
const MARCA_NOMBRE = 'FarmaQ IA';
const MARCA_TAGLINE = 'Sistema Inteligente de Gestión Farmacéutica';

const PRIMARY = '#3B82F6';       // --color-primary
const PRIMARY_DARK = '#2563EB';  // acento oscuro, mismo tono del botón de login
const SECONDARY = '#60A5FA';     // --color-secondary
const LOGO_BG = '#5B93F5';       // tinte intermedio para el marcador de logo sobre la barra azul
const PRIMARY_LIGHT = '#EFF6FF';
const SLATE_900 = '#0F172A';
const SLATE_500 = '#64748B';
const SLATE_200 = '#E2E8F0';
const SLATE_50 = '#F8FAFC';
const SUCCESS_BG = '#ECFDF5';
const SUCCESS_TEXT = '#047857';
const WARNING_BG = '#FFFBEB';
const WARNING_TEXT = '#B45309';
const DANGER_BG = '#FEF2F2';
const DANGER_TEXT = '#B91C1C';
const WHITE = '#FFFFFF';

const money = (v: number) => (Number(v) || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

@Injectable()
export class PdfGenerator {
    private generarBuffer(docDefinition: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const pdfDocGenerator: any = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
                try {
                    resolve(Buffer.from(buffer));
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // -------------------------------------------------------------------
    // Bloques reutilizables de diseño
    // -------------------------------------------------------------------
    private encabezado(titulo: string, subtitulo: string) {
        return {
            table: {
                widths: ['*'],
                body: [
                    [
                        {
                            columns: [
                                {
                                    width: 40,
                                    table: {
                                        widths: ['*'],
                                        body: [[{ text: '♥', color: WHITE, bold: true, fontSize: 17, alignment: 'center', fillColor: LOGO_BG, margin: [0, 9, 0, 9] }]],
                                    },
                                    layout: 'noBorders',
                                },
                                {
                                    width: '*',
                                    stack: [
                                        { text: `${MARCA_NOMBRE.toUpperCase()} · ${MARCA_TAGLINE.toUpperCase()}`, color: SECONDARY, bold: true, fontSize: 7, characterSpacing: 0.5, margin: [10, 2, 0, 4] },
                                        { text: titulo, color: WHITE, bold: true, fontSize: 17, margin: [10, 0, 0, 2] },
                                        { text: subtitulo, color: PRIMARY_LIGHT, fontSize: 9, margin: [10, 0, 0, 0] },
                                    ],
                                },
                            ],
                            fillColor: PRIMARY,
                            border: [false, false, false, false],
                            margin: [12, 10, 14, 10],
                        },
                    ],
                ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 12],
        };
    }

    private piePagina(currentPage: number, pageCount: number) {
        return {
            columns: [
                { text: `${MARCA_NOMBRE} · ${MARCA_TAGLINE}`, fontSize: 7.5, color: '#94A3B8', margin: [24, 0, 0, 0] },
                { text: `Página ${currentPage} de ${pageCount}`, fontSize: 7.5, color: '#94A3B8', alignment: 'right', margin: [0, 0, 24, 0] },
            ],
        };
    }

    private tarjetaResumen(label: string, valor: string, bg: string = PRIMARY_LIGHT, color: string = PRIMARY_DARK) {
        return {
            stack: [
                { text: label.toUpperCase(), fontSize: 7.5, bold: true, color: SLATE_500, margin: [0, 0, 0, 3] },
                { text: valor, fontSize: 13, bold: true, color },
            ],
            fillColor: bg,
            margin: [10, 8, 10, 8],
        };
    }

    private filaResumenTarjetas(reporte: any) {
        const t = reporte.totales ?? {};
        return {
            table: {
                widths: ['*', '*', '*', '*', '*'],
                body: [
                    [
                        this.tarjetaResumen('Productos', String(t.total_productos ?? 0)),
                        this.tarjetaResumen('Valor costo', money(t.valor_inventario_costo)),
                        this.tarjetaResumen('Valor venta', money(t.valor_inventario_venta)),
                        this.tarjetaResumen(
                            'Bajo stock',
                            String(t.productos_bajo_stock ?? 0),
                            t.productos_bajo_stock > 0 ? WARNING_BG : SUCCESS_BG,
                            t.productos_bajo_stock > 0 ? WARNING_TEXT : SUCCESS_TEXT,
                        ),
                        this.tarjetaResumen(
                            'Por caducar (30d)',
                            String(t.lotes_por_caducar_30dias ?? 0),
                            t.lotes_por_caducar_30dias > 0 ? DANGER_BG : SUCCESS_BG,
                            t.lotes_por_caducar_30dias > 0 ? DANGER_TEXT : SUCCESS_TEXT,
                        ),
                    ],
                ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 14],
        };
    }

    private textoFiltros(reporte: any) {
        const f = reporte.filtros_aplicados ?? {};

        return {
            columns: [
                {
                    text: `Sucursal: ${reporte.sucursal_nombre ?? '—'}`,
                    fontSize: 8.5,
                    color: SLATE_500,
                },
                {
                    text: `Periodo: ${f.fecha_inicio ?? '—'} a ${f.fecha_fin ?? '—'}`,
                    fontSize: 8.5,
                    color: SLATE_500,
                },
                {
                    text: `Almacén: ${f.almacen_nombre ?? 'Todos'}`,
                    fontSize: 8.5,
                    color: SLATE_500,
                },
                {
                    text: `Generado: ${new Date(reporte.generado_en).toLocaleString('es-MX')}`,
                    fontSize: 8.5,
                    color: SLATE_500,
                    alignment: 'right',
                },
            ],
            margin: [0, 0, 0, 10],
        };
    }

    private tituloSeccion(texto: string) {
        return {
            text: texto,
            fontSize: 12,
            bold: true,
            color: PRIMARY_DARK,
            margin: [0, 12, 0, 6],
        };
    }

    private layoutTablaEstandar(fillColors: (string | null)[]) {
        return {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0,
            hLineColor: () => SLATE_200,
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 5,
            paddingBottom: () => 5,
            fillColor: (rowIndex: number) => (rowIndex === 0 ? PRIMARY : fillColors[rowIndex - 1] ?? null),
        };
    }

    private celdaEncabezado(texto: string) {
        return { text: texto, color: WHITE, bold: true, fontSize: 8.5 };
    }

    private badge(texto: string, bg: string, color: string) {
        return {
            table: {
                widths: ['auto'],
                body: [[{ text: texto, fontSize: 7.5, bold: true, color, fillColor: bg, margin: [4, 2, 4, 2] }]],
            },
            layout: 'noBorders',
        };
    }

    // -------------------------------------------------------------------
    // INVENTARIO — resumen + 3 tablas (productos, almacenes, lotes)
    // -------------------------------------------------------------------
    async generarInventario(reporte: any): Promise<Buffer> {
        const items = reporte.items ?? [];

        // ---- Tabla de productos --------------------------------------
        const productosFills: (string | null)[] = [];
        const productosBody = [
            [
                this.celdaEncabezado('SKU'),
                this.celdaEncabezado('Producto'),
                this.celdaEncabezado('Categoría'),
                this.celdaEncabezado('Stock'),
                this.celdaEncabezado('Costo'),
                this.celdaEncabezado('Precio'),
                this.celdaEncabezado('Valor venta'),
                this.celdaEncabezado('Caduca en'),
                this.celdaEncabezado('Estado'),
            ],
        ];

        items.forEach((item: any) => {
            const diasMin = (item.lotes ?? []).reduce((min: number | null, l: any) => {
                if (l.dias_para_caducar == null) return min;
                return min === null ? l.dias_para_caducar : Math.min(min, l.dias_para_caducar);
            }, null as number | null);

            const bajoStockAlmacen = (item.almacenes ?? []).some(
                (a: any) => a.stock_minimo > 0 && a.stock_actual < a.stock_minimo,
            );

            let estadoBadge = this.badge('Disponible', SUCCESS_BG, SUCCESS_TEXT);
            let fill: string | null = null;
            if (item.stock_total === 0) {
                estadoBadge = this.badge('Sin stock', DANGER_BG, DANGER_TEXT);
                fill = DANGER_BG;
            } else if (bajoStockAlmacen) {
                estadoBadge = this.badge('Bajo stock', WARNING_BG, WARNING_TEXT);
                fill = WARNING_BG;
            }
            productosFills.push(fill);

            productosBody.push([
                { text: item.sku, fontSize: 8, color: SLATE_900 },
                { text: item.nombre, fontSize: 8, color: SLATE_900 },
                { text: item.categoria ?? '—', fontSize: 8, color: SLATE_500 },
                { text: String(item.stock_total ?? 0), fontSize: 8, color: SLATE_900, alignment: 'center' },
                { text: money(item.costo_compra), fontSize: 8, color: SLATE_900, alignment: 'right' },
                { text: money(item.precio_publico), fontSize: 8, color: SLATE_900, alignment: 'right' },
                {
                    text: money((item.precio_publico ?? 0) * (item.stock_total ?? 0)),
                    fontSize: 8,
                    bold: true,
                    color: SUCCESS_TEXT,
                    alignment: 'right',
                },
                { text: diasMin === null ? '—' : `${diasMin} días`, fontSize: 8, color: diasMin !== null && diasMin <= 30 ? DANGER_TEXT : SLATE_500, alignment: 'center' },
                estadoBadge,
            ] as any);
        });

        const tablaProductos = {
            table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: productosBody,
            },
            layout: this.layoutTablaEstandar(productosFills),
        };

        // ---- Tabla de almacenes ---------------------------------------
        const almacenesFills: (string | null)[] = [];
        const almacenesBody = [
            [
                this.celdaEncabezado('SKU'),
                this.celdaEncabezado('Producto'),
                this.celdaEncabezado('Almacén'),
                this.celdaEncabezado('Stock actual'),
                this.celdaEncabezado('Mínimo'),
                this.celdaEncabezado('Máximo'),
                this.celdaEncabezado('Estado'),
            ],
        ];

        items.forEach((item: any) => {
            (item.almacenes ?? []).forEach((a: any) => {
                const bajoMinimo = a.stock_minimo > 0 && a.stock_actual < a.stock_minimo;
                almacenesFills.push(bajoMinimo ? WARNING_BG : null);
                almacenesBody.push([
                    { text: item.sku, fontSize: 8, color: SLATE_900 },
                    { text: item.nombre, fontSize: 8, color: SLATE_900 },
                    { text: a.almacen_nombre, fontSize: 8, color: SLATE_900 },
                    { text: String(a.stock_actual), fontSize: 8, color: SLATE_900, alignment: 'center' },
                    { text: String(a.stock_minimo), fontSize: 8, color: SLATE_500, alignment: 'center' },
                    { text: String(a.stock_maximo), fontSize: 8, color: SLATE_500, alignment: 'center' },
                    bajoMinimo ? this.badge('Bajo mínimo', WARNING_BG, WARNING_TEXT) : this.badge('Normal', SUCCESS_BG, SUCCESS_TEXT),
                ] as any);
            });
        });

        const hayAlmacenes = almacenesBody.length > 1;
        if (!hayAlmacenes) {
            almacenesBody.push([
                { text: 'Sin registros de almacén para el periodo seleccionado.', colSpan: 7, fontSize: 8.5, italics: true, color: SLATE_500 },
                {}, {}, {}, {}, {}, {},
            ] as any);
        }

        const tablaAlmacenes = {
            table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: almacenesBody,
            },
            layout: this.layoutTablaEstandar(almacenesFills),
        };

        // ---- Tabla de lotes / caducidades ------------------------------
        const lotesFills: (string | null)[] = [];
        const lotesBody = [
            [
                this.celdaEncabezado('SKU'),
                this.celdaEncabezado('Producto'),
                this.celdaEncabezado('Almacén'),
                this.celdaEncabezado('Lote'),
                this.celdaEncabezado('Cantidad'),
                this.celdaEncabezado('Caducidad'),
                this.celdaEncabezado('Días'),
                this.celdaEncabezado('Alerta'),
            ],
        ];

        items.forEach((item: any) => {
            (item.lotes ?? []).forEach((l: any) => {
                let alerta = { texto: 'Vigente', bg: SUCCESS_BG, color: SUCCESS_TEXT };
                if (l.dias_para_caducar < 0) alerta = { texto: 'Vencido', bg: DANGER_BG, color: DANGER_TEXT };
                else if (l.dias_para_caducar <= 30) alerta = { texto: 'Por vencer', bg: WARNING_BG, color: WARNING_TEXT };

                lotesFills.push(alerta.texto === 'Vigente' ? null : alerta.bg);
                lotesBody.push([
                    { text: item.sku, fontSize: 8, color: SLATE_900 },
                    { text: item.nombre, fontSize: 8, color: SLATE_900 },
                    { text: l.almacen_nombre, fontSize: 8, color: SLATE_900 },
                    { text: l.codigo_lote, fontSize: 8, color: SLATE_500 },
                    { text: String(l.cantidad_actual), fontSize: 8, color: SLATE_900, alignment: 'center' },
                    { text: new Date(l.fecha_caducidad).toLocaleDateString('es-MX'), fontSize: 8, color: SLATE_900, alignment: 'center' },
                    { text: String(l.dias_para_caducar), fontSize: 8, color: SLATE_500, alignment: 'center' },
                    this.badge(alerta.texto, alerta.bg, alerta.color),
                ] as any);
            });
        });

        const hayLotes = lotesBody.length > 1;
        if (!hayLotes) {
            lotesBody.push([
                { text: 'Sin lotes registrados para el periodo seleccionado.', colSpan: 8, fontSize: 8.5, italics: true, color: SLATE_500 },
                {}, {}, {}, {}, {}, {}, {},
            ] as any);
        }

        const tablaLotes = {
            table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: lotesBody,
            },
            layout: this.layoutTablaEstandar(lotesFills),
        };

        const docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [24, 24, 24, 28],
            content: [
                this.encabezado('Reporte de Inventario', 'Existencias, distribución por almacén y control de caducidades'),
                this.textoFiltros(reporte),
                this.filaResumenTarjetas(reporte),
                this.tituloSeccion('Productos'),
                tablaProductos,
                this.tituloSeccion('Distribución por almacén'),
                tablaAlmacenes,
                this.tituloSeccion('Lotes y caducidades'),
                tablaLotes,
            ],
            defaultStyle: { fontSize: 9, color: SLATE_900 },
            footer: (currentPage: number, pageCount: number) => this.piePagina(currentPage, pageCount),
        };

        return this.generarBuffer(docDefinition);
    }

    // -------------------------------------------------------------------
    // VENTAS (con encabezado de marca)
    // -------------------------------------------------------------------
    async generarVentas(reporte: any): Promise<Buffer> {
        const body = [
            [
                this.celdaEncabezado('Folio'),
                this.celdaEncabezado('Fecha'),
                this.celdaEncabezado('Cliente'),
                this.celdaEncabezado('Método'),
                this.celdaEncabezado('Status'),
                this.celdaEncabezado('Total'),
            ],
        ];

        (reporte.items ?? []).forEach((v: any) => {
            body.push([
                { text: v.folio, fontSize: 8, color: SLATE_900 } as any,
                { text: new Date(v.fecha_venta).toLocaleDateString('es-MX'), fontSize: 8, color: SLATE_900 } as any,
                { text: v.cliente_nombre ?? 'Público general', fontSize: 8, color: SLATE_900 } as any,
                { text: v.metodo_pago ?? '', fontSize: 8, color: SLATE_500 } as any,
                { text: v.status, fontSize: 8, color: SLATE_500 } as any,
                { text: money(v.total), fontSize: 8, bold: true, color: SUCCESS_TEXT, alignment: 'right' } as any,
            ]);
        });

        const docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [24, 24, 24, 28],
            content: [
                this.encabezado('Reporte de Ventas', `Ventas: ${reporte.totales?.total_ventas ?? '—'} · Ingresos: ${money(reporte.totales?.total_ingresos)}`),
                {
                    table: { headerRows: 1, widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'], body },
                    layout: this.layoutTablaEstandar(body.slice(1).map(() => null)),
                },
            ],
            defaultStyle: { fontSize: 9, color: SLATE_900 },
            footer: (currentPage: number, pageCount: number) => this.piePagina(currentPage, pageCount),
        };

        return this.generarBuffer(docDefinition);
    }

    // -------------------------------------------------------------------
    // COMPRAS (con encabezado de marca)
    // -------------------------------------------------------------------
    async generarCompras(reporte: any): Promise<Buffer> {
        const body = [
            [
                this.celdaEncabezado('Folio'),
                this.celdaEncabezado('Fecha'),
                this.celdaEncabezado('Proveedor'),
                this.celdaEncabezado('Almacén'),
                this.celdaEncabezado('Status'),
                this.celdaEncabezado('Total'),
            ],
        ];

        (reporte.items ?? []).forEach((c: any) => {
            body.push([
                { text: c.folio_display, fontSize: 8, color: SLATE_900 } as any,
                { text: new Date(c.fecha_orden).toLocaleDateString('es-MX'), fontSize: 8, color: SLATE_900 } as any,
                { text: c.proveedor_nombre ?? '', fontSize: 8, color: SLATE_900 } as any,
                { text: c.almacen_nombre ?? '', fontSize: 8, color: SLATE_500 } as any,
                { text: c.status, fontSize: 8, color: SLATE_500 } as any,
                { text: money(c.total_estimado), fontSize: 8, bold: true, color: SUCCESS_TEXT, alignment: 'right' } as any,
            ]);
        });

        const docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [24, 24, 24, 28],
            content: [
                this.encabezado('Reporte de Compras', `Órdenes: ${reporte.totales?.total_ordenes ?? '—'} · Total estimado: ${money(reporte.totales?.total_estimado)}`),
                {
                    table: { headerRows: 1, widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'], body },
                    layout: this.layoutTablaEstandar(body.slice(1).map(() => null)),
                },
            ],
            defaultStyle: { fontSize: 9, color: SLATE_900 },
            footer: (currentPage: number, pageCount: number) => this.piePagina(currentPage, pageCount),
        };

        return this.generarBuffer(docDefinition);
    }
}