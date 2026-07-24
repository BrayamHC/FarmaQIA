export class VentasBo {
    static buildVentaInsert(data: any) {
        return {
            sucursal_id: data.sucursal_id,
            almacen_id: data.almacen_id,
            cliente_id: data.cliente_id,
            usuario_venta_id: data.usuario_venta_id,
            folio: data.folio,
            metodo_pago: data.metodo_pago,
            status: 'cobrada',
            subtotal: data.subtotal,
            descuento_total: data.descuento,
            impuesto_total: data.impuesto,
            total: data.total,
            monto_recibido: data.monto_recibido,
            cambio: data.cambio,
            fecha_venta: new Date(),
            usuario_creacion: data.usuario_id,
        };
    }

    static buildVentaDetalleInsert(ventaId: number, detalle: any, producto: any, loteId: number | null, usuarioId: number) {
        return {
            venta_id: ventaId,
            producto_id: producto.producto_id,
            lote_id: loteId,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            descuento: detalle.descuento ?? 0,
            impuesto: detalle.impuesto ?? 0,
            subtotal: detalle.subtotal,
            total: detalle.total,
            producto_nombre_snapshot: producto.nombre,
            sku_snapshot: producto.sku,
            usuario_creacion: usuarioId,
        };
    }
}