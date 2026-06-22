import {
    ConflictException,
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';

import { ProductosService } from './productos.service';
import { ProductosBO } from './repositories/productos.bo';
import { CrearProductoDTO, ActualizarProductoDTO } from './dto/productos.dto';
import { ResourceNotFoundException, DuplicateResourceException } from 'src/common/exceptions/business.exception';

@Injectable()
export class ProductosCoordinator {
    private readonly logger = new Logger(ProductosCoordinator.name);

    constructor(
        private readonly service: ProductosService,
        private readonly bo: ProductosBO,
    ) { }

    // ── Crear ────────────────────────────────────────────────────────────────
    async crearProducto(dto: CrearProductoDTO, usuario: any, sucursalId: number) {
        const { sku, categoria_uuid, proveedor_uuid } = dto;

        // 1. Unicidad SKU
        const existeSKU = await this.service.obtenerPorSKU(sku, sucursalId);
        if (existeSKU) throw new DuplicateResourceException('producto', 'sku', sku);

        // 2. Unicidad UPC (si viene)
        if (dto.upc) {
            const existeUPC = await this.service.obtenerPorUPC(dto.upc, sucursalId);
            if (existeUPC) throw new DuplicateResourceException('producto', 'upc', dto.upc);
        }

        // 3. Resolver categoria_id
        const categoria = await this.service.resolverCategoria(categoria_uuid);
        if (!categoria) throw new ResourceNotFoundException('Categoría', categoria_uuid);

        // 4. Resolver proveedor_id
        const proveedor = await this.service.resolverProveedor(proveedor_uuid);
        if (!proveedor) throw new ResourceNotFoundException('Proveedor', proveedor_uuid);

        // 5. Preparar objeto con el BO
        const nuevoProducto = this.bo.prepararNuevoProducto(
            { ...dto, categoria_id: categoria.categoria_id, proveedor_id: proveedor.proveedor_id, sucursal_id: sucursalId },
            usuario,
        );

        // 6. Persistir
        const producto = await this.service.crearProducto(nuevoProducto);

        return {
            meta: { message: 'Producto registrado exitosamente' },
            producto,
        };
    }

    // ── Actualizar ───────────────────────────────────────────────────────────
    async actualizarProducto(
        uuid: string,
        dto: ActualizarProductoDTO,
        usuario: any,
        sucursalId: number,
    ) {
        const existe = await this.service.obtenerProductoPorUUID(uuid, sucursalId);
        if (!existe) throw new ResourceNotFoundException('Producto', uuid);

        let categoria_id: number | null = null;
        if (dto.categoria_uuid) {
            const cat = await this.service.resolverCategoria(dto.categoria_uuid);
            if (!cat) throw new ResourceNotFoundException('Categoría', dto.categoria_uuid);
            categoria_id = cat.categoria_id;
        }

        let proveedor_id: number | null = null;
        if (dto.proveedor_uuid) {
            const prov = await this.service.resolverProveedor(dto.proveedor_uuid);
            if (!prov) throw new ResourceNotFoundException('Proveedor', dto.proveedor_uuid);
            proveedor_id = prov.proveedor_id;
        }

        const datosActualizados = this.bo.prepararActualizarProducto(
            { ...dto, categoria_id, proveedor_id },
            usuario,
        );

        const producto = await this.service.actualizarProducto(uuid, datosActualizados);

        return {
            meta: { message: 'Producto actualizado exitosamente' },
            producto,
        };
    }

    // ── Cambiar Status ───────────────────────────────────────────────────────
    async cambiarStatus(uuid: string, nuevoStatus: string, sucursalId: number) {
        const producto = await this.service.obtenerProductoPorUUID(uuid, sucursalId);
        if (!producto) throw new ResourceNotFoundException('Producto', uuid);

        if (producto.status === 'eliminado') {
            throw new UnprocessableEntityException(
                `El producto '${producto.sku}' está eliminado y no puede modificarse.`,
            );
        }
        if (producto.status === nuevoStatus) {
            throw new ConflictException(`El producto ya se encuentra en status '${nuevoStatus}'.`);
        }

        const actualizado = await this.service.cambiarStatus(uuid, nuevoStatus);

        return {
            meta: { message: `Status actualizado a '${nuevoStatus}' correctamente` },
            producto: actualizado,
        };
    }
}