// repositories/metricas.repoData.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';

interface VentaPorDiaRow {
    dia: string;
    total: number | string;
}

interface StockCategoriaRow {
    categoria: string;
    total_stock: number | string;
}

@Injectable()
export class MetricasRepoData {
    private readonly logger = new Logger(MetricasRepoData.name);

    constructor(@Inject(DATABASE_CONNECTION) private readonly knex: Knex) { }

    async ventasTotalPorRango(sucursalId: number, rango: 'hoy' | 'semana') {
        const intervalo = rango === 'hoy' ? '1 day' : '7 days';
        const statusValido = 'cobrada'; // ← corregido

        const actual = await this.knex('ventas as v')
            .sum({ total: 'v.total' })
            .where('v.sucursal_id', sucursalId)
            .andWhere('v.status', statusValido)
            .andWhereRaw(`v.fecha_venta >= NOW() - INTERVAL '${intervalo}'`)
            .first();

        const anterior = await this.knex('ventas as v')
            .sum({ total: 'v.total' })
            .where('v.sucursal_id', sucursalId)
            .andWhere('v.status', statusValido)
            .andWhereRaw(
                `v.fecha_venta >= NOW() - INTERVAL '${intervalo}' * 2 AND v.fecha_venta < NOW() - INTERVAL '${intervalo}'`,
            )
            .first();

        const totalActual = Number(actual?.total ?? 0);
        const totalAnterior = Number(anterior?.total ?? 0);
        const cambio = totalAnterior > 0
            ? Number((((totalActual - totalAnterior) / totalAnterior) * 100).toFixed(1))
            : null;

        return { total: totalActual, cambio_porcentual: cambio };
    }

    async ventasPorDiaUltimaSemana(sucursalId: number) {
        const rows = await this.knex.raw(
            `
        SELECT 
            TO_CHAR(dias.dia, 'YYYY-MM-DD') as dia,
            COALESCE(SUM(v.total), 0) as total
        FROM generate_series(
            CURRENT_DATE - INTERVAL '6 days',
            CURRENT_DATE,
            INTERVAL '1 day'
        ) as dias(dia)
        LEFT JOIN ventas as v
            ON DATE(v.fecha_venta) = dias.dia
            AND v.sucursal_id = ?
            AND v.status = 'cobrada'
        GROUP BY dias.dia
        ORDER BY dias.dia ASC
        `,
            [sucursalId],
        );

        const resultados = rows.rows as VentaPorDiaRow[];

        return {
            labels: resultados.map((r) => r.dia),
            data: resultados.map((r) => Number(r.total ?? 0)),
        };
    }

    async contarProductosBajos(sucursalId: number) {
        const row = await this.knex('stock_almacen as sa')
            .join('productos as p', 'p.producto_id', 'sa.producto_id')
            .join('almacenes as a', 'a.almacen_id', 'sa.almacen_id')
            .count({ total: 'sa.stock_almacen_id' })
            .where('a.sucursal_id', sucursalId)
            .andWhereRaw('sa.stock_actual <= sa.stock_minimo')
            .first();

        return { total: Number(row?.total ?? 0), cambio: null };
    }

    async contarProximosCaducar(sucursalId: number, dias: number) {
        const row = await this.knex('lotes as l')
            .join('almacenes as a', 'a.almacen_id', 'l.almacen_id')
            .count({ total: 'l.lote_id' })
            .where('a.sucursal_id', sucursalId)
            .andWhere('l.status', 'activo')
            .andWhereRaw(`l.fecha_caducidad <= NOW() + INTERVAL '${dias} days'`)
            .andWhereRaw('l.cantidad_actual > 0')
            .first();

        return { total: Number(row?.total ?? 0), cambio: null };
    }

    async stockPorCategoria(sucursalId: number) {
        const rows = await this.knex('stock_almacen as sa')
            .join('productos as p', 'p.producto_id', 'sa.producto_id')
            .join('almacenes as a', 'a.almacen_id', 'sa.almacen_id')
            .join('cat_categorias_subcategorias as c', 'c.categoria_id', 'p.categoria_id')
            .select('c.nombre as categoria')
            .sum({ total_stock: 'sa.stock_actual' })
            .where('a.sucursal_id', sucursalId)
            .andWhere('p.sucursal_id', sucursalId)
            .groupBy('c.categoria_id', 'c.nombre')
            .orderBy('total_stock', 'desc') as StockCategoriaRow[];

        return {
            categorias: rows.map((r) => ({
                categoria: r.categoria,
                total_stock: Number(r.total_stock ?? 0),
            })),
        };
    }

    async lotesPorProximidadCaducidad(sucursalId: number, diasMax: number) {
        const buckets = [7, 15, 30, 60, 90].filter((d) => d <= diasMax);

        const resultados = await Promise.all(
            buckets.map(async (dias) => {
                const row = await this.knex('lotes as l')
                    .join('almacenes as a', 'a.almacen_id', 'l.almacen_id')
                    .count({ total: 'l.lote_id' })
                    .where('a.sucursal_id', sucursalId)
                    .andWhere('l.status', 'activo')
                    .andWhere('l.cantidad_actual', '>', 0)
                    .andWhereRaw(`l.fecha_caducidad <= NOW() + INTERVAL '${dias} days'`)
                    .first();

                return { rango: `${dias} días`, cantidad: Number(row?.total ?? 0) };
            }),
        );

        return { buckets: resultados };
    }
}