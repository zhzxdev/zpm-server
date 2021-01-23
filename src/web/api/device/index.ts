import { FastifyPluginAsync } from 'fastify'
import { DeviceEntity, UserTokenEntity } from '../../../db'

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

  server.get('/verify', async (req) => {
    const { token } = <any>req.query
    const { user } = await server.manager.findOneOrFail(UserTokenEntity, { token }, { relations: ['user'] })
    return user
  })
}

export default fn
