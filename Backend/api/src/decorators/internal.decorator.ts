import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { InternalApiGuard } from '../guards/internal-api.guard';

export function InternalApi() {
    return applyDecorators(
        UseGuards(InternalApiGuard),
        ApiHeader({ name: 'x-internal-api-key', description: 'Clave interna para microservicios (IA)', required: true }),
        ApiHeader({ name: 'x-sucursal-id', description: 'ID de la sucursal', required: true })
    );
}