import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { ProductosRepoHelper } from './productos.repoHelper';
import { FiltrosProductosDTO } from '../dto/productos.dto';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class ProductosRepoData {
    private readonly logger = new Logger(ProductosRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: ProductosRepoHelper,
    ) { }

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

    async obtenerProductos(filtros: FiltrosProductosDTO, sucursalId: number) {
        try {
            const filtrosEfectivos = {
                ...filtros,
                page: filtros?.page ?? 1,
                limit: filtros?.limit ?? 20,
            };

            const query = this.knex('productos as p')
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
                    this.knex.raw(`(
                    SELECT COALESCE(SUM(sa.stock_actual), 0)
                    FROM stock_almacen AS sa
                    WHERE sa.producto_id = p.producto_id
                ) AS stock_total`),
                )
                .leftJoin('rel_proveedores_productos as rpp', 'rpp.producto_id', 'p.producto_id')
                .leftJoin('proveedores as pr', 'pr.proveedor_id', 'rpp.proveedor_id')
                .leftJoin('cat_categorias_subcategorias as c', 'c.categoria_id', 'p.categoria_id')
                .leftJoin('cat_unidades_medida as um', 'um.unidad_medida_id', 'p.unidad_medida_id')
                .where('p.sucursal_id', sucursalId);

            this.helper.aplicarFiltros(query, filtrosEfectivos);
            this.helper.aplicarOrden(query, filtrosEfectivos);
            this.helper.aplicarPaginacion(
                query,
                filtrosEfectivos.page,
                filtrosEfectivos.limit,
            );

            const queryCount = this.knex('productos as p')
                .count({ total: 'p.producto_id' })
                .leftJoin('rel_proveedores_productos as rpp', 'rpp.producto_id', 'p.producto_id')
                .leftJoin('proveedores as pr', 'pr.proveedor_id', 'rpp.proveedor_id')
                .leftJoin('cat_categorias_subcategorias as c', 'c.categoria_id', 'p.categoria_id')
                .leftJoin('cat_unidades_medida as um', 'um.unidad_medida_id', 'p.unidad_medida_id')
                .where('p.sucursal_id', sucursalId);

            this.helper.aplicarFiltros(queryCount, filtrosEfectivos);

            const [productos, [conteo]] = await Promise.all([
                query,
                queryCount as Promise<Array<{ total: string | number }>>,
            ]);

            return {
                productos: (productos ?? []).map((producto) => ({
                    ...producto,
                    stock_total: Number(producto.stock_total ?? 0),
                })),
                total: Number(conteo?.total ?? 0),
                page: filtrosEfectivos.page,
                limit: filtrosEfectivos.limit,
            };
        } catch (error) {
            this.logger.error('obtenerProductos', error);
            throw new DatabaseQueryException('Error al listar productos');
        }
    }

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
                precios: producto.precios ?? [],
                lotes: producto.lotes ?? [],
                stock: producto.stock ?? [],
            };
        } catch (error) {
            this.logger.error('obtenerProductoPorUUID', error);
            throw new DatabaseQueryException('Error al obtener producto');
        }
    }

    async obtenerAlmacenPorUUID(almacenUuid: string, sucursalId: number) {
        return this.knex('almacenes')
            .select('almacen_id', 'almacen_uuid', 'nombre', 'sucursal_id')
            .where({
                almacen_uuid: almacenUuid,
                sucursal_id: sucursalId,
            })
            .first();
    }

    async obtenerLotesProducto(productoId: number) {
        return this.knex('lotes as l')
            .select(
                'l.lote_uuid',
                'l.codigo_lote',
                'l.cantidad_actual',
                'l.fecha_fabricacion',
                'l.fecha_caducidad',
                'l.costo_unitario_compra',
                'l.status',
                'a.almacen_uuid',
                'a.nombre as almacen',
                'l.fecha_creacion',
                'l.fecha_actualizacion',
            )
            .leftJoin('almacenes as a', 'a.almacen_id', 'l.almacen_id')
            .where('l.producto_id', productoId)
            .orderBy([
                {
                    column: 'l.fecha_caducidad',
                    order: 'asc',
                },
                {
                    column: 'l.fecha_creacion',
                    order: 'desc',
                },
            ]);
    }

    async obtenerProductoBasicoPorUUID(uuid: string, sucursalId: number) {
        return this.knex('productos')
            .select(
                'producto_id',
                'producto_uuid',
                'nombre',
            )
            .where({
                producto_uuid: uuid,
                sucursal_id: sucursalId,
            })
            .first();
    }
}