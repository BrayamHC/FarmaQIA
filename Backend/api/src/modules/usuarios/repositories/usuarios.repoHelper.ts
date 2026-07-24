import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { FiltrosRoles, FiltrosUsuarios } from '../dto/usuarios.validator';

@Injectable()
export class UsuariosRepoHelper {
    aplicarFiltros(query: Knex.QueryBuilder, filtros: FiltrosUsuarios): Knex.QueryBuilder {
        if (filtros.nombre_completo) {
            query = query.whereILike('u.nombre_completo', `%${filtros.nombre_completo}%`);
        }
        if (filtros.email) {
            query = query.whereILike('u.email', `%${filtros.email}%`);
        }
        if (filtros.rol_id) {
            query = query.where('u.rol_id', filtros.rol_id);
        }
        // if (filtros.usuario_uuid) {
        //     query = query.where('u.usuario_uuid', filtros.usuario_uuid);
        // }
        if (filtros.status) {
            query = query.where('u.status', filtros.status);
        }
        return query;
    }
    aplicarFiltrosRoles(query: Knex.QueryBuilder, filtros: FiltrosRoles): Knex.QueryBuilder {
        if (filtros.rol_id) {
            query = query.where('cr.rol_id', filtros.rol_id);
        }
        if (filtros.status) {
            query = query.where('cr.status', filtros.status);
        }
        return query;
    }
}
