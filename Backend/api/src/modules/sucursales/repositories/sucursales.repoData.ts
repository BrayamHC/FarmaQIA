import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { SucursalesRepoHelper } from './sucursales.repoHelper';
import { FiltrosSucursalesDTO } from '../dto/sucursales.dto';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class SucursalesRepoData {
    private readonly logger = new Logger(SucursalesRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: SucursalesRepoHelper,
    ) { }

    async obtenerPorUUID(uuid: string): Promise<any | null> {
        return this.knex('sucursales')
            .where('sucursal_uuid', uuid)
            .first();
    }

    async obtenerPorNombre(nombre: string): Promise<any | null> {
        return this.knex('sucursales')
            .whereILike('nombre', nombre)
            .whereNot('status', 'eliminado')
            .first();
    }

    async obtenerSucursales(filtros: FiltrosSucursalesDTO) {
        try {
            const { page = 1, limit = 20 } = filtros;
            const offset = (page - 1) * limit;

            const baseQuery = () =>
                this.knex('sucursales as s')
                    .whereNot('s.status', 'eliminado');

            const countQuery = baseQuery()
                .clone()
                .count('s.sucursal_id as total')
                .first();

            this.helper.aplicarFiltros(countQuery as any, filtros);

            const dataQuery = baseQuery()
                .clone()
                .select(
                    's.sucursal_uuid',
                    's.nombre',
                    's.nombre_comercial',
                    's.descripcion',
                    's.status',
                    's.telefono',
                    's.email',
                    's.calle',
                    's.numero_exterior',
                    's.numero_interior',
                    's.colonia',
                    's.municipio',
                    's.estado',
                    's.pais',
                    's.codigo_postal',
                    's.fecha_creacion',
                    's.fecha_actualizacion',
                )
                .orderBy('s.nombre', 'asc')
                .limit(limit)
                .offset(offset);

            this.helper.aplicarFiltros(dataQuery, filtros);

            const [countResult, sucursales] = await Promise.all([
                countQuery,
                dataQuery,
            ]);

            const total = Number((countResult as any)?.total ?? 0);

            return {
                sucursales,
                total,
                page,
                limit,
            };

        } catch (error) {
            this.logger.error('obtenerSucursales', error);
            throw new DatabaseQueryException('Error al listar sucursales');
        }
    }
}