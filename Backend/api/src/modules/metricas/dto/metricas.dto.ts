// dto/metricas.dto.ts
import { createZodDto } from 'nestjs-zod';
import {
    FiltroCaducidadSchema,
    ResumenMetricasResponseSchema,
    VentasSemanaResponseSchema,
    InventarioCategoriaResponseSchema,
    CaducidadesResponseSchema,
} from './metricas.validator';

export class FiltroCaducidadDTO extends createZodDto(FiltroCaducidadSchema) { }
export class ResumenMetricasResponseDTO extends createZodDto(ResumenMetricasResponseSchema) { }
export class VentasSemanaResponseDTO extends createZodDto(VentasSemanaResponseSchema) { }
export class InventarioCategoriaResponseDTO extends createZodDto(InventarioCategoriaResponseSchema) { }
export class CaducidadesResponseDTO extends createZodDto(CaducidadesResponseSchema) { }