import {
    Injectable, Logger, NotFoundException, ConflictException, UnprocessableEntityException,
} from '@nestjs/common';
import { AlmacenesRepoData } from './repositories/almacenes.repoData';
import { AlmacenesRepoAction } from './repositories/almacenes.repoAction';
import { AlmacenesBO } from './repositories/almacenes.bo';

import {
    CrearAlmacenDTO,
    ActualizarAlmacenDTO,
    FiltrosAlmacenesDTO,
} from './dto/almacenes.dto';

@Injectable()
export class AlmacenesService {
    private readonly logger = new Logger(AlmacenesService.name);

    constructor(
        private readonly repoData: AlmacenesRepoData,
        private readonly repoAction: AlmacenesRepoAction,
        private readonly bo: AlmacenesBO,
    ) { }

    // ── Lecturas ─────────────────────────────────────────────────────────────
    async obtenerAlmacenes(filtros: FiltrosAlmacenesDTO, sucursalId: number) {
        const { page = 1, limit = 20 } = filtros;
        const almacenes = await this.repoData.obtenerAlmacenes(filtros, sucursalId);
        return { almacenes, page, limit };
    }

    async obtenerAlmacen(uuid: string, sucursalId: number) {
        const almacen = await this.repoData.obtenerPorUUID(uuid, sucursalId);
        if (!almacen) {
            throw new NotFoundException(`Almacén '${uuid}' no encontrado en esta sucursal`);
        }
        return { almacen };
    }

    // ── Crear ─────────────────────────────────────────────────────────────────
    async crearAlmacen(dto: CrearAlmacenDTO, sucursalId: number, usuario: any) {
        // Unicidad de nombre dentro de la sucursal
        const duplicado = await this.repoData.obtenerPorNombre(dto.nombre, sucursalId);
        if (duplicado) {
            throw new ConflictException(
                `Ya existe un almacén con el nombre '${dto.nombre}' en esta sucursal`,
            );
        }

        const datos = this.bo.prepararNuevoAlmacen(dto, sucursalId, usuario);
        const almacenUUID = await this.repoAction.insertarAlmacen(datos);
        const { almacen } = await this.obtenerAlmacen(almacenUUID, sucursalId);

        return {
            meta: { message: 'Almacén creado correctamente' },
            almacen,
        };
    }

    // ── Actualizar ────────────────────────────────────────────────────────────
    async actualizarAlmacen(
        uuid: string,
        dto: ActualizarAlmacenDTO,
        sucursalId: number,
        usuario: any,
    ) {
        const { almacen } = await this.obtenerAlmacen(uuid, sucursalId);

        if (almacen.status !== 'activo') {
            throw new UnprocessableEntityException(
                `No se puede modificar un almacén que no está activo`,
            );
        }

        const datos = this.bo.prepararActualizarAlmacen(dto, usuario);
        const almacenUUID = await this.repoAction.actualizarAlmacen(almacen.almacen_id, datos);
        const { almacen: almacenActualizado } = await this.obtenerAlmacen(almacenUUID, sucursalId);

        return {
            meta: { message: 'Almacén actualizado correctamente' },
            almacen: almacenActualizado,
        };
    }

    // ── Cambiar Status ────────────────────────────────────────────────────────
    async cambiarStatus(
        uuid: string,
        nuevoStatus: string,
        sucursalId: number,
        usuario: any,
    ) {
        const { almacen } = await this.obtenerAlmacen(uuid, sucursalId);

        if (almacen.status === 'eliminado') {
            throw new UnprocessableEntityException(
                `El almacén '${almacen.nombre}' está eliminado y no puede modificarse`,
            );
        }
        if (almacen.status === nuevoStatus) {
            throw new ConflictException(
                `El almacén ya se encuentra en status '${nuevoStatus}'`,
            );
        }
        if (nuevoStatus === 'activo' && almacen.status !== 'inactivo') {
            throw new UnprocessableEntityException(
                `Solo se puede activar un almacén inactivo`,
            );
        }

        const datos = {
            status: nuevoStatus,
            usuario_actualizacion: usuario.usuario_id,
            fecha_actualizacion: new Date(),
        };

        const almacenUUID = await this.repoAction.actualizarAlmacen(almacen.almacen_id, datos);
        const { almacen: almacenActualizado } = await this.obtenerAlmacen(almacenUUID, sucursalId);

        const mensajes: Record<string, string> = {
            activo: 'activado',
            inactivo: 'desactivado',
            eliminado: 'eliminado',
        };

        return {
            meta: { message: `Almacén ${mensajes[nuevoStatus] ?? 'actualizado'} correctamente` },
            almacen: almacenActualizado,
        };
    }
}