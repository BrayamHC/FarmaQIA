import { createZodDto } from 'nestjs-zod';
import {
    CrearSucursalSchema,
    ActualizarSucursalSchema,
    CambiarStatusSucursalSchema,
    SeleccionarSucursalSchema,
    FiltrosSucursalesSchema,
} from './sucursales.validator';

export class CrearSucursalDTO extends createZodDto(CrearSucursalSchema) { }
export class ActualizarSucursalDTO extends createZodDto(ActualizarSucursalSchema) { }
export class CambiarStatusSucursalDTO extends createZodDto(CambiarStatusSucursalSchema) { }
export class SeleccionarSucursalDTO extends createZodDto(SeleccionarSucursalSchema) { }
export class FiltrosSucursalesDTO extends createZodDto(FiltrosSucursalesSchema) { }