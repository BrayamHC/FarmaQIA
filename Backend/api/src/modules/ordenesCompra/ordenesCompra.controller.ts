import {
    Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdenesCompraService } from './ordenesCompra.service';
import { OrdenesCompraCoordinator } from './ordenesCompra.coordinator';
import {
    ActualizarOrdenCompraDTO, AutorizarOrdenCompraDTO, CancelarOrdenCompraDTO, CrearOrdenCompraDTO, FiltrosOrdenCompraDTO,
} from './dto/ordenesCompra.dto';
import { Sucursal, User } from 'src/decorators/session.decorator';

@ApiTags('Órdenes de Compra')
@ApiBearerAuth()
@Controller('ordenes-compra')
export class OrdenesCompraController {
    constructor(
        private readonly ordenesCompraService: OrdenesCompraService,
        private readonly ordenesCompraCoordinator: OrdenesCompraCoordinator,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Listar órdenes de compra con filtros' })
    async obtenerOrdenesCompra(
        @Query() filtros: FiltrosOrdenCompraDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.ordenesCompraService.obtenerOrdenesCompra(filtros, sucursalId);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Obtener detalle de una orden de compra con sus partidas' })
    async obtenerOrdenCompra(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.ordenesCompraService.obtenerOrdenCompra(uuid, sucursalId);
    }

    @Post()
    @ApiOperation({ summary: 'Crear orden de compra con partidas' })
    async crearOrdenCompra(
        @Body() body: CrearOrdenCompraDTO,
        @User() user: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.ordenesCompraCoordinator.crearOrdenCompra(body, user, sucursalId);
    }

    @Patch(':uuid')
    @ApiOperation({ summary: 'Actualizar encabezado de la orden de compra' })
    async actualizarOrdenCompra(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() body: ActualizarOrdenCompraDTO,
        @User() user: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.ordenesCompraCoordinator.actualizarOrdenCompra(uuid, body, user, sucursalId);
    }

    @Patch(':uuid/autorizar')
    @ApiOperation({ summary: 'Autorizar o rechazar orden de compra' })
    async autorizarOrdenCompra(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() body: AutorizarOrdenCompraDTO,
        @User() user: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.ordenesCompraCoordinator.autorizarOrdenCompra(uuid, body, user, sucursalId);
    }

    @Patch(':uuid/cancelar')
    @ApiOperation({ summary: 'Cancelar orden de compra' })
    async cancelarOrdenCompra(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() body: CancelarOrdenCompraDTO,
        @User() user: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.ordenesCompraCoordinator.cancelarOrdenCompra(uuid, body, user, sucursalId);
    }
}