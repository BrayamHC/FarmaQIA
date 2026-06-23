import {
    ConflictException, Injectable, Logger, NotFoundException, UnprocessableEntityException,
} from '@nestjs/common';
import { ClientesRepoData } from './repositories/clientes.repoData';
import { ClientesRepoAction } from './repositories/clientes.repoAction';
import { ClientesBO } from './repositories/clientes.bo';
import {
    CrearClienteDTO,
    ActualizarClienteDTO,
    FiltrosClienteDTO,
} from './dto/clientes.dto';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class ClientesService {
    private readonly logger = new Logger(ClientesService.name);

    constructor(
        private readonly repoData: ClientesRepoData,
        private readonly repoAction: ClientesRepoAction,
        private readonly bo: ClientesBO,
    ) { }

    async obtenerClientes(filtros: FiltrosClienteDTO, sucursalId: number) {
        try {
            return await this.repoData.obtenerClientes(filtros, sucursalId);
        } catch (error) {
            this.logger.error('obtenerClientes', error);
            throw new DatabaseQueryException('Error al obtener clientes');
        }
    }

    async obtenerClientePorUUID(cliente_uuid: string, sucursalId: number) {
        try {
            const cliente = await this.repoData.obtenerClientePorUUID(cliente_uuid, sucursalId);
            if (!cliente) {
                throw new NotFoundException(`Cliente '${cliente_uuid}' no encontrado`);
            }
            return cliente;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error('obtenerClientePorUUID', error);
            throw new DatabaseQueryException('Error al obtener cliente');
        }
    }

    async crearCliente(data: CrearClienteDTO, sucursalId: number, usuario: any) {
        try {
            if (data.rfc) {
                const clienteRFC = await this.repoData.obtenerClientePorRFC(data.rfc, sucursalId);
                if (clienteRFC) {
                    throw new ConflictException(`Ya existe un cliente con RFC '${data.rfc}'`);
                }
            }

            const clienteObj = this.bo.armarInsertCliente({
                ...data,
                sucursal_id: sucursalId,
                usuario_id: usuario.usuario_id,
            });

            return await this.repoAction.crearCliente(clienteObj);
        } catch (error) {
            if (error instanceof ConflictException) throw error;
            this.logger.error('crearCliente', error);
            throw new DatabaseQueryException('Error al crear cliente');
        }
    }

    async actualizarCliente(
        cliente_uuid: string,
        data: ActualizarClienteDTO,
        sucursalId: number,
        usuario: any,
    ) {
        try {
            const cliente = await this.repoData.obtenerClientePorUUID(cliente_uuid, sucursalId);
            if (!cliente) {
                throw new NotFoundException(`Cliente '${cliente_uuid}' no encontrado`);
            }

            if (cliente.status === 'eliminado') {
                throw new UnprocessableEntityException(
                    'No se puede modificar un cliente eliminado',
                );
            }

            if (data.rfc) {
                const clienteRFC = await this.repoData.obtenerClientePorRFC(data.rfc, sucursalId);
                if (clienteRFC && clienteRFC.cliente_uuid !== cliente_uuid) {
                    throw new ConflictException(`Ya existe un cliente con RFC '${data.rfc}'`);
                }
            }

            const updateObj = this.bo.armarUpdateCliente(data, usuario.usuario_id);
            return await this.repoAction.actualizarCliente(cliente.cliente_id, updateObj);
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof UnprocessableEntityException
            ) throw error;

            this.logger.error('actualizarCliente', error);
            throw new DatabaseQueryException('Error al actualizar cliente');
        }
    }

    async cambiarStatusCliente(
        cliente_uuid: string,
        status: string,
        sucursalId: number,
        usuario: any,
    ) {
        try {
            const cliente = await this.repoData.obtenerClientePorUUID(cliente_uuid, sucursalId);
            if (!cliente) {
                throw new NotFoundException(`Cliente '${cliente_uuid}' no encontrado`);
            }

            if (cliente.status === 'eliminado') {
                throw new UnprocessableEntityException('No se puede modificar un cliente eliminado');
            }

            if (cliente.status === status) {
                throw new ConflictException(`El cliente ya se encuentra en status '${status}'`);
            }

            const updateObj = this.bo.armarUpdateStatus(status, usuario.usuario_id);
            return await this.repoAction.cambiarStatusCliente(cliente.cliente_id, updateObj);
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof UnprocessableEntityException
            ) throw error;

            this.logger.error('cambiarStatusCliente', error);
            throw new DatabaseQueryException('Error al cambiar status de cliente');
        }
    }
}