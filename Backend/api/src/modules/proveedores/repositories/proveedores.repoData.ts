import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { ProveedoresRepoHelper } from './proveedores.repoHelper';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';
import { DATABASE_CONNECTION } from 'src/config/database.constants';

@Injectable()
export class ProveedoresRepoData {
    private readonly logger = new Logger(ProveedoresRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: ProveedoresRepoHelper,
    ) { }

    async obtenerProveedores(filtros: any) {
        try {
            const page = filtros?.page ?? 1;
            const limit = filtros?.limit ?? 20;
            const offset = (page - 1) * limit;

            const query = this.knex('proveedores as p')
                .select(
                    'p.proveedor_id',
                    'p.proveedor_uuid',
                    'p.nombre',
                    'p.nombre_comercial',
                    'p.rfc',
                    'p.contacto_nombre',
                    'p.contacto_telefono',
                    'p.contacto_email',
                    'p.calle',
                    'p.numero_exterior',
                    'p.numero_interior',
                    'p.colonia',
                    'p.municipio',
                    'p.estado',
                    'p.pais',
                    'p.codigo_postal',
                    'p.condiciones_pago',
                    'p.dias_credito',
                    'p.notas',
                    'p.status',
                    'p.fecha_creacion',
                    'p.fecha_actualizacion',
                );

            this.helper.aplicarFiltros(query, filtros);
            this.helper.aplicarOrden(query, filtros);
            query.limit(limit).offset(offset);

            const queryCount = this.knex('proveedores as p')
                .count('p.proveedor_id as total');

            this.helper.aplicarFiltros(queryCount, filtros);

            const [proveedores, [{ total }]] = await Promise.all([query, queryCount]);

            return {
                proveedores,
                total: Number(total),
            };
        } catch (error) {
            this.logger.error('obtenerProveedores', error);
            throw new DatabaseQueryException('Error al obtener proveedores');
        }
    }

    async obtenerProveedorPorUUID(uuid: string) {
        try {
            return await this.knex('proveedores')
                .where('proveedor_uuid', uuid)
                .first();
        } catch (error) {
            this.logger.error('obtenerProveedorPorUUID', error);
            throw new DatabaseQueryException('Error al obtener proveedor');
        }
    }

    async obtenerProveedorPorRFC(rfc: string) {
        try {
            return await this.knex('proveedores')
                .where('rfc', rfc)
                .whereNot('status', 'eliminado')
                .first();
        } catch (error) {
            this.logger.error('obtenerProveedorPorRFC', error);
            throw new DatabaseQueryException('Error al obtener proveedor por RFC');
        }
    }
}