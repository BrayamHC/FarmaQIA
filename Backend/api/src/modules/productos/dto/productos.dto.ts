import { createZodDto } from 'nestjs-zod';
import {
    CrearProductoSchema,
    ActualizarProductoSchema,
    CambiarStatusProductoSchema,
    FiltrosProductosSchema,
    ProductoResponseSchema,
    ProductosListaResponseSchema,
    CrearProductoResponseSchema,
} from './productos.validator';

export class CrearProductoDTO extends createZodDto(CrearProductoSchema) { }
export class ActualizarProductoDTO extends createZodDto(ActualizarProductoSchema) { }
export class CambiarStatusProductoDTO extends createZodDto(CambiarStatusProductoSchema) { }
export class FiltrosProductosDTO extends createZodDto(FiltrosProductosSchema) { }
export class ProductoResponseDTO extends createZodDto(ProductoResponseSchema) { }
export class ProductosListaResponseDTO extends createZodDto(ProductosListaResponseSchema) { }
export class CrearProductoResponseDTO extends createZodDto(CrearProductoResponseSchema) { }