import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogosBO {
    construirNuevaSerie(
        body: any,
        sucursalId: number,
        tipoDocumentoId: number,
        user: any,
    ) {
        return {
            tipo_documento_id: tipoDocumentoId,
            sucursal_id: sucursalId,
            serie: body.serie.toUpperCase(),
            prefijo: body.prefijo ? body.prefijo.toUpperCase() : null,
            folio_inicial: body.folio_inicial ?? 1,
            ultimo_folio: 0,
            padding: body.padding ?? 6,
            es_default: body.es_default ?? false,
            es_activa: true,
            usuario_creacion: user?.usuario_id ?? null,
            usuario_actualizacion: null,
            fecha_creacion: new Date(),
            fecha_actualizacion: null,
        };
    }

    construirActualizarSerie(body: any, user: any) {
        const data: Record<string, any> = {
            usuario_actualizacion: user?.usuario_id ?? null,
            fecha_actualizacion: new Date(),
        };

        if (body.prefijo !== undefined) {
            data.prefijo = body.prefijo ? body.prefijo.toUpperCase() : body.prefijo;
        }
        if (body.folio_inicial !== undefined) {
            data.folio_inicial = body.folio_inicial;
        }
        if (body.padding !== undefined) {
            data.padding = body.padding;
        }

        return data;
    }

    construirCambioStatusSerie(body: any, user: any) {
        return {
            es_activa: body.es_activa,
            usuario_actualizacion: user?.usuario_id ?? null,
            fecha_actualizacion: new Date(),
        };
    }
}