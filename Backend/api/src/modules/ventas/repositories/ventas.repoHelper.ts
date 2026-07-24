

// src/modules/ventas/repositories/ventas.repoHelper.ts
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class VentasRepoHelper {
    aplicarFiltros(query: Knex.QueryBuilder, filtros: any): Knex.QueryBuilder {
        if (!filtros) return query;

        if (filtros.status) {
            query.where('v.status', filtros.status);
        }

        if (filtros.metodo_pago) {
            query.where('v.metodo_pago', filtros.metodo_pago);
        }

        if (filtros.almacen_id) {
            query.where('v.almacen_id', filtros.almacen_id);
        }

        if (filtros.cliente_uuid) {
            query.where('cli.cliente_uuid', filtros.cliente_uuid);
        }

        if (filtros.fecha_inicio) {
            query.where('v.fecha_creacion', '>=', filtros.fecha_inicio);
        }

        if (filtros.fecha_fin) {
            query.where('v.fecha_creacion', '<=', filtros.fecha_fin);
        }

        return query;
    }

    aplicarOrden(query: Knex.QueryBuilder, filtros: any): Knex.QueryBuilder {
        if (filtros?.sort) {
            const [campo, dir] = filtros.sort.split(':');

            const columnasPermitidas: Record<string, string> = {
                folio: 'v.folio',
                total: 'v.total',
                status: 'v.status',
                fecha_creacion: 'v.fecha_creacion',
            };

            const columna = columnasPermitidas[campo] ?? 'v.fecha_creacion';
            const direccion = dir === 'desc' ? 'desc' : 'asc';

            return query.orderBy(columna, direccion);
        }

        return query.orderBy('v.fecha_creacion', 'desc');
    }

    aplicarPaginacion(
        query: Knex.QueryBuilder,
        page: number,
        limit: number,
    ): Knex.QueryBuilder {
        const offset = (page - 1) * limit;
        return query.limit(limit).offset(offset);
    }
    
        static buildNextFolioLike() {
        return 'VTA-PUE-%';
    }
}
