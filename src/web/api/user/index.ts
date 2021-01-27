import { FastifyPluginAsync } from 'fastify'
import { UserEntity } from '../../../db'
import { tokenStorage } from '../token_storage'
import user from './user'
import device from './device'
import operations from './operations'

declare module 'fastify' {
  interface FastifyRequest {
    user: UserEntity
  }
}

const fn: FastifyPluginAsync = async (server) => {
  server.decorateRequest('user', undefined)

  server.addHook('preValidation', async (req) => {
    const token = req.headers['x-access-token']
    if (typeof token !== 'string' || !token) throw server.httpErrors.forbidden('Invalid token')
    const id: string | undefined = tokenStorage.get(token)
    if (!id) throw server.httpErrors.forbidden('Invalid token')
    req.user = await server.manager.findOneOrFail(UserEntity, { id })
  })

  server.get('/', async (req) => {
    return req.user
  })

  await server.register(user, { prefix: '/user' })
  await server.register(device, { prefix: '/device' })
  await server.register(operations, { prefix: '/operations' })
}

export default fn
