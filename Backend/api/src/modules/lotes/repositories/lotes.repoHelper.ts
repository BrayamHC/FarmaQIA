import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class LotesRepoHelper {
    aplicarFiltros(query: Knex.QueryBuilder, filtros: any): Knex.QueryBuilder {
        if (!filtros) return query;

        if (filtros.codigo_lote) {
            query.whereILike('l.codigo_lote', `%${filtros.codigo_lote}%`);
        }

        if (filtros.almacen_uuid) {
            query.where('a.almacen_uuid', filtros.almacen_uuid);
        } else if (Array.isArray(filtros.almacen_uuids) && filtros.almacen_uuids.length > 0) {
            query.whereIn('a.almacen_uuid', filtros.almacen_uuids);
        }

        if (filtros.producto_nombre) {
            query.whereILike('p.nombre', `%${filtros.producto_nombre}%`);
        }

        if (filtros.producto_sku) {
            query.whereILike('p.sku', `%${filtros.producto_sku}%`);
        }

        if (filtros.status) {
            query.where('l.status', filtros.status);
        }

        if (filtros.fecha_fabricacion) {
            query.whereRaw('DATE(l.fecha_fabricacion) = ?', [filtros.fecha_fabricacion]);
        }

        if (filtros.fecha_caducidad) {
            query.whereRaw('DATE(l.fecha_caducidad) = ?', [filtros.fecha_caducidad]);
        }

        if (filtros.fecha_caducidad_desde) {
            query.whereRaw('DATE(l.fecha_caducidad) >= ?', [filtros.fecha_caducidad_desde]);
        }

        if (filtros.fecha_caducidad_hasta) {
            query.whereRaw('DATE(l.fecha_caducidad) <= ?', [filtros.fecha_caducidad_hasta]);
        }

        if (filtros.con_stock === true) {
            query.where('l.cantidad_actual', '>', 0);
        }

        return query;
    }

    aplicarOrden(query: Knex.QueryBuilder, filtros: any): Knex.QueryBuilder {
        if (filtros?.sort) {
            const [campo, dir] = filtros.sort.split(':');

            const columnasPermitidas: Record<string, string> = {
                codigo_lote: 'l.codigo_lote',
                cantidad_actual: 'l.cantidad_actual',
                fecha_fabricacion: 'l.fecha_fabricacion',
                fecha_caducidad: 'l.fecha_caducidad',
                costo_unitario_compra: 'l.costo_unitario_compra',
                status: 'l.status',
                producto_nombre: 'p.nombre',
                producto_sku: 'p.sku',
                almacen_nombre: 'a.nombre',
                fecha_creacion: 'l.fecha_creacion',
            };

            const columna = columnasPermitidas[campo] ?? 'l.fecha_caducidad';
            const direccion = dir === 'desc' ? 'desc' : 'asc';

            return query.orderBy(columna, direccion);
        }

        return query
            .orderBy('l.fecha_caducidad', 'asc')
            .orderBy('l.fecha_creacion', 'desc');
    }

    aplicarPaginacion(query: Knex.QueryBuilder, page: number, limit: number): Knex.QueryBuilder {
        const offset = (page - 1) * limit;
        return query.limit(limit).offset(offset);
    }
}