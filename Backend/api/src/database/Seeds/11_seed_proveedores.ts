import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {

    const proveedores = [
        {
            nombre: 'Distribuidora Farmacéutica Nacional',
            nombre_comercial: 'Difarnac',
            rfc: 'DFN900101AAA',

            contacto_nombre: 'Carlos Hernández',
            contacto_telefono: '2225551001',
            contacto_email: 'contacto@difarnac.com',

            calle: 'Av. Industria',
            numero_exterior: '120',
            colonia: 'Parque Industrial',
            municipio: 'Puebla',
            estado: 'Puebla',
            pais: 'México',
            codigo_postal: '72000',

            condiciones_pago: 'Crédito',
            dias_credito: 30,

            notas: 'Proveedor principal de medicamentos generales.',
        },

        {
            nombre: 'Laboratorios Médicos del Centro',
            nombre_comercial: 'LabMed Centro',
            rfc: 'LMC910202BBB',

            contacto_nombre: 'Ana Martínez',
            contacto_telefono: '2225551002',
            contacto_email: 'ventas@labmedcentro.com',

            calle: 'Calle 10 Poniente',
            numero_exterior: '450',
            colonia: 'Centro',
            municipio: 'Puebla',
            estado: 'Puebla',
            pais: 'México',
            codigo_postal: '72000',

            condiciones_pago: 'Crédito',
            dias_credito: 45,

            notas: 'Proveedor especializado en medicamentos de patente.',
        },

        {
            nombre: 'Farmacéutica del Sur',
            nombre_comercial: 'FarmaSur',
            rfc: 'FSU920303CCC',

            contacto_nombre: 'Luis Ramírez',
            contacto_telefono: '2225551003',
            contacto_email: 'ventas@farmasur.com',

            calle: 'Av. Nacional',
            numero_exterior: '850',
            colonia: 'San Manuel',
            municipio: 'Puebla',
            estado: 'Puebla',
            pais: 'México',
            codigo_postal: '72570',

            condiciones_pago: 'Contado',
            dias_credito: 0,

            notas: 'Proveedor de medicamentos genéricos.',
        },

        {
            nombre: 'Equipos y Suministros Hospitalarios',
            nombre_comercial: 'ESH Medical',
            rfc: 'ESH930404DDD',

            contacto_nombre: 'María López',
            contacto_telefono: '2225551004',
            contacto_email: 'contacto@eshmedical.com',

            calle: 'Blvd. Atlixco',
            numero_exterior: '320',
            colonia: 'La Paz',
            municipio: 'Puebla',
            estado: 'Puebla',
            pais: 'México',
            codigo_postal: '72160',

            condiciones_pago: 'Crédito',
            dias_credito: 60,

            notas: 'Proveedor de material médico y hospitalario.',
        },

        {
            nombre: 'Químicos y Farmacéuticos Unidos',
            nombre_comercial: 'QFU Pharma',
            rfc: 'QFU940505EEE',

            contacto_nombre: 'Roberto Sánchez',
            contacto_telefono: '2225551005',
            contacto_email: 'ventas@qfupharm.com',

            calle: 'Av. Reforma',
            numero_exterior: '900',
            colonia: 'Centro',
            municipio: 'Puebla',
            estado: 'Puebla',
            pais: 'México',
            codigo_postal: '72000',

            condiciones_pago: 'Crédito',
            dias_credito: 30,

            notas: 'Proveedor de insumos farmacéuticos.',
        },
    ];


    for (const proveedor of proveedores) {

        const existe = await knex('proveedores')
            .where({
                nombre: proveedor.nombre,
            })
            .first();


        if (existe) {
            continue;
        }


        await knex('proveedores')
            .insert({
                ...proveedor,

                status: 'activo',

                usuario_creacion: null,
                usuario_actualizacion: null,

                fecha_creacion: knex.fn.now(),
                fecha_actualizacion: knex.fn.now(),
            });

    }
}