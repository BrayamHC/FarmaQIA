import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';
import { FiltrosFechasDTO } from '../dto/reportes.dto';
import { ReportesRepoHelper } from './reportes.repoHelper';

@Injectable()
export class ReportesRepoData {
    private readonly logger = new Logger(ReportesRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: ReportesRepoHelper,
    ) { }

    async obtenerInventario(filtros: FiltrosFechasDTO, sucursalId: number) {
        try {
            const productosQuery = this.knex('productos as p')
                .select(
                    'p.producto_id',
                    'p.producto_uuid',
                    'p.sku',
                    'p.nombre',
                    'p.presentacion',
                    'p.con_lote',
                    'p.costo_compra',
                    'p.precio_publico',
                    'c.nombre as categoria',
                )
                .leftJoin('cat_categorias_subcategorias as c', 'c.categoria_id', 'p.categoria_id')
                .where('p.sucursal_id', sucursalId)
                .whereNot('p.status', 'eliminado');

            if (filtros.almacen_id) {
                productosQuery.whereIn('p.producto_id', function () {
                    this.select('sa.producto_id')
                        .from('stock_almacen as sa')
                        .where('sa.almacen_id', filtros.almacen_id as number);
                });
            }

            const stockQuery = this.knex('stock_almacen as sa')
                .select(
                    'sa.producto_id',
                    'sa.almacen_id',
                    'sa.stock_actual',
                    'sa.stock_minimo',
                    'sa.stock_maximo',
                    'a.nombre as almacen_nombre',
                )
                .innerJoin('almacenes as a', 'a.almacen_id', 'sa.almacen_id')
                .where('a.sucursal_id', sucursalId);

            this.helper.aplicarFiltroAlmacen(stockQuery, 'sa.almacen_id', filtros.almacen_id);

            const lotesQuery = this.knex('lotes as l')
                .select(
                    'l.producto_id',
                    'l.lote_id',
                    'l.lote_uuid',
                    'l.codigo_lote',
                    'l.cantidad_actual',
                    'l.fecha_fabricacion',
                    'l.fecha_caducidad',
                    'l.costo_unitario_compra',
                    'l.almacen_id',
                    'a.nombre as almacen_nombre',
                )
                .innerJoin('almacenes as a', 'a.almacen_id', 'l.almacen_id')
                .where('a.sucursal_id', sucursalId)
                .andWhere('l.status', 'activo');

            this.helper.aplicarFiltroAlmacen(lotesQuery, 'l.almacen_id', filtros.almacen_id);

            const sucursalQuery = this.knex('sucursales')
                .select('sucursal_id', 'nombre')
                .where('sucursal_id', sucursalId)
                .first();

            const almacenQuery = filtros.almacen_id
                ? this.knex('almacenes')
                    .select('almacen_id', 'nombre')
                    .where('almacen_id', filtros.almacen_id)
                    .first()
                : Promise.resolve(null);

            const [
                productos,
                stocks,
                lotes,
                sucursal,
                almacen,
            ] = await Promise.all([
                productosQuery,
                stockQuery,
                lotesQuery,
                sucursalQuery,
                almacenQuery,
            ]);

            return {
                sucursal,
                almacen,
                productos,
                stocks,
                lotes,
            };
        } catch (error) {
            this.logger.error('obtenerInventario', error);
            throw new DatabaseQueryException('Error al obtener reporte de inventario');
        }
    }

