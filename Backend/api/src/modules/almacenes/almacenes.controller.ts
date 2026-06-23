import {
    Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, Sucursal } from 'src/decorators/session.decorator';

import { AlmacenesService } from './almacenes.service';

import {
    CrearAlmacenDTO,
    ActualizarAlmacenDTO,
    CambiarStatusAlmacenDTO,
    FiltrosAlmacenesDTO,
} from './dto/almacenes.dto';

@ApiTags('Almacenes')
@ApiBearerAuth()
@Controller('almacenes')
export class AlmacenesController {
    constructor(private readonly service: AlmacenesService) { }

    // ── Listar ───────────────────────────────────────────────────────────────
    @Get()
    @ApiOperation({ summary: 'Listar almacenes de la sucursal activa' })
    async obtenerAlmacenes(
        @Query() filtros: FiltrosAlmacenesDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.service.obtenerAlmacenes(filtros, sucursalId);
    }

    // ── Detalle ──────────────────────────────────────────────────────────────
    @Get(':uuid')
    @ApiOperation({ summary: 'Obtener detalle de un almacén' })
    async obtenerAlmacen(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.service.obtenerAlmacen(uuid, sucursalId);
    }

    // ── Crear ────────────────────────────────────────────────────────────────
    @Post()
    @ApiOperation({ summary: 'Crear un almacén en la sucursal activa' })
    async crearAlmacen(
        @Body() dto: CrearAlmacenDTO,
        @User() usuario: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.service.crearAlmacen(dto, sucursalId, usuario);
    }

    // ── Actualizar ───────────────────────────────────────────────────────────
    @Patch(':uuid')
    @ApiOperation({ summary: 'Actualizar datos de un almacén' })
    async actualizarAlmacen(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: ActualizarAlmacenDTO,
        @User() usuario: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.service.actualizarAlmacen(uuid, dto, sucursalId, usuario);
    }

    // ── Cambiar status ───────────────────────────────────────────────────────
    @Patch(':uuid/status')
    @ApiOperation({ summary: 'Cambiar status del almacén (activo | inactivo | eliminado)' })
    async cambiarStatus(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: CambiarStatusAlmacenDTO,
        @User() usuario: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.service.cambiarStatus(uuid, dto.status, sucursalId, usuario);
    }
}