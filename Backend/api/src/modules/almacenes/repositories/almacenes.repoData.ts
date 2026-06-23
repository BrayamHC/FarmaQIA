import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { FiltrosAlmacenesDTO } from '../dto/almacenes.dto';
import { AlmacenesRepoHelper } from './almacenes.repoHelper';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class AlmacenesRepoData {
    private readonly logger = new Logger(AlmacenesRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: AlmacenesRepoHelper,
    ) { }

    async obtenerPorUUID(uuid: string, sucursalId: number): Promise<any | null> {
        return this.knex('almacenes as a')
            .select(
                'a.almacen_id',
                'a.almacen_uuid',
                'a.nombre',
                'a.descripcion',
                'a.encargado',
                'a.direccion',
                'a.telefono',
                'a.status',
                'a.sucursal_id',
                'a.fecha_creacion',
                'a.fecha_actualizacion',
                's.sucursal_uuid',
                's.nombre as sucursal_nombre',
            )
            .join('sucursales as s', 's.sucursal_id', 'a.sucursal_id')
            .where('a.almacen_uuid', uuid)
            .andWhere('a.sucursal_id', sucursalId)
            .first();
    }

    async obtenerPorNombre(nombre: string, sucursalId: number): Promise<any | null> {
        return this.knex('almacenes')
            .whereILike('nombre', nombre.trim())
            .andWhere('sucursal_id', sucursalId)
            .whereNot('status', 'eliminado')
            .first();
    }

    async obtenerAlmacenes(filtros: FiltrosAlmacenesDTO, sucursalId: number) {
        try {
            const { page = 1, limit = 20 } = filtros;
            const offset = (page - 1) * limit;

            const almacenes = await this.knex('almacenes as a')
                .select(
                    'a.almacen_uuid',
                    'a.nombre',
                    'a.descripcion',
                    'a.encargado',
                    'a.direccion',
                    'a.telefono',
                    'a.status',
                    'a.fecha_creacion',
                    'a.fecha_actualizacion',
                    's.sucursal_uuid',
                    's.nombre as sucursal_nombre',
                )
                .join('sucursales as s', 's.sucursal_id', 'a.sucursal_id')
                .where('a.sucursal_id', sucursalId)
                .modify((q) => this.helper.aplicarFiltros(q, filtros))
                .orderBy('a.nombre', 'asc')
                .limit(limit)
                .offset(offset);

            return almacenes;
        } catch (error) {
            this.logger.error('obtenerAlmacenes', error);
            throw new DatabaseQueryException('Error al obtener almacenes');
        }
    }
}