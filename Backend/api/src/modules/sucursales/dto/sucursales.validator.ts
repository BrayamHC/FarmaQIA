import { z } from 'zod';

// ─────────────────────────────────────────────
// BASE
// ─────────────────────────────────────────────
const SucursalBaseSchema = z.object({
    sucursal_uuid: z.string().uuid(),
    id: z.number(),

    // General
    nombre: z.string().min(3, 'El nombre es requerido').max(150),
    descripcion: z.string().max(500).optional(),
    nombre_comercial: z.string().max(255).optional(),
    status: z.enum(['activo', 'inactivo', 'eliminado']).default('activo'),

    // Contacto
    telefono: z.string().max(20).optional(),
    email: z.string().email('Email inválido').max(150).optional(),

    // Domicilio operativo (solo informativo, no fiscal)
    calle: z.string().max(255).optional(),
    numero_exterior: z.string().max(20).optional(),
    numero_interior: z.string().max(20).optional(),
    colonia: z.string().max(150).optional(),
    municipio: z.string().max(100).optional(),
    estado: z.string().max(100).optional(),
    pais: z.string().max(100).default('México'),
    codigo_postal: z.string().max(10).optional(),

    // Auditoría
    usuario_creacion: z.number(),
    usuario_actualizacion: z.number().nullable(),
    fecha_creacion: z.string(),
    fecha_actualizacion: z.string().nullable(),
});

// ─────────────────────────────────────────────
// CREAR
// ─────────────────────────────────────────────
export const CrearSucursalSchema = SucursalBaseSchema.omit({
    sucursal_uuid: true,
    id: true,
    status: true,
    usuario_creacion: true,
    usuario_actualizacion: true,
    fecha_creacion: true,
    fecha_actualizacion: true,
});

// ─────────────────────────────────────────────
// ACTUALIZAR
// ─────────────────────────────────────────────
export const ActualizarSucursalSchema = CrearSucursalSchema.partial();

// ─────────────────────────────────────────────
// CAMBIAR STATUS
// ─────────────────────────────────────────────
export const CambiarStatusSucursalSchema = z.object({
    status: z.enum(['activo', 'inactivo', 'eliminado']),
});

// ─────────────────────────────────────────────
// SELECCIONAR SUCURSAL EN SESIÓN
// ─────────────────────────────────────────────
export const SeleccionarSucursalSchema = z.object({
    sucursal_uuid: z.string().uuid('UUID de sucursal inválido'),
});

// ─────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────
export const FiltrosSucursalesSchema = z.object({
    nombre: z.string().optional(),
    nombre_comercial: z.string().optional(),
    municipio: z.string().optional(),
    estado: z.string().optional(),
    status: z.enum(['activo', 'inactivo', 'eliminado']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
}).partial();

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
export type CrearSucursal = z.infer<typeof CrearSucursalSchema>;
export type ActualizarSucursal = z.infer<typeof ActualizarSucursalSchema>;
export type FiltrosSucursales = z.infer<typeof FiltrosSucursalesSchema>;
export type SeleccionarSucursal = z.infer<typeof SeleccionarSucursalSchema>;