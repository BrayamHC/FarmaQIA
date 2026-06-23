import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class CatalogosRepoAction {
    private readonly logger = new Logger(CatalogosRepoAction.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
    ) { }

    async crearSerie(insertObj: any, esDefault: boolean) {
        try {
            return await this.knex.transaction(async (trx) => {
                if (esDefault) {
                    await trx('series')
                        .where('tipo_documento_id', insertObj.tipo_documento_id)
                        .andWhere('sucursal_id', insertObj.sucursal_id)
                        .update({
                            es_default: false,
                            fecha_actualizacion: trx.fn.now(),
                        });
                }

                const [serie] = await trx('series')
                    .insert({
                        ...insertObj,
                        fecha_creacion: trx.fn.now(),
                        fecha_actualizacion: trx.fn.now(),
                    })
                    .returning([
                        'serie_id',
                        'serie_uuid',
                        'tipo_documento_id',
                        'sucursal_id',
                        'serie',
                        'prefijo',
                        'folio_inicial',
                        'ultimo_folio',
                        'padding',
                        'es_default',
                        'es_activa',
                        'fecha_creacion',
                        'fecha_actualizacion',
                    ]);

                return serie;
            });
        } catch (error) {
            this.logger.error('crearSerie', error);
            throw new DatabaseQueryException('Error al crear serie');
        }
    }

    async actualizarSerie(uuid: string, updateObj: any) {
        try {
            const [serie] = await this.knex('series')
                .where('serie_uuid', uuid)
                .update({
                    ...updateObj,
                    fecha_actualizacion: this.knex.fn.now(),
                })
                .returning([
                    'serie_id',
                    'serie_uuid',
                    'tipo_documento_id',
                    'sucursal_id',
                    'serie',
                    'prefijo',
                    'folio_inicial',
                    'ultimo_folio',
                    'padding',
                    'es_default',
                    'es_activa',
                    'fecha_creacion',
                    'fecha_actualizacion',
                ]);

            return serie;
        } catch (error) {
            this.logger.error('actualizarSerie', error);
            throw new DatabaseQueryException('Error al actualizar serie');
        }
    }

    async setSerieDefault(
        uuid: string,
        tipoDocumentoId: number,
        sucursalId: number,
        user: any,
    ) {
        try {
            return await this.knex.transaction(async (trx) => {
                await trx('series')
                    .where('tipo_documento_id', tipoDocumentoId)
                    .andWhere('sucursal_id', sucursalId)
                    .update({
                        es_default: false,
                        usuario_actualizacion: user?.usuario_id ?? null,
                        fecha_actualizacion: trx.fn.now(),
                    });

                const [serie] = await trx('series')
                    .where('serie_uuid', uuid)
                    .update({
                        es_default: true,
                        usuario_actualizacion: user?.usuario_id ?? null,
                        fecha_actualizacion: trx.fn.now(),
                    })
                    .returning([
                        'serie_id',
                        'serie_uuid',
                        'tipo_documento_id',
                        'sucursal_id',
                        'serie',
                        'prefijo',
                        'folio_inicial',
                        'ultimo_folio',
                        'padding',
                        'es_default',
                        'es_activa',
                        'fecha_creacion',
                        'fecha_actualizacion',
                    ]);

                return serie;
            });
        } catch (error) {
            this.logger.error('setSerieDefault', error);
            throw new DatabaseQueryException('Error al marcar serie default');
        }
    }
}