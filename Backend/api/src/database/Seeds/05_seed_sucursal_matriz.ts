import type { Knex } from 'knex';


export async function seed(knex: Knex): Promise<void> {


    const sucursales = [

        {
            nombre: 'Matriz',
            descripcion: 'Sucursal principal de prueba FarmaQIA',

            rfc: 'FAR901010AAA',
            razon_social: 'IA SA de CV',
            nombre_comercial: 'FarmaQIA Matriz',

            calle: 'Av. Reforma',
            numero_exterior: '120',
            colonia: 'Centro',
            municipio: 'Puebla',
            estado: 'Puebla',
            codigo_postal: '72000',

            telefono: '2221234567',
            email: 'matriz@farmaqia.com'
        },


        {
            nombre: 'Sucursal Cholula',
            descripcion: 'Sucursal de prueba zona Cholula',

            rfc: 'FAR901010AAA',
            razon_social: 'IA SA de CV',
            nombre_comercial: 'FarmaQIA Cholula',

            calle: 'Av. 5 de Mayo',
            numero_exterior: '45',
            colonia: 'Centro',
            municipio: 'San Pedro Cholula',
            estado: 'Puebla',
            codigo_postal: '72760',

            telefono: '2227654321',
            email: 'cholula@farmaqia.com'
        },


        {
            nombre: 'Sucursal Angelópolis',
            descripcion: 'Sucursal comercial zona Angelópolis',

            rfc: 'FAR901010AAA',
            razon_social: 'IA SA de CV',
            nombre_comercial: 'FarmaQIA Angelópolis',

            calle: 'Blvd. del Niño Poblano',
            numero_exterior: '2510',
            colonia: 'Reserva Territorial Atlixcayotl',
            municipio: 'Puebla',
            estado: 'Puebla',
            codigo_postal: '72197',

            telefono: '2229876543',
            email: 'angelopolis@farmaqia.com'
        },


        {
            nombre: 'Sucursal Tehuacán',
            descripcion: 'Sucursal de prueba zona Tehuacán',

            rfc: 'FAR901010AAA',
            razon_social: 'IA SA de CV',
            nombre_comercial: 'FarmaQIA Tehuacán',

            calle: 'Av. Reforma Norte',
            numero_exterior: '800',
            colonia: 'Centro',
            municipio: 'Tehuacán',
            estado: 'Puebla',
            codigo_postal: '75700',

            telefono: '2384567890',
            email: 'tehuacan@farmaqia.com'
        }

    ];



    for (const sucursal of sucursales) {


        const existe = await knex('sucursales')
            .where({
                nombre: sucursal.nombre
            })
            .first();


        if (existe)
            continue;



        await knex('sucursales')
            .insert({

                nombre: sucursal.nombre,

                descripcion: sucursal.descripcion,


                status: 'activo',


                rfc: sucursal.rfc,

                razon_social: sucursal.razon_social,

                nombre_comercial: sucursal.nombre_comercial,


                calle: sucursal.calle,

                numero_exterior: sucursal.numero_exterior,

                colonia: sucursal.colonia,

                municipio: sucursal.municipio,

                estado: sucursal.estado,

                pais: 'México',

                codigo_postal: sucursal.codigo_postal,


                telefono: sucursal.telefono,

                email: sucursal.email,


                usuario_creacion: null,

                usuario_actualizacion: null,


                fecha_creacion: knex.fn.now(),

                fecha_actualizacion: knex.fn.now()

            });


    }

}