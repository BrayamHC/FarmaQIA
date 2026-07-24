import { createZodDto } from 'nestjs-zod';
import { CrearVentaSchema } from './ventas.validator';

export class CrearVentaDto extends createZodDto(CrearVentaSchema) { }