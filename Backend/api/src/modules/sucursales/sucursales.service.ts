import {
    Injectable, Logger, NotFoundException, ConflictException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { SucursalesRepoData } from './repositories/sucursales.repoData';
import { SucursalesRepoAction } from './repositories/sucursales.repoAction';
import { SucursalesBO } from './repositories/sucursales.bo';
import {
    CrearSucursalDTO,
    ActualizarSucursalDTO,
    FiltrosSucursalesDTO,
} from './dto/sucursales.dto';

@Injectable()
export class SucursalesService {
    private readonly logger = new Logger(SucursalesService.name);

    constructor(
        private readonly repoData: SucursalesRepoData,
        private readonly repoAction: SucursalesRepoAction,
        private readonly bo: SucursalesBO,
    ) { }

    // ── Lecturas ─────────────────────────────────────────────────────────────
    async obtenerSucursales(filtros: FiltrosSucursalesDTO) {
        return this.repoData.obtenerSucursales(filtros);
    }

    async obtenerSucursalPorUUID(uuid: string) {
        const sucursal = await this.repoData.obtenerPorUUID(uuid);
        if (!sucursal) throw new NotFoundException(`Sucursal '${uuid}' no encontrada`);
        return { sucursal };
    }

    async existePorNombre(nombre: string): Promise<boolean> {
        const existe = await this.repoData.obtenerPorNombre(nombre);
        return !!existe;
    }

    // ── Escrituras ────────────────────────────────────────────────────────────
    async crearSucursal(dto: CrearSucursalDTO, usuario: any) {
        const datos = this.bo.prepararNuevaSucursal(dto, usuario);
        return this.repoAction.insertarSucursal(datos);
    }

    async actualizarSucursal(uuid: string, dto: ActualizarSucursalDTO, usuario: any) {
        const existe = await this.repoData.obtenerPorUUID(uuid);
        if (!existe) throw new NotFoundException(`Sucursal '${uuid}' no encontrada`);

        if (existe.status === 'eliminado') {
            throw new UnprocessableEntityException(
                `La sucursal '${existe.nombre}' está eliminada y no puede modificarse`,
            );
        }

        const datos = this.bo.prepararActualizarSucursal(dto, usuario);
        const sucursalActualizada = await this.repoAction.actualizarSucursal(uuid, datos);

        return {
            meta: { message: 'Sucursal actualizada correctamente' },
            sucursal: sucursalActualizada,
        };
    }

    async cambiarStatus(uuid: string, nuevoStatus: string, usuario: any) {
        const existe = await this.repoData.obtenerPorUUID(uuid);
        if (!existe) throw new NotFoundException(`Sucursal '${uuid}' no encontrada`);

        if (existe.status === 'eliminado') {
            throw new UnprocessableEntityException(
                `La sucursal '${existe.nombre}' ya está eliminada y no puede modificarse`,
            );
        }

        if (existe.status === nuevoStatus) {
            throw new ConflictException(
                `La sucursal ya se encuentra en status '${nuevoStatus}'`,
            );
        }

        const sucursalActualizada = await this.repoAction.cambiarStatus(uuid, nuevoStatus, usuario);

        return {
            meta: { message: `Sucursal marcada como '${nuevoStatus}' correctamente` },
            sucursal: sucursalActualizada,
        };
    }
}