import { Controller, Get, Post, Patch, Body, Query, Param, ParseUUIDPipe, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { User, Sucursal } from 'src/decorators/session.decorator';
import { ProductosService } from './productos.service';

import {
    CrearProductoDTO,
    ActualizarProductoDTO,
    CambiarStatusProductoDTO,
    FiltrosProductosDTO,
    ProductoResponseDTO,
    ProductosListaResponseDTO,
    CrearProductoResponseDTO,
    AltaLoteStockResponseDTO,
    AltaLoteStockDTO,
} from './dto/productos.dto';
import { ProductosCoordinator } from './productos.coordinator';

@ApiTags('Productos')
@ApiBearerAuth()
@Controller('productos')
export class ProductosController {
    constructor(
        private readonly coordinator: ProductosCoordinator,
        private readonly service: ProductosService,
    ) { }

    // ── Listar ──────────────────────────────────────────────────────────────
    @Get()
    @ApiOperation({ summary: 'Obtener lista de productos' })
    async obtenerProductos(
        @Query() filtros: FiltrosProductosDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<ProductosListaResponseDTO> {
        return this.service.obtenerProductos(filtros, sucursalId);
    }

    // ── Detalle ──────────────────────────────────────────────────────────────
    @Get(':uuid')
    @ApiOperation({ summary: 'Obtener un producto por UUID' })
    async obtenerProducto(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<ProductoResponseDTO> {
        return this.service.obtenerProductoPorUUID(uuid, sucursalId);
    }

    // ── Crear ────────────────────────────────────────────────────────────────
    @Post()
    @ApiOperation({ summary: 'Crear un nuevo producto' })
    @ZodSerializerDto(CrearProductoResponseDTO)
    async crearProducto(
        @Body() dto: CrearProductoDTO,
        @User() usuario: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<CrearProductoResponseDTO> {
        return this.coordinator.crearProducto(dto, usuario, sucursalId);
    }

    // ── Actualizar ───────────────────────────────────────────────────────────
    @Patch(':uuid')
    @ApiOperation({ summary: 'Actualizar un producto' })
    async actualizarProducto(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: ActualizarProductoDTO,
        @User() usuario: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.coordinator.actualizarProducto(uuid, dto, usuario, sucursalId);
    }

    // ── Cambiar status ───────────────────────────────────────────────────────
    @Patch(':uuid/status')
    @ApiOperation({ summary: 'Cambiar el status de un producto' })
    async cambiarStatus(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: CambiarStatusProductoDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.coordinator.cambiarStatus(uuid, dto.status, sucursalId);
    }


    @Post(':uuid/lotes')
    @ApiOperation({ summary: 'Registrar un nuevo lote y sumar stock al almacén' })
    async altaLoteStock(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: AltaLoteStockDTO,
        @User() usuario: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<AltaLoteStockResponseDTO> {
        return this.coordinator.altaLoteStock(uuid, dto, usuario, sucursalId);
    }

    @Get(':uuid/lotes')
    @ApiOperation({ summary: 'Obtener los lotes de un producto' })
    async obtenerLotesProducto(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.service.obtenerLotesProducto(uuid, sucursalId);
    }
}