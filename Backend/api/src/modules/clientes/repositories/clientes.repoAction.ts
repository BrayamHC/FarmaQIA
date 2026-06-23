import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';
import { DATABASE_CONNECTION } from 'src/config/database.constants';

@Injectable()
export class ClientesRepoAction {
    private readonly logger = new Logger(ClientesRepoAction.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly knex: Knex,
    ) { }

    async crearCliente(clienteObj: object): Promise<{
        cliente_id: number;
        cliente_uuid: string;
        nombre: string;
        rfc: string | null;
        status: string;
    }> {
        try {
            const [cliente] = await this.knex('clientes')
                .insert(clienteObj)
                .returning(['cliente_id', 'cliente_uuid', 'nombre', 'rfc', 'status']);

            return cliente;
        } catch (error) {
            this.logger.error('crearCliente', error);
            throw new DatabaseQueryException('Error al crear cliente');
        }
    }

    async actualizarCliente(cliente_id: number, updateObj: object): Promise<{
        cliente_id: number;
        cliente_uuid: string;
        nombre: string;
        rfc: string | null;
        status: string;
    }> {
        try {
            const [cliente] = await this.knex('clientes')
                .where('cliente_id', cliente_id)
                .update(updateObj)
                .returning(['cliente_id', 'cliente_uuid', 'nombre', 'rfc', 'status']);

            return cliente;
        } catch (error) {
            this.logger.error('actualizarCliente', error);
            throw new DatabaseQueryException('Error al actualizar cliente');
        }
    }

    async cambiarStatusCliente(cliente_id: number, updateObj: object): Promise<{
        cliente_id: number;
        cliente_uuid: string;
        nombre: string;
        status: string;
    }> {
        try {
            const [cliente] = await this.knex('clientes')
                .where('cliente_id', cliente_id)
                .update(updateObj)
                .returning(['cliente_id', 'cliente_uuid', 'nombre', 'status']);

            return cliente;
        } catch (error) {
            this.logger.error('cambiarStatusCliente', error);
            throw new DatabaseQueryException('Error al cambiar status del cliente');
        }
    }
}