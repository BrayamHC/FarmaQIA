/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
    const roles = [
        {
            descripcion: "Administrador"
        }
    ];

    await knex("cat_roles").insert(roles);
};