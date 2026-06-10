import {
    Injectable,
    Logger,
    NestMiddleware,
    UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private readonly logger = new Logger(AuthMiddleware.name);

    constructor(private readonly authService: AuthService) { }

    async use(req: Request, _res: Response, next: NextFunction) {
        try {
            const token = this.extractTokenFromHeader(req);

            if (!token) {
                this.logger.warn(`Token no proporcionado en ${req.method} ${req.originalUrl}`);
                throw new UnauthorizedException('Token no proporcionado');
            }

            const sesion = await this.authService.obtenerSesionDesdeRedis(token);

            if (!sesion) {
                this.logger.warn(`Sesión no encontrada o expirada en ${req.method} ${req.originalUrl}`);
                throw new UnauthorizedException('Token inválido o sesión expirada');
            }

            const sesionConsistente = await this.authService.verificarSesionConsistente(
                token,
                sesion.usuario.usuario_id,
            );

            if (!sesionConsistente) {
                this.logger.warn(`Sesión inconsistente para usuario_id=${sesion.usuario.usuario_id}`);
                await this.authService.eliminarSesionDeRedis(token);
                throw new UnauthorizedException('Sesión inválida o expirada');
            }

            const usuarioExiste = await this.authService.verificarExistenciaUsuarioActivo(
                sesion.usuario.usuario_uuid,
            );

            if (!usuarioExiste) {
                this.logger.warn(`Usuario no válido o inactivo: ${sesion.usuario.usuario_uuid}`);
                await this.authService.eliminarSesionDeRedis(token);
                throw new UnauthorizedException('Usuario no válido o inactivo');
            }

            await this.authService.renovarExpiracionSesionEnRedis(
                token,
                sesion.usuario.usuario_id,
            );

            (req as any).user = sesion.usuario;
            (req as any).rol = sesion.rol;
            (req as any).permisos = sesion.permisos;
            (req as any).sesion = sesion;
            (req as any).token = token;

            this.logger.debug(
                `Request autenticado: ${req.method} ${req.originalUrl} | usuario=${sesion.usuario.email}`,
            );

            next();
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            const err = error as Error;
            this.logger.error(`Error en AuthMiddleware: ${err.message}`, err.stack);
            throw new UnauthorizedException('Error al validar sesión');
        }
    }

    private extractTokenFromHeader(req: Request): string | undefined {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return undefined;
        }

        const token = authorization.replace('Bearer ', '').trim();
        return token || undefined;
    }
}