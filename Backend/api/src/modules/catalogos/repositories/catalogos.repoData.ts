import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { CatalogosRepoHelper } from './catalogos.repoHelper';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class CatalogosRepoData {
    private readonly logger = new Logger(CatalogosRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: CatalogosRepoHelper,
    ) { }

    async obtenerTiposDocumentos(filtros: any) {
        try {
            let query = this.knex('cat_tipos_documentos as td')
                .select(
                    'td.tipo_documento_id',
                    'td.tipo_documento_uuid',
                    'td.clave',
                    'td.nombre',
                    'td.descripcion',
                    'td.es_fiscal',
                    'td.es_configurable',
                    'td.es_sistema',
                    'td.status',
                )
                .orderBy('td.clave', 'asc');

            query = this.helper.aplicarFiltrosTiposDocumento(query, filtros);
            return await query;
        } catch (error) {
            this.logger.error('obtenerTiposDocumentos', error);
            throw new DatabaseQueryException('Error al obtener tipos de documento');
        }
    }

    async obtenerUnidadesMedida(filtros: any) {
        try {
            let query = this.knex('cat_unidades_medida as um')
                .select(
                    'um.unidad_medida_id',
                    'um.unidad_medida_uuid',
                    'um.clave',
                    'um.nombre',
                    'um.nombre_corto',
                    'um.tipo',
                    'um.activo',
                    'um.fecha_creacion',
                    'um.fecha_actualizacion',
                )
                .orderBy('um.nombre', 'asc');

            query = this.helper.aplicarFiltrosUnidadesMedida(query, filtros);
            return await query;
        } catch (error) {
            this.logger.error('obtenerUnidadesMedida', error);
            throw new DatabaseQueryException('Error al obtener unidades de medida');
        }
    }


    async obtenerCategoriasSub(filtros: any) {
        try {
            let query = this.knex('cat_categorias_subcategorias as c')
                .leftJoin(
                    'cat_categorias_subcategorias as p',
                    'p.categoria_id',
                    'c.padre_id'
                )
                .select(
                    'c.categoria_id',
                    'c.categoria_uuid',
                    'c.nombre as nombre_categoria',
                    'c.padre_id',
                    'p.categoria_id as categoria_padre_id',
                    'p.categoria_uuid as categoria_padre_uuid',
                    'p.nombre as nombre_categoria_padre',
                    this.knex.raw(`
                    CASE 
                        WHEN c.padre_id IS NULL THEN 'CATEGORIA'
                        ELSE 'SUBCATEGORIA'
                    END as tipo
                `),
                    'c.fecha_creacion',
                    'c.fecha_actualizacion'
                )
                .orderBy('c.nombre', 'asc');

            // si tienes filtros específicos
            // query = this.helper.aplicarFiltrosCategorias(query, filtros);

            return await query;

        } catch (error) {
            this.logger.error('obtenerCategoriasSub', error);
            throw new DatabaseQueryException(
                'Error al obtener categorías y subcategorías'
            );
        }
    }

    async obtenerTipoDocumentoPorUUID(uuid: string) {
        try {
            return await this.knex('cat_tipos_documentos as td')
                .select(
                    'td.tipo_documento_id',
                    'td.tipo_documento_uuid',
                    'td.clave',
                    'td.nombre',
                    'td.descripcion',
                    'td.es_fiscal',
                    'td.es_configurable',
                    'td.es_sistema',
                    'td.status',
                )
                .where('td.tipo_documento_uuid', uuid)
                .andWhere('td.status', 'activo')
                .first();
        } catch (error) {
            this.logger.error('obtenerTipoDocumentoPorUUID', error);
            throw new DatabaseQueryException('Error al obtener tipo de documento');
        }
    }

    async obtenerSeries(sucursalId: number, filtros: any) {
        try {
            let query = this.knex('series as s')
                .select(
                    's.serie_id',
                    's.serie_uuid',
                    's.tipo_documento_id',
                    's.sucursal_id',
                    's.serie',
                    's.prefijo',
                    's.folio_inicial',
                    's.ultimo_folio',
                    's.padding',
                    's.es_default',
                    's.es_activa',
                    's.fecha_creacion',
                    's.fecha_actualizacion',
                    'td.tipo_documento_uuid',
                    'td.clave as tipo_documento_clave',
                    'td.nombre as tipo_documento_nombre',
                )
                .join('cat_tipos_documentos as td', 's.tipo_documento_id', 'td.tipo_documento_id')
                .where('s.sucursal_id', sucursalId)
                .orderBy('td.clave', 'asc')
                .orderBy('s.serie', 'asc');

            query = this.helper.aplicarFiltrosSeries(query, filtros);
            return await query;
        } catch (error) {
            this.logger.error('obtenerSeries', error);
            throw new DatabaseQueryException('Error al obtener series');
        }
    }

    async obtenerSeriePorUUID(uuid: string, sucursalId: number) {
        try {
            return await this.knex('series as s')
                .select(
                    's.*',
                    'td.tipo_documento_uuid',
                    'td.clave as tipo_documento_clave',
                    'td.nombre as tipo_documento_nombre',
                )
                .join('cat_tipos_documentos as td', 's.tipo_documento_id', 'td.tipo_documento_id')
                .where('s.serie_uuid', uuid)
                .andWhere('s.sucursal_id', sucursalId)
                .first();
        } catch (error) {
            this.logger.error('obtenerSeriePorUUID', error);
            throw new DatabaseQueryException('Error al obtener serie');
        }
    }

    async obtenerSeriePorNombre(
        sucursalId: number,
        tipoDocumentoId: number,
        serie: string,
    ) {
        try {
            return await this.knex('series')
                .select('*')
                .where('sucursal_id', sucursalId)
                .andWhere('tipo_documento_id', tipoDocumentoId)
                .andWhere('serie', serie)
                .first();
        } catch (error) {
            this.logger.error('obtenerSeriePorNombre', error);
            throw new DatabaseQueryException('Error al obtener serie por nombre');
        }
    }
}