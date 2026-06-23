import {
    ConflictException, Injectable, Logger, NotFoundException, UnprocessableEntityException,
} from '@nestjs/common';
import { CatalogosRepoData } from './repositories/catalogos.repoData';
import { CatalogosRepoAction } from './repositories/catalogos.repoAction';
import { CatalogosBO } from './repositories/catalogos.bo';
import {
    ActualizarSerieDTO, CambiarStatusSerieDTO, CrearSerieDTO, FiltrosSeriesDTO, FiltrosTiposDocumentoDTO,
} from './dto/catalogos.dto';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class CatalogosService {
    private readonly logger = new Logger(CatalogosService.name);

    constructor(
        private readonly repoData: CatalogosRepoData,
        private readonly repoAction: CatalogosRepoAction,
        private readonly bo: CatalogosBO,
    ) { }

    // ─────────────────────────────────────────
    // Tipos de documento
    // ─────────────────────────────────────────
    async obtenerTiposDocumentos(filtros: FiltrosTiposDocumentoDTO) {
        try {
            return await this.repoData.obtenerTiposDocumentos(filtros);
        } catch (error) {
            this.logger.error('obtenerTiposDocumentos', error);
            throw new DatabaseQueryException('Error al obtener tipos de documento');
        }
    }

    async obtenerTipoDeDocumentoPorUUID(uuid: string) {
        try {
            const tipo = await this.repoData.obtenerTipoDocumentoPorUUID(uuid);
            if (!tipo) throw new NotFoundException('Tipo de documento no encontrado');
            return tipo;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error('obtenerTipoDeDocumentoPorUUID', error);
            throw new DatabaseQueryException('Error al obtener tipo de documento');
        }
    }

    // ─────────────────────────────────────────
    // Series
    // ─────────────────────────────────────────
    async obtenerSeries(sucursalId: number, filtros: FiltrosSeriesDTO) {
        try {
            return await this.repoData.obtenerSeries(sucursalId, filtros);
        } catch (error) {
            this.logger.error('obtenerSeries', error);
            throw new DatabaseQueryException('Error al obtener series');
        }
    }

    async obtenerSeriePorUUID(uuid: string, sucursalId: number) {
        try {
            const serie = await this.repoData.obtenerSeriePorUUID(uuid, sucursalId);
            if (!serie) throw new NotFoundException('Serie no encontrada');
            return serie;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error('obtenerSeriePorUUID', error);
            throw new DatabaseQueryException('Error al obtener serie');
        }
    }

    async crearSerie(body: CrearSerieDTO, sucursalId: number, user: any) {
        try {
            const tipoDocumento = await this.obtenerTipoDeDocumentoPorUUID(body.tipo_documento_uuid);

            const serieExistente = await this.repoData.obtenerSeriePorNombre(
                sucursalId,
                tipoDocumento.tipo_documento_id,
                body.serie.toUpperCase(),
            );

            if (serieExistente) {
                throw new ConflictException(
                    `La serie '${body.serie}' ya existe para este tipo de documento`,
                );
            }

            const insertObj = this.bo.construirNuevaSerie(
                body,
                sucursalId,
                tipoDocumento.tipo_documento_id,
                user,
            );

            const serie = await this.repoAction.crearSerie(insertObj, body.es_default);

            return {
                meta: { message: 'Serie creada correctamente' },
                serie,
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) throw error;

            this.logger.error('crearSerie', error);
            throw new DatabaseQueryException('Error al crear serie');
        }
    }

    async actualizarSerie(uuid: string, body: ActualizarSerieDTO, sucursalId: number, user: any) {
        try {
            const serie = await this.obtenerSeriePorUUID(uuid, sucursalId);

            if (!serie.es_activa) {
                throw new UnprocessableEntityException(
                    'No se puede editar una serie inactiva',
                );
            }

            const updateObj = this.bo.construirActualizarSerie(body, user);
            const serieActualizada = await this.repoAction.actualizarSerie(uuid, updateObj);

            return {
                meta: { message: 'Serie actualizada correctamente' },
                serie: serieActualizada,
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof UnprocessableEntityException
            ) throw error;

            this.logger.error('actualizarSerie', error);
            throw new DatabaseQueryException('Error al actualizar serie');
        }
    }

    async setSerieDefault(uuid: string, sucursalId: number, user: any) {
        try {
            const serie = await this.obtenerSeriePorUUID(uuid, sucursalId);

            if (!serie.es_activa) {
                throw new UnprocessableEntityException(
                    'Una serie inactiva no puede ser default',
                );
            }

            if (serie.es_default) {
                throw new ConflictException('La serie ya está marcada como default');
            }

            const serieActualizada = await this.repoAction.setSerieDefault(
                uuid,
                serie.tipo_documento_id,
                serie.sucursal_id,
                user,
            );

            return {
                meta: { message: 'Serie marcada como default correctamente' },
                serie: serieActualizada,
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof UnprocessableEntityException
            ) throw error;

            this.logger.error('setSerieDefault', error);
            throw new DatabaseQueryException('Error al actualizar serie default');
        }
    }

    async cambiarStatusSerie(
        uuid: string,
        body: CambiarStatusSerieDTO,
        sucursalId: number,
        user: any,
    ) {
        try {
            const serie = await this.obtenerSeriePorUUID(uuid, sucursalId);

            if (serie.es_activa === body.es_activa) {
                throw new ConflictException(
                    `La serie ya se encuentra ${body.es_activa ? 'activa' : 'inactiva'}`,
                );
            }

            if (!body.es_activa && serie.es_default) {
                throw new UnprocessableEntityException(
                    'No se puede desactivar una serie default',
                );
            }

            const updateObj = this.bo.construirCambioStatusSerie(body, user);
            const serieActualizada = await this.repoAction.actualizarSerie(uuid, updateObj);

            return {
                meta: {
                    message: `Serie ${body.es_activa ? 'activada' : 'desactivada'} correctamente`,
                },
                serie: serieActualizada,
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof UnprocessableEntityException
            ) throw error;

            this.logger.error('cambiarStatusSerie', error);
            throw new DatabaseQueryException('Error al cambiar status de la serie');
        }
    }

    async obtenerUnidadesMedida(filtros: any) {
        try {
            return await this.repoData.obtenerUnidadesMedida(filtros);
        } catch (error) {
            this.logger.error('obtenerUnidadesMedida', error);
            throw new DatabaseQueryException('Error al obtener unidades de medida');
        }
    }
}