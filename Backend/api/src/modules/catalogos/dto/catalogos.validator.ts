import { z } from 'zod';

// ─────────────────────────────────────────────
// TIPOS DE DOCUMENTO
// ─────────────────────────────────────────────
export const FiltrosTiposDocumentoSchema = z.object({
    status: z.enum(['activo', 'inactivo']).optional(),
}).partial();

// ─────────────────────────────────────────────
// SERIES
// ─────────────────────────────────────────────
export const CrearSerieSchema = z.object({
    tipo_documento_uuid: z.string().uuid('UUID de tipo de documento inválido'),
    serie: z
        .string()
        .min(1, 'La serie es obligatoria')
        .max(10, 'La serie no puede exceder 10 caracteres')
        .regex(/^\S+$/, 'La serie no puede contener espacios'),
    prefijo: z.string().max(20, 'El prefijo no puede exceder 20 caracteres').optional(),
    folio_inicial: z.coerce.number().int().min(1).default(1),
    padding: z.coerce.number().int().min(1).max(10).default(6),
    es_default: z.boolean().default(false),
});

export const ActualizarSerieSchema = z.object({
    prefijo: z.string().max(20).nullable().optional(),
    folio_inicial: z.coerce.number().int().min(1).optional(),
    padding: z.coerce.number().int().min(1).max(10).optional(),
}).partial();

export const CambiarStatusSerieSchema = z.object({
    es_activa: z.boolean(),
});

export const FiltrosSeriesSchema = z.object({
    tipo_documento_uuid: z.string().uuid('UUID de tipo de documento inválido').optional(),
    es_activa: z.coerce.boolean().optional(),
    es_default: z.coerce.boolean().optional(),
}).partial();

export const FiltrosUnidadesMedidaSchema = z.object({
    activo: z.coerce.boolean().optional(),
    clave: z.string().optional(),
    nombre: z.string().optional(),
}).partial();

export type FiltrosUnidadesMedida = z.infer<typeof FiltrosUnidadesMedidaSchema>;

export type CrearSerie = z.infer<typeof CrearSerieSchema>;
export type ActualizarSerie = z.infer<typeof ActualizarSerieSchema>;
export type CambiarStatusSerie = z.infer<typeof CambiarStatusSerieSchema>;
export type FiltrosSeries = z.infer<typeof FiltrosSeriesSchema>;