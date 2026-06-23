import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { FiltrosClienteDTO } from '../dto/clientes.dto';
import { ClientesRepoHelper } from './clientes.repoHelper';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class ClientesRepoData {
    private readonly logger = new Logger(ClientesRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: ClientesRepoHelper,
    ) { }

    async obtenerClientes(filtros?: FiltrosClienteDTO, sucursalId?: number) {
        try {
            const filtrosEfectivos = {
                ...filtros,
                page: filtros?.page ?? 1,
                limit: filtros?.limit ?? 20,
            };

            const query = this.knex('clientes as c')
                .where('c.sucursal_id', sucursalId)
                .select(
                    'c.cliente_id',
                    'c.cliente_uuid',
                    'c.nombre',
                    'c.telefono',
                    'c.email',
                    'c.rfc',
                    'c.razon_social',
                    'c.codigo_postal_fiscal',
                    'c.direccion',
                    'c.status',
                    'c.fecha_creacion',
                    'c.fecha_actualizacion',
                );

            this.helper.aplicarFiltros(query, filtrosEfectivos);
            this.helper.aplicarOrden(query, filtrosEfectivos);
            this.helper.aplicarPaginacion(
                query,
                filtrosEfectivos.page,
                filtrosEfectivos.limit,
            );

            const queryCount = this.knex('clientes as c')
                .count('c.cliente_id as total')
                .where('c.sucursal_id', sucursalId);

            this.helper.aplicarFiltros(queryCount, filtrosEfectivos);

            const [clientes, [{ total }]] = await Promise.all([query, queryCount]);

            return {
                clientes,
                total: Number(total),
            };
        } catch (error) {
            this.logger.error('obtenerClientes', error);
            throw new DatabaseQueryException('Error al ejecutar consulta de clientes');
        }
    }

    async obtenerClientePorUUID(cliente_uuid: string, sucursalId: number) {
        return this.knex('clientes as c')
            .select(
                'c.cliente_id',
                'c.cliente_uuid',
                'c.sucursal_id',
                'c.nombre',
                'c.telefono',
                'c.email',
                'c.direccion',
                'c.rfc',
                'c.razon_social',
                'c.codigo_postal_fiscal',
                'c.status',
                'c.fecha_creacion',
                'c.fecha_actualizacion',
                'c.fecha_eliminacion',
            )
            .where('c.cliente_uuid', cliente_uuid)
            .andWhere('c.sucursal_id', sucursalId)
            .first();
    }

    async obtenerClientePorRFC(rfc: string, sucursalId: number) {
        return this.knex('clientes')
            .select('cliente_id', 'cliente_uuid', 'nombre', 'rfc')
            .where('rfc', rfc)
            .andWhere('sucursal_id', sucursalId)
            .first();
    }
}