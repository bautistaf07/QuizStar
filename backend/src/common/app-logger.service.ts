import { Injectable } from '@nestjs/common';
import { appendFile, mkdirSync } from 'fs';
import { dirname, join } from 'path';

export type NivelLog = 'INFO' | 'WARN' | 'ERROR';

/**
 * Logger estructurado (una línea JSON por evento).
 * Campos: timestamp, level, context, event, message, metadata.
 * IMPORTANTE: nunca pasar contraseñas, tokens ni secretos en metadata.
 */
@Injectable()
export class AppLogger {
  private readonly archivo = join(process.cwd(), 'logs', 'app.log');

  constructor() {
    mkdirSync(dirname(this.archivo), { recursive: true });
  }

  log(
    level: NivelLog,
    context: string,
    event: string,
    message: string,
    metadata: Record<string, unknown> = {},
  ) {
    const linea = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      context,
      event,
      message,
      metadata,
    });
    console.log(linea);
    appendFile(this.archivo, linea + '\n', () => undefined);
  }

  info(context: string, event: string, message: string, metadata: Record<string, unknown> = {}) {
    this.log('INFO', context, event, message, metadata);
  }

  warn(context: string, event: string, message: string, metadata: Record<string, unknown> = {}) {
    this.log('WARN', context, event, message, metadata);
  }

  error(context: string, event: string, message: string, metadata: Record<string, unknown> = {}) {
    this.log('ERROR', context, event, message, metadata);
  }
}
