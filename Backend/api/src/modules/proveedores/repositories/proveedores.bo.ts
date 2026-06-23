import { Injectable } from '@nestjs/common';
import { ActualizarProveedorDTO, CrearProveedorDTO } from '../dto/proveedores.dto';

@Injectable()
export class ProveedorBO {
    armarInsertProveedor(datos: CrearProveedorDTO, usuarioCreacionId: number) {
        return {
            nombre: datos.nombre,
            nombre_comercial: datos.nombre_comercial ?? null,
            rfc: datos.rfc ? datos.rfc.toUpperCase() : null,

            contacto_nombre: datos.contacto_nombre ?? null,
            contacto_telefono: datos.contacto_telefono ?? null,
            contacto_email: datos.contacto_email ?? null,

            calle: datos.calle ?? null,
            numero_exterior: datos.numero_exterior ?? null,
            numero_interior: datos.numero_interior ?? null,
            colonia: datos.colonia ?? null,
            municipio: datos.municipio ?? null,
            estado: datos.estado ?? null,
            pais: datos.pais ?? 'México',
            codigo_postal: datos.codigo_postal ?? null,

            condiciones_pago: datos.condiciones_pago ?? null,
            dias_credito: datos.dias_credito ?? 0,

            notas: datos.notas ?? null,

            status: 'activo',
            usuario_creacion: usuarioCreacionId,
            usuario_actualizacion: null,
            fecha_creacion: new Date(),
            fecha_actualizacion: null,
        };
    }

    armarUpdateProveedor(datos: ActualizarProveedorDTO, usuario: any) {
        const data: Record<string, any> = {
            usuario_actualizacion: usuario.usuario_id,
            fecha_actualizacion: new Date(),
        };

        if (datos.nombre !== undefined) data.nombre = datos.nombre;
        if (datos.nombre_comercial !== undefined) data.nombre_comercial = datos.nombre_comercial;
        if (datos.rfc !== undefined) data.rfc = datos.rfc ? datos.rfc.toUpperCase() : datos.rfc;

        if (datos.contacto_nombre !== undefined) data.contacto_nombre = datos.contacto_nombre;
        if (datos.contacto_telefono !== undefined) data.contacto_telefono = datos.contacto_telefono;
        if (datos.contacto_email !== undefined) data.contacto_email = datos.contacto_email;

        if (datos.calle !== undefined) data.calle = datos.calle;
        if (datos.numero_exterior !== undefined) data.numero_exterior = datos.numero_exterior;
        if (datos.numero_interior !== undefined) data.numero_interior = datos.numero_interior;
        if (datos.colonia !== undefined) data.colonia = datos.colonia;
        if (datos.municipio !== undefined) data.municipio = datos.municipio;
        if (datos.estado !== undefined) data.estado = datos.estado;
        if (datos.pais !== undefined) data.pais = datos.pais;
        if (datos.codigo_postal !== undefined) data.codigo_postal = datos.codigo_postal;

        if (datos.condiciones_pago !== undefined) data.condiciones_pago = datos.condiciones_pago;
        if (datos.dias_credito !== undefined) data.dias_credito = datos.dias_credito;

        if (datos.notas !== undefined) data.notas = datos.notas;

        return data;
    }
}