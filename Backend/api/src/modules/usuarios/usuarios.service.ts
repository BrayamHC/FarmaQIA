// import { Injectable, Logger, NotFoundException } from '@nestjs/common';
// import { UsuariosRepoData } from './repositories/usuarios.repoData';
// import { UsuariosRepoAction } from './repositories/usuarios.repoAction';
// import { logSqlError } from 'src/common/utils/log-sql-error';
// import { BusinessException, DatabaseQueryException, DuplicateResourceException } from 'src/common/exceptions';
// import { FiltrosRoles, FiltrosUsuarios, AgregarOverrides, ReemplazarOverrides, EditarUsuario } from './dto/usuarios.validator'; // ← tipos agregados
// import { UsuariosBo } from './repositories/usuarios.bo';
// import { CrearUsuarioDTO } from './dto/usuarios.dto';
// import { AuthService } from 'src/auth/auth.service';
// @Injectable()
// export class UsuariosService {
//     private readonly logger = new Logger(UsuariosService.name);

//     constructor(
//         private readonly repoData: UsuariosRepoData,
//         private readonly repoAction: UsuariosRepoAction,
//         private readonly usuariosBO: UsuariosBo,
//         private readonly authService: AuthService, // ← agregar
//     ) { }


//     async obtenerUsuarios(filtros: FiltrosUsuarios) {
//         try {
//             const usuarios = await this.repoData.obtenerUsuarios(filtros);
//             return { usuarios };
//         } catch (error) {
//             logSqlError(this.logger, 'obtenerUsuarios', error);
//             throw new DatabaseQueryException('Error al obtener usuarios');
//         }
//     }

//     async obtenerUsuariosAdmin() {
//         try {
//             const usuarios = await this.repoData.obtenerUsuariosAdmin();
//             return { usuarios };
//         } catch (error) {
//             logSqlError(this.logger, 'obtenerUsuariosAdmin', error);
//             throw new DatabaseQueryException('Error al obtener usuarios');
//         }
//     }

//     async obtenerUsuario(uuid: string) {
//         try {
//             const usuario = await this.repoData.obtenerUsuarioPorUuid(uuid);
//             if (!usuario) throw new NotFoundException(`Usuario ${uuid} no encontrado`);

//             const sucursales = await this.repoData.obtenerSucursalesDeUsuario(usuario.usuario_id);

//             return { usuario: { ...usuario, sucursales } };
//         } catch (error) {
//             if (error instanceof NotFoundException) throw error;
//             logSqlError(this.logger, 'obtenerUsuario', error);
//             throw new DatabaseQueryException('Error al obtener usuario');
//         }
//     }

//     async obtenerUsuarioInternoPorUuid(uuid: string) {
//         try {
//             const usuario = await this.repoData.obtenerUsuarioPorUuid(uuid);

//             if (!usuario) {
//                 throw new NotFoundException(`Usuario ${uuid} no encontrado`);
//             }

//             return usuario;
//         } catch (error) {
//             if (error instanceof NotFoundException) throw error;
//             logSqlError(this.logger, 'obtenerUsuarioInternoPorUuid', error);
//             throw new DatabaseQueryException('Error al obtener usuario');
//         }
//     }

//     async asignarUsuariosASucursal(sucursalId: number, usuarioIds: number[]) {
//         try {
//             await this.repoAction.asignarUsuariosASucursal(sucursalId, usuarioIds);
//         } catch (error) {
//             logSqlError(this.logger, 'asignarUsuariosASucursal', error);
//             throw new DatabaseQueryException('Error al asignar usuarios a sucursal');
//         }
//     }

//     async asignarSucursalesAUsuario(usuarioId: number, sucursalIds: number[]) {
//         try {
//             await this.repoAction.asignarSucursalesAUsuario(usuarioId, sucursalIds);
//         } catch (error) {
//             logSqlError(this.logger, 'asignarSucursalesAUsuario', error);
//             throw new DatabaseQueryException('Error al asignar sucursales a usuario');
//         }
//     }

//     async crearUsuario(data: CrearUsuarioDTO, usuario: any) {
//         try {
//             const { usuarios } = await this.obtenerUsuarios({ email: data.email });
//             if (usuarios.length > 0) throw new DuplicateResourceException('usuario', 'email');

