import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException ? exception.getResponse() : null;

        let message: string | string[] = 'Error interno del servidor';
        let error = 'Internal Server Error';

        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        } else if (
            exceptionResponse &&
            typeof exceptionResponse === 'object' &&
            'message' in exceptionResponse
        ) {
            message = exceptionResponse.message as string | string[];
            error =
                'error' in exceptionResponse
                    ? String(exceptionResponse.error)
                    : error;
        }

        const stack = exception instanceof Error ? exception.stack : undefined;
        const exceptionMessage =
            exception instanceof Error ? exception.message : String(exception);

        this.logger.error(
            `${request.method} ${request.url} - ${exceptionMessage}`,
            stack,
        );

        response.status(status).json({
            success: false,
            statusCode: status,
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
            error,
            message,
        });
    }
}