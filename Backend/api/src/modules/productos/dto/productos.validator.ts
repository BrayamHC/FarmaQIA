import { z } from 'zod';

// ─────────────────────────────────────────────
// BASE
// ─────────────────────────────────────────────
export const ProductoBaseSchema = z.object({
    producto_uuid: z.string().uuid(),
    id: z.number(),

    sku: z.string().min(1, 'El SKU es obligatorio'),
    upc: z.string().min(1, 'El UPC es obligatorio').optional(),
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    descripcion: z.string().optional(),
    status: z.string().default('activo'),

    // Clasificación
    unidad_medida_id: z.number(),
    categoria_uuid: z.string().uuid('UUID de categoría inválido'),
    proveedor_uuid: z.string().uuid('UUID del proveedor inválido'),

    // Físico
    volumen_valor: z.number().positive().optional(),
    volumen_unidad: z.string().optional(),
    peso_valor: z.number().positive().optional(),
    peso_unidad: z.string().optional(),

    // Control de almacén
    unidad_entrada: z.string().min(1, 'La unidad de entrada es obligatoria'),
    unidad_salida: z.string().min(1, 'La unidad de salida es obligatoria'),
    control_almacen: z.string().min(1, 'El control de almacén es obligatorio'),
    factor_unidades: z.number().positive('El factor de unidades debe ser positivo'),
    con_lote: z.boolean(),

    // Precios — IVA 16% se aplica en venta, no aquí
    costo_compra: z.coerce.number().positive('El costo de compra es obligatorio'),
    precio_publico: z.coerce.number().positive('El precio público es obligatorio'),

    // Farmacéutico
    numero_registro_sanitario: z.string().optional(),
    temperatura: z.object({
        valor: z.number(),
        unidad: z.string().default('°C'),
    }).optional(),
    presentacion: z.string().min(1, 'La presentación es obligatoria'),
    fecha_entrada: z
        .string()
        .regex(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
        .transform((f) => f.replace(/\//g, '-')),

    tags: z.array(z.string()).default([]),

    url_imagen: z.string().url().optional(),

    // Auditoría
    usuario_creacion: z.number(),
    usuario_actualizacion: z.number().nullable(),
    fecha_creacion: z.string(),
    fecha_actualizacion: z.string().nullable(),
});

// ─────────────────────────────────────────────
// CREAR
// ─────────────────────────────────────────────
export const CrearProductoSchema = ProductoBaseSchema.omit({
    producto_uuid: true,
    id: true,
    fecha_creacion: true,
    fecha_actualizacion: true,
    usuario_creacion: true,
    usuario_actualizacion: true,
});

// ─────────────────────────────────────────────
// ACTUALIZAR  (todo opcional excepto lo que no debe cambiar)
// ─────────────────────────────────────────────
export const ActualizarProductoSchema = CrearProductoSchema.omit({
    sku: true,
    status: true,
}).partial();

// ─────────────────────────────────────────────
// CAMBIAR STATUS
// ─────────────────────────────────────────────
export const CambiarStatusProductoSchema = z.object({
    status: z.enum(['activo', 'inactivo', 'eliminado']),
});

// ─────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────
export const FiltrosProductosSchema = z.object({
    nombre: z.string().optional(),
    sku: z.string().optional(),
    upc: z.string().optional(),
    status: z.string().optional(),
    cat_uuid: z.string().uuid().optional(),
    prov_uuid: z.string().uuid().optional(),
    con_lote: z.coerce.boolean().optional(),
    presentacion: z.string().optional(),
    almacen_id: z.coerce.number().int().positive().optional(), // <-- NUEVO
    sort: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
}).partial();

// ─────────────────────────────────────────────
// RESPONSE
// ─────────────────────────────────────────────
export const ProductoResponseSchema = z.object({
    producto_uuid: z.string().uuid(),
    sku: z.string(),
    upc: z.string().nullable(),
    nombre: z.string(),
    descripcion: z.string().nullable(),
    status: z.string(),

    unidad_medida: z.string().nullable(),
    clave_unidad_medida: z.string().nullable(),
    categoria: z.string().nullable(),
    proveedor: z.string().nullable(),

    volumen_valor: z.preprocess((v) => v != null ? parseFloat(String(v)) : null, z.number().nullable()),
    volumen_unidad: z.string().nullable(),
    peso_valor: z.preprocess((v) => v != null ? parseFloat(String(v)) : null, z.number().nullable()),
    peso_unidad: z.string().nullable(),

    unidad_entrada: z.string(),
    unidad_salida: z.string(),
    control_almacen: z.string(),
    factor_unidades: z.preprocess((v) => parseFloat(String(v)), z.number()),
    con_lote: z.boolean(),

    costo_compra: z.preprocess((v) => parseFloat(String(v)), z.number()),
    precio_publico: z.preprocess((v) => parseFloat(String(v)), z.number()),

    numero_registro_sanitario: z.string().nullable().optional(),
    temperatura: z.object({ valor: z.number(), unidad: z.string() }).optional(),
    presentacion: z.string(),
    fecha_entrada: z.coerce.date(),
    tags: z.array(z.string()),
    url_imagen: z.string().nullable().optional(),

    stock: z.object({
        total: z.number(),
        almacenes: z.array(z.object({
            nombre: z.string(),
            stock: z.number(),
        })),
    }).optional(),

    lotes: z.array(z.object({
        lote_uuid: z.string().optional(),
        clave: z.string(),
        fecha_caducidad: z.coerce.date().transform((d) => d.toLocaleDateString()),
        cantidad: z.number(),
        almacen: z.string(),
    })).optional(),

    precios: z.array(z.object({
        precio_uuid: z.string().uuid(),
        precio_venta: z.number(),
        es_default: z.boolean(),
        status: z.string(),
    })).optional(),

    fecha_creacion: z.coerce.date(),
    fecha_actualizacion: z.coerce.date().nullable(),
});

export const ProductosListaResponseSchema = z.object({
    productos: z.array(ProductoResponseSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
});

export const CrearProductoResponseSchema = z.object({
    meta: z.object({ message: z.string() }),
    producto: ProductoResponseSchema.pick({
        producto_uuid: true,
        sku: true,
        upc: true,
        nombre: true,
        descripcion: true,
        status: true,
        precio_publico: true,
        costo_compra: true,
        presentacion: true,
        con_lote: true,
        tags: true,
        fecha_entrada: true,
        url_imagen: true,
    }),
});

export const AltaLoteStockSchema = z.object({
    almacen_uuid: z.string().uuid('UUID de almacén inválido'),
    codigo_lote: z.string().min(1, 'El código de lote es obligatorio').max(100),
    cantidad_actual: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
    fecha_caducidad: z
        .string()
        .regex(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
        .transform((f) => f.replace(/\//g, '-')),
    fecha_fabricacion: z
        .string()
        .regex(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
        .transform((f) => f.replace(/\//g, '-'))
        .optional(),
    costo_unitario_compra: z.coerce.number().min(0).default(0),
    proveedor_uuid: z.string().uuid('UUID del proveedor inválido').optional(),
});

export const AltaLoteStockResponseSchema = z.object({
    meta: z.object({ message: z.string() }),
    lote: z.object({
        lote_uuid: z.string().uuid(),
        codigo_lote: z.string(),
        cantidad_actual: z.number(),
        fecha_caducidad: z.coerce.date(),
        status: z.string(),
    }),
    stock_almacen: z.object({
        stock_almacen_uuid: z.string().uuid(),
        stock_actual: z.number(),
    }),
});


// ─────────────────────────────────────────────
// TIPOS INFERIDOS
// ─────────────────────────────────────────────
export type CrearProducto = z.infer<typeof CrearProductoSchema>;
export type ActualizarProducto = z.infer<typeof ActualizarProductoSchema>;
export type FiltrosProductos = z.infer<typeof FiltrosProductosSchema>;
export type ProductoResponse = z.infer<typeof ProductoResponseSchema>;
export type AltaLoteStock = z.infer<typeof AltaLoteStockSchema>;
