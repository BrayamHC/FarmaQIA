import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { FiltrosAlmacenesDTO } from '../dto/almacenes.dto';
import { AlmacenesRepoHelper } from './almacenes.repoHelper';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class AlmacenesRepoData {
    private readonly logger = new Logger(AlmacenesRepoData.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
        private readonly helper: AlmacenesRepoHelper,
    ) { }

    async obtenerPorUUID(uuid: string, sucursalId: number): Promise<any | null> {
        try {
            const almacen = await this.knex('almacenes as a')
                .select(
                    'a.almacen_id',
                    'a.almacen_uuid',
                    'a.nombre',
                    'a.descripcion',
                    'a.encargado',
                    'a.direccion',
                    'a.telefono',
                    'a.status',
                    'a.sucursal_id',
                    'a.fecha_creacion',
                    'a.fecha_actualizacion',
                    's.sucursal_uuid',
                    's.nombre as sucursal_nombre',
                )
                .join('sucursales as s', 's.sucursal_id', 'a.sucursal_id')
                .where('a.almacen_uuid', uuid)
                .andWhere('a.sucursal_id', sucursalId)
                .first();

            if (!almacen) return null;

            const productosRaw = await this.knex('stock_almacen as sa')
                .leftJoin('productos as p', 'p.producto_id', 'sa.producto_id')
                .select(
                    'sa.stock_almacen_id',
                    'sa.stock_almacen_uuid',
                    'sa.stock_actual',
                    'sa.stock_maximo',
                    'sa.stock_minimo',
                    'sa.fecha_creacion',
                    'sa.fecha_actualizacion',
                    'p.producto_id',
                    'p.producto_uuid',
                    'p.nombre as producto_nombre',
                    'p.sku',
                    'p.upc',
                    'p.status as producto_status',
                )
                .where('sa.almacen_id', almacen.almacen_id)
                .orderBy('p.nombre', 'asc');

            const productos = productosRaw.map((item) => {
                const stockActual = Number(item.stock_actual ?? 0);
                const stockMinimo = Number(item.stock_minimo ?? 0);
                const stockMaximo = Number(item.stock_maximo ?? 0);

                let stock_estado = 'normal';

                if (stockActual <= 0) {
                    stock_estado = 'sin_stock';
                } else if (stockActual <= stockMinimo) {
                    stock_estado = 'bajo';
                } else if (stockMaximo > 0 && stockActual >= stockMaximo) {
                    stock_estado = 'sobrestock';
                }

                return {
                    ...item,
                    stock_actual: stockActual,
                    stock_minimo: stockMinimo,
                    stock_maximo: stockMaximo,
                    stock_estado,
                };
            });

            const resumen = productos.reduce(
                (acc, item) => {
                    acc.total_productos += 1;
                    acc.stock_total_actual += item.stock_actual;
                    acc.stock_total_minimo += item.stock_minimo;
                    acc.stock_total_maximo += item.stock_maximo;

                    if (item.stock_estado === 'sin_stock') acc.productos_sin_stock += 1;
                    if (item.stock_estado === 'bajo') acc.productos_stock_bajo += 1;
                    if (item.stock_estado === 'sobrestock') acc.productos_sobrestock += 1;

                    return acc;
                },
                {
                    total_productos: 0,
                    productos_sin_stock: 0,
                    productos_stock_bajo: 0,
                    productos_sobrestock: 0,
                    stock_total_actual: 0,
                    stock_total_minimo: 0,
                    stock_total_maximo: 0,
                },
            );

            return {
                ...almacen,
                resumen,
                productos,
            };
        } catch (error) {
            this.logger.error('obtenerPorUUID', error);
            throw new DatabaseQueryException('Error al obtener almacén');
        }
    }

    async obtenerPorNombre(nombre: string, sucursalId: number): Promise<any | null> {
        return this.knex('almacenes')
            .whereILike('nombre', nombre.trim())
            .andWhere('sucursal_id', sucursalId)
            .whereNot('status', 'eliminado')
            .first();
    }

    async obtenerAlmacenes(filtros: FiltrosAlmacenesDTO, sucursalId: number) {
        try {
            const { page = 1, limit = 20 } = filtros;
            const offset = (page - 1) * limit;

            const almacenes = await this.knex('almacenes as a')
                .select(
                    'a.almacen_uuid',
                    'a.nombre',
                    'a.descripcion',
                    'a.encargado',
                    'a.direccion',
                    'a.telefono',
                    'a.status',
                    'a.fecha_creacion',
                    'a.fecha_actualizacion',
                    's.sucursal_uuid',
                    's.nombre as sucursal_nombre',
                )
                .join('sucursales as s', 's.sucursal_id', 'a.sucursal_id')
                .where('a.sucursal_id', sucursalId)
                .modify((q) => this.helper.aplicarFiltros(q, filtros))
                .orderBy('a.nombre', 'asc')
                .limit(limit)
                .offset(offset);

            return almacenes;
        } catch (error) {
            this.logger.error('obtenerAlmacenes', error);
            throw new DatabaseQueryException('Error al obtener almacenes');
        }
    }
}