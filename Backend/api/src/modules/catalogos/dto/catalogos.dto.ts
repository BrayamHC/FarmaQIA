import { createZodDto } from 'nestjs-zod';
import {
    FiltrosTiposDocumentoSchema,
    CrearSerieSchema,
    ActualizarSerieSchema,
    CambiarStatusSerieSchema,
    FiltrosSeriesSchema,
    FiltrosUnidadesMedidaSchema
} from './catalogos.validator';

export class FiltrosTiposDocumentoDTO extends createZodDto(FiltrosTiposDocumentoSchema) { }
export class CrearSerieDTO extends createZodDto(CrearSerieSchema) { }
export class ActualizarSerieDTO extends createZodDto(ActualizarSerieSchema) { }
export class CambiarStatusSerieDTO extends createZodDto(CambiarStatusSerieSchema) { }
export class FiltrosSeriesDTO extends createZodDto(FiltrosSeriesSchema) { }
export class FiltrosUnidadesMedidaDTO extends createZodDto(FiltrosUnidadesMedidaSchema) { }