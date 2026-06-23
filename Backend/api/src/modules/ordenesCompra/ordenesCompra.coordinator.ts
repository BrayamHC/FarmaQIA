import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { OrdenesCompraService } from './ordenesCompra.service';
import { ProductosService } from '../productos/productos.service';
import { ProveedoresService } from '../proveedores/proveedores.service';
import { AlmacenesService } from '../almacenes/almacenes.service';
import {
    ActualizarOrdenCompraDTO,
    AutorizarOrdenCompraDTO,
    CancelarOrdenCompraDTO,
    CrearOrdenCompraDTO,
} from './dto/ordenesCompra.dto';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';
import { CatalogosService } from '../catalogos/catalogos.service';

@Injectable()
export class OrdenesCompraCoordinator {
    constructor(
        private readonly ordenesCompraService: OrdenesCompraService,
        private readonly productosService: ProductosService,
        private readonly proveedoresService: ProveedoresService,
        private readonly almacenesService: AlmacenesService,
        private readonly catalogosService: CatalogosService,
    ) { }

    async crearOrdenCompra(body: CrearOrdenCompraDTO, user: any, sucursalId: number) {
        const proveedor = await this.proveedoresService.obtenerProveedorPorUUID(body.proveedor_uuid);
        if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

        const almacen = await this.almacenesService.obtenerAlmacen(body.almacen_uuid, sucursalId);
        if (!almacen?.almacen) {
            throw new NotFoundException('Almacén no encontrado o no pertenece a la sucursal');
        }

        let serieId: number | null = null;
        if (body.serie_uuid) {
            const serie = await this.catalogosService.obtenerSeriePorUUID(body.serie_uuid, sucursalId);
            if (!serie) throw new NotFoundException('Serie no encontrada');
            if (!serie.es_activa) {
                throw new UnprocessableEntityException('La serie seleccionada está inactiva');
            }
            serieId = serie.serie_id;
        }

        const partidasProcesadas = await Promise.all(
            body.partidas.map(async (partida) => {
                const producto = await this.productosService.obtenerProductoPorUUID(
                    partida.producto_uuid,
                    sucursalId,
                );

                if (!producto?.producto_uuid) {
                    throw new NotFoundException(`Producto ${partida.producto_uuid} no encontrado`);
                }

                return {
                    ...partida,
                    producto_id: producto.id ?? producto.producto_id,
                };
            }),
        );

        const resultado = await this.ordenesCompraService.crearOrden(
            {
                sucursal_id: sucursalId,
                almacen_id: almacen.almacen.almacen_id,
                proveedor_id: proveedor.proveedor_id,
                serie_id: serieId,
                body,
                partidas: partidasProcesadas,
            },
            user,
        );

        return {
            meta: { message: 'Orden de compra creada correctamente' },
            orden: resultado,
        };
    }

    async actualizarOrdenCompra(
        uuid: string,
        body: ActualizarOrdenCompraDTO,
        user: any,
        sucursalId: number,
    ) {
        const orden = await this.ordenesCompraService.obtenerOrdenCompraRaw(uuid, sucursalId);

        if (!orden) throw new NotFoundException('Orden de compra no encontrada');

        if (!['borrador', 'enviada'].includes(orden.status)) {
            throw new UnprocessableEntityException(
                'Solo se pueden editar órdenes en status borrador o enviada',
            );
        }

        const ordenActualizada = await this.ordenesCompraService.actualizarOrdenCompra(
            uuid,
            body,
            user,
        );

        return {
            meta: { message: 'Orden de compra actualizada correctamente' },
            orden: ordenActualizada,
        };
    }

    async autorizarOrdenCompra(
        uuid: string,
        body: AutorizarOrdenCompraDTO,
        user: any,
        sucursalId: number,
    ) {
        const orden = await this.ordenesCompraService.obtenerOrdenCompraRaw(uuid, sucursalId);

        if (!orden) throw new NotFoundException('Orden de compra no encontrada');

        if (!['enviada', 'borrador'].includes(orden.status)) {
            throw new ConflictException(
                `La orden no puede autorizarse/rechazarse desde status '${orden.status}'`,
            );
        }

        const ordenActualizada = await this.ordenesCompraService.autorizarOrdenCompra(
            uuid,
            body,
            user,
        );

        return {
            meta: { message: 'Status de autorización actualizado correctamente' },
            orden: ordenActualizada,
        };
    }

    async cancelarOrdenCompra(
        uuid: string,
        body: CancelarOrdenCompraDTO,
        user: any,
        sucursalId: number,
    ) {
        const orden = await this.ordenesCompraService.obtenerOrdenCompraRaw(uuid, sucursalId);

        if (!orden) throw new NotFoundException('Orden de compra no encontrada');

        if (['recibida', 'cancelada'].includes(orden.status)) {
            throw new UnprocessableEntityException(
                `No se puede cancelar una orden en status '${orden.status}'`,
            );
        }

        const ordenActualizada = await this.ordenesCompraService.cancelarOrdenCompra(
            uuid,
            body,
            user,
        );

        return {
            meta: { message: 'Orden de compra cancelada correctamente' },
            orden: ordenActualizada,
        };
    }
}