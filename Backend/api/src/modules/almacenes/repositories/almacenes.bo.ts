import { Injectable } from '@nestjs/common';
import { CrearAlmacenDTO, ActualizarAlmacenDTO } from '../dto/almacenes.dto';

@Injectable()
export class AlmacenesBO {

    prepararNuevoAlmacen(dto: CrearAlmacenDTO, sucursalId: number, usuario: any) {
        return {
            nombre: dto.nombre,
            descripcion: dto.descripcion ?? null,
            encargado: dto.encargado ?? null,
            direccion: dto.direccion ?? null,
            telefono: dto.telefono ?? null,
            status: 'activo',
            sucursal_id: sucursalId,

            usuario_creacion: usuario.usuario_id,
            usuario_actualizacion: null,
            fecha_creacion: new Date(),
            fecha_actualizacion: null,
        };
    }

    prepararActualizarAlmacen(dto: ActualizarAlmacenDTO, usuario: any) {
        const update: Record<string, any> = {
            usuario_actualizacion: usuario.usuario_id,
            fecha_actualizacion: new Date(),
        };

        if (dto.nombre !== undefined) update.nombre = dto.nombre;
        if (dto.descripcion !== undefined) update.descripcion = dto.descripcion;
        if (dto.encargado !== undefined) update.encargado = dto.encargado;
        if (dto.direccion !== undefined) update.direccion = dto.direccion;
        if (dto.telefono !== undefined) update.telefono = dto.telefono;

        return update;
    }
}