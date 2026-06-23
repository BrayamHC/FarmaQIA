import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrdenesCompraRepoData } from './repositories/ordenesCompra.repoData';
import { OrdenesCompraRepoAction } from './repositories/ordenesCompra.repoAction';
import { OrdenesCompraBo } from './repositories/ordenesCompra.bo';
import {
    ActualizarOrdenCompraDTO,
    AutorizarOrdenCompraDTO,
    CancelarOrdenCompraDTO,
} from './dto/ordenesCompra.dto';
import { FiltrosOrdenCompra } from './dto/ordenesCompra.validator';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class OrdenesCompraService {
    private readonly logger = new Logger(OrdenesCompraService.name);

    constructor(
        private readonly repoData: OrdenesCompraRepoData,
        private readonly repoAction: OrdenesCompraRepoAction,
        private readonly ordenesCompraBo: OrdenesCompraBo,
    ) { }

    async obtenerOrdenesCompra(filtros: FiltrosOrdenCompra, sucursalId: number) {
        try {
            const resultado = await this.repoData.obtenerOrdenesCompra(
                { ...filtros, sucursal_id: sucursalId } as any,
            );

            return {
                meta: {
                    total: resultado.total,
                    page: resultado.page,
                    limit: resultado.limit,
                    pages: Math.ceil(resultado.total / resultado.limit),
                },
                ordenes: resultado.data,
            };
        } catch (error) {
            this.logger.error('obtenerOrdenesCompra', error);
            throw new DatabaseQueryException('Error al obtener órdenes de compra');
        }
    }

    async obtenerOrdenCompra(uuid: string, sucursalId: number) {
        try {
            const orden = await this.repoData.obtenerOrdenCompra(uuid, sucursalId);
            if (!orden) throw new NotFoundException(`Orden de compra ${uuid} no encontrada`);
            return { orden };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error('obtenerOrdenCompra', error);
            throw new DatabaseQueryException('Error al obtener la orden de compra');
        }
    }

    async obtenerOrdenCompraRaw(uuid: string, sucursalId: number) {
        return this.repoData.obtenerOrdenCompraCabecera(uuid, sucursalId);
    }

    async crearOrden(
        resolvedData: {
            sucursal_id: number;
            almacen_id: number;
            proveedor_id: number;
            serie_id: number | null;
            body: any;
            partidas: any[];
        },
        user: any,
    ) {
        try {
            const totales = this.ordenesCompraBo.calcularTotales(resolvedData.partidas);
            const ordenObj = this.ordenesCompraBo.construirOrden(
                { ...resolvedData, ...totales },
                user,
            );
            const partidasObj = resolvedData.partidas.map((p) =>
                this.ordenesCompraBo.construirPartida(p, user),
            );

            return await this.repoAction.crearOrdenCompleta(ordenObj, partidasObj);
        } catch (error) {
            this.logger.error('crearOrden', error);
            throw new DatabaseQueryException('Error al crear la orden de compra');
        }
    }

    async actualizarOrdenCompra(uuid: string, body: ActualizarOrdenCompraDTO, user: any) {
        try {
            const updateObj = this.ordenesCompraBo.construirUpdateOrden(body, user);
            return await this.repoAction.actualizarOrdenCompra(uuid, updateObj);
        } catch (error) {
            this.logger.error('actualizarOrdenCompra', error);
            throw new DatabaseQueryException('Error al actualizar la orden de compra');
        }
    }

    async autorizarOrdenCompra(uuid: string, body: AutorizarOrdenCompraDTO, user: any) {
        try {
            const updateObj = this.ordenesCompraBo.construirAutorizacion(body, user);
            return await this.repoAction.actualizarOrdenCompra(uuid, updateObj);
        } catch (error) {
            this.logger.error('autorizarOrdenCompra', error);
            throw new DatabaseQueryException('Error al autorizar/rechazar la orden');
        }
    }

    async cancelarOrdenCompra(uuid: string, body: CancelarOrdenCompraDTO, user: any) {
        try {
            const updateObj = this.ordenesCompraBo.construirCancelacion(body, user);
            return await this.repoAction.actualizarOrdenCompra(uuid, updateObj);
        } catch (error) {
            this.logger.error('cancelarOrdenCompra', error);
            throw new DatabaseQueryException('Error al cancelar la orden');
        }
    }
}