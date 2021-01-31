import fastify from 'fastify'
import fastifySensible from 'fastify-sensible'
import fastifyStatic from 'fastify-static'
import { Server } from 'socket.io'
import { EntityManager, getManager } from 'typeorm'
import { APP_VERSION, STATIC_DIR } from '../misc/constants'
import { ENV_IS_DEVELOPMENT } from '../misc/env'
import io from './io'
import api from './api'
import { logger } from '../misc/logger'

const PORT = 8012

declare module 'fastify' {
  interface FastifyInstance {
    manager: EntityManager
    io: Server
  }
}

export async function startWebService(): Promise<void> {
  const server = fastify({
    logger
  })

  // Swagger
  if (ENV_IS_DEVELOPMENT) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    await server.register(require('fastify-swagger'), {
      swagger: {
        info: {
          title: 'ZPM Server',
          description: 'ZHZX Printer Management Server',
          version: APP_VERSION
        }
      },
      exposeRoute: true
    })
  }

  await server.register(fastifyStatic, {
    root: STATIC_DIR
  })

  // Inject manager
  const manager = getManager()
  server.decorate('manager', manager)

  await server.register(io)
  await server.register(fastifySensible)
  await server.register(api, { prefix: '/api' })
  await server.listen(PORT)
  logger.info(`HTTP Server listening on port ${PORT}`)
}
