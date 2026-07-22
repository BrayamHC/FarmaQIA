import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { LotesRepoHelper } from './lotes.repoHelper';
import { FiltrosLotesDTO } from '../dto/lotes.dto';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';
import { LotesBO } from './lotes.bo';

@Injectable()
export class LotesRepoData {
    private readonly logger = new Logger(LotesRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: LotesRepoHelper,
        private readonly bo: LotesBO,
    ) { }

    async obtenerLotes(filtros: FiltrosLotesDTO, sucursalId: number) {
        try {
            const filtrosEfectivos = this.bo.construirFiltros(filtros);

            const baseQuery = this.knex('lotes as l')
                .innerJoin('almacenes as a', 'a.almacen_id', 'l.almacen_id')
                .leftJoin('productos as p', 'p.producto_id', 'l.producto_id')
                .where('a.sucursal_id', sucursalId);

            this.helper.aplicarFiltros(baseQuery, filtrosEfectivos);

            const dataQuery = baseQuery
                .clone()
                .select(
                    'l.lote_uuid',
                    'l.codigo_lote',
                    'l.cantidad_actual',
                    'l.fecha_fabricacion',
                    'l.fecha_caducidad',
                    'l.costo_unitario_compra',
                    'l.status',
                    'l.fecha_creacion',
                    'l.fecha_actualizacion',

                    'a.almacen_uuid',
                    this.knex.raw('a.nombre as almacen_nombre'),

                    'p.producto_uuid',
                    this.knex.raw('p.sku as producto_sku'),
                    this.knex.raw('p.nombre as producto_nombre'),
                    this.knex.raw('p.descripcion as producto_descripcion'),
                    this.knex.raw('p.status as producto_status'),
                    this.knex.raw('p.presentacion as producto_presentacion'),
                    this.knex.raw('p.url_imagen as producto_url_imagen'),
                );

            this.helper.aplicarOrden(dataQuery, filtrosEfectivos);
            this.helper.aplicarPaginacion(
                dataQuery,
                filtrosEfectivos.page,
                filtrosEfectivos.limit,
            );

            const countQuery = baseQuery
                .clone()
                .clearSelect()
                .clearOrder()
                .count<{ total: string | number }[]>({ total: 'l.lote_id' })
                .first();

            const [lotes, conteo] = await Promise.all([
                dataQuery,
                countQuery,
            ]);

            return {
                lotes: lotes ?? [],
                total: Number(conteo?.total ?? 0),
                page: filtrosEfectivos.page,
                limit: filtrosEfectivos.limit,
            };
        } catch (error) {
            this.logger.error('obtenerLotes', error);
            throw new DatabaseQueryException('Error al listar lotes');
        }
    }
}