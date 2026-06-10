import { z } from 'zod';

export const LoginSchema = z.object({
    email: z
        .string({ message: 'El email es requerido' })
        .email('Email inválido')
        .trim()
        .toLowerCase(),
    password: z
        .string({ message: 'La contraseña es requerida' })
        .min(1, 'La contraseña es requerida'),
});

export const LogoutSchema = z.object({});

export const SesionActualSchema = z.object({
    usuario_uuid: z.string(),
    nombre_completo: z.string(),
    email: z.string().email(),
    rol: z.object({
        rol_uuid: z.string().nullable(),
        nombre: z.string(),
        codigo: z.string().nullable(),
    }),
    permisos: z.array(z.string()),
});

export type LoginType = z.infer<typeof LoginSchema>;
export type LogoutType = z.infer<typeof LogoutSchema>;
export type SesionActualType = z.infer<typeof SesionActualSchema>;