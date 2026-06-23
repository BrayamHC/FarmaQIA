import { z } from 'zod';

export const FiltrosProveedoresSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.enum(['fecha_creacion', 'nombre', 'nombre_comercial', 'rfc']).default('fecha_creacion'),
    order: z.enum(['asc', 'desc']).default('desc'),
    q: z.string().optional(),
    nombre: z.string().optional(),
    nombre_comercial: z.string().optional(),
    rfc: z.string().max(13).optional(),
    status: z.enum(['activo', 'inactivo', 'eliminado']).optional(),
});

export const CrearProveedorSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(255),
    nombre_comercial: z.string().max(255).optional(),
    rfc: z.string().max(13).optional(),
    contacto_nombre: z.string().max(150).optional(),
    contacto_telefono: z.string().max(20).optional(),
    contacto_email: z.string().email('Email inválido').max(150).optional(),

    calle: z.string().max(255).optional(),
    numero_exterior: z.string().max(20).optional(),
    numero_interior: z.string().max(20).optional(),
    colonia: z.string().max(150).optional(),
    municipio: z.string().max(100).optional(),
    estado: z.string().max(100).optional(),
    pais: z.string().max(100).default('México'),
    codigo_postal: z.string().max(10).optional(),

    condiciones_pago: z.string().max(100).optional(),
    dias_credito: z.coerce.number().int().min(0).default(0),

    notas: z.string().optional(),
});

export const ActualizarProveedorSchema = z.object({
    nombre: z.string().min(1).max(255).optional(),
    nombre_comercial: z.string().max(255).nullable().optional(),
    rfc: z.string().max(13).nullable().optional(),
    contacto_nombre: z.string().max(150).nullable().optional(),
    contacto_telefono: z.string().max(20).nullable().optional(),
    contacto_email: z.string().email('Email inválido').max(150).nullable().optional(),

    calle: z.string().max(255).nullable().optional(),
    numero_exterior: z.string().max(20).nullable().optional(),
    numero_interior: z.string().max(20).nullable().optional(),
    colonia: z.string().max(150).nullable().optional(),
    municipio: z.string().max(100).nullable().optional(),
    estado: z.string().max(100).nullable().optional(),
    pais: z.string().max(100).nullable().optional(),
    codigo_postal: z.string().max(10).nullable().optional(),

    condiciones_pago: z.string().max(100).nullable().optional(),
    dias_credito: z.coerce.number().int().min(0).nullable().optional(),

    notas: z.string().nullable().optional(),
});

export const CambiarStatusProveedorSchema = z.object({
    status: z.enum(['activo', 'inactivo', 'eliminado']),
});

export type CrearProveedorInput = z.infer<typeof CrearProveedorSchema>;
export type ActualizarProveedorInput = z.infer<typeof ActualizarProveedorSchema>;
export type FiltrosProveedoresInput = z.infer<typeof FiltrosProveedoresSchema>;