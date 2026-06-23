import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class ClientesRepoHelper {
    aplicarFiltros(query: Knex.QueryBuilder, filtros: any): Knex.QueryBuilder {
        if (!filtros) return query;

        if (filtros.q) {
            query.andWhere((builder) => {
                builder
                    .whereILike('c.nombre', `%${filtros.q}%`)
                    .orWhereILike('c.razon_social', `%${filtros.q}%`)
                    .orWhereILike('c.rfc', `%${filtros.q}%`)
                    .orWhereILike('c.email', `%${filtros.q}%`)
                    .orWhereILike('c.telefono', `%${filtros.q}%`);
            });
        }

        if (filtros.status) {
            query.where('c.status', filtros.status);
        }

        if (filtros.rfc) {
            query.whereILike('c.rfc', `%${filtros.rfc}%`);
        }

        if (filtros.nombre) {
            query.andWhere((builder) => {
                builder
                    .whereILike('c.nombre', `%${filtros.nombre}%`)
                    .orWhereILike('c.razon_social', `%${filtros.nombre}%`);
            });
        }

        if (filtros.fecha_desde) {
            query.whereRaw('DATE(c.fecha_creacion) >= ?', [filtros.fecha_desde]);
        }

        if (filtros.fecha_hasta) {
            query.whereRaw('DATE(c.fecha_creacion) <= ?', [filtros.fecha_hasta]);
        }

        return query;
    }

    aplicarOrden(query: Knex.QueryBuilder, filtros: any): Knex.QueryBuilder {
        const columnasPermitidas: Record<string, string> = {
            fecha_creacion: 'c.fecha_creacion',
            nombre: 'c.nombre',
            razon_social: 'c.razon_social',
            rfc: 'c.rfc',
        };

        const columna = columnasPermitidas[filtros?.sort] ?? 'c.fecha_creacion';
        const direccion = filtros?.order === 'asc' ? 'asc' : 'desc';

        return query.orderBy(columna, direccion);
    }

    aplicarPaginacion(query: Knex.QueryBuilder, page: number, limit: number): Knex.QueryBuilder {
        const offset = (page - 1) * limit;
        return query.limit(limit).offset(offset);
    }
}