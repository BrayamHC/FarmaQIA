import { Inject, Injectable } from '@nestjs/common'
import { Knex } from 'knex'
import { DATABASE_CONNECTION } from 'src/config/database.constants'
import { VentasRepoHelper } from './ventas.repoHelper'

@Injectable()
export class VentasRepoData {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: VentasRepoHelper,
    ) { }

    async obtenerClientePorUuid(clienteUuid: string | null, sucursalId: number) {
        if (!clienteUuid) return null

        return this.knex('clientes')
            .select('cliente_id', 'cliente_uuid', 'nombre', 'status')
            .where({
                cliente_uuid: clienteUuid,
                sucursal_id: sucursalId,
            })
            .first()
    }

    async obtenerAlmacenPorId(almacenId: number, sucursalId: number) {
        return this.knex('almacenes')
            .select('almacen_id', 'almacen_uuid', 'nombre', 'status', 'sucursal_id')
            .where({
                almacen_id: almacenId,
                sucursal_id: sucursalId,
            })
            .whereNot('status', 'eliminado')
            .first()
    }

    async obtenerProductoPorUuid(productoUuid: string, sucursalId: number) {
        return this.knex('productos')
            .select('producto_id', 'producto_uuid', 'nombre', 'sku', 'con_lote')
            .where({
                producto_uuid: productoUuid,
                sucursal_id: sucursalId,
            })
            .first()
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
            .first()
    }

    async obtenerStockAlmacen(productoId: number, almacenId: number) {
        return this.knex('stock_almacen')
            .select('stock_almacen_id', 'producto_id', 'almacen_id', 'stock_actual')
            .where({
                producto_id: productoId,
                almacen_id: almacenId,
            })
            .first()
    }

    async obtenerSiguienteFolio() {
        const row = await this.knex('ventas')
            .where('folio', 'like', VentasRepoHelper.buildNextFolioLike())  // ✅ Clase, no instancia
            .count<{ total: string }>('venta_id as total')
            .first();

        const siguiente = Number(row?.total ?? 0) + 1;

        return `VTA-PUE-${String(siguiente).padStart(6, '0')}`;
    }

    async obtenerClientePorId(clienteId: number, sucursalId: number) {
        return this.knex('clientes')
            .select('cliente_id', 'cliente_uuid', 'nombre', 'status')
            .where({
                cliente_id: clienteId,
                sucursal_id: sucursalId,
            })
            .first();
    }
}