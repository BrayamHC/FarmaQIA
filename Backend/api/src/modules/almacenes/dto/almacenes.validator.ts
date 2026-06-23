import { z } from 'zod';

export const CrearAlmacenSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
    descripcion: z.string().max(500).optional(),
    encargado: z.string().max(150).optional(),
    direccion: z.string().max(300).optional(),
    telefono: z.string().max(20).optional(),
});

export const ActualizarAlmacenSchema = CrearAlmacenSchema.partial();

export const CambiarStatusAlmacenSchema = z.object({
    status: z.enum(['activo', 'inactivo', 'eliminado']),
});

export const FiltrosAlmacenesSchema = z.object({
    nombre: z.string().optional(),
    encargado: z.string().optional(),
    status: z.enum(['activo', 'inactivo', 'eliminado']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
}).partial();

export type CrearAlmacen = z.infer<typeof CrearAlmacenSchema>;
export type ActualizarAlmacen = z.infer<typeof ActualizarAlmacenSchema>;
export type FiltrosAlmacenes = z.infer<typeof FiltrosAlmacenesSchema>;