import { Injectable } from '@nestjs/common';

@Injectable()
export class SucursalesBO {

    prepararNuevaSucursal(datos: any, usuario: any) {
        return {
            nombre: datos.nombre,
            descripcion: datos.descripcion ?? null,
            nombre_comercial: datos.nombre_comercial ?? null,
            status: 'activo',

            // Contacto
            telefono: datos.telefono ?? null,
            email: datos.email ?? null,

            // Domicilio operativo (informativo)
            calle: datos.calle ?? null,
            numero_exterior: datos.numero_exterior ?? null,
            numero_interior: datos.numero_interior ?? null,
            colonia: datos.colonia ?? null,
            municipio: datos.municipio ?? null,
            estado: datos.estado ?? null,
            pais: datos.pais ?? 'México',
            codigo_postal: datos.codigo_postal ?? null,

            // Auditoría
            usuario_creacion: usuario.usuario_id,
            usuario_actualizacion: null,
            fecha_creacion: new Date(),
            fecha_actualizacion: null,
        };
    }

    prepararActualizarSucursal(datos: any, usuario: any) {
        // Quitar campos que no deben sobrescribirse en un UPDATE
        const { ...rest } = datos;

        const update: Record<string, any> = {
            ...rest,
            usuario_actualizacion: usuario.usuario_id,
            fecha_actualizacion: new Date(),
        };

        // Limpiar undefined para no pisar campos con undefined
        Object.keys(update).forEach((k) => {
            if (update[k] === undefined) delete update[k];
        });

        return update;
    }
}