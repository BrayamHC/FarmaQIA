// src/modules/ventas/repositories/ventas.repoData.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { VentasRepoHelper } from './ventas.repoHelper';
import { FiltrosVentasDTO } from '../dto/ventas.validator';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class VentasRepoData {
    private readonly logger = new Logger(VentasRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: VentasRepoHelper,
    ) { }

    // ── Auxiliares para creación (ya existentes) ────────────────────────────
    async obtenerClientePorUuid(clienteUuid: string | null, sucursalId: number) {
        if (!clienteUuid) return null;

        return this.knex('clientes')
            .select('cliente_id', 'cliente_uuid', 'nombre', 'status')
            .where({ cliente_uuid: clienteUuid, sucursal_id: sucursalId })
            .first();
    }

    async obtenerClientePorId(clienteId: number, sucursalId: number) {
        return this.knex('clientes')
            .select('cliente_id', 'cliente_uuid', 'nombre', 'status')
            .where({ cliente_id: clienteId, sucursal_id: sucursalId })
            .first();
    }

    async obtenerAlmacenPorId(almacenId: number, sucursalId: number) {
        return this.knex('almacenes')
            .select('almacen_id', 'almacen_uuid', 'nombre', 'status', 'sucursal_id')
            .where({ almacen_id: almacenId, sucursal_id: sucursalId })
            .whereNot('status', 'eliminada')
            .first();
    }

    async obtenerProductoPorUuid(productoUuid: string, sucursalId: number) {
        return this.knex('productos')
            .select('producto_id', 'producto_uuid', 'nombre', 'sku', 'con_lote')
            .where({ producto_uuid: productoUuid, sucursal_id: sucursalId })
            .first();
    }

    async obtenerLotePorUuid(loteUuid: string) {
        return this.knex('lotes')
            .select(
                'lote_id',
                'lote_uuid',
                'producto_id',
                'almacen_id',
                'cantidad_actual',
                'status',
                'codigo_lote',
            )
            .where({ lote_uuid: loteUuid })
            .first();
    }

    async obtenerStockAlmacen(productoId: number, almacenId: number) {
        return this.knex('stock_almacen')
            .select('stock_almacen_id', 'producto_id', 'almacen_id', 'stock_actual')
            .where({ producto_id: productoId, almacen_id: almacenId })
            .first();
    }

    async obtenerSiguienteFolio() {
        const row = await this.knex('ventas')
            .where('folio', 'like', VentasRepoHelper.buildNextFolioLike())
            .count<{ total: string }>('venta_id as total')
            .first();

        const siguiente = Number(row?.total ?? 0) + 1;
        return `VTA-PUE-${String(siguiente).padStart(6, '0')}`;
    }

    // ── Listar (mismo patrón que obtenerProductos) ───────────────────────────
    async obtenerVentas(filtros: FiltrosVentasDTO, sucursalId: number) {
        try {
            const filtrosEfectivos = {
                ...filtros,
                page: filtros?.page ?? 1,
                limit: filtros?.limit ?? 20,
            };

            const query = this.knex('ventas as v')
                .select(
                    'v.venta_id',
                    'v.venta_uuid',
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
                    'v.fecha_creacion',
                    'cli.cliente_uuid',
                    'cli.nombre as cliente_nombre',
                    'a.almacen_uuid',
                    'a.nombre as almacen_nombre',
                )
                .leftJoin('clientes as cli', 'cli.cliente_id', 'v.cliente_id')
                .leftJoin('almacenes as a', 'a.almacen_id', 'v.almacen_id')
                .where('v.sucursal_id', sucursalId)
                .whereNot('v.status', 'eliminada');

            this.helper.aplicarFiltros(query, filtrosEfectivos);
            this.helper.aplicarOrden(query, filtrosEfectivos);
            this.helper.aplicarPaginacion(
                query,
                filtrosEfectivos.page,
                filtrosEfectivos.limit,
            );

            const queryCount = this.knex('ventas as v')
                .count({ total: 'v.venta_id' })
                .leftJoin('clientes as cli', 'cli.cliente_id', 'v.cliente_id')
                .leftJoin('almacenes as a', 'a.almacen_id', 'v.almacen_id')
                .where('v.sucursal_id', sucursalId)
                .whereNot('v.status', 'eliminada');

            this.helper.aplicarFiltros(queryCount, filtrosEfectivos);

            const [ventas, [conteo]] = await Promise.all([
                query,
                queryCount as Promise<Array<{ total: string | number }>>,
            ]);

            return {
                ventas: ventas ?? [],
                total: Number(conteo?.total ?? 0),
                page: filtrosEfectivos.page,
                limit: filtrosEfectivos.limit,
            };
        } catch (error) {
            this.logger.error('obtenerVentas', error);
            throw new DatabaseQueryException('Error al listar ventas');
        }
    }

    // ── Detalle (mismo patrón que obtenerProductoPorUUID) ────────────────────
    async obtenerVentaPorUUID(uuid: string, sucursalId: number) {
        try {
            const venta = await this.knex('ventas as v')
                .select(
                    'v.venta_id',
                    'v.venta_uuid',
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
                    'v.fecha_cancelacion',
                    'v.fecha_creacion',
                    'v.fecha_actualizacion',
                    'cli.cliente_uuid',
                    'cli.nombre as cliente_nombre',
                    'a.almacen_uuid',
                    'a.nombre as almacen_nombre',
                    'a.direccion as almacen_direccion',
                )
                .leftJoin('clientes as cli', 'cli.cliente_id', 'v.cliente_id')
                .leftJoin('almacenes as a', 'a.almacen_id', 'v.almacen_id')
                .where('v.venta_uuid', uuid)
                .andWhere('v.sucursal_id', sucursalId)
                .first();

            if (!venta) return null;

            const detalles = await this.knex('ventas_detalle as vd')
                .select(
                    'vd.detalle_uuid',
                    'vd.cantidad',
                    'vd.precio_unitario',
                    'vd.descuento',
                    'vd.impuesto',
                    'vd.subtotal',
                    'vd.total',
                    'vd.producto_nombre_snapshot',
                    'vd.sku_snapshot',
                    'p.producto_uuid',
                    'p.nombre as producto_nombre',
                    'p.sku as producto_sku',
                    'p.con_lote',
                    'l.lote_uuid',
                    'l.codigo_lote',
                    'l.fecha_caducidad',
                    'al.almacen_uuid',
                    'al.nombre as almacen_nombre',
                )
                .leftJoin('productos as p', 'p.producto_id', 'vd.producto_id')
                .leftJoin('lotes as l', 'l.lote_id', 'vd.lote_id')
                .leftJoin('ventas as vv', 'vv.venta_id', 'vd.venta_id')
                .leftJoin('almacenes as al', 'al.almacen_id', 'vv.almacen_id')
                .where('vd.venta_id', venta.venta_id)
                .orderBy('vd.detalle_id', 'asc');

            return {
                ...venta,
                cliente: venta.cliente_uuid
                    ? { cliente_uuid: venta.cliente_uuid, nombre: venta.cliente_nombre }
                    : null,
                almacen: {
                    almacen_uuid: venta.almacen_uuid,
                    nombre: venta.almacen_nombre,
                    direccion: venta.almacen_direccion,
                },
                partidas: (detalles ?? []).map((d) => ({
                    detalle_uuid: d.detalle_uuid,
                    cantidad: Number(d.cantidad),
                    precio_unitario: Number(d.precio_unitario),
                    descuento: Number(d.descuento),
                    impuesto: Number(d.impuesto),
                    subtotal: Number(d.subtotal),
                    total: Number(d.total),
                    producto: {
                        producto_uuid: d.producto_uuid,
                        nombre: d.producto_nombre_snapshot ?? d.producto_nombre,
                        sku: d.sku_snapshot ?? d.producto_sku,
                        con_lote: d.con_lote,
                    },
                    lote: d.lote_uuid
                        ? {
                            lote_uuid: d.lote_uuid,
                            codigo_lote: d.codigo_lote,
                            fecha_caducidad: d.fecha_caducidad,
                        }
                        : null,
                    almacen: {
                        almacen_uuid: d.almacen_uuid,
                        nombre: d.almacen_nombre,
                    },
                })),
            };
        } catch (error) {
            this.logger.error('obtenerVentaPorUUID', error);
            throw new DatabaseQueryException('Error al obtener venta');
        }
    }
}