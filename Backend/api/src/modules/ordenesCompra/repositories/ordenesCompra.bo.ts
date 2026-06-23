import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdenesCompraBo {
    construirOrden(data: {
        sucursal_id: number;
        almacen_id: number;
        proveedor_id: number;
        serie_id: number | null;
        body: any;
        subtotal: number;
        iva: number;
        total: number;
    }, user: any) {
        return {
            sucursal_id: data.sucursal_id,
            almacen_id: data.almacen_id,
            proveedor_id: data.proveedor_id,
            serie_id: data.serie_id,
            fecha_orden: data.body.fecha_orden ?? new Date().toISOString().split('T')[0],
            fecha_entrega_estimada: data.body.fecha_entrega_estimada ?? null,
            condiciones_pago: data.body.condiciones_pago ?? null,
            moneda: data.body.moneda ?? 'MXN',
            tipo_cambio: data.body.tipo_cambio ?? 1,
            notas: data.body.notas ?? null,
            subtotal_estimado: data.subtotal,
            iva_estimado: data.iva,
            total_estimado: data.total,
            status: 'borrador',
            usuario_creacion: user?.usuario_id ?? null,
            usuario_actualizacion: null,
            fecha_creacion: new Date(),
            fecha_actualizacion: null,
        };
    }

    construirPartida(partida: any, user: any) {
        const subtotalBruto = Number(partida.cantidad_solicitada) * Number(partida.precio_unitario_est);
        const descuentoImporte = subtotalBruto * ((Number(partida.descuento_porcentaje ?? 0)) / 100);
        const subtotalEstimado = subtotalBruto - descuentoImporte;

        return {
            producto_id: partida.producto_id,
            cantidad_solicitada: partida.cantidad_solicitada,
            precio_unitario_est: partida.precio_unitario_est,
            descuento_porcentaje: partida.descuento_porcentaje ?? 0,
            descuento_importe: Number(descuentoImporte.toFixed(2)),
            subtotal_estimado: Number(subtotalEstimado.toFixed(2)),
            cantidad_recibida: 0,
            status: 'pendiente',
            comentarios: partida.comentarios ?? null,
            usuario_creacion: user?.usuario_id ?? null,
            usuario_actualizacion: null,
            fecha_creacion: new Date(),
            fecha_actualizacion: null,
        };
    }

    calcularTotales(partidas: any[]): { subtotal: number; iva: number; total: number } {
        const subtotal = partidas.reduce((acc, p) => {
            const bruto = Number(p.cantidad_solicitada) * Number(p.precio_unitario_est);
            const descuento = bruto * ((Number(p.descuento_porcentaje ?? 0)) / 100);
            return acc + (bruto - descuento);
        }, 0);

        const iva = Number((subtotal * 0.16).toFixed(2));
        const total = Number((subtotal + iva).toFixed(2));

        return {
            subtotal: Number(subtotal.toFixed(2)),
            iva,
            total,
        };
    }

    construirUpdateOrden(data: any, user: any) {
        const updateObj: Record<string, any> = {
            usuario_actualizacion: user?.usuario_id ?? null,
            fecha_actualizacion: new Date(),
        };

        if (data.fecha_entrega_estimada !== undefined) updateObj.fecha_entrega_estimada = data.fecha_entrega_estimada;
        if (data.condiciones_pago !== undefined) updateObj.condiciones_pago = data.condiciones_pago;
        if (data.moneda !== undefined) updateObj.moneda = data.moneda;
        if (data.tipo_cambio !== undefined) updateObj.tipo_cambio = data.tipo_cambio;
        if (data.notas !== undefined) updateObj.notas = data.notas;

        return updateObj;
    }

    construirAutorizacion(data: any, user: any) {
        return {
            status: data.accion === 'autorizar' ? 'autorizada' : 'rechazada',
            usuario_autoriza_id: user?.usuario_id ?? null,
            nombre_autoriza: user?.nombre ?? user?.nombre_completo ?? null,
            fecha_autorizacion: new Date(),
            motivo_rechazo: data.accion === 'rechazar' ? data.motivo_rechazo : null,
            usuario_actualizacion: user?.usuario_id ?? null,
            fecha_actualizacion: new Date(),
        };
    }

    construirCancelacion(data: any, user: any) {
        return {
            status: 'cancelada',
            notas: data.motivo_cancelacion,
            usuario_actualizacion: user?.usuario_id ?? null,
            fecha_actualizacion: new Date(),
        };
    }
}