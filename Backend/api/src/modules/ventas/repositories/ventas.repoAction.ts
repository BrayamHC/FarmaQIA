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
}