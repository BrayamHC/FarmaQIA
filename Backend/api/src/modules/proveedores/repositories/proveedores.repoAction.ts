import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class ProveedoresRepoAction {
    private readonly logger = new Logger(ProveedoresRepoAction.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
    ) { }

    async insertarProveedor(body: any): Promise<any> {
        try {
            const [proveedorCreado] = await this.knex('proveedores')
                .insert(body)
                .returning([
                    'proveedor_id',
                    'proveedor_uuid',
                    'nombre',
                    'nombre_comercial',
                    'rfc',
                    'contacto_nombre',
                    'contacto_telefono',
                    'contacto_email',
                    'condiciones_pago',
                    'dias_credito',
                    'status',
                ]);

            return proveedorCreado;
        } catch (error) {
            this.logger.error('insertarProveedor', error);
            throw new DatabaseQueryException('Error al insertar proveedor');
        }
    }

    async actualizarProveedor(uuid: string, body: any): Promise<any> {
        try {
            const [proveedorActualizado] = await this.knex('proveedores')
                .where('proveedor_uuid', uuid)
                .whereNot('status', 'eliminado')
                .update(body)
                .returning([
                    'proveedor_id',
                    'proveedor_uuid',
                    'nombre',
                    'nombre_comercial',
                    'rfc',
                    'contacto_nombre',
                    'contacto_telefono',
                    'contacto_email',
                    'condiciones_pago',
                    'dias_credito',
                    'status',
                ]);

            return proveedorActualizado;
        } catch (error) {
            this.logger.error('actualizarProveedor', error);
            throw new DatabaseQueryException('Error al actualizar proveedor');
        }
    }

    async cambiarStatusProveedor(uuid: string, data: any): Promise<any> {
        try {
            const [proveedorActualizado] = await this.knex('proveedores')
                .where('proveedor_uuid', uuid)
                .whereNot('status', 'eliminado')
                .update(data)
                .returning([
                    'proveedor_id',
                    'proveedor_uuid',
                    'nombre',
                    'nombre_comercial',
                    'status',
                ]);

            return proveedorActualizado;
        } catch (error) {
            this.logger.error('cambiarStatusProveedor', error);
            throw new DatabaseQueryException('Error al cambiar status del proveedor');
        }
    }
}