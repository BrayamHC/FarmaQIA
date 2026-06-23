import { z } from 'zod';

export const FiltrosClienteSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.enum(['fecha_creacion', 'nombre', 'razon_social', 'rfc']).default('fecha_creacion'),
    order: z.enum(['asc', 'desc']).default('desc'),
    q: z.string().optional(),
    nombre: z.string().optional(),
    rfc: z.string().max(20).optional(),
    status: z.enum(['activo', 'inactivo', 'eliminado']).optional(),
    fecha_desde: z.string().optional(),
    fecha_hasta: z.string().optional(),
});

export const CrearClienteSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(255),
    telefono: z.string().max(30).optional(),
    email: z.string().email('Email inválido').max(255).optional(),
    direccion: z.string().optional(),
    rfc: z.string().max(20).optional(),
    razon_social: z.string().max(255).optional(),
    codigo_postal_fiscal: z.string().max(10).optional(),
});

export const ActualizarClienteSchema = z.object({
    nombre: z.string().min(1).max(255).optional(),
    telefono: z.string().max(30).nullable().optional(),
    email: z.string().email('Email inválido').max(255).nullable().optional(),
    direccion: z.string().nullable().optional(),
    rfc: z.string().max(20).nullable().optional(),
    razon_social: z.string().max(255).nullable().optional(),
    codigo_postal_fiscal: z.string().max(10).nullable().optional(),
});

export const CambiarStatusClienteSchema = z.object({
    status: z.enum(['activo', 'inactivo', 'eliminado']),
});

export type CrearClienteInput = z.infer<typeof CrearClienteSchema>;
export type ActualizarClienteInput = z.infer<typeof ActualizarClienteSchema>;
export type FiltrosClienteInput = z.infer<typeof FiltrosClienteSchema>;