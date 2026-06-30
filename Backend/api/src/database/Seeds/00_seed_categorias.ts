import type { Knex } from 'knex';


export async function seed(knex: Knex): Promise<void> {


    const categorias = [

        {
            nombre: 'Medicamentos',
            subcategorias: [
                'Analgésicos y Antiinflamatorios',
                'Antibióticos',
                'Antigripales y Respiratorios',
                'Gastrointestinales',
                'Cardiovasculares',
                'Diabetes y Metabolismo',
                'Sistema Nervioso',
                'Dermatológicos',
                'Oftalmológicos',
                'Otorrinolaringológicos',
                'Ginecológicos',
                'Pediátricos',
                'Genéricos',
            ],
        },


        {
            nombre: 'Vitaminas y Suplementos',
            subcategorias: [
                'Vitaminas',
                'Minerales',
                'Nutrición Deportiva',
                'Suplementos Especializados',
            ],
        },


        {
            nombre: 'Material Médico',
            subcategorias: [
                'Curación',
                'Instrumental Médico',
                'Protección Personal',
                'Diagnóstico',
            ],
        },


        {
            nombre: 'Cuidado Personal e Higiene',
            subcategorias: [
                'Higiene Corporal',
                'Cuidado Dental',
                'Cuidado Capilar',
                'Cuidado Facial',
            ],
        },


        {
            nombre: 'Dermocosmética',
            subcategorias: [
                'Rostro',
                'Piel Sensible',
                'Protección Solar',
                'Dermatología Estética',
            ],
        },


        {
            nombre: 'Bebés y Maternidad',
            subcategorias: [
                'Alimentación Infantil',
                'Higiene del Bebé',
                'Maternidad',
            ],
        },


        {
            nombre: 'Ortopedia y Rehabilitación',
            subcategorias: [
                'Soportes Ortopédicos',
                'Movilidad',
                'Rehabilitación',
            ],
        },


        {
            nombre: 'Salud Sexual',
            subcategorias: [
                'Anticoncepción',
                'Pruebas',
            ],
        },


        {
            nombre: 'Equipos Médicos',
            subcategorias: [
                'Monitoreo',
                'Equipo Respiratorio',
                'Hospitalario',
            ],
        },


        {
            nombre: 'Alimentos Funcionales',
            subcategorias: [
                'Bebidas Saludables',
                'Alimentos Especiales',
            ],
        },


        {
            nombre: 'Mascotas',
            subcategorias: [
                'Medicamentos Veterinarios',
                'Higiene Animal',
            ],
        },


        {
            nombre: 'Productos Controlados',
            subcategorias: [
                'Controlados',
                'Refrigerados',
            ],
        },

    ];



    for (const categoria of categorias) {


        // Crear categoría padre

        let padre = await knex('cat_categorias_subcategorias')
            .where({
                nombre: categoria.nombre,
                padre_id: null,
            })
            .first();



        if (!padre) {


            const [insertado] = await knex('cat_categorias_subcategorias')
                .insert({

                    nombre: categoria.nombre,

                    padre_id: null,

                    usuario_creacion: null,

                    usuario_actualizacion: null,

                    fecha_creacion: knex.fn.now(),

                    fecha_actualizacion: knex.fn.now(),

                })
                .returning('*');


            padre = insertado;

        }



        // Crear subcategorías

        for (const subcategoria of categoria.subcategorias) {


            const existe = await knex('cat_categorias_subcategorias')
                .where({

                    nombre: subcategoria,

                    padre_id: padre.categoria_id,

                })
                .first();



            if (existe) {
                continue;
            }



            await knex('cat_categorias_subcategorias')
                .insert({

                    nombre: subcategoria,

                    padre_id: padre.categoria_id,

                    usuario_creacion: null,

                    usuario_actualizacion: null,

                    fecha_creacion: knex.fn.now(),

                    fecha_actualizacion: knex.fn.now(),

                });


        }

    }

}