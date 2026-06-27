import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from '../../../config/database.constants';

@Injectable()
export class AuthRepoData {
    private readonly logger = new Logger(AuthRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly knex: Knex,
    ) { }

    async obtenerUsuarioPorEmail(email: string) {
        try {
            return await this.knex('usuarios as u')
                .select(
                    'u.usuario_id',
                    'u.usuario_uuid',
                    'u.nombre_completo',
                    'u.email',
                    'u.password',
                    'u.rol_id',
                    'u.status',
                    'cr.rol_uuid',
                    'cr.descripcion as rol',
                )
                .leftJoin('cat_roles as cr', 'u.rol_id', 'cr.rol_id')
                .where('u.email', email)
                .first();
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error al obtener usuario por email: ${err.message}`);
            this.logger.error(err.stack);
            throw error;
        }
    }

    async obtenerUsuarioPorUuid(usuarioUuid: string) {
        try {
            return await this.knex('usuarios as u')
                .select(
                    'u.usuario_id',
                    'u.usuario_uuid',
                    'u.nombre_completo',
                    'u.email',
                    'u.rol_id',
                    'u.status',
                    'r.rol_uuid',
                    'r.nombre as rol_nombre',
                    'r.codigo as rol_codigo',
                )
                .leftJoin('roles as r', 'u.rol_id', 'r.rol_id')
                .where('u.usuario_uuid', usuarioUuid)
                .first();
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error al obtener usuario por uuid: ${err.message}`);
            this.logger.error(err.stack);
            throw error;
        }
    }

    async obtenerPermisosPorRol(rolId: number): Promise<string[]> {
        try {
            const permisos = await this.knex('rel_roles_permisos as rrp')
                .select('cp.codigo')
                .join('cat_permisos as cp', 'rrp.permiso_id', 'cp.permiso_id')
                .where('rrp.rol_id', rolId)
                .where('cp.status', 'activo');

            return permisos.map((permiso) => permiso.codigo);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error al obtener permisos por rol: ${err.message}`);
            this.logger.error(err.stack);
            throw error;
        }
    }

    async verificarExistenciaUsuarioActivo(usuarioUuid: string): Promise<boolean> {
        try {
            const usuario = await this.knex('usuarios')
                .select('usuario_id')
                .where('usuario_uuid', usuarioUuid)
                .where('status', 'activo')
                .first();

            return !!usuario;
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error al verificar usuario activo: ${err.message}`);
            this.logger.error(err.stack);
            throw error;
        }
    }

    async obtenerSucursalesPermitidas(usuario_id: number) {
        return await this.knex('rel_sucursales_usuarios as r')
            .select(
                's.sucursal_uuid',
                's.sucursal_id',
                's.nombre',
                's.nombre_comercial',
            )
            .join('sucursales as s', 'r.sucursal_id', 's.sucursal_id')
            .where('r.usuario_id', usuario_id)
            .where('s.status', 'activo');   // hardcoded, nunca entra una inactiva
    }
}