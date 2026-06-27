import type { Knex } from 'knex';


export async function seed(knex: Knex): Promise<void> {


    /*
    |--------------------------------------------------------------------------
    | UNIDADES MEDIDA
    |--------------------------------------------------------------------------
    */

    const unidades = [
        {
            clave: 'H87',
            nombre: 'Pieza',
            nombre_corto: 'PZA',
            tipo: 'Unidad'
        },
        {
            clave: 'XBX',
            nombre: 'Caja',
            nombre_corto: 'CAJA',
            tipo: 'Empaque'
        },
        {
            clave: 'LTR',
            nombre: 'Litro',
            nombre_corto: 'L',
            tipo: 'Volumen'
        },
        {
            clave: 'MLT',
            nombre: 'Mililitro',
            nombre_corto: 'ML',
            tipo: 'Volumen'
        },
        {
            clave: 'KGM',
            nombre: 'Kilogramo',
            nombre_corto: 'KG',
            tipo: 'Peso'
        },
        {
            clave: 'GRM',
            nombre: 'Gramo',
            nombre_corto: 'G',
            tipo: 'Peso'
        },
        {
            clave: 'H87',
            nombre: 'Unidad',
            nombre_corto: 'UND',
            tipo: 'Unidad'
        }
    ];


    for (const unidad of unidades) {

        const existe = await knex('cat_unidades_medida')
            .where({
                clave: unidad.clave
            })
            .first();

        if (!existe) {
            await knex('cat_unidades_medida')
                .insert(unidad);
        }
    }



    /*
    |--------------------------------------------------------------------------
    | CATEGORIAS
    |--------------------------------------------------------------------------
    */


    const insertarCategoria = async (
        nombre: string,
        padre_id: number | null = null
    ) => {

        const existe = await knex('cat_categorias_subcategorias')
            .where({
                nombre,
                padre_id
            })
            .first();


        if (existe)
            return existe.categoria_id;


        const [categoria] = await knex('cat_categorias_subcategorias')
            .insert({
                nombre,
                padre_id
            })
            .returning('categoria_id');


        return categoria.categoria_id;

    };



    /*
    medicamentos
    */

    const medicamentos = await insertarCategoria(
        'Medicamentos'
    );


    const analgesicos = await insertarCategoria(
        'Analgésicos y Antiinflamatorios',
        medicamentos
    );


    await insertarCategoria(
        'Antibióticos',
        medicamentos
    );


    await insertarCategoria(
        'Antihistamínicos',
        medicamentos
    );


    await insertarCategoria(
        'Vitaminas y Suplementos',
        medicamentos
    );



    /*
    Higiene
    */

    const higiene = await insertarCategoria(
        'Higiene Personal'
    );


    await insertarCategoria(
        'Cuidado Bucal',
        higiene
    );


    await insertarCategoria(
        'Cuidado Capilar',
        higiene
    );


    /*
    Bebés
    */

    const bebes = await insertarCategoria(
        'Bebés'
    );


    await insertarCategoria(
        'Pañales',
        bebes
    );


    await insertarCategoria(
        'Cuidado Infantil',
        bebes
    );



    /*
    Otros
    */

    await insertarCategoria(
        'Material Médico'
    );


    await insertarCategoria(
        'Equipo Médico'
    );


    await insertarCategoria(
        'Alimentos y Bebidas'
    );


}