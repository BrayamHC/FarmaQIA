// src/modules/ventas/repositories/ventas.repoAction.ts
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';

@Injectable()
export class VentasRepoAction {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
    ) { }

    async crearVentaTransaccional(data: {
        venta: any;
        detalles: any[];
        lotesAfectar: Array<{ lote_id: number; cantidad: number }>;
        stockAfectar: Array<{ producto_id: number; almacen_id: number; cantidad: number }>;
    }) {
        return this.knex.transaction(async (trx) => {
            const [venta] = await trx('ventas').insert(data.venta).returning('*');

            const detallesInsert = data.detalles.map((detalle) => ({
                ...detalle,
                venta_id: venta.venta_id,
            }));

            await trx('ventas_detalle').insert(detallesInsert);

            for (const stock of data.stockAfectar) {
                const registro = await trx('stock_almacen')
                    .where({
                        producto_id: stock.producto_id,
                        almacen_id: stock.almacen_id,
                    })
                    .forUpdate()
                    .first();

                await trx('stock_almacen')
                    .where({ stock_almacen_id: registro.stock_almacen_id })
                    .update({
                        stock_actual: this.knex.raw('stock_actual - ?', [stock.cantidad]),
                    });
            }

            for (const lote of data.lotesAfectar) {
                await trx('lotes')
                    .where({ lote_id: lote.lote_id })
                    .update({
                        cantidad_actual: this.knex.raw('cantidad_actual - ?', [lote.cantidad]),
                    });
            }

            return venta;
        });
    }

    async cancelarVentaTransaccional(data: {
        venta_id: number;
        usuario_id: number;
        partidas: Array<{
            detalle_id: number;
            producto_id: number;
            lote_id: number | null;
            cantidad: number;
            almacen_id: number;
        }>;
    }) {
        return this.knex.transaction(async (trx) => {
            // 1. Marcar venta como cancelada y registrar fecha y usuario
            const [venta] = await trx('ventas')
                .where({ venta_id: data.venta_id })
                .update({
                    status: 'cancelada',
                    fecha_cancelacion: trx.fn.now(),
                    usuario_actualizacion: data.usuario_id,
                })
                .returning('*');

            // 2. Revertir stock en stock_almacen (sumar)
            for (const partida of data.partidas) {
                const registro = await trx('stock_almacen')
                    .where({
                        producto_id: partida.producto_id,
                        almacen_id: partida.almacen_id,
                    })
                    .forUpdate()
                    .first();

                if (!registro) continue;

                await trx('stock_almacen')
                    .where({ stock_almacen_id: registro.stock_almacen_id })
                    .update({
                        stock_actual: this.knex.raw('stock_actual + ?', [partida.cantidad]),
                    });
            }

            // 3. Revertir lotes (sumar) cuando aplique
            for (const partida of data.partidas) {
                if (!partida.lote_id) continue;

                await trx('lotes')
                    .where({ lote_id: partida.lote_id })
                    .update({
                        cantidad_actual: this.knex.raw('cantidad_actual + ?', [partida.cantidad]),
                    });
            }

            return venta;
        });
    }
}