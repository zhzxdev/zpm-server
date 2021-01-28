import { FastifyPluginAsync } from 'fastify'
import { DeviceEntity, UserTokenEntity } from '../../../db'
import { APP_VERSION } from '../../../misc/constants'
import user from './user'

declare module 'fastify' {
  interface FastifyRequest {
    device: DeviceEntity
  }
}

const fn: FastifyPluginAsync = async (server) => {
  server.decorateRequest('device', undefined)

  server.addHook('preValidation', async (req) => {
    req.device = await server.manager.findOneOrFail(DeviceEntity, { ip: req.socket.remoteAddress })
  })

  server.get('/ping', async (req) => {
    return {
      device: req.device,
      server: {
        version: APP_VERSION
      }
    }
  })

  server.get('/verify', async (req) => {
    const { token } = <any>req.query
    const { user } = await server.manager.findOneOrFail(UserTokenEntity, { token }, { relations: ['user'] })
    return user
  })

  await server.register(user, { prefix: '/user' })
}

export default fn
