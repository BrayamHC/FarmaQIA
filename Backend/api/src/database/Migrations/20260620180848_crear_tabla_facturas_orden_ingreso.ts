import type { Knex } from 'knex';

const tableName = 'facturas_orden_ingreso';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('factura_orden_ingreso_id').primary();
        table.uuid('factura_orden_ingreso_uuid')
            .unique()
            .notNullable()
            .defaultTo(knex.raw('gen_random_uuid()'));

        table.integer('proveedor_id')
            .unsigned()
            .nullable()
            .references('proveedor_id')
            .inTable('proveedores')
            .onDelete('SET NULL');

        // Datos del CFDI (todos nullable: puede ser ingreso manual sin XML)
        table.string('uuid_fiscal', 36).nullable().unique()
            .comment('UUID del timbre fiscal del SAT');
        table.string('version_cfdi', 5).nullable()
            .comment('Ej: 4.0');
        table.string('serie_cfdi', 25).nullable();
        table.string('folio_cfdi', 40).nullable();
        table.timestamp('fecha_cfdi').nullable();
        table.timestamp('fecha_timbrado').nullable();

        table.string('moneda', 3).notNullable().defaultTo('MXN');
        table.decimal('tipo_cambio', 10, 4).notNullable().defaultTo(1);

        table.decimal('subtotal', 14, 2).notNullable().defaultTo(0);
        table.decimal('total_impuestos_trasladados', 14, 2).notNullable().defaultTo(0);
        table.decimal('total_impuestos_retenidos', 14, 2).notNullable().defaultTo(0);
        table.decimal('total', 14, 2).notNullable().defaultTo(0);

        // Emisor
        table.string('rfc_emisor', 13).nullable();
        table.string('nombre_emisor', 255).nullable();
        table.string('regimen_fiscal_emisor', 4).nullable()
            .comment('Clave del régimen fiscal SAT, ej: 601');

        // Receptor
        table.string('rfc_receptor', 13).nullable();
        table.string('nombre_receptor', 255).nullable();
        table.string('domicilio_fiscal_receptor', 10).nullable()
            .comment('Código postal fiscal del receptor');
        table.string('regimen_fiscal_receptor', 4).nullable();
        table.string('uso_cfdi', 4).nullable()
            .comment('Clave de uso CFDI del SAT, ej: G03');

        // Sellos y certificados
        table.string('no_certificado_emisor', 20).nullable();
        table.string('no_certificado_sat', 20).nullable();
        table.text('sello_cfdi').nullable();
        table.text('sello_sat').nullable();
        table.string('rfc_prov_certif', 13).nullable()
            .comment('RFC del proveedor de certificación (PAC)');

        // CFDI relacionados (array de UUIDs relacionados)
        table.jsonb('cfdi_relacionados').nullable().defaultTo(knex.raw("'[]'::jsonb"))
            .comment('[{ tipo_relacion: string, uuid: string }]');

        // XML completo almacenado como texto
        table.text('xml_original').nullable()
            .comment('XML original del CFDI tal como llegó. Null si fue ingreso manual.');

        table.string('status', 20).notNullable().defaultTo('activo')
            .comment('activo | cancelado');

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['proveedor_id']);
        table.index(['uuid_fiscal']);
        table.index(['rfc_emisor']);
        table.index(['fecha_cfdi']);
        table.index(['status']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}