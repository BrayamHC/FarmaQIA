import { Injectable, Logger } from '@nestjs/common';
import { ProductosRepoData } from './repositories/productos.repoData';
import { ProductosRepoAction } from './repositories/productos.repoAction';
import { ProductosBO } from './repositories/productos.bo';
import { FiltrosProductosDTO } from './dto/productos.dto';
import { ResourceNotFoundException } from 'src/common/exceptions/business.exception';
import { logSqlError } from 'src/utils/log-sql-error';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class ProductosService {
    private readonly logger = new Logger(ProductosService.name);

    constructor(
        private readonly repoData: ProductosRepoData,
        private readonly repoAction: ProductosRepoAction,
        private readonly bo: ProductosBO,
    ) { }

    // ── Lecturas ─────────────────────────────────────────────────────────────
    async obtenerProductos(filtros: FiltrosProductosDTO, sucursalId: number) {
        try {
            return await this.repoData.obtenerProductos(filtros, sucursalId);
        } catch (error) {
            this.logger.error('obtenerProductos', error);
            throw new DatabaseQueryException('Error al obtener productos');
        }
    }

    async obtenerProductoPorUUID(uuid: string, sucursalId: number) {
        const producto = await this.repoData.obtenerProductoPorUUID(uuid, sucursalId);
        if (!producto) throw new ResourceNotFoundException('Producto', uuid);

        const stockTotal = (producto.stock ?? []).reduce(
            (acc: number, s: { stock: number }) => acc + s.stock,
            0,
        );

        return {
            ...producto,
            stock: {
                total: stockTotal,
                almacenes: producto.stock ?? [],
            },
        };
    }

    async obtenerPorSKU(sku: string, sucursalId: number) {
        return this.repoData.obtenerPorSKU(sku, sucursalId);
    }

    async obtenerPorUPC(upc: string, sucursalId: number) {
        return this.repoData.obtenerPorUPC(upc, sucursalId);
    }

    async resolverCategoria(uuid: string) {
        return this.repoData.obtenerCategoriaPorUUID(uuid);
    }

    async resolverProveedor(uuid: string) {
        return this.repoData.obtenerProveedorPorUUID(uuid);
    }

    // ── Escrituras ────────────────────────────────────────────────────────────
    async crearProducto(nuevoProducto: any) {
        return this.repoAction.insertarProducto(nuevoProducto);
    }

    async actualizarProducto(uuid: string, datos: any) {
        return this.repoAction.actualizarProducto(uuid, datos);
    }

    async cambiarStatus(uuid: string, status: string) {
        return this.repoAction.cambiarStatus(uuid, status);
    }
}