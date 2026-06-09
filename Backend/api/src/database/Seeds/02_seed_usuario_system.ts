import type { Knex } from 'knex';
import bcryptjs from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
    const existeUsuario = await knex('usuarios')
        .where({ email: 'system@farmaqia.com' })
        .first();

    if (existeUsuario) return;

    const rolAdministrador = await knex('cat_roles')
        .select('rol_id')
        .where({ descripcion: 'Administrador' })
        .first();

    if (!rolAdministrador) {
        throw new Error('No existe el rol Administrador para asignar al usuario system');
    }

    const passwordPlano = 'systemFarma2024!';
    const passwordHash = await bcryptjs.hash(passwordPlano, 10);

    await knex('usuarios').insert({
        nombre_completo: 'System FarmaQ',
        email: 'system@farmaqia.com',
        password: passwordHash,
        rol_id: rolAdministrador.rol_id,
        status: 'activo',
        fecha_ultimo_acceso: null,
        usuario_creacion: null,
        usuario_actualizacion: null,
        fecha_creacion: knex.fn.now(),
        fecha_actualizacion: null,
    });
}