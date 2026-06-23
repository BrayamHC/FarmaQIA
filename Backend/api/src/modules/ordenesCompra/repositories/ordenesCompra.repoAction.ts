import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';


@Injectable()
export class OrdenesCompraRepoAction {
    constructor(@Inject('DATABASE_CONNECTION') private readonly knex: Knex) { }

    async crearOrdenCompleta(ordenObj: any, partidasBase: any[]): Promise<{ uuid: string; folio_display: string }> {
        return this.knex.transaction(async (trx) => {
            let nuevoFolio: number | null = null;
            let folioDisplay: string | null = null;

            if (ordenObj.serie_id) {
                const serie = await trx('series')
                    .where('serie_id', ordenObj.serie_id)
                    .forUpdate()
                    .first();

                if (!serie) {
                    throw new Error('Serie no encontrada');
                }

                nuevoFolio = Number(serie.ultimo_folio ?? 0) === 0
                    ? Number(serie.folio_inicial)
                    : Number(serie.ultimo_folio) + 1;

                folioDisplay = `${serie.prefijo ?? ''}${String(nuevoFolio).padStart(Number(serie.padding ?? 6), '0')}`;

                await trx('series')
                    .where('serie_id', ordenObj.serie_id)
                    .update({
                        ultimo_folio: nuevoFolio,
                        fecha_actualizacion: trx.fn.now(),
                    });
            }

            const [ordenCreada] = await trx('ordenes_compra')
                .insert({
                    ...ordenObj,
                    folio_numero: nuevoFolio,
                    folio_display: folioDisplay,
                    fecha_creacion: trx.fn.now(),
                    fecha_actualizacion: trx.fn.now(),
                })
                .returning(['orden_compra_id', 'orden_compra_uuid', 'folio_display']);

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
            .update(body)
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