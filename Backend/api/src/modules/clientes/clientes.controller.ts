import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import {
    CrearClienteDTO,
    ActualizarClienteDTO,
    CambiarStatusClienteDTO,
    FiltrosClienteDTO,
} from './dto/clientes.dto';
import { Sucursal, User } from 'src/decorators/session.decorator';

@ApiTags('Clientes')
@ApiBearerAuth()
@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) { }

    @Get()
    @ApiOperation({ summary: 'Listar clientes de la sucursal activa' })
    async obtenerClientes(
        @Query() filtros: FiltrosClienteDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        const { clientes, total } = await this.clientesService.obtenerClientes(filtros, sucursalId);

        return {
            data: { clientes },
            meta: {
                total,
                page: filtros.page ?? 1,
                limit: filtros.limit ?? 20,
                total_paginas: Math.ceil(total / (filtros.limit ?? 20)),
            },
        };
    }

    @Get(':cliente_uuid')
    @ApiOperation({ summary: 'Obtener detalle de un cliente' })
    async obtenerClientePorUUID(
        @Param('cliente_uuid', ParseUUIDPipe) cliente_uuid: string,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        const cliente = await this.clientesService.obtenerClientePorUUID(cliente_uuid, sucursalId);
        return { cliente };
    }

    @Post()
    @ApiOperation({ summary: 'Crear cliente' })
    async crearCliente(
        @Body() body: CrearClienteDTO,
        @Sucursal('sucursal_id') sucursalId: number,
        @User() user: any,
    ) {
        const cliente = await this.clientesService.crearCliente(body, sucursalId, user);
        return { cliente };
    }

    @Put(':cliente_uuid')
    @ApiOperation({ summary: 'Actualizar cliente' })
    async actualizarCliente(
        @Param('cliente_uuid', ParseUUIDPipe) cliente_uuid: string,
        @Body() body: ActualizarClienteDTO,
        @Sucursal('sucursal_id') sucursalId: number,
        @User() user: any,
    ) {
        const cliente = await this.clientesService.actualizarCliente(
            cliente_uuid,
            body,
            sucursalId,
            user,
        );
        return { cliente };
    }

    @Patch(':cliente_uuid/status')
    @ApiOperation({ summary: 'Cambiar status de cliente' })
    async cambiarStatus(
        @Param('cliente_uuid', ParseUUIDPipe) cliente_uuid: string,
        @Body() body: CambiarStatusClienteDTO,
        @Sucursal('sucursal_id') sucursalId: number,
        @User() user: any,
    ) {
        const cliente = await this.clientesService.cambiarStatusCliente(
            cliente_uuid,
            body.status,
            sucursalId,
            user,
        );
        return { cliente };
    }
}