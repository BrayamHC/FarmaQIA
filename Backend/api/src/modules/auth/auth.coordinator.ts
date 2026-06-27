import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthCoordinator {
    private readonly logger = new Logger(AuthCoordinator.name);

    constructor(private readonly authService: AuthService) { }

    async login(data: { email: string; password: string }) {
        this.logger.log(`Iniciando proceso de login para: ${data.email}`);

        const usuario = await this.authService.validarUsuario(data.email, data.password);

        if (!usuario) {
            this.logger.warn(`Login fallido por credenciales inválidas: ${data.email}`);
            throw new UnauthorizedException('Credenciales inválidas');
        }

        await this.authService.cerrarSesionPrevia(usuario.usuario_id);

        const sucursalesPermitidas = await this.authService.obtenerSucursalesPermitidas(usuario.usuario_id,);

        const token = this.authService.generarTokenSesion();

        await this.authService.guardarSesionEnRedis(token, usuario, sucursalesPermitidas);

        this.logger.log(`Sesión iniciada correctamente para: ${usuario.email}`);

        return {
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                usuario: {
                    usuario_uuid: usuario.usuario_uuid,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email,
                    rol: usuario.rol,
                    permisos: usuario.permisos,
                },
                sucursales_permitidas: sucursalesPermitidas
            },
        };
    }

    async logout(token: string) {
        this.logger.log(`Procesando logout para token: ${token.substring(0, 12)}...`);

        const sesion = await this.authService.obtenerSesionDesdeRedis(token);

        if (!sesion) {
            this.logger.warn('Logout rechazado: sesión no válida o expirada');
            throw new UnauthorizedException('Sesión no válida o expirada');
        }

        await this.authService.eliminarSesionDeRedis(token);

        this.logger.log(`Sesión cerrada correctamente para: ${sesion.usuario.email}`);

        return {
            success: true,
            message: 'Sesión cerrada correctamente',
        };
    }

    async obtenerSesionActual(token: string) {
        this.logger.debug(`Consultando sesión actual: ${token.substring(0, 12)}...`);

        const sesion = await this.authService.obtenerSesionDesdeRedis(token);

        if (!sesion) {
            this.logger.warn('Consulta de sesión actual rechazada: sesión expirada');
            throw new UnauthorizedException('Sesión no válida o expirada');
        }

        return {
            usuario_uuid: sesion.usuario.usuario_uuid,
            nombre_completo: sesion.usuario.nombre_completo,
            email: sesion.usuario.email,
            rol: {
                rol_uuid: sesion.rol.rol_uuid,
                nombre: sesion.rol.nombre,
                codigo: sesion.rol.codigo,
            },
            permisos: sesion.permisos,
        };
    }
}