import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
@Injectable()
export class ProductosRepoAction {
    private readonly logger = new Logger(ProductosRepoAction.name);

    constructor(@Inject(DATABASE_CONNECTION) private readonly knex: Knex) { }

    async insertarProducto(nuevoProducto: any): Promise<any> {
        const trx = await this.knex.transaction();
        try {
            // 1. Insertar producto
            const [{ producto_id, producto_uuid }] = await trx('productos')
                .insert(nuevoProducto)
                .returning(['producto_id', 'producto_uuid']);

            // 2. Relación proveedor ↔ producto
            await trx('rel_proveedores_productos').insert({
                producto_id,
                proveedor_id: nuevoProducto.proveedor_id,
                usuario_creacion: nuevoProducto.usuario_creacion,
                usuario_actualizacion: null,
                fecha_creacion: new Date(),
                fecha_actualizacion: null,
            });

            // 3. Precio inicial (precio_publico se convierte en precio de lista base)
            await trx('precios').insert({
                producto_id,
                precio_venta: nuevoProducto.precio_publico,
                es_default: true,
                status: 'activo',
                con_impuestos: true,   // IVA 16% se calcula en ventas
                usuario_creacion: nuevoProducto.usuario_creacion,
                usuario_actualizacion: null,
                fecha_creacion: new Date(),
                fecha_actualizacion: null,
            });

            await trx.commit();

            // 4. Retornar producto recién creado
            return await this.knex('productos as p')
                .select('p.*', 'c.nombre as categoria', 'pr.nombre_comercial as proveedor')
                .leftJoin('rel_proveedores_productos as rpp', 'rpp.producto_id', 'p.producto_id')
                .leftJoin('proveedores as pr', 'pr.proveedor_id', 'rpp.proveedor_id')
                .leftJoin('cat_categorias_subcategorias as c', 'c.categoria_id', 'p.categoria_id')
                .where('p.producto_id', producto_id)
                .first();
        } catch (error) {
            await trx.rollback();
            this.logger.error('insertarProducto', error);
            throw new DatabaseQueryException('Error al crear producto');
        }
    }

    async actualizarProducto(uuid: string, datos: any): Promise<any> {
        try {
            await this.knex('productos').where('producto_uuid', uuid).update(datos);

            return await this.knex('productos as p')
                .select('p.*', 'c.nombre as categoria', 'pr.nombre_comercial as proveedor')
                .leftJoin('rel_proveedores_productos as rpp', 'rpp.producto_id', 'p.producto_id')
                .leftJoin('proveedores as pr', 'pr.proveedor_id', 'rpp.proveedor_id')
                .leftJoin('cat_categorias_subcategorias as c', 'c.categoria_id', 'p.categoria_id')
                .where('p.producto_uuid', uuid)
                .first();
        } catch (error) {
            this.logger.error('actualizarProducto', error);
            throw new DatabaseQueryException('Error al actualizar producto');
        }
    }

    async cambiarStatus(uuid: string, status: string): Promise<any> {
        try {
            await this.knex('productos')
                .where('producto_uuid', uuid)
                .update({ status, fecha_actualizacion: new Date() });

            return await this.knex('productos').where('producto_uuid', uuid).first();
        } catch (error) {
            this.logger.error('cambiarStatus', error);
            throw new DatabaseQueryException('Error al cambiar status del producto');
        }
    }

    async altaLoteStock(payload: { lote: any; stock: any }): Promise<any> {
        const trx = await this.knex.transaction();

        try {
            const { lote: lotePayload, stock: stockPayload } = payload;

            // 1. Crear siempre el lote
            const [lote] = await trx('lotes')
                .insert(lotePayload)
                .returning([
                    'lote_id',
                    'lote_uuid',
                    'codigo_lote',
                    'cantidad_actual',
                    'fecha_caducidad',
                    'status',
                ]);

            // 2. Buscar stock_almacen existente por producto_id + almacen_id
            const stockExistente = await trx('stock_almacen')
                .where({
                    producto_id: stockPayload.producto_id,
                    almacen_id: stockPayload.almacen_id,
                })
                .first();

            let stockActualizado;

            if (stockExistente) {
                // 3a. Ya existe → sumar cantidad
                [stockActualizado] = await trx('stock_almacen')
                    .where('stock_almacen_id', stockExistente.stock_almacen_id)
                    .update({
                        stock_actual: this.knex.raw('stock_actual + ?', [stockPayload.cantidad_ingresada]),
                        stock_minimo: stockPayload.stock_minimo ?? stockExistente.stock_minimo,
                        stock_maximo: stockPayload.stock_maximo ?? stockExistente.stock_maximo,
                        usuario_actualizacion: stockPayload.usuario_id,
                        fecha_actualizacion: new Date(),
                    })
                    .returning([
                        'stock_almacen_id',
                        'stock_almacen_uuid',
                        'stock_actual',
                        'stock_minimo',
                        'stock_maximo',
                    ]);
            } else {
                // 3b. No existe → crear registro nuevo
                [stockActualizado] = await trx('stock_almacen')
                    .insert({
                        producto_id: stockPayload.producto_id,
                        almacen_id: stockPayload.almacen_id,
                        stock_actual: stockPayload.cantidad_ingresada,
                        stock_minimo: stockPayload.stock_minimo ?? 0,
                        stock_maximo: stockPayload.stock_maximo ?? null,
                        usuario_creacion: stockPayload.usuario_id,
                        usuario_actualizacion: null,
                        fecha_creacion: new Date(),
                        fecha_actualizacion: null,
                    })
                    .returning([
                        'stock_almacen_id',
                        'stock_almacen_uuid',
                        'stock_actual',
                        'stock_minimo',
                        'stock_maximo',
                    ]);
            }

            await trx.commit();

            return { lote, stock_almacen: stockActualizado };
        } catch (error) {
            await trx.rollback();
            this.logger.error('altaLoteStock', error);
            throw new DatabaseQueryException('Error al registrar lote y actualizar stock');
        }
    }
}