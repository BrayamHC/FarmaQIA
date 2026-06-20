import type { Knex } from 'knex';

const tableName = 'proveedores';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('proveedor_id').primary();
        table.uuid('proveedor_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.string('nombre', 255).notNullable();
        table.string('nombre_comercial', 255).nullable();
        table.string('rfc', 13).nullable();
        table.string('contacto_nombre', 150).nullable();
        table.string('contacto_telefono', 20).nullable();
        table.string('contacto_email', 150).nullable();

        table.string('calle', 255).nullable();
        table.string('numero_exterior', 20).nullable();
        table.string('numero_interior', 20).nullable();
        table.string('colonia', 150).nullable();
        table.string('municipio', 100).nullable();
        table.string('estado', 100).nullable();
        table.string('pais', 100).nullable().defaultTo('México');
        table.string('codigo_postal', 10).nullable();

        table.string('condiciones_pago', 100).nullable();
        table.integer('dias_credito').unsigned().nullable().defaultTo(0);

        table.text('notas').nullable();

        table.string('status', 20).notNullable().defaultTo('activo')
            .comment('activo | inactivo | eliminado');

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['status']);
        table.index(['rfc']);
        table.index(['nombre']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}