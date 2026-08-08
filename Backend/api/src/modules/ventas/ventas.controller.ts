// src/modules/ventas/ventas.controller.ts
import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, Sucursal } from 'src/decorators/session.decorator';

import { VentasCoordinator } from './ventas.coordinator';
import { VentasService } from './ventas.service';
import { CrearVentaDto, FiltrosVentasDTO } from './dto/ventas.validator';

@ApiTags('Ventas')
@ApiBearerAuth()
@Controller('ventas')
export class VentasController {
    constructor(
        private readonly ventasCoordinator: VentasCoordinator,
        private readonly service: VentasService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Obtener lista de ventas' })
    async obtenerVentas(
        @Query() filtros: FiltrosVentasDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.service.obtenerVentas(filtros, sucursalId);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Obtener una venta por UUID' })
    async obtenerVenta(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.service.obtenerVentaPorUUID(uuid, sucursalId);
    }

    @Post()
    @ApiOperation({ summary: 'Crear una venta en la sucursal activa' })
    async crearVenta(
        @Body() data: CrearVentaDto,
        @User() usuario: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        await this.ventasCoordinator.crearVenta(data, sucursalId, usuario);
        return { success: true, message: 'Venta registrada exitosamente' };
    }

    @Post(':uuid/cancelar')
    @ApiOperation({ summary: 'Cancelar una venta (devolución) — revierte stock y lotes' })
    async cancelarVenta(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @User() usuario: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        await this.ventasCoordinator.cancelarVenta(uuid, sucursalId, usuario);
        return { success: true, message: 'Venta cancelada exitosamente' };
    }
}