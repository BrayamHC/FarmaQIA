// usuarios.validator.ts
import { z } from 'zod';

export const CrearUsuarioSchema = z.object({
    nombre_completo: z.string().min(3).max(150),
    email: z.email(),
    password: z.string().min(8).max(255),
    telefono: z.string().min(10).max(20).optional(),
    rol_uuid: z.uuid(),
});

export const EditarUsuarioSchema = CrearUsuarioSchema.partial()

export const EditarUsuarioResponseSchema = z.object({
    msg: z.string(),
    usuario: z.object({
        usuario_uuid: z.string(),
        nombre_completo: z.string(),
        email: z.email()
    })
});

export const AsignarSucursalesSchema = z.object({
    sucursal_uuids: z.array(z.string().uuid()).min(1),
});

export const FiltrosUsuariosSchema = z.object({
    nombre_completo: z.string().optional(),
    email: z.string().optional(),
    rol_id: z.coerce.number().optional(),
    status: z.enum(['activo', 'inactivo', 'eliminado']).optional(),

});

export const FiltrosRolesSchema = z.object({
    rol_id: z.coerce.number().optional(),
    status: z.enum(['activo', 'inactivo', 'eliminado']).optional(),
});

// Base sin refinements — reutilizable
const OverridesBaseSchema = z.object({
    grant: z.array(z.number().int().positive()).default([]),
    deny: z.array(z.number().int().positive()).default([]),
});

export const UsuarioDetalleResponseSchema = z.object({
    usuario: z.object({
        uuid: z.string(),
        nombre_completo: z.string(),
        email: z.email(),
        telefono: z.string(),
        fecha_creacion: z.date(),
        rol_id: z.number(),
        rol_descripcion: z.string(),
        sucursales: z.array(z.object({
            sucursal_uuid: z.string(),
            nombre: z.string(),
            nombre_comercial: z.string()
        }))
    })
});

// Refinement compartido como función
const validarOverrides = (data: { grant: number[]; deny: number[] }) => {
    const interseccion = data.grant.filter(id => data.deny.includes(id));
    return interseccion.length === 0;
};

// POST — requiere al menos uno
export const AgregarOverridesSchema = OverridesBaseSchema
    .refine(validarOverrides, { message: 'Un permiso no puede estar en grant y deny al mismo tiempo' })
    .refine(
        (data) => data.grant.length > 0 || data.deny.length > 0,
        { message: 'Debes enviar al menos un permiso en grant o deny' }
    );

// PUT — permite arrays vacíos (limpiar todos los overrides es válido)
export const ReemplazarOverridesSchema = OverridesBaseSchema
    .refine(validarOverrides, { message: 'Un permiso no puede estar en grant y deny al mismo tiempo' });

export type CrearUsuario = z.infer<typeof CrearUsuarioSchema>;
export type AsignarSucursales = z.infer<typeof AsignarSucursalesSchema>;
export type FiltrosUsuarios = z.infer<typeof FiltrosUsuariosSchema>;
export type FiltrosRoles = z.infer<typeof FiltrosRolesSchema>;
export type CrearUsuarioInsert = Omit<CrearUsuario, 'rol_uuid'> & { rol_id: number };
export type AgregarOverrides = z.infer<typeof AgregarOverridesSchema>;
export type ReemplazarOverrides = z.infer<typeof ReemplazarOverridesSchema>;
export type EditarUsuario = z.infer<typeof EditarUsuarioSchema>;