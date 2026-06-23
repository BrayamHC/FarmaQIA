import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { FiltrosOrdenCompra } from '../dto/ordenesCompra.validator';

@Injectable()
export class OrdenesCompraRepoHelper {
    calcularOffset(page: number, limit: number): number {
        return (page - 1) * limit;
    }

    aplicarFiltros(
        query: Knex.QueryBuilder,
        filtros: FiltrosOrdenCompra,
    ): Knex.QueryBuilder {
        if (!filtros) return query;

        if (filtros.status) {
            query = query.where('oc.status', filtros.status);
        }

        if (filtros.proveedor_uuid) {
            query = query.where('p.proveedor_uuid', filtros.proveedor_uuid);
        }

        if (filtros.fecha_desde) {
            query = query.where('oc.fecha_orden', '>=', filtros.fecha_desde);
        }

        if (filtros.fecha_hasta) {
            query = query.where('oc.fecha_orden', '<=', filtros.fecha_hasta);
        }

        if (filtros.folio) {
            query = query.whereILike('oc.folio_display', `%${filtros.folio}%`);
        }

        return query;
    }
}