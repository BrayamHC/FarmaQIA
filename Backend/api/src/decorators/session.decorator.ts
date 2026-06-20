import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SucursalNotSelectedException } from 'src/common/exceptions/business.exception';

/**
     * Route handler parameter decorator. Extracts the 
     * entire `sucursal_seleccionada` object from the `request` object and populates 
     * the decorated parameter with the value of the selected `sucursal`.
     * @returns object of the `selected_sucursal` stored in session.
     */
export const Sucursal = createParamDecorator((propiedad: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { sesion: { sucursal_seleccionada } } = request;

    if (!sucursal_seleccionada) {
        throw new SucursalNotSelectedException();
    }

    return propiedad ? sucursal_seleccionada[`${propiedad}`] : sucursal_seleccionada;
},
);

/**
     * Route handler parameter decorator. Extracts the 
     * entire `usuario` object from the `request` object and populates 
     * the decorated parameter with the value of the selected `usuario`.
     * @returns object of the `usuario` stored in session.
     */
export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.sesion.usuario;
    }
)
