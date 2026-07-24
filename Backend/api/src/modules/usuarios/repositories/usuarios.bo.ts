import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CrearUsuario, CrearUsuarioInsert, EditarUsuario } from '../dto/usuarios.validator';

@Injectable()
export class UsuariosBo {

    async armarInsertUsuario(data: CrearUsuarioInsert, usuarioCreacion: any) {
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
        const passwordHash = await bcrypt.hash(data.password, saltRounds);

        return {
            nombre_completo: data.nombre_completo,
            email: data.email.toLowerCase().trim(),
            password: passwordHash,
            telefono: data.telefono ?? null,
            rol_id: data.rol_id,   // ← ya resuelto
            status: 'activo',
            fecha_ultimo_acceso: null,
            usuario_creacion: usuarioCreacion.usuario_id,
            usuario_actualizacion: null,
            fecha_creacion: new Date(),
            fecha_actualizacion: null,
        };
    }

    async armarEditarUsuario(editarUsuario: EditarUsuario & { usuarioUuid: string }, usuarioEdicion: any) {

        let password: string | null = null;
        if (editarUsuario.password) {
            const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
            const passwordHash = await bcrypt.hash(editarUsuario.password, saltRounds);
            password = passwordHash;
        }

        const data: any = {
            ...editarUsuario,
            password,
            usuario_actualizacion: usuarioEdicion.usuario_id,
            fecha_actualizacion: new Date(),
        };

        Object.keys(data).forEach(key => {
            if (data[key] === undefined || data[key] === null) {
                delete data[key];
            }
        });

        return data;

    }

    armarInsertBitacoraUsuario({ accion, descripcion, datos_nuevos, usuario }: {
        accion: string; descripcion: string; datos_nuevos: any; usuario: any;
    }) {
        return {
            modulo: 'usuarios',
            accion,
            descripcion,
            datos_nuevos: JSON.stringify(datos_nuevos),
            usuario_id: usuario.usuario_id,
            usuario_nombre: usuario.nombre_completo,
        };
    }
}
