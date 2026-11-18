import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AppLogger } from './app-logger.service';

/** Registra cuánto tarda cada petición que termina bien (Shift Right). */
@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const inicio = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        this.logger.info('HTTP', 'HTTP_REQUEST', 'Petición atendida', {
          metodo: req.method,
          ruta: req.originalUrl,
          estado: res.statusCode,
          duracionMs: Date.now() - inicio,
          usuarioId: req.user?.sub,
        });
      }),
    );
  }
}
