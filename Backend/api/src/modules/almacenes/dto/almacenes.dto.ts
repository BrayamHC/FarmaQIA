import { createZodDto } from 'nestjs-zod';
import {
    CrearAlmacenSchema,
    ActualizarAlmacenSchema,
    CambiarStatusAlmacenSchema,
    FiltrosAlmacenesSchema,
} from './almacenes.validator';

export class CrearAlmacenDTO extends createZodDto(CrearAlmacenSchema) { }
export class ActualizarAlmacenDTO extends createZodDto(ActualizarAlmacenSchema) { }
export class CambiarStatusAlmacenDTO extends createZodDto(CambiarStatusAlmacenSchema) { }
export class FiltrosAlmacenesDTO extends createZodDto(FiltrosAlmacenesSchema) { }