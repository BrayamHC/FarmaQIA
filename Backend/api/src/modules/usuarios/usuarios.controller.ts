// import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, ParseUUIDPipe, ParseIntPipe, Put, Delete, Patch } from '@nestjs/common';
// import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { RequireTenantSessionGuard } from 'src/guards/require-tenant-session.guard';
// import { UsuariosService } from './usuarios.service';
// import { CrearUsuarioDTO, FiltrosUsuariosDTO, AsignarSucursalesDTO, AgregarOverridesDTO, ReemplazarOverridesDTO, EditarUsuarioDTO, EditarUsuarioResponseDTO, UserDetailsResponseDTO } from './dto/usuarios.dto';
// import { UsuariosCoordinator } from './usuarios.coordinator';
// import { User } from 'src/decorators/session.decorator';
// import { ZodSerializerDto } from 'nestjs-zod';
// import { RequierePermiso } from 'src/decorators/permiso.decorator';
// @ApiTags('Usuarios')
// @ApiBearerAuth()
// @UseGuards(RequireTenantSessionGuard)
// @Controller('usuarios')
// export class UsuariosController {
//     constructor(private readonly usuariosService: UsuariosService,
//         private readonly usuariosCoordinator: UsuariosCoordinator
//     ) { }

//     @Get()
//     @RequierePermiso('deltaerp.usuarios.ver')
//     @ApiOperation({ summary: 'Listar usuarios' })
//     async obtenerUsuarios(@Query() filtros: FiltrosUsuariosDTO, @Req() req: any) {
//         const usuarios = await this.usuariosService.obtenerUsuarios(filtros);
//         const roles = await this.usuariosService.obtenerRoles(filtros);
//         return { usuarios, roles }
//     }

//     @Get(':uuid')
//     @RequierePermiso('deltaerp.usuarios.ver')
//     @ZodSerializerDto(UserDetailsResponseDTO)
//     @ApiOperation({ summary: 'Obtener detalle de un usuario' })
//     async obtenerUsuario(@Param('uuid', ParseUUIDPipe) uuid: string, @Req() req: any) {
//         return this.usuariosService.obtenerUsuario(uuid);
//     }

//     @Post()
//     @RequierePermiso('deltaerp.usuarios.crear')
//     @ApiOperation({ summary: 'Crear usuario' })
//     async crearUsuario(@Body() crearUsuarioDTO: CrearUsuarioDTO, @Req() req: any) {
//         return this.usuariosCoordinator.crearUsuario(crearUsuarioDTO, req.user);
//     }

//     @Post(':uuid/sucursales')
//     @RequierePermiso('deltaerp.usuarios.crear')
//     @ApiOperation({ summary: 'Asignar sucursales a un usuario' })
//     async asignarSucursales(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() asignarSucursalesDTO: AsignarSucursalesDTO, @Req() req: any,
//     ) {
//         return this.usuariosService.asignarSucursalesManual(uuid, asignarSucursalesDTO.sucursal_uuids);
//     }

//     @Get(':uuid/permisos')
//     @RequierePermiso('deltaerp.usuarios.ver')
//     @ApiOperation({ summary: 'Permisos efectivos del usuario (rol + overrides)' })
//     async obtenerPermisosEfectivos(@Param('uuid', ParseUUIDPipe) uuid: string) {
//         return this.usuariosService.obtenerPermisosEfectivos(uuid);
//     }

//     @Post(':uuid/permisos')
//     @RequierePermiso('deltaerp.usuarios.editar')
//     @ApiOperation({ summary: 'Agregar overrides individuales sin tocar los existentes' })
//     async agregarOverrides(
//         @Param('uuid', ParseUUIDPipe) uuid: string,
//         @Body() dto: AgregarOverridesDTO,
//         @Req() req: any,
//     ) {
//         return this.usuariosService.agregarOverrides(uuid, dto, req.despacho.despacho_id);
//     }

//     @Patch(':uuid')
//     @ZodSerializerDto(EditarUsuarioResponseDTO)
//     @RequierePermiso('deltaerp.usuarios.editar')
//     @ApiOperation({ summary: 'Editar usuarios' })
//     async editarUsuario(
//         @Param('uuid', ParseUUIDPipe) usuarioUuid: string,
//         @Body() dto: EditarUsuarioDTO,
//         @User() userEdicion: any
//     ) {
//         return this.usuariosCoordinator.editarUsuario(dto, userEdicion, usuarioUuid);
//     }

//     @Delete(':uuid/permisos/:permisoId')
//     @RequierePermiso('deltaerp.usuarios.editar')
//     @ApiOperation({ summary: 'Quitar un override individual por permiso_id' })
//     async quitarOverride(
//         @Param('uuid', ParseUUIDPipe) uuid: string,
//         @Param('permisoId', ParseIntPipe) permisoId: number,
//         @Req() req: any,
//     ) {
//         return this.usuariosService.quitarOverride(uuid, permisoId, req.despacho.despacho_id);
//     }

//     @Put(':uuid/permisos')
//     @RequierePermiso('deltaerp.usuarios.editar')
//     @ApiOperation({ summary: 'Reemplazar TODOS los overrides del usuario de una sola vez' })
//     async reemplazarOverrides(
//         @Param('uuid', ParseUUIDPipe) uuid: string,
//         @Body() dto: ReemplazarOverridesDTO,
//         @Req() req: any,
//     ) {
//         return this.usuariosService.reemplazarOverrides(uuid, dto, req.despacho.despacho_id);
//     }
// }
