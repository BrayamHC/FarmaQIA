/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('cat_permisos', (table) => {
        table.increments('permiso_id').primary();

        table.string('codigo', 80).notNullable().unique()
            .comment('Identificador único para el Guard: deltaerp.usuarios.ver');

        table.integer('modulo_orden').unsigned().notNullable()
            .comment('Orden del módulo en UI: 1, 2, 3...');

        table.string('modulo', 60).notNullable()
            .comment('Agrupación lógica: usuarios, inventario, ordenes_compra...');

        table.string('accion', 30).notNullable()
            .comment('ver | crear | editar | eliminar | desactivar | cancelar | autorizar | transferir');

        table.string('descripcion', 150).notNullable()
            .comment('Texto legible para UI: Consultar usuarios, Crear órdenes de compra...');

        table.string('status', 20).notNullable().defaultTo('activo')
            .comment('activo | inactivo');

        table.unique(['modulo', 'accion']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('cat_permisos');
};