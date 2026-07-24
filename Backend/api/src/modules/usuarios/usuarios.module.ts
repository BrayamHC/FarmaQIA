// import { Module, forwardRef } from '@nestjs/common';
// import { UsuariosController } from './usuarios.controller';
// import { UsuariosService } from './usuarios.service';
// import { UsuariosRepoData } from './repositories/usuarios.repoData';
// import { UsuariosRepoAction } from './repositories/usuarios.repoAction';
// import { UsuariosRepoHelper } from './repositories/usuarios.repoHelper';
// import { UsuariosBo } from './repositories/usuarios.bo';
// import { UsuariosCoordinator } from './usuarios.coordinator';
// import { SucursalesModule } from '../sucursales/sucursales.module';
// import { InformacionDespachoModule } from '../informacionDespacho/informacionDespacho.module';
// import { AuthModule } from 'src/auth/auth.module';

// @Module({
//     imports: [forwardRef(() => SucursalesModule), AuthModule, InformacionDespachoModule],
//     controllers: [UsuariosController],
//     providers: [UsuariosService, UsuariosRepoData, UsuariosRepoAction, UsuariosRepoHelper, UsuariosBo, UsuariosCoordinator],
//     exports: [UsuariosService],
// })
// export class UsuariosModule { }