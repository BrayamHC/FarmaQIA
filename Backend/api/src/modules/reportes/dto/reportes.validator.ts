import { z } from 'zod';

// ─────────────────────────────────────────────
// FILTROS BASE
// ─────────────────────────────────────────────
export const FiltrosFechasSchema = z.object({
    fecha_inicio: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD')
        .optional(),
    fecha_fin: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD')
        .optional(),
    almacen_id: z.coerce.number().int().positive().optional(),
}).partial();

export const FormatoExportacionSchema = z.object({
    formato: z.enum(['excel', 'pdf']),
});

// ─────────────────────────────────────────────
// INVENTARIO
// ─────────────────────────────────────────────
export const ReporteInventarioItemSchema = z.object({
    producto_id: z.number(),
    producto_uuid: z.string().uuid(),
    sku: z.string(),
    nombre: z.string(),
    presentacion: z.string().nullable(),
    categoria: z.string().nullable(),
    con_lote: z.boolean(),
    costo_compra: z.number(),
    precio_publico: z.number(),
    stock_total: z.number(),
    almacenes: z.array(
        z.object({
            almacen_id: z.number(),
            almacen_nombre: z.string(),
            stock_actual: z.number(),
            stock_minimo: z.number(),
            stock_maximo: z.number(),
        }),
    ),
    lotes: z.array(
        z.object({
            codigo_lote: z.string(),
            cantidad_actual: z.number(),
            fecha_caducidad: z.coerce.date().nullable(),
            almacen_nombre: z.string(),
            dias_para_caducar: z.number().nullable(),
        }),
    ),
});

export const ReporteInventarioResponseSchema = z.object({
    generado_en: z.coerce.date(),
    sucursal_id: z.number(),
    filtros_aplicados: z.object({
        fecha_inicio: z.string().nullable(),
        fecha_fin: z.string().nullable(),
        almacen_id: z.number().nullable(),
    }),
    totales: z.object({
        total_productos: z.number(),
        valor_inventario_costo: z.number(),
        valor_inventario_venta: z.number(),
        productos_bajo_stock: z.number(),
        lotes_por_caducar_30dias: z.number(),
    }),
    items: z.array(ReporteInventarioItemSchema),
});

// ─────────────────────────────────────────────
// VENTAS
// ─────────────────────────────────────────────
export const ReporteVentasDetalleItemSchema = z.object({
    detalle_id: z.number(),
    detalle_uuid: z.string().uuid(),
    producto_id: z.number(),
    producto_nombre_snapshot: z.string(),
    sku_snapshot: z.string().nullable(),
    lote_id: z.number().nullable(),
    cantidad: z.number(),
    precio_unitario: z.number(),
    descuento: z.number(),
    impuesto: z.number(),
    subtotal: z.number(),
    total: z.number(),
});

export const ReporteVentasItemSchema = z.object({
    venta_id: z.number(),
    venta_uuid: z.string().uuid(),
    folio: z.string(),
    fecha_venta: z.coerce.date(),
    cliente_id: z.number().nullable(),
    cliente_nombre: z.string().nullable(),
    usuario_venta_id: z.number().nullable(),
    metodo_pago: z.string().nullable(),
    status: z.string(),
    subtotal: z.number(),
    descuento_total: z.number(),
    impuesto_total: z.number(),
    total: z.number(),
    monto_recibido: z.number().nullable(),
    cambio: z.number().nullable(),
    detalles: z.array(ReporteVentasDetalleItemSchema),
});

export const ReporteVentasResponseSchema = z.object({
    generado_en: z.coerce.date(),
    sucursal_id: z.number(),
    filtros_aplicados: z.object({
        fecha_inicio: z.string().nullable(),
        fecha_fin: z.string().nullable(),
        almacen_id: z.number().nullable(),
    }),
    totales: z.object({
        total_ventas: z.number(),
        subtotal: z.number(),
        descuento_total: z.number(),
        impuesto_total: z.number(),
        total_ingresos: z.number(),
        ticket_promedio: z.number(),
        productos_vendidos: z.number(),
    }),
    items: z.array(ReporteVentasItemSchema),
});

// ─────────────────────────────────────────────
// COMPRAS
// ─────────────────────────────────────────────
export const ReporteComprasDetalleItemSchema = z.object({
    partida_oc_id: z.number(),
    partida_oc_uuid: z.string().uuid(),
    producto_id: z.number(),
    producto_nombre: z.string().nullable(),
    sku: z.string().nullable(),
    cantidad_solicitada: z.number(),
    cantidad_recibida: z.number(),
    precio_unitario_est: z.number(),
    descuento_porcentaje: z.number(),
    descuento_importe: z.number(),
    subtotal_estimado: z.number(),
    status: z.string(),
    comentarios: z.string().nullable(),
});

export const ReporteComprasItemSchema = z.object({
    orden_compra_id: z.number(),
    orden_compra_uuid: z.string().uuid(),
    folio_numero: z.string().nullable(),
    folio_display: z.string(),
    fecha_orden: z.coerce.date(),
    fecha_entrega_estimada: z.coerce.date().nullable(),
    proveedor_id: z.number().nullable(),
    proveedor_nombre: z.string().nullable(),
    almacen_id: z.number().nullable(),
    almacen_nombre: z.string().nullable(),
    moneda: z.string().nullable(),
    tipo_cambio: z.number().nullable(),
    subtotal_estimado: z.number(),
    iva_estimado: z.number(),
    total_estimado: z.number(),
    status: z.string(),
    condiciones_pago: z.string().nullable(),
    notas: z.string().nullable(),
    detalles: z.array(ReporteComprasDetalleItemSchema),
});

export const ReporteComprasResponseSchema = z.object({
    generado_en: z.coerce.date(),
    sucursal_id: z.number(),
    filtros_aplicados: z.object({
        fecha_inicio: z.string().nullable(),
        fecha_fin: z.string().nullable(),
        almacen_id: z.number().nullable(),
    }),
    totales: z.object({
        total_ordenes: z.number(),
        subtotal: z.number(),
        iva: z.number(),
        total_estimado: z.number(),
        piezas_solicitadas: z.number(),
        piezas_recibidas: z.number(),
    }),
    items: z.array(ReporteComprasItemSchema),
});

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
export type FiltrosFechas = z.infer<typeof FiltrosFechasSchema>;
export type FormatoExportacion = z.infer<typeof FormatoExportacionSchema>;
export type ReporteInventarioResponse = z.infer<typeof ReporteInventarioResponseSchema>;
export type ReporteVentasResponse = z.infer<typeof ReporteVentasResponseSchema>;
export type ReporteComprasResponse = z.infer<typeof ReporteComprasResponseSchema>;