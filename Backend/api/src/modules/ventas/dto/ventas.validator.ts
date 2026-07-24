import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CrearVentaPartidaSchema = z.object({
    producto_uuid: z.string().uuid(),
    lote_uuid: z.string().uuid().nullable().optional(),
    cantidad: z.coerce.number().positive(),
    precio_unitario: z.coerce.number().nonnegative(),
    descuento: z.coerce.number().nonnegative().default(0),
    impuesto: z.coerce.number().nonnegative().default(0),
    subtotal: z.coerce.number().nonnegative(),
    total: z.coerce.number().nonnegative(),
})

export const CrearVentaSchema = z.object({
    cliente_uuid: z.string().uuid(),
    almacen_id: z.coerce.number().int().positive(),
    metodo_pago: z.string().min(1),
    subtotal: z.coerce.number().nonnegative(),
    descuento: z.coerce.number().nonnegative().default(0),
    impuesto: z.coerce.number().nonnegative().default(0),
    total: z.coerce.number().nonnegative(),
    monto_recibido: z.coerce.number().nonnegative(),
    cambio: z.coerce.number().nonnegative().default(0),
    partidas: z.array(CrearVentaPartidaSchema).min(1),
})

export class CrearVentaDto extends createZodDto(CrearVentaSchema) { }

// ─────────────────────────────────────────────
// FILTROS — mismo patrón que FiltrosProductosSchema
// ─────────────────────────────────────────────
export const FiltrosVentasSchema = z.object({
    cliente_uuid: z.string().uuid().optional(),
    almacen_id: z.coerce.number().int().positive().optional(),
    metodo_pago: z.string().optional(),
    status: z.string().optional(),
    fecha_inicio: z.string().optional(), // YYYY-MM-DD
    fecha_fin: z.string().optional(),    // YYYY-MM-DD
    sort: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
}).partial()
 
export class FiltrosVentasDTO extends createZodDto(FiltrosVentasSchema) { }