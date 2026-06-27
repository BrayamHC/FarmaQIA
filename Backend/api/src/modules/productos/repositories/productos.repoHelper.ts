import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class ProductosRepoHelper {
    aplicarFiltros(query: Knex.QueryBuilder, filtros: any): Knex.QueryBuilder {
        if (!filtros) return query;

        if (filtros.nombre) {
            query.whereILike('p.nombre', `%${filtros.nombre}%`);
        }

        if (filtros.sku) {
            query.where('p.sku', filtros.sku);
        }

        if (filtros.upc) {
            query.where('p.upc', filtros.upc);
        }

        if (filtros.status) {
            query.where('p.status', filtros.status);
        }

        if (filtros.presentacion) {
            query.whereILike('p.presentacion', `%${filtros.presentacion}%`);
        }

        if (filtros.con_lote !== undefined) {
            query.where('p.con_lote', filtros.con_lote);
        }

        if (filtros.cat_uuid) {
            query.where('c.categoria_uuid', filtros.cat_uuid);
        }

        if (filtros.prov_uuid) {
            query.where('pr.proveedor_uuid', filtros.prov_uuid);
        }

        return query;
    }

    aplicarOrden(query: Knex.QueryBuilder, filtros: any): Knex.QueryBuilder {
        if (filtros?.sort) {
            const [campo, dir] = filtros.sort.split(':');

            const columnasPermitidas: Record<string, string> = {
                nombre: 'p.nombre',
                sku: 'p.sku',
                status: 'p.status',
                precio_publico: 'p.precio_publico',
                costo_compra: 'p.costo_compra',
                fecha_creacion: 'p.fecha_creacion',
            };

            const columna = columnasPermitidas[campo] ?? 'p.nombre';
            const direccion = dir === 'desc' ? 'desc' : 'asc';

            return query.orderBy(columna, direccion);
        }

        return query.orderBy('p.nombre', 'asc');
    }

    aplicarPaginacion(
        query: Knex.QueryBuilder,
        page: number,
        limit: number,
    ): Knex.QueryBuilder {
        const offset = (page - 1) * limit;
        return query.limit(limit).offset(offset);
    }
}