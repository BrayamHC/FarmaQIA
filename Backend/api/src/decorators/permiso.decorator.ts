import { SetMetadata } from '@nestjs/common';

export const PERMISOS_KEY = 'permisos_requeridos';

/**
 * Decorador para proteger endpoints por código de permiso.
 * @example @RequierePermiso('deltaerp.usuarios.ver')
 * @example @RequierePermiso('deltaerp.ordenesCompra.crear', 'deltaerp.proveedores.ver')
 */
export const RequierePermiso = (...permisos: string[]) =>
    SetMetadata(PERMISOS_KEY, permisos);