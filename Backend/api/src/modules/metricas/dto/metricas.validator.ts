// metricas.validator.ts
import { z } from 'zod';

export const FiltroCaducidadSchema = z.object({
    dias: z.coerce.number().int().positive().default(90),
}).partial();

export const ResumenMetricasResponseSchema = z.object({
    ventas_dia: z.object({
        total: z.number(),
        cambio_porcentual: z.number().nullable(),
    }),
    ventas_semana: z.object({
        total: z.number(),
        cambio_porcentual: z.number().nullable(),
    }),
    productos_bajos: z.object({
        total: z.number(),
        cambio: z.number().nullable(),
    }),
    proximos_caducar: z.object({
        total: z.number(),
        cambio: z.number().nullable(),
    }),
});

export const VentasSemanaResponseSchema = z.object({
    labels: z.array(z.string()),
    data: z.array(z.number()),
});

export const InventarioCategoriaResponseSchema = z.object({
    categorias: z.array(z.object({
        categoria: z.string(),
        total_stock: z.number(),
    })),
});

export const CaducidadesResponseSchema = z.object({
    buckets: z.array(z.object({
        rango: z.string(),
        cantidad: z.number(),
    })),
});