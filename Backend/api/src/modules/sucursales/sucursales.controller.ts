import {
    Controller, Get, Post, Patch, Body, Param, Query, Req, ParseUUIDPipe, UseGuards, ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/decorators/session.decorator';
import { SucursalesService } from './sucursales.service';
import { AuthService } from '../auth/auth.service';

import {
    CrearSucursalDTO,
    ActualizarSucursalDTO,
    CambiarStatusSucursalDTO,
    SeleccionarSucursalDTO,
    FiltrosSucursalesDTO,
} from './dto/sucursales.dto';
import { SucursalesCoordinator } from './sucursales.coordinator';

@ApiTags('Sucursales')
@ApiBearerAuth()
@Controller('sucursales')
export class SucursalesController {
    constructor(
        private readonly coordinator: SucursalesCoordinator,
        private readonly service: SucursalesService,
        private readonly authService: AuthService,
    ) { }

    // ── Listar ───────────────────────────────────────────────────────────────
    @Get()
    @ApiOperation({ summary: 'Listar sucursales' })
    async obtenerSucursales(@Query() filtros: FiltrosSucursalesDTO) {
        return this.service.obtenerSucursales(filtros);
    }

    // ── Detalle ──────────────────────────────────────────────────────────────
    @Get(':uuid')
    @ApiOperation({ summary: 'Obtener detalle de una sucursal' })
    async obtenerSucursal(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.service.obtenerSucursalPorUUID(uuid);
    }

    // ── Crear ────────────────────────────────────────────────────────────────
    @Post()
    @ApiOperation({ summary: 'Crear una nueva sucursal' })
    async crearSucursal(
        @Body() dto: CrearSucursalDTO,
        @User() usuario: any,
        @Req() req: any,
    ) {
        return this.coordinator.crearSucursal(dto, usuario, req.token);
    }

    // ── Actualizar ───────────────────────────────────────────────────────────
    @Patch(':uuid')
    @ApiOperation({ summary: 'Actualizar datos de una sucursal' })
    async actualizarSucursal(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: ActualizarSucursalDTO,
        @User() usuario: any,
    ) {
        return this.service.actualizarSucursal(uuid, dto, usuario);
    }

    // ── Cambiar status ───────────────────────────────────────────────────────
    @Patch(':uuid/status')
    @ApiOperation({ summary: 'Cambiar status de una sucursal (activo | inactivo | eliminado)' })
    async cambiarStatus(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: CambiarStatusSucursalDTO,
        @User() usuario: any,
    ) {
        return this.service.cambiarStatus(uuid, dto.status, usuario);
    }

    // ── Seleccionar sucursal en sesión ────────────────────────────────────────
    // Este endpoint NO requiere sucursal previa en sesión:
    // el usuario la está eligiendo aquí por primera vez.
    @Post('seleccionar-sucursal')
    @ApiOperation({ summary: 'Establecer la sucursal activa para la sesión actual' })
    async seleccionarSucursal(
        @Body() dto: SeleccionarSucursalDTO,
        @Req() req: any,
    ) {
        const sesion: any = req.sesion;

        // Validar que la sucursal esté en la lista permitida de la sesión
        const sucursal = sesion?.sucursales_permitidas?.find(
            (s: any) => s.sucursal_uuid === dto.sucursal_uuid,
        );

        if (!sucursal) {
            throw new ForbiddenException('No tienes acceso a la sucursal solicitada');
        }

        await this.authService.actualizarSucursalSeleccionada(req.token, sucursal);

        return {
            meta: { message: 'Sucursal seleccionada correctamente' },
            sucursal_seleccionada: sucursal,
        };
    }
}