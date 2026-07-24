// src/modules/ventas/ventas.service.ts
import { Injectable } from '@nestjs/common';
import { VentasBo } from './repositories/ventas.bo';
import { VentasRepoAction } from './repositories/ventas.repoAction';
import { VentasRepoData } from './repositories/ventas.repoData';

@Injectable()
export class VentasService {
    constructor(
        private readonly repoAction: VentasRepoAction,
        private readonly repoData: VentasRepoData,
    ) { }

    async obtenerClienteParaVenta(input: {
        cliente_id: number;
        sucursal_id: number;
    }) {
        return this.repoData.obtenerClientePorId(input.cliente_id, input.sucursal_id);
    }

    async obtenerAlmacenParaVenta(input: {
        almacen_id: number;
        sucursal_id: number;
    }) {
        return this.repoData.obtenerAlmacenPorId(input.almacen_id, input.sucursal_id);
    }

    async obtenerProductoParaVenta(input: {
        producto_uuid: string | null;
        sucursal_id: number;
    }) {
        if (!input.producto_uuid) return null;
        return this.repoData.obtenerProductoPorUuid(input.producto_uuid, input.sucursal_id);
    }

    async obtenerLoteParaVenta(input: {
        lote_uuid: string | null;
        sucursal_id: number;
    }) {
        if (!input.lote_uuid) return null;
        return this.repoData.obtenerLotePorUuid(input.lote_uuid);
    }

    async obtenerStockProductoParaVenta(input: {
        producto_id: number;
        almacen_id: number;
    }) {
        return this.repoData.obtenerStockAlmacen(input.producto_id, input.almacen_id);
    }

    async crearVenta(input: {
        body: any;
        sucursal_id: number;
        almacen_id: number;
        usuario_id: number;
        cliente_id: number | null;
        detallesResueltos: Array<{
            detalle: any;
            producto: any;
            lote_id: number | null;
        }>;
    }) {
        return this.crearVentaProcesada(input);
    }

    async crearVentaProcesada(input: {
        body: any;
        sucursal_id: number;
        almacen_id: number;
        usuario_id: number;
        cliente_id: number | null;
        detallesResueltos: Array<{
            detalle: any;
            producto: any;
            lote_id: number | null;
        }>;
    }) {
        const folio = await this.repoData.obtenerSiguienteFolio();

        const venta = VentasBo.buildVentaInsert({
            ...input.body,
            sucursal_id: input.sucursal_id,
            almacen_id: input.almacen_id,
            cliente_id: input.cliente_id,
            usuario_venta_id: input.usuario_id,
            usuario_id: input.usuario_id,
            folio,
        });

        const detalles = input.detallesResueltos.map(({ detalle, producto, lote_id }) =>
            VentasBo.buildVentaDetalleInsert(
                0,
                detalle,
                producto,
                lote_id,
                input.usuario_id,
            ),
        );

        const stockAfectar = input.detallesResueltos.map(({ detalle, producto }) => ({
            producto_id: producto.producto_id,
            almacen_id: input.almacen_id,
            cantidad: Number(detalle.cantidad),
        }));

        const lotesAfectar = input.detallesResueltos
            .filter(({ lote_id }) => !!lote_id)
            .map(({ detalle, lote_id }) => ({
                lote_id: Number(lote_id),
                cantidad: Number(detalle.cantidad),
            }));

        return this.repoAction.crearVentaTransaccional({
            venta,
            detalles,
            stockAfectar,
            lotesAfectar,
        });
    }
}