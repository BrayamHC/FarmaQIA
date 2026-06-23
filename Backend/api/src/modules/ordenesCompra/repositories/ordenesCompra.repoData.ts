import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { OrdenesCompraRepoHelper } from './ordenesCompra.repoHelper';
import { FiltrosOrdenCompra } from '../dto/ordenesCompra.validator';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class OrdenesCompraRepoData {
    private readonly logger = new Logger(OrdenesCompraRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly repoHelper: OrdenesCompraRepoHelper,
    ) { }

    async obtenerOrdenesCompra(filtros: FiltrosOrdenCompra & { sucursal_id: number }) {
        try {
            const offset = this.repoHelper.calcularOffset(filtros.page, filtros.limit);

            let query = this.knex('ordenes_compra as oc')
                .select(
                    'oc.orden_compra_uuid as uuid',
                    'oc.folio_display',
                    'oc.folio_numero',
                    'oc.fecha_orden',
                    'oc.fecha_entrega_estimada',
                    'oc.status',
                    'oc.moneda',
                    'oc.subtotal_estimado',
                    'oc.iva_estimado',
                    'oc.total_estimado',
                    'oc.notas',
                    'oc.nombre_autoriza',
                    'oc.fecha_autorizacion',
                    'oc.fecha_creacion',
                    'a.almacen_uuid as almacen_uuid',
                    'a.nombre as almacen_nombre',
                    'p.proveedor_uuid as proveedor_uuid',
                    'p.nombre_comercial as proveedor_nombre',
                    'p.rfc as proveedor_rfc',
                    's.serie_uuid as serie_uuid',
                    's.serie as serie',
                    's.prefijo as serie_prefijo',
                    this.knex.raw(`
                        (
                            SELECT COUNT(*)
                            FROM partidas_oc poc
                            WHERE poc.orden_compra_id = oc.orden_compra_id
                        )::int as total_partidas
                    `),
                )
                .join('almacenes as a', 'oc.almacen_id', 'a.almacen_id')
                .join('proveedores as p', 'oc.proveedor_id', 'p.proveedor_id')
                .leftJoin('series as s', 'oc.serie_id', 's.serie_id')
                .where('oc.sucursal_id', filtros.sucursal_id)
                .orderBy('oc.orden_compra_id', 'desc')
                .limit(filtros.limit)
                .offset(offset);

            let countQuery = this.knex('ordenes_compra as oc')
                .join('almacenes as a', 'oc.almacen_id', 'a.almacen_id')
                .join('proveedores as p', 'oc.proveedor_id', 'p.proveedor_id')
                .leftJoin('series as s', 'oc.serie_id', 's.serie_id')
                .where('oc.sucursal_id', filtros.sucursal_id)
                .count('oc.orden_compra_id as total')
                .first();

            query = this.repoHelper.aplicarFiltros(query, filtros);
            countQuery = this.repoHelper.aplicarFiltros(countQuery as any, filtros);

            const [data, conteo] = await Promise.all([query, countQuery]);

            return {
                data,
                total: Number((conteo as any)?.total ?? 0),
                page: filtros.page,
                limit: filtros.limit,
            };
        } catch (error) {
            this.logger.error('obtenerOrdenesCompra', error);
            throw new DatabaseQueryException('Error al obtener órdenes de compra');
        }
    }

    async obtenerOrdenCompra(uuid: string, sucursalId: number) {
        try {
            const orden = await this.knex('ordenes_compra as oc')
                .select(
                    'oc.orden_compra_uuid as uuid',
                    'oc.folio_display',
                    'oc.folio_numero',
                    'oc.fecha_orden',
                    'oc.fecha_entrega_estimada',
                    'oc.condiciones_pago',
                    'oc.moneda',
                    'oc.tipo_cambio',
                    'oc.subtotal_estimado',
                    'oc.iva_estimado',
                    'oc.total_estimado',
                    'oc.status',
                    'oc.notas',
                    'oc.nombre_autoriza',
                    'oc.fecha_autorizacion',
                    'oc.motivo_rechazo',
                    'oc.fecha_creacion',
                    'a.almacen_uuid as almacen_uuid',
                    'a.nombre as almacen_nombre',
                    'p.proveedor_uuid as proveedor_uuid',
                    'p.nombre_comercial as proveedor_nombre',
                    'p.rfc as proveedor_rfc',
                    's.serie_uuid as serie_uuid',
                    's.serie as serie',
                    's.prefijo as serie_prefijo',
                )
                .join('almacenes as a', 'oc.almacen_id', 'a.almacen_id')
                .join('proveedores as p', 'oc.proveedor_id', 'p.proveedor_id')
                .leftJoin('series as s', 'oc.serie_id', 's.serie_id')
                .where('oc.orden_compra_uuid', uuid)
                .andWhere('oc.sucursal_id', sucursalId)
                .first();

            if (!orden) return null;

            const partidas = await this.knex('partidas_oc as poc')
                .select(
                    'poc.partida_oc_uuid as uuid',
                    'poc.cantidad_solicitada',
                    'poc.precio_unitario_est',
                    'poc.descuento_porcentaje',
                    'poc.descuento_importe',
                    'poc.subtotal_estimado',
                    'poc.cantidad_recibida',
                    'poc.status',
                    'poc.comentarios',
                    'pr.producto_uuid as producto_uuid',
                    'pr.nombre as producto_nombre',
                    'pr.sku as producto_sku',
                    'pr.upc as producto_upc',
                )
                .join('productos as pr', 'poc.producto_id', 'pr.producto_id')
                .join('ordenes_compra as oc', 'poc.orden_compra_id', 'oc.orden_compra_id')
                .where('oc.orden_compra_uuid', uuid)
                .orderBy('poc.partida_oc_id', 'asc');

            return { ...orden, partidas };
        } catch (error) {
            this.logger.error('obtenerOrdenCompra', error);
            throw new DatabaseQueryException('Error al obtener el detalle de la orden');
        }
    }

    async obtenerOrdenCompraCabecera(uuid: string, sucursalId: number) {
        return this.knex('ordenes_compra')
            .select('*')
            .where('orden_compra_uuid', uuid)
            .andWhere('sucursal_id', sucursalId)
            .first();
    }
}