import pino from 'pino'
import { ENV_IS_DEVELOPMENT } from './env'

export const logger = pino({
  prettyPrint: ENV_IS_DEVELOPMENT,
  level: ENV_IS_DEVELOPMENT ? 'info' : 'warn'
})
