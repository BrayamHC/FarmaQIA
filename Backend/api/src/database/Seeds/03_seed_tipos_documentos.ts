exports.seed = async function (knex) {
    await knex('cat_tipos_documentos')
        .whereIn('clave', ['OC', 'FAC', 'VTA', 'REM', 'NC', 'CP', 'TRP'])
        .delete();

    await knex('cat_tipos_documentos').insert([
        {
            clave: 'OC',
            nombre: 'Orden de Compra',
            descripcion: 'Documento interno para solicitar mercancía a proveedores',
            es_fiscal: false,
            es_configurable: false,
            es_sistema: true,
            status: 'activo',
        },
        {
            clave: 'FAC',
            nombre: 'Factura',
            descripcion: 'Comprobante Fiscal Digital por Internet (CFDI)',
            es_fiscal: true,
            es_configurable: false,
            es_sistema: true,
            status: 'activo',
        },
        {
            clave: 'VTA',
            nombre: 'Venta',
            descripcion: 'Documento comercial de venta sin efectos fiscales directos',
            es_fiscal: false,
            es_configurable: false,
            es_sistema: true,
            status: 'activo',
        },
        {
            clave: 'REM',
            nombre: 'Nota de Remisión',
            descripcion: 'Documento que acredita la entrega de mercancía sin ser factura',
            es_fiscal: false,
            es_configurable: false,
            es_sistema: true,
            status: 'activo',
        },
        {
            clave: 'NC',
            nombre: 'Nota de Crédito',
            descripcion: 'Documento fiscal o comercial de egreso para ajuste/cancelación',
            es_fiscal: true,
            es_configurable: false,
            es_sistema: true,
            status: 'activo',
        },
        {
            clave: 'CP',
            nombre: 'Carta Porte',
            descripcion: 'Documento fiscal/complemento para traslado de mercancías',
            es_fiscal: true,
            es_configurable: false,
            es_sistema: true,
            status: 'activo',
        },
        {
            clave: 'TRP',
            nombre: 'Traspaso de Almacén',
            descripcion: 'Documento interno para transferencia de mercancía entre almacenes',
            es_fiscal: false,
            es_configurable: false,
            es_sistema: true,
            status: 'activo',
        },
    ]);
};