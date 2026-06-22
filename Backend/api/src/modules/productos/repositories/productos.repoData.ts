import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { ProductosRepoHelper } from './productos.repoHelper';
import { FiltrosProductosDTO } from '../dto/productos.dto';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class ProductosRepoData {
    private readonly logger = new Logger(ProductosRepoData.name);

    constructor(
        @Inject('DATABASE_CONNECTION') private readonly knex: Knex,
        private readonly helper: ProductosRepoHelper,
    ) { }

    // ── Lookups ──────────────────────────────────────────────────────────────
    async obtenerPorSKU(sku: string, sucursalId: number) {
        return this.knex('productos as p')
            .select('p.sku')
            .where('p.sku', sku)
            .andWhere('p.sucursal_id', sucursalId)
            .whereNot('p.status', 'eliminado')
            .first();
    }

    async obtenerPorUPC(upc: string, sucursalId: number) {
        return this.knex('productos as p')
            .select('p.upc')
            .where('p.upc', upc)
            .andWhere('p.sucursal_id', sucursalId)
            .whereNot('p.status', 'eliminado')
            .first();
    }

    async obtenerCategoriaPorUUID(uuid: string) {
        return this.knex('cat_categorias_subcategorias')
            .where('categoria_uuid', uuid)
            .first();
    }

    async obtenerProveedorPorUUID(uuid: string) {
        return this.knex('proveedores')
            .where('proveedor_uuid', uuid)
            .first();
    }

    // ── Lista ────────────────────────────────────────────────────────────────
    async obtenerProductos(filtros: FiltrosProductosDTO, sucursalId: number) {
        try {
            const { page = 1, limit = 20 } = filtros;
            const offset = (page - 1) * limit;

            const baseQuery = () =>
                this.knex('productos as p')
                    .leftJoin('rel_proveedores_productos as rpp', 'rpp.producto_id', 'p.producto_id')
                    .leftJoin('proveedores as pr', 'pr.proveedor_id', 'rpp.proveedor_id')
                    .leftJoin('cat_categorias_subcategorias as c', 'c.categoria_id', 'p.categoria_id')
                    .leftJoin('cat_unidades_medida as um', 'um.unidad_medida_id', 'p.unidad_medida_id')
                    .where('p.sucursal_id', sucursalId);

            const countQuery = baseQuery()
                .clone()
                .count('p.producto_id as total')
                .first();

            this.helper.aplicarFiltros(countQuery as any, filtros);

            const dataQuery = baseQuery()
                .clone()
                .select(
                    'p.producto_uuid',
                    'p.sku',
                    'p.upc',
                    'p.nombre',
                    'p.descripcion',
                    'p.status',
                    'p.precio_publico',
                    'p.costo_compra',
                    'p.presentacion',
                    'p.con_lote',
                    'p.tags',
                    'p.url_imagen',
                    'p.fecha_entrada',
                    'p.fecha_creacion',
                    'p.fecha_actualizacion',
                    'um.nombre as unidad_medida',
                    'um.clave as clave_unidad_medida',
                    'c.nombre as categoria',
                    'pr.nombre_comercial as proveedor',
                )
                .limit(limit)
                .offset(offset);

            this.helper.aplicarFiltros(dataQuery, filtros);

            const [countResult, productos] = await Promise.all([
                countQuery,
                dataQuery,
            ]);

            const total = Number((countResult as any)?.total ?? 0);

            return {
                productos: productos.map((p: any) => ({
                    ...p,
                    tags: this.parsearJSON(p.tags, []),
                })),
                total,
                page,
                limit,
            };
        } catch (error) {
            this.logger.error('obtenerProductos', error);
            throw new DatabaseQueryException('Error al listar productos');
        }
    }

    // ── Detalle ──────────────────────────────────────────────────────────────
    async obtenerProductoPorUUID(uuid: string, sucursalId: number) {
        try {
            const producto = await this.knex('productos as p')
                .select(
                    'p.*',
                    'um.nombre as unidad_medida',
                    'um.clave as clave_unidad_medida',
                    'c.nombre as categoria',
                    'pr.nombre_comercial as proveedor',
                    this.knex.raw(`(
                        SELECT COALESCE(json_agg(json_build_object(
                            'precio_uuid',  pre.precio_uuid,
                            'precio_venta', pre.precio_venta,
                            'es_default',   pre.es_default,
                            'status',       pre.status
                        )), '[]'::json)
                        FROM precios AS pre
                        WHERE pre.producto_id = p.producto_id
                    ) AS precios`),
                    this.knex.raw(`(
                        SELECT COALESCE(json_agg(json_build_object(
                            'lote_uuid',       lot.lote_uuid,
                            'clave',           lot.codigo_lote,
                            'fecha_caducidad', lot.fecha_caducidad,
                            'cantidad',        lot.cantidad_actual,
                            'almacen',         al.nombre
                        ) ORDER BY lot.fecha_caducidad ASC), '[]'::json)
                        FROM lotes AS lot
                        LEFT JOIN almacenes AS al ON al.almacen_id = lot.almacen_id
                        WHERE lot.producto_id = p.producto_id
                    ) AS lotes`),
                    this.knex.raw(`(
                        SELECT COALESCE(json_agg(json_build_object(
                            'nombre', al.nombre,
                            'stock',  sa.stock_actual
                        )), '[]'::json)
                        FROM stock_almacen AS sa
                        INNER JOIN almacenes AS al ON al.almacen_id = sa.almacen_id
                        WHERE sa.producto_id = p.producto_id
                    ) AS stock`),
                )
                .leftJoin('rel_proveedores_productos as rpp', 'rpp.producto_id', 'p.producto_id')
                .leftJoin('proveedores as pr', 'pr.proveedor_id', 'rpp.proveedor_id')
                .leftJoin('cat_categorias_subcategorias as c', 'c.categoria_id', 'p.categoria_id')
                .leftJoin('cat_unidades_medida as um', 'um.unidad_medida_id', 'p.unidad_medida_id')
                .where('p.producto_uuid', uuid)
                .andWhere('p.sucursal_id', sucursalId)
                .first();

            if (!producto) return null;

            return {
                ...producto,
                tags: this.parsearJSON(producto.tags, []),
                temperatura: this.parsearJSON(producto.temperatura, null),
                precios: producto.precios ?? [],
                lotes: producto.lotes ?? [],
                stock: producto.stock ?? [],
            };
        } catch (error) {
            this.logger.error('obtenerProductoPorUUID', error);
            throw new DatabaseQueryException('Error al obtener producto');
        }
    }

    // ── Utils privados ───────────────────────────────────────────────────────
    private parsearJSON<T>(valor: any, fallback: T): T {
        if (valor === null || valor === undefined) return fallback;
        if (typeof valor === 'object') return valor as T;
        try { return JSON.parse(valor); } catch { return fallback; }
    }
}