import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SucursalNotSelectedException } from 'src/common/exceptions/business.exception';

export const Sucursal = createParamDecorator((propiedad: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // 1. Intentar obtener de la sesión (usuario normal)
    if (request.sesion && request.sesion.sucursal_seleccionada) {
        return propiedad
            ? request.sesion.sucursal_seleccionada[`${propiedad}`]
            : request.sesion.sucursal_seleccionada;
    }

    // 2. Fallback para microservicios internos (FastAPI / IA)
    // Si viene el header x-sucursal-id, lo usamos directamente
    const headerSucursalId = request.headers['x-sucursal-id'];
    if (headerSucursalId) {
        const sucursalId = Number(headerSucursalId);
        // Si piden una propiedad específica como 'sucursal_id', la devolvemos
        if (propiedad === 'sucursal_id') {
            return sucursalId;
        }
        // Si piden el objeto completo, simulamos la estructura
        return { sucursal_id: sucursalId };
    }

    // 3. Si no hay ni sesión ni header, lanzamos la excepción original
    throw new SucursalNotSelectedException();
});

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        // Protección contra undefined en sesiones internas
        return request.sesion?.usuario;
    }
);