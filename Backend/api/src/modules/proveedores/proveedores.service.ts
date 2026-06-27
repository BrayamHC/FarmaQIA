import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ProveedoresRepoData } from './repositories/proveedores.repoData';
import { ProveedoresRepoAction } from './repositories/proveedores.repoAction';
import { ProveedorBO } from './repositories/proveedores.bo';
import {
    ActualizarProveedorDTO,
    CrearProveedorDTO,
    FiltrosProveedoresDTO,
} from './dto/proveedores.dto';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class ProveedoresService {
    private readonly logger = new Logger(ProveedoresService.name);

    constructor(
        private readonly repoData: ProveedoresRepoData,
        private readonly repoAction: ProveedoresRepoAction,
        private readonly proveedorBO: ProveedorBO,
    ) { }

    async obtenerProveedores(filtros: FiltrosProveedoresDTO) {
        try {
            return await this.repoData.obtenerProveedores(filtros);
        } catch (error) {
            this.logger.error('obtenerProveedores', error);
            throw new DatabaseQueryException('Error al obtener proveedores');
        }
    }

    async obtenerProveedorPorUUID(uuid: string) {
        try {
            const proveedor = await this.repoData.obtenerProveedorPorUUID(uuid);
            if (!proveedor) {
                throw new NotFoundException(`Proveedor '${uuid}' no encontrado`);
            }
            return proveedor;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error('obtenerProveedorPorUUID', error);
            throw new DatabaseQueryException('Error al obtener proveedor');
        }
    }

    async obtenerProveedorPorRFC(rfc: string) {
        return this.repoData.obtenerProveedorPorRFC(rfc);
    }

    // ── Crear ─────────────────────────────────────────────────────────────────
    async crearProveedor(data: CrearProveedorDTO, user: any) {
        try {
            if (data.rfc) {
                const existeProveedor = await this.obtenerProveedorPorRFC(data.rfc);

                if (existeProveedor) {
                    throw new ConflictException(
                        `El proveedor con RFC '${data.rfc}' ya existe`,
                    );
                }
            }

            const proveedorData = this.proveedorBO.armarInsertProveedor(
                data,
                user.usuario_id,
            );

            const proveedorUUID = await this.repoAction.insertarProveedor(proveedorData);

            return {
                meta: {
                    message: 'Proveedor creado correctamente',
                },
            };

        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }

            this.logger.error('crearProveedor', error);

            throw new DatabaseQueryException(
                'Error al crear proveedor',
            );
        }
    }

    async actualizarProveedor(uuid: string, data: ActualizarProveedorDTO, user: any) {
        try {
            const proveedorActual = await this.obtenerProveedorPorUUID(uuid);

            if (proveedorActual.status === 'eliminado') {
                throw new UnprocessableEntityException(
                    'No se puede modificar un proveedor eliminado',
                );
            }

            if (data.rfc) {
                const proveedorRFC = await this.obtenerProveedorPorRFC(data.rfc);
                if (proveedorRFC && proveedorRFC.proveedor_uuid !== uuid) {
                    throw new ConflictException(`El proveedor con RFC '${data.rfc}' ya existe`);
                }
            }

            const updateObj = this.proveedorBO.armarUpdateProveedor(data, user);
            return await this.repoAction.actualizarProveedor(uuid, updateObj);
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof UnprocessableEntityException
            ) throw error;

            this.logger.error('actualizarProveedor', error);
            throw new DatabaseQueryException('Error al actualizar proveedor');
        }
    }

    async cambiarStatusProveedor(uuid: string, nuevoStatus: string, user: any) {
        try {
            const proveedor = await this.obtenerProveedorPorUUID(uuid);

            if (proveedor.status === 'eliminado') {
                throw new UnprocessableEntityException(
                    'No se puede modificar un proveedor eliminado',
                );
            }

            if (proveedor.status === nuevoStatus) {
                throw new ConflictException(
                    `El proveedor ya se encuentra en status '${nuevoStatus}'`,
                );
            }

            if (nuevoStatus === 'activo' && proveedor.status !== 'inactivo') {
                throw new UnprocessableEntityException(
                    'Solo se puede activar un proveedor inactivo',
                );
            }

            const data = {
                status: nuevoStatus,
                usuario_actualizacion: user.usuario_id,
                fecha_actualizacion: new Date(),
            };

            return await this.repoAction.cambiarStatusProveedor(uuid, data);
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof UnprocessableEntityException
            ) throw error;

            this.logger.error('cambiarStatusProveedor', error);
            throw new DatabaseQueryException('Error al cambiar status del proveedor');
        }
    }
}