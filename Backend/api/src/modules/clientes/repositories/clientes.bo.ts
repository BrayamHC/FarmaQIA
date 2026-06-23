import { Injectable } from '@nestjs/common';
import { ActualizarClienteInput } from '../dto/clientes.validator';

@Injectable()
export class ClientesBO {
    armarInsertCliente(data: {
        sucursal_id: number;
        nombre: string;
        telefono?: string | null;
        email?: string | null;
        direccion?: string | null;
        rfc?: string | null;
        razon_social?: string | null;
        codigo_postal_fiscal?: string | null;
        usuario_id: number;
    }) {
        return {
            sucursal_id: data.sucursal_id,
            nombre: data.nombre,
            telefono: data.telefono ?? null,
            email: data.email ?? null,
            direccion: data.direccion ?? null,
            rfc: data.rfc ?? null,
            razon_social: data.razon_social ?? null,
            codigo_postal_fiscal: data.codigo_postal_fiscal ?? null,
            status: 'activo',
            fecha_creacion: new Date(),
            fecha_actualizacion: null,
            fecha_eliminacion: null,
            usuario_creacion: data.usuario_id,
            usuario_actualizacion: null,
        };
    }

    armarUpdateCliente(data: ActualizarClienteInput, usuario_id: number) {
        const update: Record<string, any> = {
            fecha_actualizacion: new Date(),
            usuario_actualizacion: usuario_id,
        };

        if (data.nombre !== undefined) update.nombre = data.nombre;
        if (data.telefono !== undefined) update.telefono = data.telefono;
        if (data.email !== undefined) update.email = data.email;
        if (data.direccion !== undefined) update.direccion = data.direccion;
        if (data.rfc !== undefined) update.rfc = data.rfc;
        if (data.razon_social !== undefined) update.razon_social = data.razon_social;
        if (data.codigo_postal_fiscal !== undefined) {
            update.codigo_postal_fiscal = data.codigo_postal_fiscal;
        }

        return update;
    }

    armarUpdateStatus(status: string, usuario_id: number) {
        return {
            status,
            fecha_actualizacion: new Date(),
            fecha_eliminacion: status === 'eliminado' ? new Date() : null,
            usuario_actualizacion: usuario_id,
        };
    }
}