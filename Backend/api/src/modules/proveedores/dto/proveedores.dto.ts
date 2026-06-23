import { createZodDto } from 'nestjs-zod';
import {
    FiltrosProveedoresSchema,
    CrearProveedorSchema,
    ActualizarProveedorSchema,
    CambiarStatusProveedorSchema,
} from './proveedores.validator';

export class FiltrosProveedoresDTO extends createZodDto(FiltrosProveedoresSchema) { }
export class CrearProveedorDTO extends createZodDto(CrearProveedorSchema) { }
export class ActualizarProveedorDTO extends createZodDto(ActualizarProveedorSchema) { }
export class CambiarStatusProveedorDTO extends createZodDto(CambiarStatusProveedorSchema) { }