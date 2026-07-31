import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportesBO {
    construirReporteInventario(data: any, sucursalId: number, filtros: any) {
        const {
            sucursal,
            almacen,
            productos,
            stocks,
            lotes,
        } = data;
        const hoy = new Date();

        const stocksPorProducto = this.agrupar(stocks, 'producto_id');
        const lotesPorProducto = this.agrupar(lotes, 'producto_id');

        let valorCosto = 0;
        let valorVenta = 0;
        let bajoStock = 0;
        let lotesPorCaducar = 0;

        const items = productos.map((p: any) => {
            const almacenes = (stocksPorProducto[p.producto_id] ?? []).map((s: any) => ({
                almacen_id: s.almacen_id,
                almacen_nombre: s.almacen_nombre,
                stock_actual: Number(s.stock_actual ?? 0),
                stock_minimo: Number(s.stock_minimo ?? 0),
                stock_maximo: Number(s.stock_maximo ?? 0),
            }));

            const stockTotal = almacenes.reduce((acc: number, a: any) => acc + a.stock_actual, 0);

            if (almacenes.some((a: any) => a.stock_actual <= a.stock_minimo)) {
                bajoStock++;
            }

            const lotesProducto = (lotesPorProducto[p.producto_id] ?? []).map((l: any) => {
                const fechaCad = l.fecha_caducidad ? new Date(l.fecha_caducidad) : null;
                const dias = fechaCad
                    ? Math.ceil((fechaCad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                if (dias !== null && dias >= 0 && dias <= 30) {
                    lotesPorCaducar++;
                }

                return {
                    codigo_lote: l.codigo_lote,
                    cantidad_actual: Number(l.cantidad_actual ?? 0),
                    fecha_caducidad: l.fecha_caducidad,
                    almacen_nombre: l.almacen_nombre,
                    dias_para_caducar: dias,
                };
            });

            valorCosto += stockTotal * Number(p.costo_compra ?? 0);
            valorVenta += stockTotal * Number(p.precio_publico ?? 0);

            return {
                producto_id: p.producto_id,
                producto_uuid: p.producto_uuid,
                sku: p.sku,
                nombre: p.nombre,
                presentacion: p.presentacion,
                categoria: p.categoria,
                con_lote: p.con_lote,
                costo_compra: Number(p.costo_compra ?? 0),
                precio_publico: Number(p.precio_publico ?? 0),
                stock_total: stockTotal,
                almacenes,
                lotes: lotesProducto,
            };
        });

        return {
            generado_en: new Date(),

            sucursal_id: sucursal?.sucursal_id ?? sucursalId,
            sucursal_nombre: sucursal?.nombre ?? null,

            filtros_aplicados: {
                fecha_inicio: filtros?.fecha_inicio ?? null,
                fecha_fin: filtros?.fecha_fin ?? null,

                almacen_id: almacen?.almacen_id ?? null,
                almacen_nombre: almacen?.nombre ?? null,
            },

            totales: {
                total_productos: items.length,
                valor_inventario_costo: Number(valorCosto.toFixed(2)),
                valor_inventario_venta: Number(valorVenta.toFixed(2)),
                productos_bajo_stock: bajoStock,
                lotes_por_caducar_30dias: lotesPorCaducar,
            },

            items,
        };
    }

    construirReporteVentas(data: any, sucursalId: number, filtros: any) {
        const ventasPorId = this.agrupar(data.detalles, 'venta_id');

        let subtotal = 0;
        let descuentoTotal = 0;
        let impuestoTotal = 0;
        let totalIngresos = 0;
        let productosVendidos = 0;

        const items = (data.ventas ?? []).map((v: any) => {
            const detalles = (ventasPorId[v.venta_id] ?? []).map((d: any) => {
                productosVendidos += Number(d.cantidad ?? 0);

                return {
                    detalle_id: d.detalle_id,
                    detalle_uuid: d.detalle_uuid,
                    producto_id: d.producto_id,
                    producto_nombre_snapshot: d.producto_nombre_snapshot,
                    sku_snapshot: d.sku_snapshot,
                    lote_id: d.lote_id,
                    cantidad: Number(d.cantidad ?? 0),
                    precio_unitario: Number(d.precio_unitario ?? 0),
                    descuento: Number(d.descuento ?? 0),
                    impuesto: Number(d.impuesto ?? 0),
                    subtotal: Number(d.subtotal ?? 0),
                    total: Number(d.total ?? 0),
                };
            });

            subtotal += Number(v.subtotal ?? 0);
            descuentoTotal += Number(v.descuento_total ?? 0);
            impuestoTotal += Number(v.impuesto_total ?? 0);
            totalIngresos += Number(v.total ?? 0);

            return {
                venta_id: v.venta_id,
                venta_uuid: v.venta_uuid,
                folio: v.folio,
                fecha_venta: v.fecha_venta,
                cliente_id: v.cliente_id,
                cliente_nombre: v.cliente_nombre,
                usuario_venta_id: v.usuario_venta_id,
                metodo_pago: v.metodo_pago,
                status: v.status,
                subtotal: Number(v.subtotal ?? 0),
                descuento_total: Number(v.descuento_total ?? 0),
                impuesto_total: Number(v.impuesto_total ?? 0),
                total: Number(v.total ?? 0),
                monto_recibido: v.monto_recibido != null ? Number(v.monto_recibido) : null,
                cambio: v.cambio != null ? Number(v.cambio) : null,
                detalles,
            };
        });

        return {
            generado_en: new Date(),
            sucursal_id: sucursalId,
            filtros_aplicados: {
                fecha_inicio: filtros?.fecha_inicio ?? null,
                fecha_fin: filtros?.fecha_fin ?? null,
                almacen_id: filtros?.almacen_id ?? null,
            },
            totales: {
                total_ventas: items.length,
                subtotal: Number(subtotal.toFixed(2)),
                descuento_total: Number(descuentoTotal.toFixed(2)),
                impuesto_total: Number(impuestoTotal.toFixed(2)),
                total_ingresos: Number(totalIngresos.toFixed(2)),
                ticket_promedio: items.length ? Number((totalIngresos / items.length).toFixed(2)) : 0,
                productos_vendidos: productosVendidos,
            },
            items,
        };
    }

    construirReporteCompras(data: any, sucursalId: number, filtros: any) {
        const partidasPorOrden = this.agrupar(data.partidas, 'orden_compra_id');

        let subtotal = 0;
        let iva = 0;
        let totalEstimado = 0;
        let piezasSolicitadas = 0;
        let piezasRecibidas = 0;

        const items = (data.compras ?? []).map((oc: any) => {
            const detalles = (partidasPorOrden[oc.orden_compra_id] ?? []).map((d: any) => {
                piezasSolicitadas += Number(d.cantidad_solicitada ?? 0);
                piezasRecibidas += Number(d.cantidad_recibida ?? 0);

                return {
                    partida_oc_id: d.partida_oc_id,
                    partida_oc_uuid: d.partida_oc_uuid,
                    producto_id: d.producto_id,
                    producto_nombre: d.producto_nombre,
                    sku: d.sku,
                    cantidad_solicitada: Number(d.cantidad_solicitada ?? 0),
                    cantidad_recibida: Number(d.cantidad_recibida ?? 0),
                    precio_unitario_est: Number(d.precio_unitario_est ?? 0),
                    descuento_porcentaje: Number(d.descuento_porcentaje ?? 0),
                    descuento_importe: Number(d.descuento_importe ?? 0),
                    subtotal_estimado: Number(d.subtotal_estimado ?? 0),
                    status: d.status,
                    comentarios: d.comentarios,
                };
            });

            subtotal += Number(oc.subtotal_estimado ?? 0);
            iva += Number(oc.iva_estimado ?? 0);
            totalEstimado += Number(oc.total_estimado ?? 0);

            return {
                orden_compra_id: oc.orden_compra_id,
                orden_compra_uuid: oc.orden_compra_uuid,
                folio_numero: oc.folio_numero,
                folio_display: oc.folio_display,
                fecha_orden: oc.fecha_orden,
                fecha_entrega_estimada: oc.fecha_entrega_estimada,
                proveedor_id: oc.proveedor_id,
                proveedor_nombre: oc.proveedor_nombre,
                almacen_id: oc.almacen_id,
                almacen_nombre: oc.almacen_nombre,
                moneda: oc.moneda,
                tipo_cambio: oc.tipo_cambio != null ? Number(oc.tipo_cambio) : null,
                subtotal_estimado: Number(oc.subtotal_estimado ?? 0),
                iva_estimado: Number(oc.iva_estimado ?? 0),
                total_estimado: Number(oc.total_estimado ?? 0),
                status: oc.status,
                condiciones_pago: oc.condiciones_pago,
                notas: oc.notas,
                detalles,
            };
        });

        return {
            generado_en: new Date(),
            sucursal_id: sucursalId,
            filtros_aplicados: {
                fecha_inicio: filtros?.fecha_inicio ?? null,
                fecha_fin: filtros?.fecha_fin ?? null,
                almacen_id: filtros?.almacen_id ?? null,
            },
            totales: {
                total_ordenes: items.length,
                subtotal: Number(subtotal.toFixed(2)),
                iva: Number(iva.toFixed(2)),
                total_estimado: Number(totalEstimado.toFixed(2)),
                piezas_solicitadas: piezasSolicitadas,
                piezas_recibidas: piezasRecibidas,
            },
            items,
        };
    }

    private agrupar(arr: any[], campo: string): Record<number, any[]> {
        return (arr ?? []).reduce((acc, item) => {
            const key = item[campo];
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {} as Record<number, any[]>);
    }
}