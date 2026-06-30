import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {

    const clientes = [
        // ============================
        // SUCURSAL 1 (5 clientes)
        // ============================
        {
            sucursal_id: 1,
            nombre: 'Hospital Puebla',
            telefono: '2221111111',
            email: 'contacto@hospitalpuebla.com',
            direccion: 'Av. Reforma 100, Puebla',
            rfc: 'HPS900101AAA',
            razon_social: 'Hospital Puebla SA de CV',
            codigo_postal_fiscal: '72000',
        },
        {
            sucursal_id: 1,
            nombre: 'Farmacia del Centro',
            telefono: '2221111112',
            email: 'contacto@farmaciacentro.com',
            direccion: 'Calle 5 Oriente 20, Puebla',
            rfc: 'FDC910202BBB',
            razon_social: 'Farmacia del Centro SA de CV',
            codigo_postal_fiscal: '72000',
        },
        {
            sucursal_id: 1,
            nombre: 'Clínica Santa María',
            telefono: '2221111113',
            email: 'contacto@clinicasantamaria.com',
            direccion: 'Av. Juárez 500, Puebla',
            rfc: 'CSM920303CCC',
            razon_social: 'Clínica Santa María',
            codigo_postal_fiscal: '72100',
        },
        {
            sucursal_id: 1,
            nombre: 'Consultorio Médico Integral',
            telefono: '2221111114',
            email: 'contacto@consultoriomedico.com',
            direccion: 'Centro Puebla',
            rfc: 'CMI930404DDD',
            razon_social: 'Consultorio Médico Integral',
            codigo_postal_fiscal: '72000',
        },
        {
            sucursal_id: 1,
            nombre: 'Distribuidora Médica Puebla',
            telefono: '2221111115',
            email: 'ventas@distribuidoramedica.com',
            direccion: 'Blvd. Norte Puebla',
            rfc: 'DMP940505EEE',
            razon_social: 'Distribuidora Médica Puebla SA',
            codigo_postal_fiscal: '72300',
        },


        // ============================
        // SUCURSAL 2 (3 clientes)
        // ============================
        {
            sucursal_id: 2,
            nombre: 'Clínica Cholula',
            telefono: '2222222221',
            email: 'contacto@clinicacholula.com',
            direccion: 'Centro Cholula',
            rfc: 'CCS900101AAA',
            razon_social: 'Clínica Cholula SA',
            codigo_postal_fiscal: '72760',
        },
        {
            sucursal_id: 2,
            nombre: 'Farmacia Cholula Salud',
            telefono: '2222222222',
            email: 'ventas@farmaciasalud.com',
            direccion: 'Av. 5 de Mayo Cholula',
            rfc: 'FCS910202BBB',
            razon_social: 'Farmacia Cholula Salud',
            codigo_postal_fiscal: '72760',
        },
        {
            sucursal_id: 2,
            nombre: 'Consultorio Vida Sana',
            telefono: '2222222223',
            email: 'vidasana@email.com',
            direccion: 'Centro Cholula',
            rfc: 'CVS920303CCC',
            razon_social: 'Consultorio Vida Sana',
            codigo_postal_fiscal: '72760',
        },


        // ============================
        // SUCURSAL 3 (1 cliente)
        // ============================
        {
            sucursal_id: 3,
            nombre: 'Hospital Angelópolis',
            telefono: '2223333333',
            email: 'contacto@hospitalangelopolis.com',
            direccion: 'Zona Angelópolis Puebla',
            rfc: 'HAP930404DDD',
            razon_social: 'Hospital Angelópolis SA de CV',
            codigo_postal_fiscal: '72197',
        },
    ];


    for (const cliente of clientes) {

        const existe = await knex('clientes')
            .where({
                sucursal_id: cliente.sucursal_id,
                nombre: cliente.nombre,
            })
            .first();


        if (existe) {
            continue;
        }


        await knex('clientes').insert({
            ...cliente,

            status: 'activo',

            usuario_creacion: null,
            usuario_actualizacion: null,

            fecha_creacion: knex.fn.now(),
            fecha_actualizacion: knex.fn.now(),
        });

    }
}