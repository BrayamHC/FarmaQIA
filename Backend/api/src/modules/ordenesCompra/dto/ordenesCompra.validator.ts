import { z } from 'zod';

// ─────────────────────────────────────────────
// PARTIDAS
// ─────────────────────────────────────────────
export const PartidaOCBaseSchema = z.object({
    producto_uuid: z.string().uuid('UUID de producto inválido'),
    cantidad_solicitada: z.coerce.number().positive('La cantidad solicitada debe ser mayor a 0'),
    precio_unitario_est: z.coerce.number().min(0, 'El precio unitario no puede ser negativo'),
    descuento_porcentaje: z.coerce.number().min(0).max(100).default(0),
    comentarios: z.string().max(1000).optional(),
});

export const CrearPartidaOCSchema = PartidaOCBaseSchema;

export const ActualizarPartidaOCSchema = z.object({
    cantidad_solicitada: z.coerce.number().positive().optional(),
    precio_unitario_est: z.coerce.number().min(0).optional(),
    descuento_porcentaje: z.coerce.number().min(0).max(100).optional(),
    comentarios: z.string().max(1000).nullable().optional(),
});

// ─────────────────────────────────────────────
// ORDEN DE COMPRA
// ─────────────────────────────────────────────
export const OrdenCompraBaseSchema = z.object({
    almacen_uuid: z.string().uuid('UUID de almacén inválido'),
    proveedor_uuid: z.string().uuid('UUID de proveedor inválido'),
    serie_uuid: z.string().uuid('UUID de serie inválido').optional(),

    fecha_orden: z
        .string()
        .regex(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/, 'Formato inválido. Use YYYY-MM-DD')
        .transform((f) => f.replace(/\//g, '-'))
        .optional(),

    fecha_entrega_estimada: z
        .string()
        .regex(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/, 'Formato inválido. Use YYYY-MM-DD')
        .transform((f) => f.replace(/\//g, '-'))
        .optional(),

    condiciones_pago: z.string().max(100).optional(),
    moneda: z.enum(['MXN', 'USD', 'EUR']).default('MXN'),
    tipo_cambio: z.coerce.number().positive().default(1),
    notas: z.string().max(2000).optional(),
});

// POST /ordenes-compra
export const CrearOrdenCompraSchema = OrdenCompraBaseSchema.extend({
    partidas: z.array(CrearPartidaOCSchema).min(1, 'La orden debe tener al menos una partida'),
});

// PATCH /ordenes-compra/:uuid
export const ActualizarOrdenCompraSchema = z.object({
    fecha_entrega_estimada: OrdenCompraBaseSchema.shape.fecha_entrega_estimada.optional(),
    condiciones_pago: z.string().max(100).nullable().optional(),
    moneda: z.enum(['MXN', 'USD', 'EUR']).optional(),
    tipo_cambio: z.coerce.number().positive().optional(),
    notas: z.string().max(2000).nullable().optional(),
});

// PATCH /ordenes-compra/:uuid/autorizar
export const AutorizarOrdenCompraSchema = z.object({
    accion: z.enum(['autorizar', 'rechazar']),
    motivo_rechazo: z.string().min(10, 'Especifique el motivo del rechazo').optional(),
}).superRefine((data, ctx) => {
    if (data.accion === 'rechazar' && !data.motivo_rechazo) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['motivo_rechazo'],
            message: 'El motivo de rechazo es requerido al rechazar',
        });
    }
});

// PATCH /ordenes-compra/:uuid/cancelar
export const CancelarOrdenCompraSchema = z.object({
    motivo_cancelacion: z.string().min(10, 'Especifique el motivo de cancelación'),
});

// GET /ordenes-compra
export const FiltrosOrdenCompraSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.enum([
        'borrador',
        'enviada',
        'autorizada',
        'rechazada',
        'recibida_parcial',
        'recibida',
        'cancelada',
    ]).optional(),
    proveedor_uuid: z.string().uuid().optional(),
    folio: z.string().optional(),
    fecha_desde: z.string().optional(),
    fecha_hasta: z.string().optional(),
});

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export type CrearOrdenCompra = z.infer<typeof CrearOrdenCompraSchema>;
export type ActualizarOrdenCompra = z.infer<typeof ActualizarOrdenCompraSchema>;
export type AutorizarOrdenCompra = z.infer<typeof AutorizarOrdenCompraSchema>;
export type CancelarOrdenCompra = z.infer<typeof CancelarOrdenCompraSchema>;
export type FiltrosOrdenCompra = z.infer<typeof FiltrosOrdenCompraSchema>;
export type CrearPartidaOC = z.infer<typeof CrearPartidaOCSchema>;
export type ActualizarPartidaOC = z.infer<typeof ActualizarPartidaOCSchema>;