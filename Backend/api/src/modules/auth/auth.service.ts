import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { getRedisConfig } from '../../config/database.config';
import { AuthRepoData } from './repositories/auth.repoData';

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AuthService.name);
    private clienteRedis!: Redis;

    constructor(private readonly authRepoData: AuthRepoData) { }

    async onModuleInit() {
        const config = getRedisConfig();

        this.logger.log(`Inicializando conexión Redis en ${config.host}:${config.port}`);

        this.clienteRedis = new Redis({
            host: config.host,
            port: config.port,
            password: config.password || undefined,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });

        this.clienteRedis.on('connect', () => {
            this.logger.log('Conexión a Redis establecida correctamente');
        });

        this.clienteRedis.on('error', (error) => {
            this.logger.error(`Error de conexión a Redis: ${error.message}`);
        });
    }

    async onModuleDestroy() {
        if (this.clienteRedis) {
            this.logger.log('Cerrando conexión Redis');
            await this.clienteRedis.quit();
        }
    }

    async validarContrasenia(passwordPlano: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(passwordPlano, passwordHash);
    }

    async validarUsuario(email: string, password: string) {
        this.logger.debug(`Validando usuario por email: ${email}`);

        const usuario = await this.authRepoData.obtenerUsuarioPorEmail(email);

        if (!usuario) {
            this.logger.warn(`Usuario no encontrado: ${email}`);
            return null;
        }

        if (usuario.status !== 'activo') {
            this.logger.warn(`Usuario inactivo: ${email}`);
            throw new UnauthorizedException('Usuario inactivo');
        }

        const passwordValido = await this.validarContrasenia(password, usuario.password);

        if (!passwordValido) {
            this.logger.warn(`Contraseña inválida para: ${email}`);
            return null;
        }

        const permisos = await this.authRepoData.obtenerPermisosPorRol(usuario.rol_id);

        this.logger.log(`Usuario autenticado correctamente: ${email}`);

        return {
            usuario_id: usuario.usuario_id,
            usuario_uuid: usuario.usuario_uuid,
            nombre_completo: usuario.nombre_completo,
            email: usuario.email,
            rol: {
                rol_id: usuario.rol_id,
                rol_uuid: usuario.rol_uuid,
                nombre: usuario.rol_nombre,
                codigo: usuario.rol_codigo,
            },
            permisos,
        };
    }

    generarTokenSesion(): string {
        const fecha = new Date();
        const yyyy = fecha.getFullYear().toString();
        const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dd = fecha.getDate().toString().padStart(2, '0');
        const hh = fecha.getHours().toString().padStart(2, '0');
        const mi = fecha.getMinutes().toString().padStart(2, '0');
        const ss = fecha.getSeconds().toString().padStart(2, '0');
        const random = crypto.randomBytes(24).toString('base64url');

        return `FQ${yyyy}${mm}${dd}${hh}${mi}${ss}${random}`;
    }

    async obtenerSesionActivaPorUsuario(usuarioId: number): Promise<string | null> {
        return this.clienteRedis.get(`usuario_sesion:${usuarioId}`);
    }

    async cerrarSesionPrevia(usuarioId: number): Promise<void> {
        const tokenAnterior = await this.obtenerSesionActivaPorUsuario(usuarioId);

        if (!tokenAnterior) {
            return;
        }

        this.logger.warn(`Cerrando sesión previa del usuario_id: ${usuarioId}`);

        await this.clienteRedis.del(`sesion:${tokenAnterior}`);
        await this.clienteRedis.del(`usuario_sesion:${usuarioId}`);
    }

    async guardarSesionEnRedis(token: string, usuario: any): Promise<void> {
        const ttl = getRedisConfig().sessionTTL;

        const datosSesion = {
            token,
            usuario: {
                usuario_id: usuario.usuario_id,
                usuario_uuid: usuario.usuario_uuid,
                nombre_completo: usuario.nombre_completo,
                email: usuario.email,
            },
            rol: usuario.rol,
            permisos: usuario.permisos,
            fecha_creacion: new Date().toISOString(),
        };

        await this.clienteRedis.setex(`sesion:${token}`, ttl, JSON.stringify(datosSesion));
        await this.clienteRedis.setex(`usuario_sesion:${usuario.usuario_id}`, ttl, token);

        this.logger.log(
            `Sesión guardada en Redis para usuario_id=${usuario.usuario_id}, ttl=${ttl}s`,
        );
    }

    async obtenerSesionDesdeRedis(token: string): Promise<any | null> {
        const sesion = await this.clienteRedis.get(`sesion:${token}`);
        return sesion ? JSON.parse(sesion) : null;
    }

    async eliminarSesionDeRedis(token: string): Promise<void> {
        const sesion = await this.obtenerSesionDesdeRedis(token);

        await this.clienteRedis.del(`sesion:${token}`);

        if (sesion?.usuario?.usuario_id) {
            await this.clienteRedis.del(`usuario_sesion:${sesion.usuario.usuario_id}`);
            this.logger.log(`Sesión eliminada de Redis para usuario_id=${sesion.usuario.usuario_id}`);
        } else {
            this.logger.warn('Sesión eliminada sin índice de usuario asociado');
        }
    }

    async renovarExpiracionSesionEnRedis(token: string, usuarioId: number): Promise<void> {
        const ttl = getRedisConfig().sessionTTL;

        await this.clienteRedis.expire(`sesion:${token}`, ttl);
        await this.clienteRedis.expire(`usuario_sesion:${usuarioId}`, ttl);

        this.logger.debug(`TTL renovado para usuario_id=${usuarioId}, ttl=${ttl}s`);
    }

    async verificarSesionConsistente(token: string, usuarioId: number): Promise<boolean> {
        const tokenIndice = await this.clienteRedis.get(`usuario_sesion:${usuarioId}`);
        return tokenIndice === token;
    }

    async verificarExistenciaUsuarioActivo(usuarioUuid: string): Promise<boolean> {
        return this.authRepoData.verificarExistenciaUsuarioActivo(usuarioUuid);
    }

    // ── Sucursales en sesión ──────────────────────────────────────────────────────

    async agregarSucursalPermitidaEnRedis(token: string, sucursal: {
        sucursal_uuid: string;
        sucursal_id: number;
        nombre: string;
        nombre_comercial: string | null;
    }): Promise<void> {
        try {
            const sesion = await this.obtenerSesionDesdeRedis(token);
            if (!sesion) throw new Error('Sesión no encontrada al agregar sucursal');

            const yaExiste = sesion.sucursales_permitidas?.some(
                (s: any) => s.sucursal_uuid === sucursal.sucursal_uuid,
            );

            if (!yaExiste) {
                sesion.sucursales_permitidas = [
                    ...(sesion.sucursales_permitidas ?? []),
                    sucursal,
                ];
            }

            // Preservar TTL restante — no resetear la expiración
            const ttlRestante = await this.clienteRedis.ttl(`sesion:${token}`);
            const ttl = ttlRestante > 0 ? ttlRestante : getRedisConfig().sessionTTL;

            await this.clienteRedis.setex(`sesion:${token}`, ttl, JSON.stringify(sesion));

            this.logger.debug(
                `Sucursal agregada a sesión: ${sucursal.nombre} | Token: ${token.substring(0, 15)}...`,
            );
        } catch (error) {
            this.logger.error('agregarSucursalPermitidaEnRedis', error);
            throw new Error('Error al actualizar sucursales permitidas en sesión');
        }
    }

    async actualizarSucursalSeleccionada(token: string, sucursal: {
        sucursal_uuid: string;
        sucursal_id: number;
        nombre: string;
        nombre_comercial: string | null;
    }): Promise<void> {
        try {
            const sesion = await this.obtenerSesionDesdeRedis(token);
            if (!sesion) throw new Error('Sesión no encontrada al seleccionar sucursal');

            sesion.sucursal_seleccionada = sucursal;

            // Preservar TTL restante — no resetear la expiración
            const ttlRestante = await this.clienteRedis.ttl(`sesion:${token}`);
            const ttl = ttlRestante > 0 ? ttlRestante : getRedisConfig().sessionTTL;

            await this.clienteRedis.setex(`sesion:${token}`, ttl, JSON.stringify(sesion));

            this.logger.debug(
                `Sucursal seleccionada: ${sucursal.nombre} | Token: ${token.substring(0, 15)}...`,
            );
        } catch (error) {
            this.logger.error('actualizarSucursalSeleccionada', error);
            throw new Error('Error al actualizar sucursal seleccionada en sesión');
        }
    }
}