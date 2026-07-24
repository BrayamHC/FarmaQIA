// src/modules/ventas/ventas.coordinator.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { VentasService } from './ventas.service';

type LoteRelacionado = {
    lote_id: number;
    lote_uuid?: string | null;
    producto_id: number;
    almacen_id: number;
    cantidad_actual?: number;
    status?: string | null;
};

type ProductoRelacionado = {
    producto_id: number;
    producto_uuid?: string | null;
    nombre?: string;
    con_lote?: boolean;
    status?: string | null;
};

type DetalleVentaInput = {
    producto_uuid?: string | null;
    lote_uuid?: string | null;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
    impuesto?: number;
    subtotal?: number;
    total?: number;
};

type DetalleResuelto = {
    detalle: DetalleVentaInput;
    producto: ProductoRelacionado;
    lote_id: number | null;
    lote: LoteRelacionado | null;
};

@Injectable()
export class VentasCoordinator {
    constructor(private readonly ventasService: VentasService) { }

    async crearVenta(body: any, sucursalId: number, usuario: any) {
        const sucursal_id = Number(sucursalId);
        const usuario_id = Number(usuario?.usuario_id ?? usuario?.id);

        if (!sucursal_id) {
            throw new BadRequestException('No se encontró la sucursal en la sesión.');
        }

        if (!usuario_id) {
            throw new BadRequestException('No se encontró el usuario en la sesión.');
        }

        const almacen_id = Number(body?.almacen_id);

        if (!almacen_id) {
            throw new BadRequestException('El almacén es obligatorio para registrar la venta.');
        }

        const cliente_id = body?.cliente_id ? Number(body.cliente_id) : null;
        const detalles = Array.isArray(body?.partidas) ? body.partidas : [];

        if (!detalles.length) {
            throw new BadRequestException('La venta debe contener al menos una partida.');
        }

        const almacen = await this.ventasService.obtenerAlmacenParaVenta({
            almacen_id,
            sucursal_id,
        });

        if (!almacen) {
            throw new NotFoundException('No se encontró el almacén seleccionado.');
        }

        let cliente = null;

        if (cliente_id) {
            cliente = await this.ventasService.obtenerClienteParaVenta({
                cliente_id,
                sucursal_id,
            });

            if (!cliente) {
                throw new NotFoundException('No se encontró el cliente seleccionado.');
            }
        }

        const detallesResueltos: DetalleResuelto[] = [];

        for (const detalle of detalles as DetalleVentaInput[]) {
            if (!detalle?.producto_uuid) {
                throw new BadRequestException('Cada partida debe incluir producto_uuid.');
            }

            if (!Number(detalle?.cantidad) || Number(detalle.cantidad) <= 0) {
                throw new BadRequestException('Cada partida debe incluir una cantidad válida.');
            }

            const producto = await this.ventasService.obtenerProductoParaVenta({
                producto_uuid: detalle.producto_uuid,
                sucursal_id,
            });

            if (!producto) {
                throw new NotFoundException('No se encontró uno de los productos enviados.');
            }

            let loteResuelto: LoteRelacionado | null = null;
            let lote_id: number | null = null;

            if (detalle.lote_uuid) {
                const lote = await this.ventasService.obtenerLoteParaVenta({
                    lote_uuid: detalle.lote_uuid,
                    sucursal_id,
                }) as LoteRelacionado | null;

                if (!lote) {
                    throw new NotFoundException('No se encontró uno de los lotes enviados.');
                }

                if (Number(lote.almacen_id) !== almacen_id) {
                    throw new BadRequestException('El lote seleccionado no pertenece al almacén de la venta.');
                }

                if (Number(lote.producto_id) !== Number(producto.producto_id)) {
                    throw new BadRequestException('El lote seleccionado no corresponde al producto enviado.');
                }

                if (Number(lote.cantidad_actual ?? 0) < Number(detalle.cantidad)) {
                    throw new BadRequestException(`Stock insuficiente en el lote del producto ${producto.nombre ?? ''}.`);
                }

                loteResuelto = lote;
                lote_id = Number(lote.lote_id);
            } else if (producto.con_lote) {
                throw new BadRequestException(`El producto ${producto.nombre ?? ''} requiere lote.`);
            } else {
                const stock = await this.ventasService.obtenerStockProductoParaVenta({
                    producto_id: Number(producto.producto_id),
                    almacen_id,
                });

                if (!stock || Number(stock.stock_actual ?? 0) < Number(detalle.cantidad)) {
                    throw new BadRequestException(`Stock insuficiente para el producto ${producto.nombre ?? ''}.`);
                }
            }

            detallesResueltos.push({
                detalle,
                producto,
                lote_id,
                lote: loteResuelto,
            });
        }

        return this.ventasService.crearVenta({
            body,
            sucursal_id,
            almacen_id,
            usuario_id,
            cliente_id,
            detallesResueltos,
        });
    }
}