    async obtenerVentas(filtros: FiltrosFechasDTO, sucursalId: number) {
        try {
            const ventasQuery = this.knex('ventas as v')
                .select(
                    'v.venta_id',
                    'v.venta_uuid',
                    'v.cliente_id',
                    'v.usuario_venta_id',
                    'v.folio',
                    'v.metodo_pago',
                    'v.status',
                    'v.subtotal',
                    'v.descuento_total',
                    'v.impuesto_total',
                    'v.total',
                    'v.monto_recibido',
                    'v.cambio',
                    'v.fecha_venta',
                    'c.nombre as cliente_nombre',
                )
                .leftJoin('clientes as c', 'c.cliente_id', 'v.cliente_id')
                .where('v.sucursal_id', sucursalId);

            this.helper.aplicarFiltroAlmacen(ventasQuery, 'v.almacen_id', filtros.almacen_id);
            this.helper.aplicarFiltrosPorFecha(ventasQuery, 'v.fecha_venta', filtros);

            const detallesQuery = this.knex('ventas_detalle as vd')
                .select(
                    'vd.detalle_id',
                    'vd.detalle_uuid',
                    'vd.venta_id',
                    'vd.producto_id',
                    'vd.lote_id',
                    'vd.cantidad',
                    'vd.precio_unitario',
                    'vd.descuento',
                    'vd.impuesto',
                    'vd.subtotal',
                    'vd.total',
                    'vd.producto_nombre_snapshot',
                    'vd.sku_snapshot',
                )
                .innerJoin('ventas as v', 'v.venta_id', 'vd.venta_id')
                .where('v.sucursal_id', sucursalId);

            this.helper.aplicarFiltroAlmacen(detallesQuery, 'v.almacen_id', filtros.almacen_id);
            this.helper.aplicarFiltrosPorFecha(detallesQuery, 'v.fecha_venta', filtros);

            const [ventas, detalles] = await Promise.all([ventasQuery, detallesQuery]);

            return { ventas, detalles };
        } catch (error) {
            this.logger.error('obtenerVentas', error);
            throw new DatabaseQueryException('Error al obtener reporte de ventas');
        }
    }

    async obtenerCompras(filtros: FiltrosFechasDTO, sucursalId: number) {
        try {
            const comprasQuery = this.knex('ordenes_compra as oc')
                .select(
                    'oc.orden_compra_id',
                    'oc.orden_compra_uuid',
                    'oc.folio_numero',
                    'oc.folio_display',
                    'oc.almacen_id',
                    'oc.proveedor_id',
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
                    'a.nombre as almacen_nombre',
                    'p.nombre_comercial as proveedor_nombre',
                )
                .leftJoin('almacenes as a', 'a.almacen_id', 'oc.almacen_id')
                .leftJoin('proveedores as p', 'p.proveedor_id', 'oc.proveedor_id')
                .where('oc.sucursal_id', sucursalId);

            this.helper.aplicarFiltroAlmacen(comprasQuery, 'oc.almacen_id', filtros.almacen_id);
            this.helper.aplicarFiltrosPorFecha(comprasQuery, 'oc.fecha_orden', filtros);

            const partidasQuery = this.knex('partidas_oc as poc')
                .select(
                    'poc.partida_oc_id',
                    'poc.partida_oc_uuid',
                    'poc.orden_compra_id',
                    'poc.producto_id',
                    'poc.cantidad_solicitada',
                    'poc.precio_unitario_est',
                    'poc.descuento_porcentaje',
                    'poc.descuento_importe',
                    'poc.subtotal_estimado',
                    'poc.cantidad_recibida',
                    'poc.status',
                    'poc.comentarios',
                    'pr.nombre as producto_nombre',
                    'pr.sku',
                )
                .innerJoin('ordenes_compra as oc', 'oc.orden_compra_id', 'poc.orden_compra_id')
                .leftJoin('productos as pr', 'pr.producto_id', 'poc.producto_id')
                .where('oc.sucursal_id', sucursalId);

            this.helper.aplicarFiltroAlmacen(partidasQuery, 'oc.almacen_id', filtros.almacen_id);
            this.helper.aplicarFiltrosPorFecha(partidasQuery, 'oc.fecha_orden', filtros);

            const [compras, partidas] = await Promise.all([comprasQuery, partidasQuery]);

            return { compras, partidas };
        } catch (error) {
            this.logger.error('obtenerCompras', error);
            throw new DatabaseQueryException('Error al obtener reporte de compras');
        }
    }
}