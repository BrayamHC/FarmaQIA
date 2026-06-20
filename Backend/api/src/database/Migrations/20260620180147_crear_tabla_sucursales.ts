import type { Knex } from 'knex';

const tableName = 'sucursales';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('sucursal_id').primary();
        table.uuid('sucursal_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.string('nombre', 150).notNullable();
        table.text('descripcion').nullable();
        table.string('status', 20).notNullable().defaultTo('activo')
            .comment('activo | inactivo | eliminado');

        // Datos generales (opcionales para uso sin facturación)
        table.string('rfc', 13).nullable();
        table.string('razon_social', 255).nullable();
        table.string('nombre_comercial', 255).nullable();
        table.integer('regimen_fiscal_id').unsigned().nullable()
            .comment('Referencia opcional a catálogo fiscal');

        // Dirección operativa
        table.string('calle', 255).nullable();
        table.string('numero_exterior', 20).nullable();
        table.string('numero_interior', 20).nullable();
        table.string('colonia', 150).nullable();
        table.string('municipio', 100).nullable();
        table.string('estado', 100).nullable();
        table.string('pais', 100).nullable().defaultTo('México');
        table.string('codigo_postal', 10).nullable();
        table.string('telefono', 20).nullable();
        table.string('email', 150).nullable();

        // Dirección fiscal (opcional)
        table.string('calle_fiscal', 255).nullable();
        table.string('numero_exterior_fiscal', 20).nullable();
        table.string('numero_interior_fiscal', 20).nullable();
        table.string('colonia_fiscal', 150).nullable();
        table.string('municipio_fiscal', 100).nullable();
        table.string('estado_fiscal', 100).nullable();
        table.string('pais_fiscal', 100).nullable();
        table.string('codigo_postal_fiscal', 10).nullable();

        // Control de timbres (opcional, para futura facturación)
        table.integer('timbres_asignados').unsigned().nullable().defaultTo(0);
        table.integer('timbres_restantes').unsigned().nullable().defaultTo(0);

        table.integer('emisor_id').unsigned().nullable()
            .comment('Referencia opcional a configuración de emisor fiscal');

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['status']);
        table.index(['rfc']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}