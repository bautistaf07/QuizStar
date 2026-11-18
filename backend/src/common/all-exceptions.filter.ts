import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { AppLogger } from './app-logger.service';

/** Atrapa todos los errores, los registra en el log y responde al cliente. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const esHttp = exception instanceof HttpException;
    const estado = esHttp ? exception.getStatus() : 500;
    const cuerpo = esHttp
      ? exception.getResponse()
      : { statusCode: 500, message: 'Error interno del servidor' };

    const meta = { metodo: req.method, ruta: req.originalUrl, estado, usuarioId: req.user?.sub };

    if (estado >= 500) {
      const err = exception as Error;
      this.logger.error('HTTP', 'UNHANDLED_ERROR', err?.message ?? 'Error no controlado', {
        ...meta,
        stack: err?.stack?.split('\n').slice(0, 4).join(' | '),
      });
    } else if (estado === 400) {
      this.logger.warn('HTTP', 'VALIDATION_REJECTED', 'Datos inválidos rechazados', {
        ...meta,
        detalle: cuerpo,
      });
    } else {
      this.logger.warn('HTTP', 'REQUEST_REJECTED', 'Petición rechazada', meta);
    }

    res.status(estado).json(cuerpo);
  }
}
