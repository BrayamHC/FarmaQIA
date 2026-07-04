import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductosBO {

    prepararNuevoProducto(datos: any, usuario: any) {
        const tags = this.normalizarTags(datos.tags);

        return {
            sku: datos.sku,
            upc: datos.upc ?? null,
            nombre: datos.nombre,
            descripcion: datos.descripcion ?? null,
            status: 'activo',

            unidad_medida_id: datos.unidad_medida_id,
            categoria_id: datos.categoria_id,
            proveedor_id: datos.proveedor_id,
            sucursal_id: datos.sucursal_id,

            volumen_valor: datos.volumen_valor ?? null,
            volumen_unidad: datos.volumen_unidad ?? null,
            peso_valor: datos.peso_valor ?? null,
            peso_unidad: datos.peso_unidad ?? null,

            unidad_entrada: datos.unidad_entrada,
            unidad_salida: datos.unidad_salida,
            control_almacen: String(datos.control_almacen),
            factor_unidades: datos.factor_unidades,
            con_lote: datos.con_lote,

            // IVA siempre 16% — se aplica en el módulo de ventas, no aquí
            costo_compra: Number(datos.costo_compra),
            precio_publico: Number(datos.precio_publico),

            numero_registro_sanitario: datos.numero_registro_sanitario ?? null,
            temperatura: datos.temperatura ? JSON.stringify(datos.temperatura) : null,
            presentacion: datos.presentacion,
            fecha_entrada: new Date(datos.fecha_entrada),

            tags: JSON.stringify(tags),
            url_imagen: datos.url_imagen ?? null,

            usuario_creacion: usuario.usuario_id,
            usuario_actualizacion: null,
            fecha_creacion: new Date(),
            fecha_actualizacion: null,
        };
    }

    prepararActualizarProducto(datos: any, usuario: any) {
        const { categoria_uuid, proveedor_uuid, fecha_entrada, temperatura, tags, ...rest } = datos;

        const data: Record<string, any> = {
            ...rest,
            usuario_actualizacion: usuario.usuario_id,
            fecha_actualizacion: new Date(),
        };

        if (temperatura !== undefined) {
            data.temperatura = JSON.stringify(temperatura);
        }
        if (tags !== undefined) {
            data.tags = JSON.stringify(this.normalizarTags(tags));
        }
        if (fecha_entrada) {
            data.fecha_entrada = new Date(fecha_entrada);
        }

        // Limpiar nulos/undefined que no deben sobrescribir
        Object.keys(data).forEach((k) => {
            if (data[k] === undefined) delete data[k];
        });

        return data;
    }

    private normalizarTags(tags: string | string[]): string[] {
        if (!tags) return [];
        if (Array.isArray(tags)) return tags.map((t) => t.trim());
        return tags.split(',').map((t) => t.trim());
    }

    prepararAltaLoteStock(datos: any, usuario: any) {
        return {
            lote: {
                codigo_lote: datos.codigo_lote,
                cantidad_actual: Number(datos.cantidad_actual),
                fecha_fabricacion: datos.fecha_fabricacion ? new Date(datos.fecha_fabricacion) : null,
                fecha_caducidad: new Date(datos.fecha_caducidad),
                costo_unitario_compra: Number(datos.costo_unitario_compra ?? 0),
                status: 'activo',
                almacen_id: datos.almacen_id,
                producto_id: datos.producto_id,
                proveedor_id: datos.proveedor_id ?? null,
                usuario_creacion: usuario.usuario_id,
                usuario_actualizacion: null,
                fecha_creacion: new Date(),
                fecha_actualizacion: null,
            },
            stock: {
                producto_id: datos.producto_id,
                almacen_id: datos.almacen_id,
                cantidad_ingresada: Number(datos.cantidad_actual),
                stock_minimo: datos.stock_minimo,
                stock_maximo: datos.stock_maximo,
                usuario_id: usuario.usuario_id,
            },
        };
    }
}