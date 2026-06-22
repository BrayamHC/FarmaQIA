import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { FiltrosProductosDTO } from '../dto/productos.dto';

@Injectable()
export class ProductosRepoHelper {

    aplicarFiltros(query: Knex.QueryBuilder, filtros: FiltrosProductosDTO): void {
        if (!filtros) return;

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
        if (filtros.sort) {
            const [campo, orden] = filtros.sort.split(':');
            query.orderBy(`p.${campo}`, orden ?? 'asc');
        } else {
            query.orderBy('p.nombre', 'asc');
        }
    }
}