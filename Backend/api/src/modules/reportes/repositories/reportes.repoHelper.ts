import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class ReportesRepoHelper {
    aplicarFiltrosPorFecha(
        query: Knex.QueryBuilder,
        columnaFecha: string,
        filtros?: { fecha_inicio?: string; fecha_fin?: string },
    ): Knex.QueryBuilder {
        if (!filtros) return query;

        if (filtros.fecha_inicio) {
            query.andWhereRaw(`DATE(${columnaFecha}) >= ?`, [filtros.fecha_inicio]);
        }

        if (filtros.fecha_fin) {
            query.andWhereRaw(`DATE(${columnaFecha}) <= ?`, [filtros.fecha_fin]);
        }

        return query;
    }

    aplicarFiltroAlmacen(
        query: Knex.QueryBuilder,
        columnaAlmacen: string,
        almacenId?: number,
    ): Knex.QueryBuilder {
        if (almacenId) {
            query.andWhere(columnaAlmacen, almacenId);
        }

        return query;
    }
}