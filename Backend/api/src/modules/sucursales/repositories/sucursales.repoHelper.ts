import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { FiltrosSucursalesDTO } from '../dto/sucursales.dto';

@Injectable()
export class SucursalesRepoHelper {

    aplicarFiltros(query: Knex.QueryBuilder, filtros: FiltrosSucursalesDTO): void {
        if (!filtros) return;

        if (filtros.nombre) {
            query.whereILike('s.nombre', `%${filtros.nombre}%`);
        }
        if (filtros.nombre_comercial) {
            query.whereILike('s.nombre_comercial', `%${filtros.nombre_comercial}%`);
        }
        if (filtros.municipio) {
            query.whereILike('s.municipio', `%${filtros.municipio}%`);
        }
        if (filtros.estado) {
            query.whereILike('s.estado', `%${filtros.estado}%`);
        }
        if (filtros.status) {
            query.where('s.status', filtros.status);
        }
    }
}