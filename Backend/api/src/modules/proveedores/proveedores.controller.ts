import {
    Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProveedoresService } from './proveedores.service';
import {
    ActualizarProveedorDTO, CambiarStatusProveedorDTO, CrearProveedorDTO, FiltrosProveedoresDTO,
} from './dto/proveedores.dto';
import { User } from 'src/decorators/session.decorator';

@ApiTags('Proveedores')
@ApiBearerAuth()
@Controller('proveedores')
export class ProveedoresController {
    constructor(private readonly proveedoresService: ProveedoresService) { }

    @Get()
    @ApiOperation({ summary: 'Listar proveedores' })
    async obtenerProveedores(@Query() filtros: FiltrosProveedoresDTO) {
        const { proveedores, total } = await this.proveedoresService.obtenerProveedores(filtros);

        return {
            data: { proveedores },
            meta: {
                total,
                page: filtros.page ?? 1,
                limit: filtros.limit ?? 20,
                total_paginas: Math.ceil(total / (filtros.limit ?? 20)),
            },
        };
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Obtener detalle de un proveedor' })
    async obtenerProveedorPorUUID(@Param('uuid', ParseUUIDPipe) uuid: string) {
        const proveedor = await this.proveedoresService.obtenerProveedorPorUUID(uuid);
        return { proveedor };
    }

    @Post()
    @ApiOperation({ summary: 'Crear proveedor' })
    async crearProveedor(
        @Body() body: CrearProveedorDTO,
        @User() user: any,
    ) {
        const proveedor = await this.proveedoresService.crearProveedor(body, user);
        return { proveedor };
    }

    @Put(':uuid')
    @ApiOperation({ summary: 'Actualizar proveedor' })
    async actualizarProveedor(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() body: ActualizarProveedorDTO,
        @User() user: any,
    ) {
        const proveedor = await this.proveedoresService.actualizarProveedor(uuid, body, user);
        return { proveedor };
    }

    @Patch(':uuid/status')
    @ApiOperation({ summary: 'Cambiar status de proveedor' })
    async cambiarStatus(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() body: CambiarStatusProveedorDTO,
        @User() user: any,
    ) {
        const proveedor = await this.proveedoresService.cambiarStatusProveedor(
            uuid,
            body.status,
            user,
        );
        return { proveedor };
    }
}