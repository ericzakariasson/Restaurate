import { createLogger, transports, format } from 'winston';
import { isProduction } from './env.helper';

const level = isProduction() ? process.env.LOG_LEVEL || 'info' : 'debug';

const defaultFormat = format.combine(format.colorize(), format.json());

const defaultTransports = [
  new transports.Console({
    format: format.simple(),
    handleExceptions: true
  })
];

const productionTransports = [
  new transports.File({
    filename: 'error.log',
    level: 'error',
    handleExceptions: true
  }),
  new transports.File({
    filename: 'combined.log'
  })
];

export const logger = createLogger({
  exitOnError: false,
  level,
  transports: isProduction() ? productionTransports : defaultTransports,
  format: defaultFormat
});

export class LogStream {
  write(message: string) {
    logger.info(message);
  }
}
