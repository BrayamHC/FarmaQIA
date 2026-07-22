import { createZodDto } from 'nestjs-zod';
import {
    FiltrosLotesSchema,
    LoteResponseSchema,
    LotesListaResponseSchema,
} from './lotes.validator';

export class FiltrosLotesDTO extends createZodDto(FiltrosLotesSchema) { }
export class LoteResponseDTO extends createZodDto(LoteResponseSchema) { }
export class LotesListaResponseDTO extends createZodDto(LotesListaResponseSchema) { }