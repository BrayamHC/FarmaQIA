import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';

@Injectable()
export class OrdenesCompraRepoAction {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly knex: Knex,
    ) { }

    async crearOrdenCompleta(
        ordenObj: any,
        partidasBase: any[],
    ): Promise<{ uuid: string; folio_display: string }> {
        return this.knex.transaction(async (trx) => {
            // Obtener el último folio utilizado
            const ultimo = await trx('ordenes_compra')
                .max<{ max: number | string }>('folio_numero as max')
                .first();

            const nuevoFolio = Number(ultimo?.max ?? 0) + 1;
            const folioDisplay = `OC-PUE-${String(nuevoFolio).padStart(6, '0')}`;

            const [ordenCreada] = await trx('ordenes_compra')
                .insert({
                    ...ordenObj,

                    folio_numero: nuevoFolio,
                    folio_display: folioDisplay,

                    fecha_creacion: trx.fn.now(),
                    fecha_actualizacion: trx.fn.now(),
                })
                .returning([
                    'orden_compra_id',
                    'orden_compra_uuid',
                    'folio_display',
                ]);

            for (const partida of partidasBase) {
                await trx('partidas_oc').insert({
                    ...partida,
                    orden_compra_id: ordenCreada.orden_compra_id,
                    fecha_creacion: trx.fn.now(),
                    fecha_actualizacion: trx.fn.now(),
                });
            }

            return {
                uuid: ordenCreada.orden_compra_uuid,
                folio_display: ordenCreada.folio_display,
            };
        });
    }

    async actualizarOrdenCompra(uuid: string, body: any) {
        const [ordenActualizada] = await this.knex('ordenes_compra')
            .where('orden_compra_uuid', uuid)
            .update({
                ...body,
                fecha_actualizacion: this.knex.fn.now(),
            })
            .returning([
                'orden_compra_uuid',
                'folio_display',
                'status',
                'fecha_orden',
                'fecha_entrega_estimada',
                'condiciones_pago',
                'moneda',
                'tipo_cambio',
                'subtotal_estimado',
                'iva_estimado',
                'total_estimado',
                'notas',
                'nombre_autoriza',
                'fecha_autorizacion',
                'motivo_rechazo',
                'fecha_actualizacion',
            ]);

        return ordenActualizada;
    }
}