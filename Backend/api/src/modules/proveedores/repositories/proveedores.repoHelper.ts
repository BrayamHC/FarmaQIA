import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class ProveedoresRepoHelper {
    aplicarFiltros(query: Knex.QueryBuilder, filtros: any): void {
        if (!filtros) return;

        if (filtros.q) {
            query.andWhere((builder) => {
                builder
                    .whereILike('p.nombre', `%${filtros.q}%`)
                    .orWhereILike('p.nombre_comercial', `%${filtros.q}%`)
                    .orWhereILike('p.rfc', `%${filtros.q}%`)
                    .orWhereILike('p.contacto_nombre', `%${filtros.q}%`)
                    .orWhereILike('p.contacto_email', `%${filtros.q}%`);
            });
        }

        if (filtros.nombre) {
            query.whereILike('p.nombre', `%${filtros.nombre}%`);
        }

        if (filtros.nombre_comercial) {
            query.whereILike('p.nombre_comercial', `%${filtros.nombre_comercial}%`);
        }

        if (filtros.rfc) {
            query.whereILike('p.rfc', `%${filtros.rfc}%`);
        }

        if (filtros.status) {
            query.where('p.status', filtros.status);
        }
    }

    aplicarOrden(query: Knex.QueryBuilder, filtros: any): void {
        const columnasPermitidas: Record<string, string> = {
            fecha_creacion: 'p.fecha_creacion',
            nombre: 'p.nombre',
            nombre_comercial: 'p.nombre_comercial',
            rfc: 'p.rfc',
        };

        const columna = columnasPermitidas[filtros?.sort] ?? 'p.fecha_creacion';
        const direccion = filtros?.order === 'asc' ? 'asc' : 'desc';

        query.orderBy(columna, direccion);
    }
}