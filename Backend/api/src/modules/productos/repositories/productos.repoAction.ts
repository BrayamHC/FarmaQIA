import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class ProductosRepoAction {
    private readonly logger = new Logger(ProductosRepoAction.name);

    constructor(@Inject('DATABASE_CONNECTION') private readonly knex: Knex) { }

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
}