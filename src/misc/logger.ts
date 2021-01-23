import pino from 'pino'
import { ENV_IS_DEV } from './env'

export const logger = pino({
  prettyPrint: ENV_IS_DEV,
  level: ENV_IS_DEV ? 'info' : 'warn'
})
