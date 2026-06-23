import { createZodDto } from 'nestjs-zod';
import {
    FiltrosClienteSchema,
    CrearClienteSchema,
    ActualizarClienteSchema,
    CambiarStatusClienteSchema,
} from './clientes.validator';

export class FiltrosClienteDTO extends createZodDto(FiltrosClienteSchema) { }
export class CrearClienteDTO extends createZodDto(CrearClienteSchema) { }
export class ActualizarClienteDTO extends createZodDto(ActualizarClienteSchema) { }
export class CambiarStatusClienteDTO extends createZodDto(CambiarStatusClienteSchema) { }