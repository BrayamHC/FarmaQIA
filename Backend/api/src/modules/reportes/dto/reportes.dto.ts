import { createZodDto } from 'nestjs-zod';
import {
    FiltrosFechasSchema,
    FormatoExportacionSchema,
    ReporteInventarioResponseSchema,
    ReporteVentasResponseSchema,
    ReporteComprasResponseSchema,
} from './reportes.validator';

export class FiltrosFechasDTO extends createZodDto(FiltrosFechasSchema) { }
export class FormatoExportacionDTO extends createZodDto(FormatoExportacionSchema) { }

export class ReporteInventarioResponseDTO extends createZodDto(ReporteInventarioResponseSchema) { }
export class ReporteVentasResponseDTO extends createZodDto(ReporteVentasResponseSchema) { }
export class ReporteComprasResponseDTO extends createZodDto(ReporteComprasResponseSchema) { }