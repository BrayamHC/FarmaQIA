import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { EditarUsuario } from '../dto/usuarios.validator';

@Injectable()
export class UsuariosRepoAction {
    constructor(@Inject('TENANT_CONNECTION') private readonly knex: Knex) { }

    async crearUsuario(insert: object, bitacora: object): Promise<string> {
        return this.knex.transaction(async (trx) => {
            const [usuario] = await trx('usuarios')
                .insert(insert)
                .returning(['usuario_id', 'usuario_uuid']);

            await trx('bitacora_sistema').insert({
                ...bitacora,
                modulo_id: usuario.usuario_id,
                entidad_uuid: usuario.usuario_uuid,
            });

            return usuario.usuario_uuid;
        });
    }

    async editarUsuario(datos: EditarUsuario & { usuarioUuid: string }) {
        const { usuarioUuid, ...rawData } = await datos;

        return this.knex.transaction(async (trx) => {
            await trx('usuarios').forUpdate().where('usuario_uuid', usuarioUuid);

            const [updatedUser] = await trx('usuarios').update(rawData, '*').where('usuario_uuid', usuarioUuid).returning('*');

            return updatedUser;
        });

    }

    async asignarUsuariosASucursal(sucursalId: number, usuarioIds: number[]) {
        const relaciones = usuarioIds.map(usuario_id => ({
            usuario_id,
            sucursal_id: sucursalId,
            es_activa: true,
        }));
        return this.knex('rel_sucursales_usuarios').insert(relaciones);
    }

    async asignarSucursalesAUsuario(usuarioId: number, sucursalIds: number[]) {
        const relaciones = sucursalIds.map(sucursal_id => ({
            usuario_id: usuarioId,
            sucursal_id,
            es_activa: true,
        }));
        return this.knex('rel_sucursales_usuarios').insert(relaciones);
    }

    // POST — solo inserta los nuevos, ignora los que ya existen
    async agregarOverrides(usuarioId: number, grant: number[], deny: number[]): Promise<void> {
        const inserts = [
            ...grant.map(permiso_id => ({ usuario_id: usuarioId, permiso_id, tipo: 'grant' })),
            ...deny.map(permiso_id => ({ usuario_id: usuarioId, permiso_id, tipo: 'deny' })),
        ];

        // onConflict ignora duplicados — no rompe si ya existe ese permiso
        await this.knex('rel_usuarios_permisos')
            .insert(inserts)
            .onConflict(['usuario_id', 'permiso_id'])
            .ignore();
    }

    // DELETE — quita un override específico
    async quitarOverride(usuarioId: number, permisoId: number): Promise<void> {
        await this.knex('rel_usuarios_permisos')
            .where({ usuario_id: usuarioId, permiso_id: permisoId })
            .delete();
    }

    // PUT — reemplaza todo (el comportamiento actual, bien nombrado)
    async reemplazarOverrides(usuarioId: number, grant: number[], deny: number[]): Promise<void> {
        return this.knex.transaction(async (trx) => {
            await trx('rel_usuarios_permisos')
                .where('usuario_id', usuarioId)
                .delete();

            const inserts = [
                ...grant.map(permiso_id => ({ usuario_id: usuarioId, permiso_id, tipo: 'grant' })),
                ...deny.map(permiso_id => ({ usuario_id: usuarioId, permiso_id, tipo: 'deny' })),
            ];

            if (inserts.length > 0) {
                await trx('rel_usuarios_permisos').insert(inserts);
            }
        });
    }
}