//             const rol = await this.obtenerRolPorUuid(data.rol_uuid);

//             const { rol_uuid, ...resto } = data;
//             const insert = await this.usuariosBO.armarInsertUsuario(
//                 { ...resto, rol_id: rol.rol_id },
//                 usuario,
//             );

//             const bitacora = this.usuariosBO.armarInsertBitacoraUsuario({
//                 accion: 'crear',
//                 descripcion: `Usuario '${data.email}' creado por '${usuario.nombre_completo}'`,
//                 datos_nuevos: { ...insert, password: '[REDACTED]' },
//                 usuario,
//             });

//             const usuario_uuid = await this.repoAction.crearUsuario(insert, bitacora);
//             const usuarioCreado = await this.repoData.obtenerUsuarioPorUuid(usuario_uuid);
//             return { usuarioCreado };
//         } catch (error) {
//             if (error instanceof DuplicateResourceException) throw error;
//             if (error instanceof NotFoundException) throw error;
//             logSqlError(this.logger, 'crearUsuario', error);
//             throw new DatabaseQueryException('Error al crear usuario');
//         }
//     }

//     async editarUsuario(datos: EditarUsuario & { usuarioUuid: string, rol_id: number | null }, usuarioEdicion: any) {
//         const businessObject = await this.usuariosBO.armarEditarUsuario(datos, usuarioEdicion);
//         return await this.repoAction.editarUsuario(businessObject);
//     }

//     async obtenerRoles(filtros: FiltrosRoles) {
//         try {
//             const roles = await this.repoData.obtenerRoles(filtros);
//             return { roles };
//         } catch (error) {
//             logSqlError(this.logger, 'obtenerRoles', error);
//             throw new DatabaseQueryException('Error al obtener roles');
//         }
//     }

//     async obtenerRolPorUuid(uuid: string) {
//         const rol = await this.repoData.obtenerRolPorUuid(uuid);
//         if (!rol) throw new NotFoundException(`Rol ${uuid} no encontrado o no está activo`);
//         return rol;
//     }

//     async asignarSucursalesManual(uuid: string, sucursalUuids: string[]) {
//         try {
//             const usuario = await this.repoData.obtenerUsuarioPorUuid(uuid);
//             if (!usuario) throw new NotFoundException(`Usuario ${uuid} no encontrado`);

//             const sucursales = await this.repoData.obtenerSucursalIdsPorUuids(sucursalUuids);
//             if (sucursales.length === 0) throw new NotFoundException('No se encontraron sucursales activas');

//             const existentesIds = await this.repoData.obtenerSucursalIdsDeUsuario(usuario.usuario_id);

//             const nuevas = sucursales.filter(s => !existentesIds.includes(s.sucursal_id));
//             const repetidas = sucursales.filter(s => existentesIds.includes(s.sucursal_id));

//             if (nuevas.length > 0) {
//                 await this.repoAction.asignarSucursalesAUsuario(
//                     usuario.usuario_id,
//                     nuevas.map(s => s.sucursal_id),
//                 );
//             }

//             const { usuario: usuarioActualizado } = await this.obtenerUsuario(uuid);

//             return {
//                 meta: {
//                     msg: nuevas.length > 0
//                         ? `${nuevas.length} sucursal(es) asignada(s) correctamente`
//                         : 'No se asignaron sucursales nuevas',
//                     asignadas: nuevas.map(s => ({ uuid: s.sucursal_uuid, nombre: s.nombre })),
//                     repetidas: repetidas.map(s => ({ uuid: s.sucursal_uuid, nombre: s.nombre })),
//                 },
//                 usuario: usuarioActualizado,
//             };
//         } catch (error) {
//             if (error instanceof NotFoundException) throw error;
//             logSqlError(this.logger, 'asignarSucursalesManual', error);
//             throw new DatabaseQueryException('Error al asignar sucursales al usuario');
//         }
//     }

//     async obtenerTotalUsuariosCreados() {
//         try {
//             const totalUsuarios = await this.repoData.obtenerTotalUsuarios();
//             return totalUsuarios;
//         } catch (error) {
//             logSqlError(this.logger, 'obtenerUsuarios', error);
//             throw new DatabaseQueryException('Error al obtener usuarios');
//         }
//     }

