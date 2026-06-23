import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class CatalogosRepoHelper {
    aplicarFiltrosTiposDocumento(query: Knex.QueryBuilder, filtros: any) {
        if (!filtros) return query;

        if (filtros.status) {
            query.where('td.status', filtros.status);
        }

        return query;
    }

    aplicarFiltrosUnidadesMedida(query: Knex.QueryBuilder, filtros: any) {
        if (!filtros) return query;

        if (filtros.activo !== undefined) {
            query.where('um.activo', filtros.activo);
        }

        if (filtros.clave) {
            query.whereILike('um.clave', `%${filtros.clave}%`);
        }

        if (filtros.nombre) {
            query.whereILike('um.nombre', `%${filtros.nombre}%`);
        }

        return query;
    }

    aplicarFiltrosSeries(query: Knex.QueryBuilder, filtros: any) {
        if (!filtros) return query;

        if (filtros.tipo_documento_uuid) {
            query.where('td.tipo_documento_uuid', filtros.tipo_documento_uuid);
        }

        if (filtros.es_activa !== undefined) {
            query.where('s.es_activa', filtros.es_activa);
        }

        if (filtros.es_default !== undefined) {
            query.where('s.es_default', filtros.es_default);
        }

        return query;
    }
}