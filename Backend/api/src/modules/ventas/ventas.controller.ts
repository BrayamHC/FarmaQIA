// src/modules/ventas/ventas.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, Sucursal } from 'src/decorators/session.decorator';

import { VentasCoordinator } from './ventas.coordinator';
import { CrearVentaDto } from './dto/ventas.validator';

@ApiTags('Ventas')
@ApiBearerAuth()
@Controller('ventas')
export class VentasController {
    constructor(private readonly ventasCoordinator: VentasCoordinator) { }

    @Post()
    @ApiOperation({ summary: 'Crear una venta en la sucursal activa' })
    async crearVenta(
        @Body() data: CrearVentaDto,
        @User() usuario: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.ventasCoordinator.crearVenta(data, sucursalId, usuario);
    }
}