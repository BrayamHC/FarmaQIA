import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { FiltrosAlmacenesDTO } from '../dto/almacenes.dto';

@Injectable()
export class AlmacenesRepoHelper {

    aplicarFiltros(query: Knex.QueryBuilder, filtros: FiltrosAlmacenesDTO): void {
        if (!filtros) return;

        if (filtros.nombre) {
            query.whereILike('a.nombre', `%${filtros.nombre}%`);
        }
        if (filtros.encargado) {
            query.whereILike('a.encargado', `%${filtros.encargado}%`);
        }
        if (filtros.status) {
            query.where('a.status', filtros.status);
        }
    }
}