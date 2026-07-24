// import { Injectable, forwardRef, Inject } from '@nestjs/common';
// import { UsuariosService } from './usuarios.service';
// import { SucursalesService } from '../sucursales/sucursales.service';
// import { CrearUsuarioDTO, EditarUsuarioDTO } from './dto/usuarios.dto';
// import { InformacionDespachoService } from '../informacionDespacho/informacionDespacho.service';
// import { BusinessException, ResourceNotFoundException } from 'src/common/exceptions';

// const ROL_ADMIN = 1;

// @Injectable()
// export class UsuariosCoordinator {
//     constructor(
//         private readonly usuariosService: UsuariosService,
//         @Inject(forwardRef(() => SucursalesService))
//         private readonly sucursalesService: SucursalesService,
//         private readonly informacionDespachoService: InformacionDespachoService,
//     ) { }

//     async crearUsuario(data: CrearUsuarioDTO, usuario: any) {
//         const infoDespacho = await this.informacionDespachoService.obtenerInfoDespacho();

//         const usuariosCreados = await this.usuariosService.obtenerTotalUsuariosCreados();

//         if (usuariosCreados >= infoDespacho.limite_usuarios) {
//             throw new BusinessException(
//                 `Se ha alcanzado el límite de usuarios permitidos (${infoDespacho.limite_usuarios})`
//             );
//         }

//         const { usuarioCreado } = await this.usuariosService.crearUsuario(data, usuario);

//         if (usuarioCreado.rol_id === ROL_ADMIN) {
//             const sucursalIds = await this.sucursalesService.obtenerSucursalIdsActivas();
//             if (sucursalIds.length > 0) {
//                 await this.usuariosService.asignarSucursalesAUsuario(usuarioCreado.usuario_id, sucursalIds);
//             }
//         }

//         const { usuario_id, ...resto } = usuarioCreado;
//         return {
//             meta: { msg: 'Usuario creado correctamente' },
//             usuario: resto,
//         };
//     }

//     /**
//      * ##### Función para editar el registro de un usuario
//      * @param data - Datos nuevos para el registro
//      * @param userEdicion - Usuario de la sesión que está editando el registro
//      * @param usuarioUuid - Identificador del registro a editar
//      */
//     async editarUsuario(data: EditarUsuarioDTO, usuarioEdicion: any, usuarioUuid: string) {

//         const { rol_uuid, ...rawData } = data;

//         const usuario = await this.usuariosService.obtenerUsuario(usuarioUuid);

//         if (!usuario) throw new ResourceNotFoundException('Usuario', usuarioUuid);

//         let rol_id: number | null = null;
//         if (rol_uuid) {
//             const rol = await this.usuariosService.obtenerRolPorUuid(rol_uuid);
//             if (!rol) throw new ResourceNotFoundException('Rol', rol_uuid);
//             rol_id = rol.rol_id;
//         }

//         const editarUsuario = await this.usuariosService.editarUsuario({ ...rawData, usuarioUuid, rol_id }, usuarioEdicion);

//         return {
//             msg: 'Usuario actualizado exitosamente',
//             usuario: editarUsuario
//         };
//     }
// }
