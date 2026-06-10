import {
    Body,
    Controller,
    Get,
    Logger,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthCoordinator } from './auth.coordinator';
import {
    LoginDTO,
    LogoutDTO,
    SesionActualResponseDTO,
} from './dto/auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authCoordinator: AuthCoordinator) { }

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'Iniciar sesión' })
    async login(@Body() body: LoginDTO) {
        this.logger.log(`Intento de login para email: ${body.email}`);
        return this.authCoordinator.login(body);
    }

    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cerrar sesión' })
    async logout(@Req() req: any, @Body() _body: LogoutDTO) {
        if (!req.token) {
            this.logger.warn('Logout rechazado: token no proporcionado');
            throw new UnauthorizedException('Token no proporcionado');
        }

        this.logger.log(`Solicitud de logout para usuario: ${req.user?.email ?? 'N/A'}`);
        return this.authCoordinator.logout(req.token);
    }

    @Get('me')
    @ApiBearerAuth()
    @ZodSerializerDto(SesionActualResponseDTO)
    @ApiOperation({ summary: 'Obtener sesión actual' })
    async me(@Req() req: any) {
        if (!req.token) {
            this.logger.warn('Consulta de sesión actual rechazada: token no proporcionado');
            throw new UnauthorizedException('Token no proporcionado');
        }

        this.logger.debug(`Consulta de sesión actual para usuario: ${req.user?.email ?? 'N/A'}`);
        return this.authCoordinator.obtenerSesionActual(req.token);
    }
}