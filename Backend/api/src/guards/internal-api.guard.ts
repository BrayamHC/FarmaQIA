import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InternalApiGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = request.headers['x-internal-api-key'] as string;

        // Validamos contra NESTJS_INTERNAL_API_KEY o tu CRYPTO_SECRET existente
        const validKey = this.configService.get<string>('NESTJS_INTERNAL_API_KEY') ||
            this.configService.get<string>('CRYPTO_SECRET');

        if (!apiKey || apiKey !== validKey) {
            throw new UnauthorizedException('Microservicio no autorizado');
        }

        // 💡 Inyectamos la sucursal en la request para que @Sucursal('sucursal_id') no rompa
        (request as any).sucursal_id = Number(request.headers['x-sucursal-id']) || 1;
        return true;
    }
}