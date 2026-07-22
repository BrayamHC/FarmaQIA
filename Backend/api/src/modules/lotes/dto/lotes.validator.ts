import { z } from 'zod';

export const FiltrosLotesSchema = z.object({
    codigo_lote: z.string().optional(),

    almacen_uuid: z.string().uuid('UUID de almacén inválido').optional(),

    almacen_uuids: z
        .union([
            z.array(z.string().uuid('UUID de almacén inválido')),
            z.string().uuid('UUID de almacén inválido'),
        ])
        .transform((value) => Array.isArray(value) ? value : [value])
        .optional(),

    producto_nombre: z.string().optional(),
    producto_sku: z.string().optional(),
    status: z.string().optional(),

    fecha_fabricacion: z
        .string()
        .regex(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/, 'Formato de fecha_fabricacion inválido (YYYY-MM-DD)')
        .transform((f) => f.replace(/\//g, '-'))
        .optional(),

    fecha_caducidad: z
        .string()
        .regex(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/, 'Formato de fecha_caducidad inválido (YYYY-MM-DD)')
        .transform((f) => f.replace(/\//g, '-'))
        .optional(),

    fecha_caducidad_desde: z
        .string()
        .regex(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/, 'Formato de fecha_caducidad_desde inválido (YYYY-MM-DD)')
        .transform((f) => f.replace(/\//g, '-'))
        .optional(),

    fecha_caducidad_hasta: z
        .string()
        .regex(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/, 'Formato de fecha_caducidad_hasta inválido (YYYY-MM-DD)')
        .transform((f) => f.replace(/\//g, '-'))
        .optional(),

    con_stock: z.coerce.boolean().optional(),

    sort: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
}).partial();

export const LoteResponseSchema = z.object({
    lote_uuid: z.string().uuid(),
    codigo_lote: z.string(),
    cantidad_actual: z.preprocess((v) => parseFloat(String(v)), z.number()),
    fecha_fabricacion: z.coerce.date().nullable(),
    fecha_caducidad: z.coerce.date().nullable(),
    costo_unitario_compra: z.preprocess(
        (v) => (v != null ? parseFloat(String(v)) : null),
        z.number().nullable(),
    ),
    status: z.string(),

    almacen_uuid: z.string().uuid(),
    almacen_nombre: z.string(),

    producto_uuid: z.string().uuid().nullable(),
    producto_sku: z.string().nullable(),
    producto_nombre: z.string().nullable(),
    producto_descripcion: z.string().nullable(),
    producto_status: z.string().nullable(),
    producto_presentacion: z.string().nullable(),
    producto_url_imagen: z.string().nullable().optional(),

    fecha_creacion: z.coerce.date(),
    fecha_actualizacion: z.coerce.date().nullable(),
});

export const LotesListaResponseSchema = z.object({
    lotes: z.array(LoteResponseSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
});

export type FiltrosLotes = z.infer<typeof FiltrosLotesSchema>;
export type LoteResponse = z.infer<typeof LoteResponseSchema>;