//     async agregarOverrides(uuid: string, datos: AgregarOverrides, despachoId: number) {
//         const usuario = await this.repoData.obtenerUsuarioPorUuid(uuid);
//         if (!usuario) throw new NotFoundException(`Usuario ${uuid} no encontrado`);

//         const todosIds = [...datos.grant, ...datos.deny];
//         const validos = await this.repoData.permisosExistesPorIds(todosIds);
//         if (!validos) throw new BusinessException('Uno o más permisos no existen o están inactivos');

//         try {
//             await this.repoAction.agregarOverrides(usuario.usuario_id, datos.grant, datos.deny);
//             await this.authService.sincronizarPermisosEnSesion(usuario.usuario_id, despachoId);

//             const permisos = await this.repoData.obtenerPermisosEfectivosDeUsuario(usuario.usuario_id);
//             return { meta: { msg: 'Permisos individuales agregados correctamente' }, ...permisos };
//         } catch (error) {
//             logSqlError(this.logger, 'agregarOverrides', error);
//             throw new DatabaseQueryException('Error al agregar permisos individuales');
//         }
//     }

//     async quitarOverride(uuid: string, permisoId: number, despachoId: number) {
//         const usuario = await this.repoData.obtenerUsuarioPorUuid(uuid);
//         if (!usuario) throw new NotFoundException(`Usuario ${uuid} no encontrado`);

//         try {
//             await this.repoAction.quitarOverride(usuario.usuario_id, permisoId);
//             await this.authService.sincronizarPermisosEnSesion(usuario.usuario_id, despachoId);

//             const permisos = await this.repoData.obtenerPermisosEfectivosDeUsuario(usuario.usuario_id);
//             return { meta: { msg: 'Permiso individual eliminado correctamente' }, ...permisos };
//         } catch (error) {
//             logSqlError(this.logger, 'quitarOverride', error);
//             throw new DatabaseQueryException('Error al quitar permiso individual');
//         }
//     }

//     async reemplazarOverrides(uuid: string, datos: ReemplazarOverrides, despachoId: number) {
//         const usuario = await this.repoData.obtenerUsuarioPorUuid(uuid);
//         if (!usuario) throw new NotFoundException(`Usuario ${uuid} no encontrado`);

//         const todosIds = [...datos.grant, ...datos.deny];
//         if (todosIds.length > 0) {
//             const validos = await this.repoData.permisosExistesPorIds(todosIds);
//             if (!validos) throw new BusinessException('Uno o más permisos no existen o están inactivos');
//         }

//         try {
//             await this.repoAction.reemplazarOverrides(usuario.usuario_id, datos.grant, datos.deny);
//             await this.authService.sincronizarPermisosEnSesion(usuario.usuario_id, despachoId);

//             const permisos = await this.repoData.obtenerPermisosEfectivosDeUsuario(usuario.usuario_id);
//             return { meta: { msg: 'Permisos individuales reemplazados correctamente' }, ...permisos };
//         } catch (error) {
//             logSqlError(this.logger, 'reemplazarOverrides', error);
//             throw new DatabaseQueryException('Error al reemplazar permisos individuales');
//         }
//     }

//     async obtenerPermisosEfectivos(uuid: string) {
//         const usuario = await this.repoData.obtenerUsuarioPorUuid(uuid);
//         if (!usuario) throw new NotFoundException(`Usuario ${uuid} no encontrado`);

//         try {
//             return await this.repoData.obtenerPermisosEfectivosDeUsuario(usuario.usuario_id);
//         } catch (error) {
//             logSqlError(this.logger, 'obtenerPermisosEfectivos', error);
//             throw new DatabaseQueryException('Error al obtener permisos');
//         }
//     }

//     async obtenerUsuariosInternosPorUuids(uuids: string[]) {
//         try {
//             return await this.repoData.obtenerUsuariosPorUuids(uuids);
//         } catch (error) {
//             logSqlError(this.logger, 'obtenerUsuariosInternosPorUuids', error);
//             throw new DatabaseQueryException('Error al obtener usuarios');
//         }
//     }
// }
