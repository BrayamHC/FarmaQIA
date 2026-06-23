import { createZodDto } from 'nestjs-zod';
import {
    CrearOrdenCompraSchema,
    ActualizarOrdenCompraSchema,
    AutorizarOrdenCompraSchema,
    CancelarOrdenCompraSchema,
    FiltrosOrdenCompraSchema,
} from './ordenesCompra.validator';

export class CrearOrdenCompraDTO extends createZodDto(CrearOrdenCompraSchema) { }
export class ActualizarOrdenCompraDTO extends createZodDto(ActualizarOrdenCompraSchema) { }
export class AutorizarOrdenCompraDTO extends createZodDto(AutorizarOrdenCompraSchema) { }
export class CancelarOrdenCompraDTO extends createZodDto(CancelarOrdenCompraSchema) { }
export class FiltrosOrdenCompraDTO extends createZodDto(FiltrosOrdenCompraSchema) { }